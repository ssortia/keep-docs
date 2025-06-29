import app from '@adonisjs/core/services/app'
import { inject } from '@adonisjs/core'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { createWriteStream } from 'node:fs'
import archiver from 'archiver'
import { DocumentProcessingException } from '#exceptions/document_exceptions'

@inject()
export class ArchiveProcessor {
  private readonly baseUploadPath = 'storage/uploads'

  constructor() {}

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
