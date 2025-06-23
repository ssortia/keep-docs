/**
 * Валидатор для проверки типа документа согласно схеме досье
 */
export class SchemaValidator {
  /**
   * Валидирует тип документа согласно схеме досье
   */
  static validateDocumentType(schema: string, documentType: string): boolean {
    const schemaData = JSON.parse(schema);
    const allowedTypes = schemaData.documentTypes || [];
    return allowedTypes.includes(documentType);
  }
}