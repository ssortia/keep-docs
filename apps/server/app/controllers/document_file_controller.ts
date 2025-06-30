import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DocumentService } from '#services/document_service'
import { DocumentStreamingService } from '#services/document_streaming_service'
import { deletePageValidator, getPageValidator } from '#validators/document_validator'
import { DocumentAccessValidator } from '#rules/document_access_validator'

@inject()
export default class DocumentFileController {
  constructor(
    private documentService: DocumentService,
    private documentStreamingService: DocumentStreamingService,
    private documentAccessValidator: DocumentAccessValidator
  ) {}

  /**
   * @getPage
   * @tag Document Files
   * @summary Скачать конкретную страницу
   * @description Скачивает отдельную страницу документа
   * @paramPath uuid - UUID досье - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @paramPath pageUuid - UUID страницы - eg: 660e8400-e29b-41d4-a716-446655440001
   * @responseBody 200 - Файл страницы документа
   * @responseBody 404 - {"message": "Страница не найдена"}
   * @responseBody 403 - {"message": "Нет доступа к странице"}
   */
  async getPage({ params, response }: HttpContext) {
    const { uuid, type, pageUuid } = await getPageValidator.validate(params)

    const { file } = await this.documentAccessValidator.validateDocumentFileAccess(
      uuid,
      type,
      pageUuid
    )

    return this.documentStreamingService.streamSingleFile(file, response)
  }

  /**
   * @deletePage
   * @tag Document Files
   * @summary Удалить страницу
   * @description Выполняет мягкое удаление страницы документа. Страница помечается как удаленная
   * @paramPath uuid - UUID досье - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @paramPath pageUuid - UUID страницы - eg: 660e8400-e29b-41d4-a716-446655440001
   * @responseBody 200 - {"message": "Страница успешно удалена"}
   * @responseBody 404 - {"message": "Страница не найдена"}
   * @responseBody 403 - {"message": "Нет доступа к странице"}
   * @responseBody 409 - {"message": "Страница уже удалена"}
   */
  async deletePage({ params, response }: HttpContext) {
    const { uuid, type, pageUuid } = await deletePageValidator.validate(params)

    const { file } = await this.documentAccessValidator.validateDocumentFileAccess(
      uuid,
      type,
      pageUuid
    )

    await this.documentService.deleteFile(file)

    return response.ok({ message: 'Страница успешно удалена' })
  }
}
