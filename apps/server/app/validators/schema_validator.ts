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
    console.log(schema, documentType, allowedTypes)
    return allowedTypes.includes(documentType)
  }
}
