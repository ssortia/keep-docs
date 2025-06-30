import { inject } from '@adonisjs/core'
import { DocumentService } from '#services/document_service'
import { DossierService } from '#services/dossier_service'
import { DocumentExistsRule } from '#rules/document_exists_rule'
import { FileExistsRule } from '#rules/file_exists_rule'
import type Document from '#models/document'
import type Dossier from '#models/dossier'
import type File from '#models/file'

interface DocumentAccessResult {
  dossier: Dossier
  document: Document
}

interface DocumentFileAccessResult extends DocumentAccessResult {
  file: File
}

@inject()
export class DocumentAccessValidator {
  constructor(
    private documentService: DocumentService,
    private dossierService: DossierService,
    private documentExistsRule: DocumentExistsRule,
    private fileExistsRule: FileExistsRule
  ) {}

  /**
   * Валидирует доступ к документу
   */
  async validateDocumentAccess(
    uuid: string,
    type: string,
    requireFiles = false
  ): Promise<DocumentAccessResult> {
    const dossier = await this.dossierService.findDossierByUuid(uuid)
    const document = await this.documentService.findDocument(dossier.id, type)
    await this.documentExistsRule.validate(document, requireFiles)

    return { dossier, document: document! }
  }

  /**
   * Валидирует доступ к документу и файлу
   */
  async validateDocumentFileAccess(
    uuid: string,
    type: string,
    pageUuid: string
  ): Promise<DocumentFileAccessResult> {
    const { dossier, document } = await this.validateDocumentAccess(uuid, type)

    const file = await this.documentService.findFileByUuid(pageUuid, document)
    await this.fileExistsRule.validate(file, pageUuid)

    return { dossier, document, file: file! }
  }
}
