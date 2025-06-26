import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DocumentService } from '#services/document_service'
import { DossierService } from '#services/dossier_service'
import { DocumentAdapter } from '#adapters/document_adapter'
import {
  changeCurrentVersionValidator,
  getDocumentsValidator,
} from '#validators/document_validator'
import { DocumentNotFoundException } from '#exceptions/document_exceptions'

@inject()
export default class DocumentController {
  constructor(
    private documentService: DocumentService,
    private dossierService: DossierService,
    private documentAdapter: DocumentAdapter
  ) {}

  /**
   * @list
   * @tag Documents
   * @summary Получить список документов
   * @description Возвращает список всех документов в досье клиента (без детальной информации)
   * @paramPath uuid - UUID досье клиента - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramQuery schema - Схема досье - eg: client_dossier
   * @responseBody 200 - {"data": [{"id": 1, "code": "passport", "currentVersion": {"id": 1, "name": "v2024.01.01.1200", "createdAt": "2024-01-01T12:00:00.000Z"}, "filesCount": 2}]}
   * @responseBody 404 - {"message": "Досье не найдено"}
   */
  async list({ params, request, response }: HttpContext) {
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

    return response.ok({ data: documentsWithVersions })
  }

  /**
   * @setVersion
   * @tag Documents
   * @summary Изменить текущую версию
   * @description Изменяет текущую активную версию документа
   * @paramPath uuid - UUID досье клиента - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @requestBody {"versionId": 2}
   * @responseBody 200 - {"message": "Текущая версия документа успешно изменена"}
   * @responseBody 404 - {"message": "Версия не найдена или не принадлежит документу"}
   */
  async setVersion({ params, request, response }: HttpContext) {
    const { uuid, type, versionId } = await changeCurrentVersionValidator.validate({
      ...params,
      versionId: request.input('versionId'),
    })

    const dossier = await this.dossierService.findDossierByUuid(uuid)
    const document = await this.documentService.findDocumentByDossierAndType(dossier, type)

    if (!document) {
      throw new DocumentNotFoundException()
    }

    await this.documentService.changeCurrentVersion(document, versionId)

    return response.ok({ message: 'Текущая версия документа успешно изменена' })
  }
}
