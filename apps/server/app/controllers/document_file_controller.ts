import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DocumentService } from '#services/document_service'
import { DossierService } from '#services/dossier_service'
import { DocumentAdapter } from '#adapters/document_adapter'
import {
  createAddPagesValidator,
  deletePageValidator,
  getDocumentValidator,
  getPageValidator,
} from '#validators/document_validator'
import { DocumentNotFoundException, PageNotFoundException } from '#exceptions/document_exceptions'

@inject()
export default class DocumentFileController {
  constructor(
    private documentService: DocumentService,
    private dossierService: DossierService,
    private documentAdapter: DocumentAdapter
  ) {}

  /**
   * @upload
   * @tag Document Files
   * @summary Загрузить страницы документа
   * @description Загружает файлы документа в досье
   * @paramPath uuid - UUID досье клиента - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @paramForm documents - Файлы документа (multipart/form-data)
   * @paramForm name - Название версии документа - eg: Паспорт 01.01.2024
   * @paramForm isNewVersion - Создать новую версию (true/false) - eg: false
   * @responseBody 201 - {"data": {"document": {"id": 1, "code": "passport"}, "version": {"id": 1, "name": "Паспорт 01.01.2024"}, "filesProcessed": 2, "pagesAdded": 2}}
   * @responseBody 422 - {"message": "Validation failed", "errors": [{"message": "Documents are required", "rule": "required", "field": "documents"}]}
   */
  async upload({ params, request, response }: HttpContext) {
    const dossier = await this.dossierService.findOrCreateDossier(params.uuid)
    const validator = await createAddPagesValidator(dossier.schema, params.type)
    const { type, documents, name, isNewVersion } = await validator.validate({
      ...params,
      documents: request.files('documents'),
      name: request.input('name'),
      isNewVersion: request.input('isNewVersion', false),
    })

    const result = await this.documentService.processDocumentUpload({
      dossier,
      documentType: type,
      files: documents,
      versionName: name,
      isNewVersion: isNewVersion,
    })

    const formattedResponse = this.documentAdapter.formatDocumentUploadResponse(
      result.document,
      result.version,
      result.filesProcessed,
      result.pagesAdded
    )

    return response.created(formattedResponse)
  }

  /**
   * @download
   * @tag Document Files
   * @summary Скачать полный документ
   * @description Скачивает документ как объединенный файл
   * @paramPath uuid - UUID досье клиента - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @responseBody 200 - Файл документа в формате PDF или Excel
   * @responseBody 404 - {"message": "Документ не найден"}
   */
  async download({ params, response }: HttpContext) {
    const { uuid, type } = await getDocumentValidator.validate(params)

    const dossier = await this.dossierService.findDossierByUuid(uuid)
    const document = await this.documentService.findDocumentByDossierAndType(dossier, type)

    if (!document || !document.files || document.files.length === 0) {
      throw new DocumentNotFoundException()
    }

    return this.documentService.streamDocumentFiles(document.files, type, response)
  }

  /**
   * @getPage
   * @tag Document Files
   * @summary Скачать конкретную страницу
   * @description Скачивает отдельную страницу документа
   * @paramPath uuid - UUID досье клиента - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @paramPath number - Номер страницы - eg: 1
   * @responseBody 200 - Файл страницы документа
   * @responseBody 404 - {"message": "Страница не найдена"}
   */
  async getPage({ params, response }: HttpContext) {
    const { uuid, type, number } = await getPageValidator.validate(params)

    const dossier = await this.dossierService.findDossierByUuid(uuid)
    const document = await this.documentService.findDocumentByDossierAndType(dossier, type)

    if (!document) {
      throw new DocumentNotFoundException()
    }

    const file = document.files?.find((f) => f.pageNumber === number)

    if (!file) {
      throw new PageNotFoundException(number)
    }

    return this.documentService.streamSingleFile(file, response)
  }

  /**
   * @deletePage
   * @tag Document Files
   * @summary Удалить страницу
   * @description Выполняет мягкое удаление страницы документа
   * @paramPath uuid - UUID досье клиента - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @paramPath pageUuid - UUID страницы - eg: 660e8400-e29b-41d4-a716-446655440001
   * @responseBody 200 - {"message": "Страница успешно удалена"}
   * @responseBody 404 - {"message": "Страница не найдена"}
   */
  async deletePage({ params, response }: HttpContext) {
    const { uuid, type, pageUuid } = await deletePageValidator.validate(params)

    const dossier = await this.dossierService.findDossierByUuid(uuid)
    const document = await this.documentService.findDocumentByDossierAndType(dossier, type)

    if (!document) {
      throw new DocumentNotFoundException()
    }

    const file = await this.documentService.findFileByUuid(pageUuid, document)

    if (!file) {
      throw new PageNotFoundException(pageUuid)
    }

    await this.documentService.deleteFile(file)

    return response.ok({ message: 'Страница успешно удалена' })
  }
}
