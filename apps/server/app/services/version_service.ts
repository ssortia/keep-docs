import { inject } from '@adonisjs/core'
import Document from '#models/document'
import Version from '#models/version'
import { VersionExistenceRule } from '#rules/version_existence_rule'

@inject()
export class VersionService {
  constructor(private versionExistenceRule: VersionExistenceRule) {}
  /**
   * Изменяет текущую версию документа
   */
  async changeCurrentVersion(document: Document, versionId: number): Promise<void> {
    const version = await Version.find(versionId)
    await this.versionExistenceRule.validate(version)

    document.currentVersionId = versionId
    await document.save()
  }

  /**
   * Обновляет название версии
   */
  async updateVersionName(versionId: number, name: string): Promise<void> {
    const version = await Version.find(versionId)
    await this.versionExistenceRule.validate(version)

    version!.name = name
    await version!.save()
  }

  /**
   * Удаляет версию
   * @param versionId
   */
  async deleteVersion(versionId: number): Promise<void> {
    const version = await Version.find(versionId)
    await this.versionExistenceRule.validate(version)

    await version!.delete()
  }
}
