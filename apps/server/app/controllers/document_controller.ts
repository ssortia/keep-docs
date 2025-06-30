import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DocumentService } from '#services/document_service'
import { DossierService } from '#services/dossier_service'
import { DocumentStreamingService } from '#services/document_streaming_service'
import { DocumentAdapter } from '#adapters/document_adapter'
import {
  addPagesValidator,
  changeCurrentVersionValidator,
  getDocumentValidator,
} from '#validators/document_validator'
import { DocumentAccessValidator } from '#rules/document_access_validator'
import { FileExtensionRule } from '#rules/file_extension_rule'
import { transaction } from 'adonisjs-transaction-decorator'
import Version from '#models/version'

@inject()
export default class DocumentController {
  constructor(
    private documentService: DocumentService,
    private dossierService: DossierService,
    private documentStreamingService: DocumentStreamingService,
    private documentAdapter: DocumentAdapter,
    private documentAccessValidator: DocumentAccessValidator,
    private fileExtensionRule: FileExtensionRule
  ) {}

  /**
   * @setVersion
   * @tag Documents
   * @summary Изменить текущую версию
   * @description Изменяет текущую активную версию документа
   * @paramPath uuid - UUID досье - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @requestBody {"versionId": 2}
   * @responseBody 200 - {"message": "Текущая версия документа успешно изменена"}
   * @responseBody 404 - {"message": "Версия не найдена или не принадлежит документу"}
   * @responseBody 422 - {"message": "Validation failed", "errors": [{"message": "The versionId field must be a number", "rule": "number", "field": "versionId"}]}
   */
  async setVersion({ params, request, response }: HttpContext) {
    const { uuid, type, versionId } = await changeCurrentVersionValidator.validate({
      ...params,
      versionId: request.input('versionId'),
    })

    const { document } = await this.documentAccessValidator.validateDocumentAccess(uuid, type)
    const version = await Version.findOrFail(versionId)

    await this.documentService.changeCurrentVersion(document, version.id)

    return response.ok({ message: 'Текущая версия документа успешно изменена' })
  }

  /**
   * @upload
   * @tag Documents
   * @summary Загрузить страницы документа
   * @description Загружает файлы документа в досье. Поддерживает PDF, JPG, PNG файлы
   * @paramPath uuid - UUID досье - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @paramForm documents - Файлы документа (multipart/form-data)
   * @paramForm name - Название версии документа - eg: Паспорт обновленный
   * @paramForm isNewVersion - Создать новую версию (true/false) - eg: false
   * @responseBody 201 - {"data": {"document": {"id": 1, "code": "passport", "name": "Паспорт", "createdAt": "2024-01-01T00:00:00.000Z"}, "version": {"id": 1, "name": "Паспорт обновленный", "createdAt": "2024-01-01T12:00:00.000Z", "isCurrent": true}, "filesProcessed": 2, "pagesAdded": 2}}
   * @responseBody 422 - {"message": "Validation failed", "errors": [{"message": "Documents are required", "rule": "required", "field": "documents"}]}
   * @responseBody 413 - {"message": "Файл слишком большой. Максимальный размер: 10MB"}
   */
  @transaction()
  async upload({ params, request, response }: HttpContext) {
    const dossier = await this.dossierService.findOrCreateDossier(params.uuid)
    const { type, documents, name, isNewVersion } = await addPagesValidator.validate({
      ...params,
      documents: request.files('documents'),
      name: request.input('name'),
      isNewVersion: request.input('isNewVersion', false),
    })

    // Бизнес-валидация расширений файлов
    await this.fileExtensionRule.validate(dossier.schema, type, documents)

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
   * @tag Documents
   * @summary Скачать полный документ
   * @description Скачивает документ как объединенный файл (если воможно - объединяет страницы в pdf, если нет - возвращает архив)
   * @paramPath uuid - UUID досье - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @responseBody 200 - Файл документа в формате PDF или Excel
   * @responseBody 404 - {"message": "Документ не найден"}
   * @responseBody 403 - {"message": "Нет доступа к документу"}
   */
  async download({ params, response }: HttpContext) {
    const { uuid, type } = await getDocumentValidator.validate(params)

    const { document } = await this.documentAccessValidator.validateDocumentAccess(
      uuid,
      type,
      true // requireFiles
    )

    return this.documentStreamingService.streamDocumentFiles(document.files, type, response)
  }
}
