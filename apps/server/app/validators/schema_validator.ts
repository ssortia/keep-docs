/**
 * Валидатор для проверки типа документа согласно схеме досье
 */
export class SchemaValidator {
  /**
   * Валидирует тип документа согласно схеме досье
   */
  static async validateDocumentType(schemaName: string, documentType: string): Promise<boolean> {
    const schema = (await import(`#scheme/${schemaName}`)).default
    const allowedTypes = schema.documents.map((document: any) => document.type)
    console.log(schema, documentType, allowedTypes)
    return allowedTypes.includes(documentType)
  }
}
