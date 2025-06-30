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
  async createVersion(documentId: number, name: string): Promise<Version> {
    const version = new Version()
    version.name = name
    version.documentId = documentId
    await version.save()

    return version
  }

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

  /**
   * Создает или находит версию документа
   */
  async createOrFindVersion(
    document: Document,
    versionName?: string,
    isNewVersion?: boolean
  ): Promise<Version> {
    if (isNewVersion) {
      return await this.createNewVersion(document.id, versionName)
    }

    const currentVersion = await Version.find(document.currentVersionId || 0)

    if (!currentVersion) {
      return await this.createNewVersion(document.id, versionName)
    }

    return currentVersion
  }

  /**
   * Создает новую версию
   */
  async createNewVersion(documentId: number, versionName?: string): Promise<Version> {
    const name = versionName || this.generateVersionName()
    return await Version.create({ name, documentId })
  }

  /**
   * Обновляет текущую версию документа
   */
  async updateCurrentVersion(document: Document, versionId: number | null): Promise<void> {
    document.currentVersionId = versionId
    await document.save()
  }

  /**
   * Генерирует имя версии
   */
  generateVersionName(): string {
    const now = new Date()
    return `v${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}.${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`
  }
}
