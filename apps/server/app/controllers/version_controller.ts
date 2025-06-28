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
   * @description Создает новую версию документа и делает её текущей
   * @paramPath uuid - UUID досье - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @requestBody {"name": "Название новой версии"}
   * @responseBody 201 - {"message": "Версия успешно создана", "version": {"id": 1, "name": "Название версии"}}
   * @responseBody 404 - {"message": "Документ не найден"}
   */
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
    await this.documentService.updateCurrentVersion(document, version.id)

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
   * @description Изменяет название указанной версии документа
   * @paramPath uuid - UUID досье - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @paramPath versionId - ID версии - eg: 1
   * @requestBody {"name": "Новое название версии"}
   * @responseBody 200 - {"message": "Название версии успешно изменено"}
   * @responseBody 404 - {"message": "Версия не найдена"}
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
   * @description Удаляет указанную версию документа
   * @paramPath uuid - UUID досье - eg: 550e8400-e29b-41d4-a716-446655440000
   * @paramPath type - Тип документа - eg: passport
   * @paramPath versionId - ID версии - eg: 1
   * @responseBody 200 - {"message": "Версия успешно удалена"}
   * @responseBody 404 - {"message": "Версия не найдена"}
   */
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

      await this.documentService.updateCurrentVersion(document!, prevVersion?.id || null)
    }

    await this.versionService.deleteVersion(versionId)

    return response.ok({ message: 'Версия успешно удалена' })
  }
}
