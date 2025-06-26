import type { HttpContext } from '@adonisjs/core/http'
import { getSchemaValidator } from '#validators/document_validator'

export default class SchemaController {
  /**
   * @get
   * @tag Schemas
   * @summary Получить объект схемы
   * @description Возвращает полный объект схемы с настройками, блоками и типами документов
   * @paramPath schema - Название схемы - eg: example
   * @responseBody 200 - {"schema": {"documents": [{"type": "passport", "block": "offerCreateBlock", "name": "Паспорт", "required": ["CREATION"], "access": {"show": "*", "editable": ["CREATION"]}}]}}
   * @responseBody 403 - {"message": "Нет доступа к схеме: nonexistent_schema", "code": "E_SCHEMA_ACCESS_DENIED"}
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
