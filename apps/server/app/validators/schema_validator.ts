/**
 * Валидатор для проверки типа документа согласно схеме досье
 */
export class SchemaValidator {
  /**
   * Валидирует тип документа согласно схеме досье
   */
  static async validateDocumentType(schemaName: string, documentType: string): Promise<boolean> {
    const schemaModule = await import(`#scheme/${schemaName}`)
    const schema = schemaModule.default
    const allowedTypes = schema.documents.map((document: any) => document.type)

    return allowedTypes.includes(documentType)
  }

  /**
   * Получает список допустимых MIME-типов для указанного типа документа из схемы
   */
  static async getAllowedMimeTypes(schemaName: string, documentType: string): Promise<string[]> {
    const schemaModule = await import(`#scheme/${schemaName}`)
    const schema = schemaModule.default

    const documentConfig = schema.documents.find((document: any) => document.type === documentType)

    if (!documentConfig) {
      // Если тип документа не найден, возвращаем стандартные типы для изображений и PDF
      return ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    }

    // Если в схеме указаны допустимые типы файлов, используем их
    if (documentConfig.accept && Array.isArray(documentConfig.accept)) {
      return documentConfig.accept
    }

    // По умолчанию разрешаем только изображения и PDF
    return ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  }

  /**
   * Получает список допустимых расширений файлов для указанного типа документа из схемы
   */
  static async getAllowedExtensions(schemaName: string, documentType: string): Promise<string[]> {
    const allowedMimeTypes = await this.getAllowedMimeTypes(schemaName, documentType)

    // Маппинг MIME-типов к расширениям файлов
    const mimeToExtensions: Record<string, string[]> = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/jpg': ['jpg'],
      'image/png': ['png'],
      'image/tiff': ['tiff', 'tif'],
      'image/tif': ['tif'],
      'application/pdf': ['pdf'],
      'application/vnd.ms-excel': ['xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
      'application/vnd.oasis.opendocument.text': ['odt'],
      'application/zip': ['zip'],
      'application/x-tika-ooxml': ['docx', 'xlsx', 'pptx'],
      'application/x-tika-msoffice': ['doc', 'xls', 'ppt'],
      'application/msword': ['doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
      'application/vnd.oasis.opendocument.spreadsheet': ['ods'],
      'image/*': ['jpg', 'jpeg', 'png', 'webp'],
    }

    const extensions = new Set<string>()

    for (const mimeType of allowedMimeTypes) {
      const exts = mimeToExtensions[mimeType]
      if (exts) {
        exts.forEach((ext) => extensions.add(ext))
      }
    }

    // Если расширения не найдены, возвращаем стандартные
    if (extensions.size === 0) {
      return ['pdf', 'jpg', 'jpeg', 'png']
    }

    return Array.from(extensions)
  }
}
