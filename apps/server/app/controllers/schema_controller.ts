import type { HttpContext } from '@adonisjs/core/http'
import { getSchemaValidator } from '#validators/document_validator'

export default class SchemaController {
  /**
   * @get
   * @tag Schemas
   * @summary Получить объект схемы
   * @description Возвращает полный объект схемы с настройками, блоками и типами документов. Содержит конфигурацию всех доступных документов для конкретной схемы
   * @paramPath schema - Название схемы - eg: client_dossier
   * @responseBody 200 - {"schema": {"documents": [{"type": "passport", "name": "Паспорт", "required": {"statusCode": ["CREATION"]}, "access": {"show": "*", "editable": {"statusCode": ["CREATION", "CREATED", "CONTINUE_QUESTIONNAIRE"]}}}, {"type": "buyerQuestionnaire", "name": "Анкета", "accept": ["image/*", "application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.oasis.opendocument.text", "application/zip", "application/x-tika-ooxml", "application/x-tika-msoffice", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.oasis.opendocument.spreadsheet"]}, {"name": "Прочее", "type": "otherDocuments"}]}}
   * @responseBody 404 - {"message": "Схема не найдена"}
   * @responseBody 403 - {"message": "Нет доступа к схеме: restricted_schema", "code": "E_SCHEMA_ACCESS_DENIED"}
   */
  async get({ params, response }: HttpContext) {
    const { schema: schemaName } = await getSchemaValidator.validate(params)

    try {
      const schemaModule = await import(`#scheme/${schemaName}`)
      const schema = schemaModule.default
      return response.ok({ schema })
    } catch (error) {
      return response.notFound({ message: 'Схема не найдена' })
    }
  }
}
