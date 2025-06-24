import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DocumentService } from '#services/document_service'
import { DossierService } from '#services/dossier_service'
import { DocumentAdapter } from '#adapters/document_adapter'
import {
  addPagesValidator,
  changeCurrentVersionValidator,
  createDossierValidator,
  deletePageValidator,
  getDocumentsValidator,
  getDocumentValidator,
  getPageValidator,
  getSchemaValidator,
} from '#validators/document_validator'
import {
  DocumentNotFoundException,
  InvalidDocumentTypeException,
  PageNotFoundException,
} from '#exceptions/document_exceptions'
import { SchemaValidator } from '#validators/schema_validator'

@inject()
export default class DocumentController {
  constructor(
    private documentService: DocumentService,
    private dossierService: DossierService,
    private documentAdapter: DocumentAdapter
  ) {}

  /**
   * @createDossier
   * @tag Documents
   * @summary Создать новое досье
   * @description Создает новое досье клиента с уникальным UUID
   * @requestBody {"schema": "client_dossier", "uuid": "550e8400-e29b-41d4-a716-446655440000"}
   * @responseBody 201 - {"data": {"id": 1, "uuid": "550e8400-e29b-41d4-a716-446655440000", "schema": "client_dossier", "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z"}}
   * @responseBody 422 - {"message": "Validation failed", "errors": [{"message": "The schema field is required", "rule": "required", "field": "schema"}]}
   */
  async createDossier({ request, response }: HttpContext) {
    const { schema, uuid } = await createDossierValidator.validate(request.all())

    const dossier = await this.dossierService.createDossier({
      uuid: uuid || crypto.randomUUID(),
      schema,
    })

    const formattedResponse = this.documentAdapter.formatCreateDossierResponse(dossier)

    return response.created(formattedResponse)
  }

  /**
   * @getDocuments
   * @tag Documents
   * @summary Получить все документы досье
   * @description Возвращает список всех документов в досье клиента
   * @paramPath uuid - UUID досье клиента - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramQuery schema - Схема досье - eg: client_dossier
   * @responseBody 200 - {"data": {"id": 1, "uuid": "550e8400-e29b-41d4-a716-446655440000", "schema": "client_dossier", "documents": [{"id": 1, "code": "passport", "currentVersion": {"id": 1, "name": "v2024.01.01.1200", "createdAt": "2024-01-01T12:00:00.000Z"}, "filesCount": 2}]}}
   * @responseBody 404 - {"message": "Досье не найдено"}
   */
  async getDocuments({ params, request, response }: HttpContext) {
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

  /**
   * @getDocument
   * @tag Documents
   * @summary Скачать полный документ
   * @description Скачивает документ как объединенный файл
   * @paramPath uuid - UUID досье клиента - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @responseBody 200 - Файл документа в формате PDF или Excel
   * @responseBody 404 - {"message": "Документ не найден"}
   */
  async getDocument({ params, response }: HttpContext) {
    const { uuid, type } = await getDocumentValidator.validate(params)

    const dossier = await this.dossierService.findDossierByUuid(uuid)
    const document = await this.documentService.findDocumentByDossierAndType(dossier, type)

    if (!document || !document.files || document.files.length === 0) {
      throw new DocumentNotFoundException()
    }

    return this.documentService.streamDocumentFiles(document.files, type, response)
  }

  /**
   * @addPages
   * @tag Documents
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
  async addPages({ params, request, response }: HttpContext) {
    console.log(params, request.files('documents'))
    const { uuid, type, documents, name, isNewVersion } = await addPagesValidator.validate({
      ...params,
      documents: request.files('documents'),
      name: request.input('name'),
      isNewVersion: request.input('isNewVersion', false),
    })

    const dossier = await this.dossierService.findOrCreateDossier(uuid)
    const isValid = await SchemaValidator.validateDocumentType(dossier.schema, type)

    if (!isValid) {
      throw new InvalidDocumentTypeException(type, dossier.schema)
    }

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
   * @getPage
   * @tag Documents
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
   * @tag Documents
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

  /**
   * @changeCurrentVersion
   * @tag Documents
   * @summary Изменить текущую версию
   * @description Изменяет текущую активную версию документа
   * @paramPath uuid - UUID досье клиента - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @requestBody {"versionId": 2}
   * @responseBody 200 - {"message": "Текущая версия документа успешно изменена"}
   * @responseBody 404 - {"message": "Версия не найдена или не принадлежит документу"}
   */
  async changeCurrentVersion({ params, request, response }: HttpContext) {
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

  /**
   * @getSchema
   * @tag Documents
   * @summary Получить объект схемы
   * @description Возвращает полный объект схемы с настройками, блоками и типами документов
   * @paramPath schemaName - Название схемы - eg: example
   * @responseBody 200 - {"schema": {"documents": [{"type": "passport", "block": "offerCreateBlock", "name": "Паспорт", "required": ["CREATION"], "access": {"show": "*", "editable": ["CREATION"]}}]}}
   * @responseBody 403 - {"message": "Нет доступа к схеме: nonexistent_schema", "code": "E_SCHEMA_ACCESS_DENIED"}
   */
  async getSchema({ params, response }: HttpContext) {
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
