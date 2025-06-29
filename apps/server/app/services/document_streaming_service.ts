import { inject } from '@adonisjs/core'
import File from '#models/file'
import { FileProcessingService, ProcessedFile } from '#services/file_processing_service'
import { FileUtils } from '#utils/file_utils'

@inject()
export class DocumentStreamingService {
  constructor(
    private fileProcessingService: FileProcessingService,
    private fileUtils: FileUtils
  ) {}

  /**
   * Стримит файлы документа - PDF или ZIP архив
   */
  async streamDocumentFiles(files: any[], documentType: string, response: any): Promise<any> {
    if (files.length === 1) {
      return await this.streamSingleFile(files[0], response)
    }

    const canMergeToPdf = this.canFilesBemerged(files)

    if (canMergeToPdf) {
      return await this.streamAsPdf(files, documentType, response)
    } else {
      return await this.streamAsZip(files, documentType, response)
    }
  }

  /**
   * Стримит один файл
   */
  async streamSingleFile(file: any, response: any): Promise<any> {
    const { stream, size, mimeType } = await this.fileProcessingService.getFileStream(file.path)

    response.header('Content-Type', mimeType)
    response.header('Content-Length', size.toString())
    response.header('Content-Disposition', `attachment; filename="${file.originalName}"`)

    return response.stream(stream)
  }

  /**
   * Объединяет файлы документа в один PDF и стримит
   */
  async streamAsPdf(files: File[], documentType: string, response: any): Promise<any> {
    const mergedFilePath = await this.mergeDocumentFiles(files)
    const { stream, size } = await this.fileProcessingService.getFileStream(mergedFilePath)

    response.header('Content-Type', 'application/pdf')
    response.header('Content-Length', size.toString())
    response.header('Content-Disposition', `attachment; filename="${documentType}.pdf"`)

    return response.stream(stream)
  }

  /**
   * Создает ZIP архив и стримит
   */
  async streamAsZip(files: any[], documentType: string, response: any): Promise<any> {
    const zipFilePath = await this.fileProcessingService.createZipArchive(files, documentType)
    const { stream, size } = await this.fileProcessingService.getFileStream(zipFilePath)

    response.header('Content-Type', 'application/zip')
    response.header('Content-Length', size.toString())
    response.header('Content-Disposition', `attachment; filename="${documentType}.zip"`)

    return response.stream(stream)
  }

  /**
   * Объединяет файлы документа в один PDF
   */
  private async mergeDocumentFiles(files: File[]): Promise<string> {
    const sortedFiles = [...files].sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0))

    const processedFiles: ProcessedFile[] = sortedFiles.map((file) => ({
      uuid: file.uuid,
      originalName: file.originalName || 'unknown',
      extension: file.extension || 'pdf',
      mimeType: file.mimeType || 'application/pdf',
      size: 0,
      path: file.path,
    }))

    return await this.fileProcessingService.mergeFiles(processedFiles)
  }

  /**
   * Проверяет, могут ли файлы быть объединены в PDF
   */
  private canFilesBemerged(files: any[]): boolean {
    return files.every((file) => {
      return this.fileUtils.isMergeableFile(file.extension)
    })
  }
}
