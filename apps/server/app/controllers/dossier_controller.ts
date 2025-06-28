import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DossierService } from '#services/dossier_service'
import { DocumentAdapter } from '#adapters/document_adapter'
import { createDossierValidator, getDocumentsValidator } from '#validators/document_validator'

@inject()
export default class DossierController {
  constructor(
    private dossierService: DossierService,
    private documentAdapter: DocumentAdapter
  ) {}

  /**
   * @create
   * @tag Dossiers
   * @summary Создать новое досье
   * @description Создает новое досье с уникальным UUID
   * @requestBody {"schema": "client_dossier", "uuid": "550e8400-e29b-41d4-a716-446655440000"}
   * @responseBody 201 - {"data": {"id": 1, "uuid": "550e8400-e29b-41d4-a716-446655440000", "schema": "client_dossier", "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z"}}
   * @responseBody 422 - {"message": "Validation failed", "errors": [{"message": "The schema field is required", "rule": "required", "field": "schema"}]}
   */
  async create({ request, response }: HttpContext) {
    const { schema, uuid } = await createDossierValidator.validate(request.all())

    const dossier = await this.dossierService.createDossier({
      uuid: uuid || crypto.randomUUID(),
      schema,
    })

    const formattedResponse = this.documentAdapter.formatCreateDossierResponse(dossier)

    return response.created(formattedResponse)
  }

  /**
   * @show
   * @tag Dossiers
   * @summary Получить досье с документами
   * @description Возвращает досье со списком всех документов
   * @paramPath uuid - UUID досье - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramQuery schema - Схема досье - eg: client_dossier
   * @responseBody 200 - {"data": {"id": 1, "uuid": "550e8400-e29b-41d4-a716-446655440000", "schema": "client_dossier", "documents": [{"id": 1, "code": "passport", "currentVersion": {"id": 1, "name": "v2024.01.01.1200", "createdAt": "2024-01-01T12:00:00.000Z"}, "filesCount": 2}]}}
   * @responseBody 404 - {"message": "Досье не найдено"}
   */
  async show({ params, request, response }: HttpContext) {
    const { uuid, schema } = await getDocumentsValidator.validate({
      uuid: params.uuid,
      schema: request.input('schema'),
    })

    const dossier = await this.dossierService.findOrCreateDossier(uuid, schema)

    // Загружаем версии для каждого документа
    const documentsWithVersions = await Promise.all(
      dossier.documents.map(async (document) => {

        const versions = await this.dossierService.getDocumentVersions(document.id)
        return this.documentAdapter.formatDocumentResponse(document, versions)
      })
    )

    const formattedResponse = {
      id: dossier.id,
      uuid: dossier.uuid,
      schema: dossier.schema,
      documents: documentsWithVersions,
      createdAt: dossier.createdAt.toISO() || '',
      updatedAt: dossier.updatedAt.toISO() || '',
    }

    return response.ok(formattedResponse)
  }
}
