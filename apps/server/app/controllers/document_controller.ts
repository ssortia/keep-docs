import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Dossier from '#models/dossier'
import { DocumentService } from '#services/document_service'
import { DocumentAdapter } from '#adapters/document_adapter'
import { FileProcessingService } from '#services/file_processing_service'
import {
  getDocumentsValidator,
  getDocumentValidator,
  addPagesValidator,
  getPageValidator,
  deletePageValidator,
} from '#validators/document_validator'
import {
  DocumentNotFoundException,
  DossierNotFoundException,
  InvalidDocumentTypeException,
  PageNotFoundException,
} from '#exceptions/document_exceptions'

@inject()
export default class DocumentController {
  constructor(
    private documentService: DocumentService,
    private documentAdapter: DocumentAdapter,
    private fileProcessingService: FileProcessingService
  ) {}

  /**
   * GET /:uuid/documents
   * Получить все документы досье
   */
  async getDocuments({ params, response }: HttpContext) {
    const { uuid } = await getDocumentsValidator.validate(params)

    const dossier = await this.findDossierWithDocuments(uuid)
    const formattedResponse = this.documentAdapter.formatDossierResponse(dossier)

    return response.ok(formattedResponse)
  }

  /**
   * GET /:uuid/documents/:type
   * Скачать полный документ как объединенный файл
   */
  async getDocument({ params, response }: HttpContext) {
    const { uuid, type } = await getDocumentValidator.validate(params)

    const document = await this.documentService.findDocumentByDossierAndType(uuid, type)

    if (!document || !document.files || document.files.length === 0) {
      throw new DocumentNotFoundException()
    }

    return this.streamDocumentFiles(document.files, type, response)
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

    const dossier = await this.documentService.findOrCreateDossier(uuid)

    if (!this.documentService.validateDocumentType(dossier.schema, type)) {
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

    const document = await this.documentService.findDocumentByDossierAndType(uuid, type)

    if (!document) {
      throw new DocumentNotFoundException()
    }

    const file = document.files?.find((f) => f.pageNumber === number)

    if (!file) {
      throw new PageNotFoundException(number)
    }

    return this.streamSingleFile(file, response)
  }

  /**
   * DELETE /:uuid/documents/:type/:pageUuid
   * Мягкое удаление страницы
   */
  async deletePage({ params, response }: HttpContext) {
    const { uuid, type, pageUuid } = await deletePageValidator.validate(params)

    const document = await this.documentService.findDocumentByDossierAndType(uuid, type)

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
   * Находит досье с документами
   */
  private async findDossierWithDocuments(uuid: string) {
    const dossier = await Dossier.query()
      .where('uuid', uuid)
      .preload('documents', (query) => {
        query.preload('currentVersion')
        query.preload('files', (fileQuery) => {
          fileQuery.whereNull('deletedAt')
          fileQuery.orderBy('pageNumber', 'asc')
        })
      })
      .first()

    if (!dossier) {
      throw new DossierNotFoundException(uuid)
    }

    return dossier
  }

  /**
   * Стримит файлы документа
   */
  private async streamDocumentFiles(files: any[], documentType: string, response: any) {
    if (files.length === 1) {
      return this.streamSingleFile(files[0], response)
    }

    // Объединяем несколько файлов
    const mergedFilePath = await this.documentService.mergeDocumentFiles(files)
    const { stream, size } = await this.fileProcessingService.getFileStream(mergedFilePath)

    response.header('Content-Type', 'application/pdf')
    response.header('Content-Length', size.toString())
    response.header('Content-Disposition', `attachment; filename="${documentType}.pdf"`)

    return response.stream(stream)
  }

  /**
   * Стримит один файл
   */
  private async streamSingleFile(file: any, response: any) {
    const { stream, size, mimeType } = await this.fileProcessingService.getFileStream(file.path)

    response.header('Content-Type', mimeType)
    response.header('Content-Length', size.toString())
    response.header('Content-Disposition', `attachment; filename="${file.originalName}"`)

    return response.stream(stream)
  }
}
