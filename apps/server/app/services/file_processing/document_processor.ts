import app from '@adonisjs/core/services/app'
import { inject } from '@adonisjs/core'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { mkdir, stat } from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
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
export class DocumentProcessor {
  private readonly baseUploadPath = 'storage/uploads'

  constructor(private fileUtils: FileUtils) {}

  /**
   * Обрабатывает документ (Excel, Word и т.д.) - сохраняет как есть без конвертации
   */
  async processDocumentFile(file: MultipartFile, uploadPath: string): Promise<ProcessedFile> {
    const uuid = randomUUID()
    const originalExtension = file.extname?.toLowerCase() || ''
    const filename = this.fileUtils.generateFilename(uuid, originalExtension)
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
      originalName: this.fileUtils.sanitizeFilename(file.clientName || 'unknown'),
      extension: originalExtension,
      mimeType: file.type || this.fileUtils.getMimeType(originalExtension),
      size: fileStats.size,
      path: join(uploadPath, filename),
    }
  }
}
