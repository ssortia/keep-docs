import { inject } from '@adonisjs/core'
import Document from '#models/document'
import Version from '#models/version'
import { VersionExistenceRule } from '#rules/version_existence_rule'

@inject()
export class VersionService {
  constructor(private versionExistenceRule: VersionExistenceRule) {}

  /**
   * Создает новую версию документа
   */
  async createVersion(documentId: number, name?: string): Promise<Version> {
    name = name || this.generateVersionName()

    return await Version.create({ name, documentId })
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

  /**
   * Создает или находит версию документа
   */
  async createOrFindVersion(
    document: Document,
    versionName?: string,
    isNewVersion?: boolean
  ): Promise<Version> {
    if (isNewVersion) {
      return await this.createVersion(document.id, versionName)
    }

    const currentVersion = await Version.find(document.currentVersionId || 0)

    if (!currentVersion) {
      return await this.createVersion(document.id, versionName)
    }

    return currentVersion
  }

  /**
   * Генерирует имя версии
   */
  generateVersionName(): string {
    const now = new Date()
    return `v${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}.${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`
  }
}
