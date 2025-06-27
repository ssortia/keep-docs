import { inject } from '@adonisjs/core'
import File from '#models/file'
import { PageNotFoundException } from '#exceptions/document_exceptions'

@inject()
export class FileExistsRule {
  /**
   * Проверяет существование файла
   */
  async validate(file: File | null, pageUuid?: string): Promise<File> {
    if (!file) {
      throw new PageNotFoundException(pageUuid)
    }
    return file
  }
}