import { inject } from '@adonisjs/core'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import db from '@adonisjs/lucid/services/db'
import Dossier from '#models/dossier'
import Document from '#models/document'
import Version from '#models/version'
import File from '#models/file'
import { FileProcessingService, ProcessedFile } from '#services/file_processing_service'
import { DossierService } from '#services/dossier_service'
import { VersionService } from '#services/version_service'
import { DocumentProcessingException } from '#exceptions/document_exceptions'

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

interface ProcessedFileWithPageNumber extends ProcessedFile {
  pageNumber: number
}

@inject()
export class DocumentService {
  constructor(
    private fileProcessingService: FileProcessingService,
    private dossierService: DossierService,
    private versionService: VersionService
  ) {}

  /**
   * Обрабатывает загрузку документа с файлами
   */
  async processDocumentUpload(data: DocumentUploadData): Promise<DocumentUploadResult> {
    const trx = await db.transaction()

    try {
      const dossierPath = this.dossierService.generateDossierPath(data.dossier)
      const document = await this.findOrCreateDocument(data.dossier, data.documentType, trx)
      const version = await this.versionService.createOrFindVersion(
        document,
        data.versionName,
        data.isNewVersion,
        trx
      )

      const processedFiles = await this.fileProcessingService.processUploadedFiles(
        data.files,
        dossierPath
      )

      const startPageNumber = await this.getNextPageNumber(version.id, trx)
      const filesWithPageNumbers = this.assignPageNumbers(processedFiles, startPageNumber)

      const savedFiles = await this.saveFilesToDatabase(
        filesWithPageNumbers,
        document,
        version,
        trx
      )

      // Устанавливаем текущую версию если это первая версия или создается новая версия
      if (!document.currentVersionId || data.isNewVersion) {
        await this.versionService.updateCurrentVersion(document, version.id, trx)
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
   * Находит документ по досье и типу с файлами текущей версии
   */
  async findDocument(dossierId: number, documentType: string): Promise<Document | null> {
    const document = await Document.query()
      .where('dossierId', dossierId)
      .where('code', documentType)
      .preload('currentVersion')
      .preload('versions')
      .first()

    if (!document || !document.currentVersionId) {
      return document
    }

    await document.load('files', (query) => {
      query
        .where('versionId', document.currentVersionId!)
        .whereNull('deletedAt')
        .orderBy('pageNumber', 'asc')
    })

    return document
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
  async deleteFile(file: File): Promise<void> {
    await file.delete()
  }

  /**
   * Находит или создает документ
   */
  private async findOrCreateDocument(
    dossier: Dossier,
    documentType: string,
    trx: TransactionClientContract
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
   * Сохраняет обработанные файлы в базу данных
   */
  private async saveFilesToDatabase(
    processedFiles: ProcessedFileWithPageNumber[],
    document: Document,
    version: Version,
    trx: TransactionClientContract
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
   * Присваивает номера страниц файлам
   */
  private assignPageNumbers(
    processedFiles: ProcessedFile[],
    startPageNumber: number
  ): ProcessedFileWithPageNumber[] {
    let currentPageNumber = startPageNumber

    return processedFiles.map((file) => ({
      ...file,
      pageNumber: currentPageNumber++,
    }))
  }

  /**
   * Получает следующий номер страницы для версии документа
   */
  private async getNextPageNumber(
    versionId: number,
    trx: TransactionClientContract
  ): Promise<number> {
    const maxPageFile = await File.query({ client: trx })
      .where('versionId', versionId)
      .whereNull('deletedAt')
      .orderBy('pageNumber', 'desc')
      .first()

    return maxPageFile && maxPageFile.pageNumber ? maxPageFile.pageNumber + 1 : 1
  }
}
