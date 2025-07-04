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

export interface VersionResponse {
  id: number
  name: string
  files: FileResponse[]
  createdAt: string
}

export interface DocumentResponse {
  id: number
  code: string
  currentVersion?: VersionResponse
  versions: VersionResponse[]
  filesCount: number
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
  data: {
    document: {
      id: number
      code: string
      createdAt: string
    }
    version: {
      id: number
      name: string
      createdAt: string
      isCurrent: boolean
    }
    filesProcessed: number
    pagesAdded: number
  }
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

export interface CreateDossierResponse {
  data: {
    id: number
    uuid: string
    schema: string
    documents: any[]
    createdAt: string
    updatedAt: string
  }
}

export class DocumentAdapter {
  formatFileResponse(file: File): FileResponse {
    return {
      uuid: file.uuid,
      originalName: file.originalName || '',
      extension: file.extension || '',
      mimeType: file.mimeType || '',
      pageNumber: file.pageNumber || 0,
      createdAt: file.createdAt.toISO() || '',
    }
  }

  formatFileResponseWithDetails(file: File): FileResponse {
    return {
      uuid: file.uuid,
      originalName: file.originalName || '',
      extension: file.extension || '',
      mimeType: file.mimeType || '',
      pageNumber: file.pageNumber || 0,
      path: file.path || undefined,
      createdAt: file.createdAt.toISO() || '',
    }
  }

  formatVersionResponse(version: Version): VersionResponse {
    return {
      id: version.id,
      name: version.name,
      files: version.files?.map((file) => this.formatFileResponse(file)) || [],
      createdAt: version.createdAt.toISO() || '',
    }
  }

  formatDocumentResponse(document: Document, versions: Version[] = []): DocumentResponse {
    // Фильтруем файлы только текущей версии
    const currentVersionFiles =
      document.files?.filter((f) => !f.deletedAt && f.versionId === document.currentVersionId) || []

    return {
      id: document.id,
      code: document.code,
      currentVersion: document.currentVersion
        ? this.formatVersionResponse(document.currentVersion)
        : undefined,
      versions: versions.map((version) => this.formatVersionResponse(version)),
      filesCount: currentVersionFiles.length,
      files: currentVersionFiles
        .map((file) => this.formatFileResponse(file))
        .sort((a, b) => a.pageNumber - b.pageNumber),
      createdAt: document.createdAt.toISO() || '',
      updatedAt: document.updatedAt.toISO() || '',
    }
  }

  formatDossierResponse(dossier: Dossier): DossierResponse {
    return {
      uuid: dossier.uuid,
      schema: dossier.schema,
      documents: (dossier.documents || []).map((doc) => this.formatDocumentResponse(doc)),
      createdAt: dossier.createdAt.toISO() || '',
      updatedAt: dossier.updatedAt.toISO() || '',
    }
  }

  formatDocumentUploadResponse(
    document: Document,
    version: Version,
    filesProcessed: number,
    pagesAdded: number
  ): DocumentUploadResponse {
    return {
      data: {
        document: {
          id: document.id,
          code: document.code,
          createdAt: document.createdAt.toISO() || '',
        },
        version: {
          id: version.id,
          name: version.name,
          createdAt: version.createdAt.toISO() || '',
          isCurrent: document.currentVersionId === version.id,
        },
        filesProcessed,
        pagesAdded,
      },
    }
  }

  formatCreateDossierResponse(dossier: Dossier): CreateDossierResponse {
    return {
      data: {
        id: dossier.id,
        uuid: dossier.uuid,
        schema: dossier.schema,
        documents: (dossier.documents || []).map((doc) => this.formatDocumentResponse(doc)),
        createdAt: dossier.createdAt.toISO() || '',
        updatedAt: dossier.updatedAt.toISO() || '',
      },
    }
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
