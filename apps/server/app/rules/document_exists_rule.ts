import { inject } from '@adonisjs/core'
import Document from '#models/document'
import { DocumentNotFoundException } from '#exceptions/document_exceptions'

@inject()
export class DocumentExistsRule {
  /**
   * Проверяет существование документа
   */
  async validate(document: Document | null, requireFiles = false): Promise<Document> {
    if (!document) {
      throw new DocumentNotFoundException()
    }

    if (requireFiles && (!document.files || document.files.length === 0)) {
      throw new DocumentNotFoundException()
    }

    return document
  }
}
