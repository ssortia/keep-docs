import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DocumentService } from '#services/document_service'
import { DossierService } from '#services/dossier_service'
import { DocumentAdapter } from '#adapters/document_adapter'
import {
  changeCurrentVersionValidator,
  addPagesValidator,
  getDocumentValidator,
} from '#validators/document_validator'
import { DocumentExistsRule } from '#rules/document_exists_rule'
import { FileExtensionRule } from '#rules/file_extension_rule'

@inject()
export default class DocumentController {
  constructor(
    private documentService: DocumentService,
    private dossierService: DossierService,
    private documentAdapter: DocumentAdapter,
    private documentExistsRule: DocumentExistsRule,
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
   */
  async setVersion({ params, request, response }: HttpContext) {
    const { uuid, type, versionId } = await changeCurrentVersionValidator.validate({
      ...params,
      versionId: request.input('versionId'),
    })

    const dossier = await this.dossierService.findDossierByUuid(uuid)
    const document = await this.documentService.findDocumentByDossierAndType(dossier, type)
    await this.documentExistsRule.validate(document)

    await this.documentService.changeCurrentVersion(document!, versionId)

    return response.ok({ message: 'Текущая версия документа успешно изменена' })
  }

  /**
   * @upload
   * @tag Documents
   * @summary Загрузить страницы документа
   * @description Загружает файлы документа в досье
   * @paramPath uuid - UUID досье - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @paramForm documents - Файлы документа (multipart/form-data)
   * @paramForm name - Название версии документа - eg: Паспорт 01.01.2024
   * @paramForm isNewVersion - Создать новую версию (true/false) - eg: false
   * @responseBody 201 - {"data": {"document": {"id": 1, "code": "passport"}, "version": {"id": 1, "name": "Паспорт 01.01.2024"}, "filesProcessed": 2, "pagesAdded": 2}}
   * @responseBody 422 - {"message": "Validation failed", "errors": [{"message": "Documents are required", "rule": "required", "field": "documents"}]}
   */
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
   * @description Скачивает документ как объединенный файл
   * @paramPath uuid - UUID досье - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @responseBody 200 - Файл документа в формате PDF или Excel
   * @responseBody 404 - {"message": "Документ не найден"}
   */
  async download({ params, response }: HttpContext) {
    const { uuid, type } = await getDocumentValidator.validate(params)

    const dossier = await this.dossierService.findDossierByUuid(uuid)
    const document = await this.documentService.findDocumentByDossierAndType(dossier, type)
    await this.documentExistsRule.validateHasFiles(document)

    return this.documentService.streamDocumentFiles(document!.files, type, response)
  }
}
