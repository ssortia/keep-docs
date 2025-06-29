import { inject } from '@adonisjs/core'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { join } from 'node:path'
import { stat } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import app from '@adonisjs/core/services/app'
import { PdfProcessor } from '#services/file_processing/pdf_processor'
import { ImageProcessor } from '#services/file_processing/image_processor'
import { ArchiveProcessor } from '#services/file_processing/archive_processor'
import { DocumentProcessor } from '#services/file_processing/document_processor'
import { FileUtils } from '#utils/file_utils'
import { FileSystemException } from '#exceptions/document_exceptions'

export interface ProcessedFile {
  uuid: string
  originalName: string
  extension: string
  mimeType: string
  size: number
  path: string
}

@inject()
export class FileProcessingService {
  private readonly baseUploadPath = 'storage/uploads'

  constructor(
    private pdfProcessor: PdfProcessor,
    private imageProcessor: ImageProcessor,
    private archiveProcessor: ArchiveProcessor,
    private documentProcessor: DocumentProcessor,
    private fileUtils: FileUtils
  ) {}

  /**
   * Обрабатывает загруженные файлы с валидацией и сохранением
   */
  async processUploadedFiles(
    files: MultipartFile[],
    customUploadPath: string
  ): Promise<ProcessedFile[]> {
    const processedFiles: ProcessedFile[] = []

    for (const file of files) {
      const fileResults = await this.processFileByType(file, customUploadPath)
      processedFiles.push(...fileResults)
    }

    return processedFiles
  }

  /**
   * Объединяет несколько файлов в один PDF
   */
  async mergeFiles(files: ProcessedFile[]): Promise<string> {
    return await this.pdfProcessor.mergeFiles(files)
  }

  /**
   * Создает ZIP архив из файлов
   */
  async createZipArchive(files: any[], archiveName: string): Promise<string> {
    return await this.archiveProcessor.createZipArchive(files, archiveName)
  }

  /**
   * Получает поток файла для скачивания
   */
  async getFileStream(filePath: string): Promise<{
    stream: NodeJS.ReadableStream
    size: number
    mimeType: string
  }> {
    const fullPath = filePath.startsWith('/') ? filePath : this.getFullPath(filePath)

    try {
      const fileStats = await stat(fullPath)
      const stream = createReadStream(fullPath)
      const extension = filePath.split('.').pop()?.toLowerCase()

      return {
        stream,
        size: fileStats.size,
        mimeType: this.fileUtils.getMimeType(extension || ''),
      }
    } catch (error) {
      throw new FileSystemException(`Ошибка чтения файла: ${fullPath}`)
    }
  }

  /**
   * Очищает имя файла от опасных символов
   */
  sanitizeFilename(filename: string): string {
    return this.fileUtils.sanitizeFilename(filename)
  }

  /**
   * Обрабатывает файл в зависимости от типа
   */
  private async processFileByType(
    file: MultipartFile,
    uploadPath: string
  ): Promise<ProcessedFile[]> {
    const extension = file.extname?.toLowerCase()

    if (extension === 'pdf') {
      return await this.pdfProcessor.processPdfFile(file, uploadPath)
    } else if (this.fileUtils.isImageFile(extension)) {
      const processedFile = await this.imageProcessor.processImageFile(file, uploadPath)
      return [processedFile]
    } else {
      const processedFile = await this.documentProcessor.processDocumentFile(file, uploadPath)
      return [processedFile]
    }
  }

  /**
   * Получает полный путь к файлу
   */
  private getFullPath(relativePath: string): string {
    return join(app.makePath(this.baseUploadPath), relativePath)
  }
}
