import app from '@adonisjs/core/services/app'
import { inject } from '@adonisjs/core'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { PDFDocument } from 'pdf-lib'
import { fromPath } from 'pdf2pic'
import sharp from 'sharp'
import { PDF_PAGE_SIZE, IMAGE_PROCESSING } from '#constants/file_types'
import { FileUtils } from '#utils/file_utils'
import { DocumentProcessingException } from '#exceptions/document_exceptions'

export interface ProcessedFile {
  uuid: string
  originalName: string
  extension: string
  mimeType: string
  size: number
  path: string
}

@inject()
export class PdfProcessor {
  private readonly baseUploadPath = 'storage/uploads'

  constructor(private fileUtils: FileUtils) {}

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
   * Обрабатывает PDF файл (всегда разделяет на JPG страницы)
   */
  async processPdfFile(file: MultipartFile, customUploadPath: string): Promise<ProcessedFile[]> {
    const tempFilePath = await this.saveTempFile(file)

    try {
      const pageCount = await this.getPdfPageCount(tempFilePath)
      return await this.convertPdfToImages(file, tempFilePath, pageCount, customUploadPath)
    } finally {
      await unlink(tempFilePath)
    }
  }

  /**
   * Создает объединенный PDF
   */
  private async createMergedPdf(files: ProcessedFile[]): Promise<string> {
    try {
      const mergedPdf = await PDFDocument.create()

      for (const file of files) {
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
    } else if (this.fileUtils.isImageFile(file.extension)) {
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

    const page = mergedPdf.addPage([PDF_PAGE_SIZE.A4_WIDTH, PDF_PAGE_SIZE.A4_HEIGHT])

    // Вычисляем масштаб для вписывания изображения в страницу
    const scaleX = PDF_PAGE_SIZE.A4_WIDTH / image.width
    const scaleY = PDF_PAGE_SIZE.A4_HEIGHT / image.height
    const scale = Math.min(scaleX, scaleY)

    const scaledWidth = image.width * scale
    const scaledHeight = image.height * scale

    // Центрируем изображение на странице
    const x = (PDF_PAGE_SIZE.A4_WIDTH - scaledWidth) / 2
    const y = (PDF_PAGE_SIZE.A4_HEIGHT - scaledHeight) / 2

    page.drawImage(image, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
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
   * Получает количество страниц в PDF
   */
  private async getPdfPageCount(filePath: string): Promise<number> {
    const pdfBytes = await readFile(filePath)
    const pdf = await PDFDocument.load(pdfBytes)
    return pdf.getPageCount()
  }

  /**
   * Конвертирует PDF в JPG изображения с высоким качеством
   */
  private async convertPdfToImages(
    file: MultipartFile,
    tempFilePath: string,
    pageCount: number,
    customUploadPath: string
  ): Promise<ProcessedFile[]> {
    const uploadDir = app.makePath(this.baseUploadPath, customUploadPath)
    await mkdir(uploadDir, { recursive: true })

    const convert = fromPath(tempFilePath, {
      density: IMAGE_PROCESSING.PDF_DENSITY,
      saveFilename: 'page',
      savePath: uploadDir,
      format: 'jpeg',
      quality: IMAGE_PROCESSING.JPEG_QUALITY,
      preserveAspectRatio: true,
    })

    const processedFiles: ProcessedFile[] = []

    for (let pageIndex = 1; pageIndex <= pageCount; pageIndex++) {
      const processedFile = await this.convertSinglePage(convert, file, pageIndex, customUploadPath)
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
    uploadPath: string
  ): Promise<ProcessedFile | null> {
    try {
      const convertResult = await convert(pageIndex, { responseType: 'image' })

      if (convertResult && 'path' in convertResult) {
        return await this.saveConvertedPage(convertResult.path, file, pageIndex, uploadPath)
      }

      return null
    } catch (pageError) {
      console.warn(`Ошибка обработки страницы ${pageIndex}:`, pageError)
      return null
    }
  }

  /**
   * Сохраняет конвертированную страницу как JPG
   */
  private async saveConvertedPage(
    tempPagePath: string,
    file: MultipartFile,
    pageIndex: number,
    uploadPath: string
  ): Promise<ProcessedFile> {
    const uuid = randomUUID()
    const filename = this.fileUtils.generateFilename(uuid, 'jpg')
    const uploadDir = app.makePath(this.baseUploadPath, uploadPath)
    const finalPath = join(uploadDir, filename)

    await sharp(tempPagePath).jpeg({ quality: IMAGE_PROCESSING.JPEG_QUALITY }).toFile(finalPath)
    await unlink(tempPagePath)

    const fileStats = await import('node:fs/promises').then((fs) => fs.stat(finalPath))

    return {
      uuid,
      originalName: this.fileUtils.createPdfPageName(file.clientName || 'unknown', pageIndex),
      extension: 'jpg',
      mimeType: this.fileUtils.getMimeType('jpg'),
      size: fileStats.size,
      path: join(uploadPath, filename),
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
    } else {
      throw new Error('Нет данных файла')
    }

    return tempFilePath
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
}
