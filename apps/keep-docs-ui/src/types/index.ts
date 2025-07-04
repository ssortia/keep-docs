export interface DossierFile {
  uuid: string;
  originalName: string;
  extension: string;
  mimeType: string;
  pageNumber: number; // Используется только для отображения, для API используется uuid
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
  versions: DocumentVersion[];
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

export interface DocumentManagerConfig {
  baseUrl: string;
  schema: string;
}

// Типы для схемы документов
export interface UISchemaDocument {
  type: string;
  name: string;
  block?: string;
  accept?: string[];
  required?: string[] | '*' | { [key: string]: string[] };
  access: {
    show: string[] | '*' | { [key: string]: string[] };
    editable: string[] | '*' | { [key: string]: string[] };
  };
}

export interface UISchema {
  documents: UISchemaDocument[];
}
