import { inject } from '@adonisjs/core'
import Dossier from '#models/dossier'
import { DossierNotFoundException } from '#exceptions/document_exceptions'

@inject()
export class DossierExistsRule {
  /**
   * Проверяет существование досье
   */
  async validate(dossier: Dossier | null, uuid?: string): Promise<Dossier> {
    if (!dossier) {
      throw new DossierNotFoundException(uuid)
    }
    return dossier
  }
}