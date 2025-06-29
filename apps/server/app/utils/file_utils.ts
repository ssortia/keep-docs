import { IMAGE_EXTENSIONS, MIME_TYPES, MERGEABLE_EXTENSIONS } from '#constants/file_types'

export class FileUtils {
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
   * Получает MIME тип по расширению файла
   */
  getMimeType(extension: string): string {
    return MIME_TYPES[extension.toLowerCase()] || 'application/octet-stream'
  }

  /**
   * Проверяет, является ли файл изображением
   */
  isImageFile(extension: string | undefined): boolean {
    return extension ? IMAGE_EXTENSIONS.includes(extension.toLowerCase()) : false
  }

  /**
   * Проверяет, можно ли файл объединить в PDF
   */
  isMergeableFile(extension: string | undefined): boolean {
    return extension ? MERGEABLE_EXTENSIONS.includes(extension.toLowerCase()) : false
  }

  /**
   * Получает расширение файла без точки
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  /**
   * Генерирует уникальное имя файла с расширением
   */
  generateFilename(uuid: string, extension: string): string {
    return `${uuid}.${extension}`
  }

  /**
   * Создает имя для конвертированной страницы PDF
   */
  createPdfPageName(originalName: string, pageIndex: number): string {
    return `${originalName}_page_${pageIndex}.jpg`
  }
}
