export interface DossierFile {
  uuid: string;
  originalName: string;
  extension: string;
  mimeType: string;
  pageNumber: number;
  createdAt: string;
}

export interface DocumentVersion {
  id: number;
  name: string;
  createdAt: string;
}

export interface Document {
  id: number;
  code: string;
  currentVersion?: DocumentVersion;
  filesCount: number;
  files?: DossierFile[];
  createdAt: string;
  updatedAt: string;
}

export interface Dossier {
  id: number;
  uuid: string;
  schema: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentUploadResponse {
  data: {
    document: {
      id: number;
      code: string;
    };
    version: {
      id: number;
      name: string;
    };
    filesProcessed: number;
    pagesAdded: number;
  };
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
}

export interface DocumentManagerConfig {
  baseUrl: string;
  schema: string;
}