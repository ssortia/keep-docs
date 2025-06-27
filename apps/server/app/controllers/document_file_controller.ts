import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DocumentService } from '#services/document_service'
import { DossierService } from '#services/dossier_service'
import { deletePageValidator, getPageValidator } from '#validators/document_validator'
import { DocumentExistsRule } from '#rules/document_exists_rule'
import { FileExistsRule } from '#rules/file_exists_rule'

@inject()
export default class DocumentFileController {
  constructor(
    private documentService: DocumentService,
    private dossierService: DossierService,
    private documentExistsRule: DocumentExistsRule,
    private fileExistsRule: FileExistsRule
  ) {}

  /**
   * @getPage
   * @tag Document Files
   * @summary Скачать конкретную страницу
   * @description Скачивает отдельную страницу документа
   * @paramPath uuid - UUID досье клиента - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @paramPath pageUuid - UUID страницы - eg: 660e8400-e29b-41d4-a716-446655440001
   * @responseBody 200 - Файл страницы документа
   * @responseBody 404 - {"message": "Страница не найдена"}
   */
  async getPage({ params, response }: HttpContext) {
    const { uuid, type, pageUuid } = await getPageValidator.validate(params)

    const dossier = await this.dossierService.findDossierByUuid(uuid)
    const document = await this.documentService.findDocumentByDossierAndType(dossier, type)
    await this.documentExistsRule.validate(document)

    const file = await this.documentService.findFileByUuid(pageUuid, document)
    await this.fileExistsRule.validate(file, pageUuid)

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
    await this.documentExistsRule.validate(document)

    const file = await this.documentService.findFileByUuid(pageUuid, document)
    await this.fileExistsRule.validate(file, pageUuid)

    await this.documentService.deleteFile(file)

    return response.ok({ message: 'Страница успешно удалена' })
  }
}
