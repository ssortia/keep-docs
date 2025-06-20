import { inject } from '@adonisjs/core'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { Transaction } from '@adonisjs/lucid/types/database'
import db from '@adonisjs/lucid/services/db'
import Dossier from '#models/dossier'
import Document from '#models/document'
import Version from '#models/version'
import File from '#models/file'
import { FileProcessingService, ProcessedFile } from '#services/file_processing_service'
import {
  DossierNotFoundException,
  DocumentProcessingException,
} from '#exceptions/document_exceptions'

export interface DocumentUploadData {
  dossier: Dossier
  documentType: string
  files: MultipartFile[]
  versionName?: string
  isNewVersion?: boolean
}

export interface DocumentUploadResult {
  document: Document
  version: Version
  filesProcessed: number
  pagesAdded: number
}

@inject()
export class DocumentService {
  constructor(private fileProcessingService: FileProcessingService) {}

  /**
   * Валидирует тип документа согласно схеме досье
   */
  validateDocumentType(schema: string, documentType: string): boolean {
    try {
      const schemaData = JSON.parse(schema)
      const allowedTypes = schemaData.documentTypes || []
      return allowedTypes.includes(documentType)
    } catch {
      // Если схема невалидна, разрешаем любые типы
      return true
    }
  }

  /**
   * Обрабатывает загрузку документа с файлами
   */
  async processDocumentUpload(data: DocumentUploadData): Promise<DocumentUploadResult> {
    const trx = await db.transaction()

    try {
      // Обрабатываем файлы
      const processedFiles = await this.fileProcessingService.processUploadedFiles(data.files)

      // Находим или создаем документ
      const document = await this.findOrCreateDocument(data.dossier, data.documentType, trx)

      // Создаем или находим версию
      const version = await this.createOrFindVersion(
        document,
        data.versionName,
        data.isNewVersion,
        trx
      )

      // Сохраняем файлы в базу
      const savedFiles = await this.saveFilesToDatabase(processedFiles, document, version, trx)

      // Обновляем текущую версию документа, если она еще не установлена
      if (!document.currentVersionId) {
        await this.updateCurrentVersion(document, version, trx)
      }

      await trx.commit()

      return {
        document,
        version,
        filesProcessed: data.files.length,
        pagesAdded: savedFiles.length,
      }
    } catch (error) {
      await trx.rollback()
      throw new DocumentProcessingException(`Ошибка обработки загрузки: ${error.message}`)
    }
  }

  /**
   * Объединяет файлы документа в один PDF
   */
  async mergeDocumentFiles(files: File[]): Promise<string> {
    const processedFiles: ProcessedFile[] = files.map((file) => ({
      uuid: file.uuid,
      originalName: file.originalName || 'unknown',
      extension: file.extension || 'pdf',
      mimeType: file.mimeType || 'application/pdf',
      size: 0, // Не используется при мердже
      path: file.path,
      pageNumber: file.pageNumber || 0,
    }))

    return await this.fileProcessingService.mergeFiles(processedFiles)
  }

  /**
   * Находит документ по досье UUID и типу
   */
  async findDocumentByDossierAndType(
    dossierUuid: string,
    documentType: string
  ): Promise<Document | null> {
    const dossier = await Dossier.findBy('uuid', dossierUuid)
    if (!dossier) {
      throw new DossierNotFoundException(dossierUuid)
    }

    return await Document.query()
      .where('dossierId', dossier.id)
      .where('code', documentType)
      .preload('files', (query) => {
        query.whereNull('deletedAt').orderBy('pageNumber', 'asc')
      })
      .preload('currentVersion')
      .first()
  }

  /**
   * Находит файл по UUID с проверкой принадлежности к документу
   */
  async findFileByUuid(fileUuid: string, document: Document): Promise<File | null> {
    return await File.query()
      .where('uuid', fileUuid)
      .where('documentId', document.id)
      .whereNull('deletedAt')
      .first()
  }

  /**
   * Выполняет мягкое удаление файла
   */
  async softDeleteFile(file: File): Promise<void> {
    file.deletedAt = new Date()
    await file.save()
  }

  /**
   * Находит или создает досье по UUID
   */
  async findOrCreateDossier(uuid: string, schema: string = 'default'): Promise<Dossier> {
    let dossier = await Dossier.findBy('uuid', uuid)

    if (!dossier) {
      dossier = await Dossier.create({
        uuid,
        schema,
      })
    }

    return dossier
  }

  /**
   * Находит или создает документ
   */
  private async findOrCreateDocument(
    dossier: Dossier,
    documentType: string,
    trx: Transaction
  ): Promise<Document> {
    let document = await Document.query({ client: trx })
      .where('dossierId', dossier.id)
      .where('code', documentType)
      .first()

    if (!document) {
      document = await Document.create(
        {
          code: documentType,
          dossierId: dossier.id,
        },
        { client: trx }
      )
    }

    return document
  }

  /**
   * Создает или находит версию документа
   */
  private async createOrFindVersion(
    document: Document,
    versionName?: string,
    isNewVersion?: boolean,
    trx?: Transaction
  ): Promise<Version> {
    // Если документ новый или нужна новая версия
      if (isNewVersion) {
      return await this.createNewVersion(versionName, trx)
    }

    // Возвращаем текущую версию
    const currentVersion = await Version.find(document.currentVersionId, { client: trx })
    if (!currentVersion) {
      return await this.createNewVersion(versionName, trx)
    }

    return currentVersion
  }

  /**
   * Создает новую версию
   */
  private async createNewVersion(versionName?: string, trx?: Transaction): Promise<Version> {
    const name = versionName || this.generateVersionName()

    return await Version.create({ name }, { client: trx })
  }

  /**
   * Генерирует имя версии
   */
  private generateVersionName(): string {
    const now = new Date()
    return `v${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}.${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`
  }

  /**
   * Сохраняет обработанные файлы в базу данных
   */
  private async saveFilesToDatabase(
    processedFiles: ProcessedFile[],
    document: Document,
    version: Version,
    trx: Transaction
  ): Promise<File[]> {
    const savedFiles: File[] = []

    for (const processedFile of processedFiles) {
      const file = await File.create(
        {
          uuid: processedFile.uuid,
          name: processedFile.originalName,
          originalName: processedFile.originalName,
          extension: processedFile.extension,
          mimeType: processedFile.mimeType,
          path: processedFile.path,
          pageNumber: processedFile.pageNumber,
          documentId: document.id,
          versionId: version.id,
        },
        { client: trx }
      )

      savedFiles.push(file)
    }

    return savedFiles
  }

  /**
   * Обновляет текущую версию документа
   */
  private async updateCurrentVersion(
    document: Document,
    version: Version,
    trx: Transaction
  ): Promise<void> {
    document.currentVersionId = version.id
    await document.useTransaction(trx).save()
  }
}
