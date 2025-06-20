import type Dossier from '#models/dossier'
import type Document from '#models/document'
import type File from '#models/file'
import type Version from '#models/version'

export interface FileResponse {
  uuid: string
  originalName: string
  extension: string
  mimeType: string
  pageNumber: number
  path?: string
  size?: number
  createdAt: string
}

export interface DocumentResponse {
  code: string
  currentVersion?: string
  pageCount: number
  files: FileResponse[]
  createdAt: string
  updatedAt: string
}

export interface DossierResponse {
  uuid: string
  schema: string
  documents: DocumentResponse[]
  createdAt: string
  updatedAt: string
}

export interface DocumentUploadResponse {
  document: {
    code: string
    version: string
    filesProcessed: number
    pagesAdded: number
  }
  message: string
}

export interface PageResponse {
  uuid: string
  originalName: string
  extension: string
  mimeType: string
  pageNumber: number
  documentCode: string
  version: string
}

export class DocumentAdapter {
  formatFileResponse(file: File): FileResponse {
    return {
      uuid: file.uuid,
      originalName: file.originalName,
      extension: file.extension,
      mimeType: file.mimeType,
      pageNumber: file.pageNumber,
      createdAt: file.createdAt.toISO(),
    }
  }

  formatFileResponseWithDetails(file: File): FileResponse {
    return {
      uuid: file.uuid,
      originalName: file.originalName,
      extension: file.extension,
      mimeType: file.mimeType,
      pageNumber: file.pageNumber,
      path: file.path,
      size: file.size,
      createdAt: file.createdAt.toISO(),
    }
  }

  formatDocumentResponse(document: Document): DocumentResponse {
    return {
      code: document.code,
      currentVersion: document.currentVersion?.name,
      pageCount: document.files?.filter((f) => !f.deletedAt).length || 0,
      files: (document.files?.filter((f) => !f.deletedAt) || [])
        .map((file) => this.formatFileResponse(file))
        .sort((a, b) => a.pageNumber - b.pageNumber),
      createdAt: document.createdAt.toISO(),
      updatedAt: document.updatedAt.toISO(),
    }
  }

  formatDossierResponse(dossier: Dossier): DossierResponse {
    return {
      uuid: dossier.uuid,
      schema: dossier.schema,
      documents: (dossier.documents || []).map((doc) => this.formatDocumentResponse(doc)),
      createdAt: dossier.createdAt.toISO(),
      updatedAt: dossier.updatedAt.toISO(),
    }
  }

  formatDocumentUploadResponse(
    document: Document,
    version: Version,
    filesProcessed: number,
    pagesAdded: number
  ): DocumentUploadResponse {
    return {
      document: {
        code: document.code,
        version: version.name,
        filesProcessed,
        pagesAdded,
      },
      message: 'Document pages uploaded successfully',
    }
  }

  formatPageResponse(file: File, document: Document): PageResponse {
    return {
      uuid: file.uuid,
      originalName: file.originalName,
      extension: file.extension,
      mimeType: file.mimeType,
      pageNumber: file.pageNumber,
      documentCode: document.code,
      version: document.currentVersion?.name || 'unknown',
    }
  }

  formatDocumentListResponse(documents: Document[]): DocumentResponse[] {
    return documents.map((doc) => this.formatDocumentResponse(doc))
  }

  formatErrorResponse(message: string, code?: string, details?: any) {
    return {
      error: true,
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
    }
  }
}
