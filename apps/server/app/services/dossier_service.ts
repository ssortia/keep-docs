import { inject } from '@adonisjs/core'
import Dossier from '#models/dossier'
import {
  DocumentProcessingException,
  DossierNotFoundException,
} from '#exceptions/document_exceptions'

export interface CreateDossierData {
  uuid: string
  schema?: string
  title?: string
  description?: string
}

@inject()
export class DossierService {
  /**
   * Находит или создает досье по UUID
   */
  async findOrCreateDossier(uuid: string, schema: string = 'default'): Promise<Dossier> {
    let dossier = await Dossier.findBy('uuid', uuid)

    if (!dossier) {
      dossier = await Dossier.create({ uuid, schema })
    }

    return dossier
  }

  /**
   * Создает новое досье с дополнительными параметрами
   */
  async createDossier(data: CreateDossierData): Promise<Dossier> {
    const existingDossier = await Dossier.findBy('uuid', data.uuid)

    if (existingDossier) {
      throw new DocumentProcessingException(`Досье с UUID ${data.uuid} уже существует`)
    }

    return Dossier.create({
      uuid: data.uuid,
      schema: data.schema,
    })
  }

  /**
   * Находит досье с документами
   */
  async findDossierWithDocuments(uuid: string): Promise<Dossier> {
    const dossier = await Dossier.query()
      .where('uuid', uuid)
      .preload('documents', (query) => {
        query.preload('currentVersion')
        query.preload('files', (fileQuery) => {
          fileQuery.whereNull('deletedAt')
          fileQuery.orderBy('pageNumber', 'asc')
        })
      })
      .first()

    if (!dossier) {
      throw new DossierNotFoundException(uuid)
    }

    return dossier
  }

  /**
   * Находит досье по UUID
   */
  async findDossierByUuid(uuid: string): Promise<Dossier> {
    const dossier = await Dossier.findBy('uuid', uuid)

    if (!dossier) {
      throw new DossierNotFoundException(uuid)
    }

    return dossier
  }
}
