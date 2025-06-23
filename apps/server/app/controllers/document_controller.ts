import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DocumentService } from '#services/document_service'
import { DossierService } from '#services/dossier_service'
import { DocumentAdapter } from '#adapters/document_adapter'
import {
  getDocumentsValidator,
  getDocumentValidator,
  addPagesValidator,
  getPageValidator,
  deletePageValidator,
  createDossierValidator,
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
    private documentAdapter: DocumentAdapter,
  ) {}

  /**
   * POST /documents
   * Создать новое досье
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
   * GET /:uuid/documents
   * Получить все документы досье
   */
  async getDocuments({ params, response }: HttpContext) {
    const { uuid } = await getDocumentsValidator.validate(params)

    const dossier = await this.dossierService.findDossierWithDocuments(uuid)
    const formattedResponse = this.documentAdapter.formatDossierResponse(dossier)

    return response.ok(formattedResponse)
  }

  /**
   * GET /:uuid/documents/:type
   * Скачать полный документ как объединенный файл
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
   * PUT /:uuid/documents/:type
   * Загрузить страницы документа
   */
  async addPages({ params, request, response }: HttpContext) {
    const { uuid, type, documents, name, isNewVersion } = await addPagesValidator.validate({
      ...params,
      documents: request.files('documents'),
      name: request.input('name'),
      isNewVersion: request.input('isNewVersion', false),
    })

    const dossier = await this.dossierService.findOrCreateDossier(uuid)

    if (!SchemaValidator.validateDocumentType(dossier.schema, type)) {
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
   * GET /:uuid/documents/:type/:number
   * Скачать конкретную страницу
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
   * DELETE /:uuid/documents/:type/:pageUuid
   * Мягкое удаление страницы
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
