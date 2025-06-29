import app from '@adonisjs/core/services/app'
import { inject } from '@adonisjs/core'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { mkdir, stat, unlink } from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import sharp from 'sharp'
import { IMAGE_PROCESSING } from '#constants/file_types'
import { FileUtils } from '#utils/file_utils'

export interface ProcessedFile {
  uuid: string
  originalName: string
  extension: string
  mimeType: string
  size: number
  path: string
}

@inject()
export class ImageProcessor {
  private readonly baseUploadPath = 'storage/uploads'

  constructor(private fileUtils: FileUtils) {}

  /**
   * Обрабатывает файл изображения
   */
  async processImageFile(file: MultipartFile, uploadPath: string): Promise<ProcessedFile> {
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
    const filename = this.fileUtils.generateFilename(uuid, 'jpg')
    const uploadDir = app.makePath(this.baseUploadPath, uploadPath)
    await mkdir(uploadDir, { recursive: true })
    const finalPath = join(uploadDir, filename)

    await sharp(tempFilePath)
      .jpeg({ quality: IMAGE_PROCESSING.JPEG_QUALITY })
      .resize(IMAGE_PROCESSING.MAX_WIDTH, IMAGE_PROCESSING.MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFile(finalPath)

    const fileStats = await stat(finalPath)

    return {
      uuid,
      originalName: this.fileUtils.sanitizeFilename(file.clientName || 'unknown'),
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
}
