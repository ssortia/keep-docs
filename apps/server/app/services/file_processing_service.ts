import app from '@adonisjs/core/services/app'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { mkdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { PDFDocument } from 'pdf-lib'
import sharp from 'sharp'
import { fromPath } from 'pdf2pic'
import archiver from 'archiver'
import { DocumentProcessingException, FileSystemException } from '#exceptions/document_exceptions'

export interface ProcessedFile {
  uuid: string
  originalName: string
  extension: string
  mimeType: string
  size: number
  path: string
}

export class FileProcessingService {
  private readonly baseUploadPath = 'storage/uploads'

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
    const fullPath = filePath.startsWith('/') ? filePath : this.getFullPath(filePath)

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
      throw new FileSystemException(`Ошибка чтения файла: ${fullPath}`)
    }
  }

  /**
   * Создает ZIP архив из файлов
   */
  async createZipArchive(files: any[], archiveName: string): Promise<string> {
    const zipFileName = `${archiveName}_${randomUUID()}.zip`
    const zipFilePath = join(this.getUploadDirectory(), zipFileName)

    return new Promise((resolve, reject) => {
      const output = createWriteStream(zipFilePath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      output.on('close', () => {
        resolve(zipFilePath)
      })

      archive.on('error', (err) => {
        reject(new DocumentProcessingException(`Ошибка создания архива: ${err.message}`))
      })

      archive.pipe(output)

      // Добавляем файлы в архив
      for (const file of files) {
        const filePath = this.getFullPath(file.path)
        const fileName = file.originalName || `${file.uuid}.${file.extension}`
        archive.file(filePath, { name: fileName })
      }

      archive.finalize()
    })
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
   * Обрабатывает файл в зависимости от типа
   */
  private async processFileByType(
    file: MultipartFile,
    uploadPath: string
  ): Promise<ProcessedFile[]> {
    const extension = file.extname?.toLowerCase()

    if (extension === 'pdf') {
      return await this.processPdfFile(file, uploadPath)
    } else if (this.isImageFile(extension)) {
      const processedFile = await this.processImageFile(file, uploadPath)
      return [processedFile]
    } else {
      // Для офисных документов и других файлов - сохраняем как есть
      const processedFile = await this.processDocumentFile(file, uploadPath)
      return [processedFile]
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

    // Стандартный размер страницы A4 (595.28 x 841.89 точек)
    const pageWidth = 595.28
    const pageHeight = 841.89

    const page = mergedPdf.addPage([pageWidth, pageHeight])

    // Вычисляем масштаб для вписывания изображения в страницу
    const scaleX = pageWidth / image.width
    const scaleY = pageHeight / image.height
    const scale = Math.min(scaleX, scaleY)

    const scaledWidth = image.width * scale
    const scaledHeight = image.height * scale

    // Центрируем изображение на странице
    const x = (pageWidth - scaledWidth) / 2
    const y = (pageHeight - scaledHeight) / 2

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
   * Обрабатывает PDF файл (всегда разделяет на JPG страницы)
   */
  private async processPdfFile(
    file: MultipartFile,
    customUploadPath: string
  ): Promise<ProcessedFile[]> {
    const tempFilePath = await this.saveTempFile(file)

    try {
      const pageCount = await this.getPdfPageCount(tempFilePath)
      return await this.convertPdfToImages(file, tempFilePath, pageCount, customUploadPath)
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
      density: 300,
      saveFilename: 'page',
      savePath: uploadDir,
      format: 'jpeg',
      quality: 100,
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
    const filename = `${uuid}.jpg`
    const uploadDir = app.makePath(this.baseUploadPath, uploadPath)
    const finalPath = join(uploadDir, filename)

    // Конвертируем в JPG с высоким качеством
    await sharp(tempPagePath).jpeg({ quality: 100 }).toFile(finalPath)
    await unlink(tempPagePath)

    const fileStats = await stat(finalPath)

    return {
      uuid,
      originalName: `${file.clientName}_page_${pageIndex}.jpg`,
      extension: 'jpg',
      mimeType: 'image/jpeg',
      size: fileStats.size,
      path: join(uploadPath, filename),
    }
  }

  /**
   * Проверяет, является ли файл изображением
   */
  private isImageFile(extension: string | undefined): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'tiff', 'tif', 'gif', 'bmp', 'webp']
    return extension ? imageExtensions.includes(extension.toLowerCase()) : false
  }

  /**
   * Обрабатывает документ (Excel, Word и т.д.) - сохраняет как есть без конвертации
   */
  private async processDocumentFile(
    file: MultipartFile,
    uploadPath: string
  ): Promise<ProcessedFile> {
    const uuid = randomUUID()
    const originalExtension = file.extname?.toLowerCase() || ''
    const filename = `${uuid}.${originalExtension}`
    const uploadDir = app.makePath(this.baseUploadPath, uploadPath)
    await mkdir(uploadDir, { recursive: true })
    const finalPath = join(uploadDir, filename)

    // Копируем файл как есть без обработки
    if (file.tmpPath) {
      await pipeline(createReadStream(file.tmpPath), createWriteStream(finalPath))
    } else {
      throw new Error('Нет данных файла')
    }

    const fileStats = await stat(finalPath)

    return {
      uuid,
      originalName: this.sanitizeFilename(file.clientName || 'unknown'),
      extension: originalExtension,
      mimeType: file.type || this.getMimeType(originalExtension),
      size: fileStats.size,
      path: join(uploadPath, filename),
    }
  }

  /**
   * Обрабатывает файл изображения
   */
  private async processImageFile(file: MultipartFile, uploadPath: string): Promise<ProcessedFile> {
    const tempFilePath = await this.saveTempFile(file)
    try {
      return await this.optimizeAndSaveImage(file, tempFilePath, uploadPath)
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
    uploadPath: string
  ): Promise<ProcessedFile> {
    const uuid = randomUUID()
    const filename = `${uuid}.jpg`
    const uploadDir = app.makePath(this.baseUploadPath, uploadPath)
    await mkdir(uploadDir, { recursive: true })
    const finalPath = join(uploadDir, filename)

    await sharp(tempFilePath)
      .jpeg({ quality: 100 })
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
      gif: 'image/gif',
      bmp: 'image/bmp',
      webp: 'image/webp',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      odt: 'application/vnd.oasis.opendocument.text',
      ods: 'application/vnd.oasis.opendocument.spreadsheet',
      zip: 'application/zip',
    }

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
  }
}
