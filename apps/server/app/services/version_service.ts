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
}
