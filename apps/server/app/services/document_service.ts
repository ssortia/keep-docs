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
    private dossierService: DossierService
  ) {}

  /**
   * Обрабатывает загрузку документа с файлами
   */
  async processDocumentUpload(data: DocumentUploadData): Promise<DocumentUploadResult> {
    const trx = await db.transaction()

    try {
      const dossierPath = this.dossierService.generateDossierPath(data.dossier)
      const document = await this.findOrCreateDocument(data.dossier, data.documentType, trx)
      const version = await this.createOrFindVersion(
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
        await this.updateCurrentVersion(document, version.id, trx)
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
    // Сортируем файлы по номерам страниц перед объединением
    const sortedFiles = [...files].sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0))

    const processedFiles: ProcessedFile[] = sortedFiles.map((file) => ({
      uuid: file.uuid,
      originalName: file.originalName || 'unknown',
      extension: file.extension || 'pdf',
      mimeType: file.mimeType || 'application/pdf',
      size: 0, // Не используется при мердже
      path: file.path,
    }))

    return await this.fileProcessingService.mergeFiles(processedFiles)
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
   * Стримит файлы документа
   */
  async streamDocumentFiles(files: any[], documentType: string, response: any): Promise<any> {
    if (files.length === 1) {
      return await this.streamSingleFile(files[0], response)
    }

    // Объединяем несколько файлов
    const mergedFilePath = await this.mergeDocumentFiles(files)
    const { stream, size } = await this.fileProcessingService.getFileStream(mergedFilePath)

    response.header('Content-Type', 'application/pdf')
    response.header('Content-Length', size.toString())
    response.header('Content-Disposition', `attachment; filename="${documentType}.pdf"`)

    return response.stream(stream)
  }

  /**
   * Стримит один файл
   */
  async streamSingleFile(file: any, response: any): Promise<any> {
    const { stream, size, mimeType } = await this.fileProcessingService.getFileStream(file.path)

    response.header('Content-Type', mimeType)
    response.header('Content-Length', size.toString())
    response.header('Content-Disposition', `attachment; filename="${file.originalName}"`)

    return response.stream(stream)
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
   * Создает или находит версию документа
   */
  private async createOrFindVersion(
    document: Document,
    versionName?: string,
    isNewVersion?: boolean,
    trx?: TransactionClientContract
  ): Promise<Version> {
    if (isNewVersion) {
      return await this.createNewVersion(document.id, versionName, trx)
    }
    const currentVersion = await Version.find(document.currentVersionId || 0, { client: trx })

    if (!currentVersion) {
      return await this.createNewVersion(document.id, versionName, trx)
    }

    return currentVersion
  }

  /**
   * Создает новую версию
   */
  private async createNewVersion(
    documentId: number,
    versionName?: string,
    trx?: TransactionClientContract
  ): Promise<Version> {
    const name = versionName || this.generateVersionName()

    return await Version.create({ name, documentId }, { client: trx })
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

  /**
   * Обновляет текущую версию документа
   */
  async updateCurrentVersion(
    document: Document,
    versionId: number | null,
    trx?: TransactionClientContract
  ): Promise<void> {
    document.currentVersionId = versionId
    if (trx) {
      await document.useTransaction(trx).save()
    } else {
      await document.save()
    }
  }
}
