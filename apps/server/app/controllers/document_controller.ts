import type { HttpContext } from '@adonisjs/core/http'

export default class DocumentController {
  /**
   * GET /:uuid/documents
   * Get all documents for a classification
   */
  async getDocuments(context: HttpContext) {}

  /**
   * GET /:uuid/documents/:type
   * Get document by type
   */
  async getDocument(context: HttpContext) {}

  /**
   * PUT /:uuid/documents/:type
   * Add pages to document
   */
  async addPages(context: HttpContext) {}

  /**
   * GET /:uuid/documents/:type/:number
   * Get specific page from document
   */
  async getPage(context: HttpContext) {}

  /**
   * DELETE /:uuid/documents/:type/:pageUuid
   * Delete specific page from document
   */
  async deletePage(context: HttpContext) {}
}
