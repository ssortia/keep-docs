import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { VersionService } from '#services/version_service'
import {
  createVersionValidator,
  deleteVersionValidator,
  updateVersionNameValidator,
} from '#validators/document_validator'
import { VersionOwnershipRule } from '#rules/version_ownership_rule'
import { DocumentService } from '#services/document_service'
import { DossierService } from '#services/dossier_service'
import { transaction } from 'adonisjs-transaction-decorator'

@inject()
export default class VersionController {
  constructor(
    private versionService: VersionService,
    private documentService: DocumentService,
    private versionOwnershipRule: VersionOwnershipRule,
    private dossierService: DossierService
  ) {}

  /**
   * @createVersion
   * @tag Versions
   * @summary Создать новую версию документа
   * @description Создает новую версию документа и автоматически делает её текущей
   * @paramPath uuid - UUID досье - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @requestBody {"name": "Паспорт обновленный 2024"}
   * @responseBody 201 - {"message": "Версия успешно создана", "version": {"id": 3, "name": "Паспорт обновленный 2024", "createdAt": "2024-01-01T12:00:00.000Z", "isCurrent": true}}
   * @responseBody 404 - {"message": "Документ не найден"}
   * @responseBody 422 - {"message": "Validation failed", "errors": [{"message": "The name field is required", "rule": "required", "field": "name"}]}
   */
  @transaction()
  async createVersion({ params, request, response }: HttpContext) {
    const { uuid, type, name } = await createVersionValidator.validate({
      ...params,
      name: request.input('name'),
    })

    const dossier = await this.dossierService.findDossierByUuid(uuid)
    const document = await this.documentService.findDocument(dossier.id, type)

    if (!document) {
      return response.notFound({ message: 'Документ не найден' })
    }

    const version = await this.versionService.createVersion(document.id, name)
    await this.versionService.changeCurrentVersion(document, version.id)

    return response.created({
      message: 'Версия успешно создана',
      version: {
        id: version.id,
        name: version.name,
      },
    })
  }

  /**
   * @updateVersionName
   * @tag Versions
   * @summary Изменить название версии
   * @description Изменяет название указанной версии документа. Можно редактировать любую версию
   * @paramPath uuid - UUID досье - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @paramPath versionId - ID версии - eg: 3
   * @requestBody {"name": "Паспорт финальная версия"}
   * @responseBody 200 - {"message": "Название версии успешно изменено"}
   * @responseBody 404 - {"message": "Версия не найдена"}
   * @responseBody 403 - {"message": "Нет доступа к версии"}
   * @responseBody 422 - {"message": "Validation failed", "errors": [{"message": "The name field is required", "rule": "required", "field": "name"}]}
   */
  async updateVersionName({ params, request, response }: HttpContext) {
    const { uuid, type, versionId, name } = await updateVersionNameValidator.validate({
      ...params,
      versionId: Number(params.versionId),
      name: request.input('name'),
    })

    await this.versionOwnershipRule.validate(uuid, type, versionId)
    await this.versionService.updateVersionName(versionId, name)

    return response.ok({ message: 'Название версии успешно изменено' })
  }

  /**
   * @deleteVersion
   * @tag Versions
   * @summary Удалить версию
   * @description Удаляет указанную версию документа. При удалении текущей версии автоматически выбирается предыдущая
   * @paramPath uuid - UUID досье - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @paramPath versionId - ID версии - eg: 3
   * @responseBody 200 - {"message": "Версия успешно удалена"}
   * @responseBody 404 - {"message": "Версия не найдена"}
   * @responseBody 403 - {"message": "Нет доступа к версии"}
   * @responseBody 409 - {"message": "Нельзя удалить единственную версию"}
   */
  @transaction()
  async deleteVersion({ params, response }: HttpContext) {
    const { uuid, type, versionId } = await deleteVersionValidator.validate({
      ...params,
      versionId: Number(params.versionId),
    })
    await this.versionOwnershipRule.validate(uuid, type, versionId)
    const dossier = await this.dossierService.findDossierByUuid(uuid)
    const document = await this.documentService.findDocument(dossier.id, type)

    if (document!.isCurrentVersion(versionId)) {
      const prevVersion =
        document!.versions
          .filter((v) => v.id !== versionId)
          .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())[0] || null

      await this.versionService.changeCurrentVersion(document!, prevVersion?.id || null)
    }

    await this.versionService.deleteVersion(versionId)

    return response.ok({ message: 'Версия успешно удалена' })
  }
}
