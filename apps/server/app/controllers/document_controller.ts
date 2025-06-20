import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Dossier from '#models/dossier'
import { DocumentService } from '#services/document_service'
import { DocumentAdapter } from '#adapters/document_adapter'
import { FileProcessingService } from '#services/file_processing_service'
import {
  documentTypeValidator,
  dossierUuidValidator,
  pageNumberValidator,
  pageUuidValidator,
  uploadDocumentValidator,
} from '#validators/document_validator'
import {
  DocumentNotFoundException,
  DocumentProcessingException,
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
    console.log(312)
    try {
      const { uuid } = await dossierUuidValidator.validate(params)

      const dossier = await this.findDossierWithDocuments(uuid)
      const formattedResponse = this.documentAdapter.formatDossierResponse(dossier)

      return response.ok(formattedResponse)
    } catch (error) {
      if (error instanceof DossierNotFoundException) {
        throw error
      }
      throw new DocumentProcessingException('Ошибка получения документов')
    }
  }

  /**
   * GET /:uuid/documents/:type
   * Скачать полный документ как объединенный файл
   */
  async getDocument({ params, response }: HttpContext) {
    try {
      const { uuid } = await dossierUuidValidator.validate(params)
      const { type } = await documentTypeValidator.validate(params)

      const document = await this.documentService.findDocumentByDossierAndType(uuid, type)

      if (!document || !document.files || document.files.length === 0) {
        throw new DocumentNotFoundException()
      }

      return await this.streamDocumentFiles(document.files, type, response)
    } catch (error) {
      if (error instanceof DocumentNotFoundException) {
        throw error
      }
      console.log(error)
      throw new DocumentProcessingException('Ошибка получения документа')
    }
  }

  /**
   * PUT /:uuid/documents/:type
   * Загрузить страницы документа
   */
  async addPages({ params, request, response }: HttpContext) {
    try {
      const { uuid } = await dossierUuidValidator.validate(params)
      const { type } = await documentTypeValidator.validate(params)
      // Находим или создаем досье
      const dossier = await this.documentService.findOrCreateDossier(uuid)

      // Валидация типа документа
      if (!this.documentService.validateDocumentType(dossier.schema, type)) {
        throw new InvalidDocumentTypeException(type, dossier.schema)
      }

      const payload = await uploadDocumentValidator.validate({
        documents: request.files('documents'),
        name: request.input('name'),
        isNewVersion: request.input('isNewVersion', false),
      })

      const result = await this.documentService.processDocumentUpload({
        dossier,
        documentType: type,
        files: payload.documents,
        versionName: payload.name,
        isNewVersion: payload.isNewVersion,
      })

      const formattedResponse = this.documentAdapter.formatDocumentUploadResponse(
        result.document,
        result.version,
        result.filesProcessed,
        result.pagesAdded
      )

      return response.created(formattedResponse)
    } catch (error) {
      if (
        error instanceof InvalidDocumentTypeException ||
        error instanceof DossierNotFoundException
      ) {
        throw error
      }
      throw new DocumentProcessingException(`Ошибка загрузки документа: ${error.message}`)
    }
  }

  /**
   * GET /:uuid/documents/:type/:number
   * Скачать конкретную страницу
   */
  async getPage({ params, response }: HttpContext) {
    try {
      const { uuid } = await dossierUuidValidator.validate(params)
      const { type } = await documentTypeValidator.validate(params)
      const { number } = await pageNumberValidator.validate(params)

      const document = await this.documentService.findDocumentByDossierAndType(uuid, type)

      if (!document) {
        throw new DocumentNotFoundException()
      }

      const file = document.files?.find((f) => f.pageNumber === number)

      if (!file) {
        throw new PageNotFoundException(number)
      }

      return await this.streamSingleFile(file, response)
    } catch (error) {
      if (error instanceof DocumentNotFoundException || error instanceof PageNotFoundException) {
        throw error
      }
      throw new DocumentProcessingException('Ошибка получения страницы')
    }
  }

  /**
   * DELETE /:uuid/documents/:type/:pageUuid
   * Мягкое удаление страницы
   */
  async deletePage({ params, response }: HttpContext) {
    try {
      const { uuid } = await dossierUuidValidator.validate(params)
      const { type } = await documentTypeValidator.validate(params)
      const { pageUuid } = await pageUuidValidator.validate(params)

      const document = await this.documentService.findDocumentByDossierAndType(uuid, type)

      if (!document) {
        throw new DocumentNotFoundException()
      }

      const file = await this.documentService.findFileByUuid(pageUuid, document)

      if (!file) {
        throw new PageNotFoundException(pageUuid)
      }

      await this.documentService.softDeleteFile(file)

      return response.ok({ message: 'Страница успешно удалена' })
    } catch (error) {
      if (error instanceof DocumentNotFoundException || error instanceof PageNotFoundException) {
        throw error
      }
      throw new DocumentProcessingException('Ошибка удаления страницы')
    }
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
      return await this.streamSingleFile(files[0], response)
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
