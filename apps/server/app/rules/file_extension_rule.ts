import { inject } from '@adonisjs/core'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { SchemaValidator } from '#validators/schema_validator'
import { InvalidFileTypeException } from '#exceptions/document_exceptions'

@inject()
export class FileExtensionRule {
  /**
   * Валидирует расширения файлов согласно схеме
   */
  async validate(
    schemaName: string,
    documentType: string,
    files: MultipartFile[]
  ): Promise<void> {
    const allowedExtensions = await SchemaValidator.getAllowedExtensions(schemaName, documentType)
    
    for (const file of files) {
      if (!file.extname) {
        throw new InvalidFileTypeException(file.clientName, allowedExtensions)
      }

      const fileExtension = file.extname.toLowerCase().replace('.', '')
      
      if (!allowedExtensions.includes(fileExtension)) {
        throw new InvalidFileTypeException(file.clientName, allowedExtensions)
      }
    }
  }

  /**
   * Получает список разрешенных расширений для схемы и типа документа
   */
  async getAllowedExtensions(schemaName: string, documentType: string): Promise<string[]> {
    return await SchemaValidator.getAllowedExtensions(schemaName, documentType)
  }
}