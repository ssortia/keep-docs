import { inject } from '@adonisjs/core'
import Dossier from '#models/dossier'
import Version from '#models/version'
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
   * Находит или создает досье по UUID с документами
   */
  async findOrCreateDossier(uuid: string, schema: string = 'default'): Promise<Dossier> {
    try {
      return await this.findDossierWithDocuments(uuid)
    } catch (error) {
      if (error instanceof DossierNotFoundException) {
        await Dossier.create({ uuid, schema })
        return await this.findDossierWithDocuments(uuid)
      }
      throw error
    }
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
        query.preload('versions', (versionQuery) => {
          versionQuery.orderBy('created_at', 'desc')
        })
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

  /**
   * Получает все версии для документа
   */
  async getDocumentVersions(documentId: number): Promise<Version[]> {
    return Version.query()
      .preload('files')
      .where('document_id', documentId)
      .orderBy('created_at', 'desc')
  }

  /**
   * Генерирует иерархический путь для досье в формате uploads/2025/06/23/[uuid]
   */
  generateDossierPath(dossier: Dossier): string {
    const createdAt = dossier.createdAt
    const year = createdAt.year.toString()
    const month = createdAt.month.toString().padStart(2, '0')
    const day = createdAt.day.toString().padStart(2, '0')

    return `${year}/${month}/${day}/${dossier.uuid}`
  }
}
