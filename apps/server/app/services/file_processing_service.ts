import app from '@adonisjs/core/services/app'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { mkdir, writeFile, stat, unlink, readFile } from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { PDFDocument } from 'pdf-lib'
import sharp from 'sharp'
import { fromPath } from 'pdf2pic'
import {
  FileSystemException,
  FileSizeLimitException,
  InvalidFileTypeException,
  DocumentProcessingException,
} from '#exceptions/document_exceptions'

export interface ProcessedFile {
  uuid: string
  originalName: string
  extension: string
  mimeType: string
  size: number
  path: string
  pageNumber: number
}

export interface FileProcessingOptions {
  allowedExtensions?: string[]
  maxFileSize?: number
  baseUploadPath?: string
}

export class FileProcessingService {
  private readonly allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'tiff', 'tif']
  private readonly maxFileSize = 50 * 1024 * 1024 // 50MB
  private readonly baseUploadPath = 'storage/uploads'

  /**
   * Обрабатывает загруженные файлы с валидацией и сохранением
   */
  async processUploadedFiles(
    files: MultipartFile[],
    options: FileProcessingOptions = {}
  ): Promise<ProcessedFile[]> {
    const processedFiles: ProcessedFile[] = []
    const config = this.getProcessingConfig(options)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      this.validateFile(file, config.allowedExtensions, config.maxFileSize)

      const fileResults = await this.processFileByType(file, i + 1)
      processedFiles.push(...fileResults)
    }

    return processedFiles
  }

  /**
   * Объединяет несколько файлов в один PDF
   */
  async mergeFiles(files: ProcessedFile[]): Promise<string> {
    if (files.length === 0) {
      throw new DocumentProcessingException('Нет файлов для объединения')
    }

    if (files.length === 1) {
      return this.getFullPath(files[0].path)
    }

    return await this.createMergedPdf(files)
  }

  /**
   * Получает поток файла для скачивания
   */
  async getFileStream(filePath: string): Promise<{
    stream: NodeJS.ReadableStream
    size: number
    mimeType: string
  }> {
    const fullPath = this.getFullPath(filePath)

    try {
      const fileStats = await stat(fullPath)
      const stream = createReadStream(fullPath)
      const extension = filePath.split('.').pop()?.toLowerCase()

      return {
        stream,
        size: fileStats.size,
        mimeType: this.getMimeType(extension || ''),
      }
    } catch (error) {
      throw new FileSystemException(`Ошибка чтения файла: ${filePath}`)
    }
  }

  /**
   * Удаляет файл из файловой системы
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = this.getFullPath(filePath)

    try {
      await unlink(fullPath)
    } catch (error) {
      console.warn(`Не удалось удалить файл: ${filePath}`, error)
    }
  }

  /**
   * Генерирует уникальное имя файла
   */
  generateUniqueFilename(originalName: string): string {
    const uuid = randomUUID()
    const extension = originalName.split('.').pop()
    return `${uuid}.${extension}`
  }

  /**
   * Очищает имя файла от опасных символов
   */
  sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.+/g, '.')
      .substring(0, 255)
  }

  /**
   * Получает конфигурацию обработки
   */
  private getProcessingConfig(options: FileProcessingOptions) {
    return {
      allowedExtensions: options.allowedExtensions || this.allowedExtensions,
      maxFileSize: options.maxFileSize || this.maxFileSize,
    }
  }

  /**
   * Обрабатывает файл в зависимости от типа
   */
  private async processFileByType(
    file: MultipartFile,
    startPageNumber: number
  ): Promise<ProcessedFile[]> {
    if (file.extname === 'pdf') {
      return await this.processPdfFile(file, startPageNumber)
    } else {
      const processedFile = await this.processImageFile(file, startPageNumber)
      return [processedFile]
    }
  }

  /**
   * Создает объединенный PDF
   */
  private async createMergedPdf(files: ProcessedFile[]): Promise<string> {
    try {
      const mergedPdf = await PDFDocument.create()
      const sortedFiles = [...files].sort((a, b) => a.pageNumber - b.pageNumber)

      for (const file of sortedFiles) {
        await this.addFileToMergedPdf(mergedPdf, file)
      }

      return await this.saveMergedPdf(mergedPdf)
    } catch (error) {
      throw new DocumentProcessingException(`Ошибка при объединении файлов: ${error.message}`)
    }
  }

  /**
   * Добавляет файл в объединенный PDF
   */
  private async addFileToMergedPdf(mergedPdf: PDFDocument, file: ProcessedFile): Promise<void> {
    const filePath = this.getFullPath(file.path)

    if (file.extension === 'pdf') {
      await this.addPdfToMerged(mergedPdf, filePath)
    } else {
      await this.addImageToMerged(mergedPdf, filePath, file.mimeType)
    }
  }

  /**
   * Добавляет PDF страницы в объединенный документ
   */
  private async addPdfToMerged(mergedPdf: PDFDocument, filePath: string): Promise<void> {
    const pdfBytes = await readFile(filePath)
    const pdf = await PDFDocument.load(pdfBytes)
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    pages.forEach((page) => mergedPdf.addPage(page))
  }

  /**
   * Добавляет изображение в объединенный PDF
   */
  private async addImageToMerged(
    mergedPdf: PDFDocument,
    imagePath: string,
    mimeType: string
  ): Promise<void> {
    const imageBytes = await readFile(imagePath)

    const image = mimeType.includes('png')
      ? await mergedPdf.embedPng(imageBytes)
      : await mergedPdf.embedJpg(imageBytes)

    const page = mergedPdf.addPage([image.width, image.height])
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    })
  }

  /**
   * Сохраняет объединенный PDF
   */
  private async saveMergedPdf(mergedPdf: PDFDocument): Promise<string> {
    const mergedPdfBytes = await mergedPdf.save()
    const mergedFileName = `merged_${randomUUID()}.pdf`
    const mergedFilePath = join(this.getUploadDirectory(), mergedFileName)

    await writeFile(mergedFilePath, mergedPdfBytes)
    return mergedFilePath
  }

  /**
   * Валидирует загруженный файл
   */
  private validateFile(
    file: MultipartFile,
    allowedExtensions: string[],
    maxFileSize: number
  ): void {
    if (file.size > maxFileSize) {
      throw new FileSizeLimitException(
        file.clientName || 'неизвестно',
        `${Math.round(maxFileSize / 1024 / 1024)}MB`
      )
    }

    const extension = file.extname?.toLowerCase().replace('.', '')
    if (!extension || !allowedExtensions.includes(extension)) {
      throw new InvalidFileTypeException(file.clientName || 'неизвестно', allowedExtensions)
    }

    if (!file.clientName) {
      throw new DocumentProcessingException('Имя файла обязательно')
    }
  }

  /**
   * Обрабатывает PDF файл (разделяет на страницы)
   */
  private async processPdfFile(
    file: MultipartFile,
    startPageNumber: number
  ): Promise<ProcessedFile[]> {
    const tempFilePath = await this.saveTempFile(file)

    try {
      const pageCount = await this.getPdfPageCount(tempFilePath)

      if (pageCount === 1) {
        return [await this.saveProcessedFile(file, tempFilePath, startPageNumber, 'pdf')]
      } else {
        return await this.convertPdfToImages(file, tempFilePath, startPageNumber, pageCount)
      }
    } finally {
      await unlink(tempFilePath)
    }
  }

  /**
   * Получает количество страниц в PDF
   */
  private async getPdfPageCount(filePath: string): Promise<number> {
    const pdfBytes = await readFile(filePath)
    const pdf = await PDFDocument.load(pdfBytes)
    return pdf.getPageCount()
  }

  /**
   * Конвертирует PDF в изображения
   */
  private async convertPdfToImages(
    file: MultipartFile,
    tempFilePath: string,
    startPageNumber: number,
    pageCount: number
  ): Promise<ProcessedFile[]> {
    const convert = fromPath(tempFilePath, {
      density: 200,
      saveFilename: 'page',
      savePath: this.getUploadDirectory(),
      format: 'png',
      width: 2480,
      height: 3508,
    })

    const processedFiles: ProcessedFile[] = []

    for (let pageIndex = 1; pageIndex <= pageCount; pageIndex++) {
      const processedFile = await this.convertSinglePage(convert, file, pageIndex, startPageNumber)
      if (processedFile) {
        processedFiles.push(processedFile)
      }
    }

    return processedFiles
  }

  /**
   * Конвертирует одну страницу PDF
   */
  private async convertSinglePage(
    convert: any,
    file: MultipartFile,
    pageIndex: number,
    startPageNumber: number
  ): Promise<ProcessedFile | null> {
    try {
      const convertResult = await convert(pageIndex, { responseType: 'image' })

      if (convertResult && 'path' in convertResult) {
        return await this.saveConvertedPage(convertResult.path, file, pageIndex, startPageNumber)
      }

      return null
    } catch (pageError) {
      console.warn(`Ошибка обработки страницы ${pageIndex}:`, pageError)
      return null
    }
  }

  /**
   * Сохраняет конвертированную страницу
   */
  private async saveConvertedPage(
    tempPagePath: string,
    file: MultipartFile,
    pageIndex: number,
    startPageNumber: number
  ): Promise<ProcessedFile> {
    const uuid = randomUUID()
    const filename = `${uuid}.png`
    const finalPath = join(this.getUploadDirectory(), filename)

    await pipeline(createReadStream(tempPagePath), createWriteStream(finalPath))
    await unlink(tempPagePath)

    const fileStats = await stat(finalPath)

    return {
      uuid,
      originalName: `${file.clientName}_page_${pageIndex}.png`,
      extension: 'png',
      mimeType: 'image/png',
      size: fileStats.size,
      path: filename,
      pageNumber: startPageNumber + pageIndex - 1,
    }
  }

  /**
   * Обрабатывает файл изображения
   */
  private async processImageFile(file: MultipartFile, pageNumber: number): Promise<ProcessedFile> {
    const tempFilePath = await this.saveTempFile(file)

    try {
      return await this.optimizeAndSaveImage(file, tempFilePath, pageNumber)
    } finally {
      await unlink(tempFilePath)
    }
  }

  /**
   * Оптимизирует и сохраняет изображение
   */
  private async optimizeAndSaveImage(
    file: MultipartFile,
    tempFilePath: string,
    pageNumber: number
  ): Promise<ProcessedFile> {
    const uuid = randomUUID()
    const filename = `${uuid}.jpg`
    const finalPath = join(this.getUploadDirectory(), filename)

    await sharp(tempFilePath)
      .jpeg({ quality: 85 })
      .resize(2480, 3508, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFile(finalPath)

    const fileStats = await stat(finalPath)

    return {
      uuid,
      originalName: this.sanitizeFilename(file.clientName || 'unknown'),
      extension: 'jpg',
      mimeType: 'image/jpeg',
      size: fileStats.size,
      path: filename,
      pageNumber,
    }
  }

  /**
   * Сохраняет временный файл
   */
  private async saveTempFile(file: MultipartFile): Promise<string> {
    const tempDir = join(this.getUploadDirectory(), 'temp')
    await mkdir(tempDir, { recursive: true })

    const tempFilePath = join(tempDir, `temp_${randomUUID()}_${file.clientName}`)

    if (file.tmpPath) {
      await pipeline(createReadStream(file.tmpPath), createWriteStream(tempFilePath))
    } else if (file.data) {
      await writeFile(tempFilePath, file.data)
    } else {
      throw new Error('Нет данных файла')
    }

    return tempFilePath
  }

  /**
   * Сохраняет обработанный файл
   */
  private async saveProcessedFile(
    originalFile: MultipartFile,
    sourcePath: string,
    pageNumber: number,
    extension: string
  ): Promise<ProcessedFile> {
    const uuid = randomUUID()
    const filename = `${uuid}.${extension}`
    const finalPath = join(this.getUploadDirectory(), filename)

    await pipeline(createReadStream(sourcePath), createWriteStream(finalPath))
    const fileStats = await stat(finalPath)

    return {
      uuid,
      originalName: this.sanitizeFilename(originalFile.clientName || 'unknown'),
      extension,
      mimeType: originalFile.type || this.getMimeType(extension),
      size: fileStats.size,
      path: filename,
      pageNumber,
    }
  }

  /**
   * Получает директорию для загрузок
   */
  private getUploadDirectory(): string {
    return app.makePath(this.baseUploadPath)
  }

  /**
   * Получает полный путь к файлу
   */
  private getFullPath(relativePath: string): string {
    return join(this.getUploadDirectory(), relativePath)
  }

  /**
   * Получает MIME тип по расширению файла
   */
  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      tiff: 'image/tiff',
      tif: 'image/tiff',
    }

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
  }
}
