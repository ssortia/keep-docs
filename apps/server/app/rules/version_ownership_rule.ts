import { inject } from '@adonisjs/core'
import Version from '#models/version'
import { VersionNotFoundException } from '#exceptions/document_exceptions'

@inject()
export class VersionOwnershipRule {
  /**
   * Валидирует принадлежность версии к досье и типу документа
   */
  async validate(dossierUuid: string, documentType: string, versionId: number): Promise<Version> {
    const version = await Version.query()
      .where('id', versionId)
      .preload('document', (documentQuery) => {
        documentQuery.preload('dossier')
      })
      .first()

    if (!version) {
      throw new VersionNotFoundException(versionId)
    }

    if (version.document.dossier.uuid !== dossierUuid || version.document.code !== documentType) {
      throw new VersionNotFoundException(versionId)
    }

    return version
  }
}
