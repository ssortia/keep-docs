import { inject } from '@adonisjs/core'
import Version from '#models/version'
import { VersionNotFoundException } from '#exceptions/document_exceptions'

@inject()
export class VersionExistenceRule {
  /**
   * Проверяет существование версии
   */
  async validate(version: Version | null, versionId?: number): Promise<Version> {
    if (!version) {
      throw new VersionNotFoundException(versionId)
    }

    return version
  }
}
