import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { VersionService } from '#services/version_service'
import { updateVersionNameValidator } from '#validators/document_validator'
import { VersionOwnershipRule } from '#rules/version_ownership_rule'

@inject()
export default class VersionController {
  constructor(
    private versionService: VersionService,
    private versionOwnershipRule: VersionOwnershipRule
  ) {}

  /**
   * @updateVersionName
   * @tag Versions
   * @summary Изменить название версии
   * @description Изменяет название указанной версии документа
   * @paramPath uuid - UUID досье клиента - eg: 550e8400-e29b-41d4-a716-446655440000
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
}
