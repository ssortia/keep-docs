import { BusinessException } from './business_exceptions.js'

/**
 * Document not found exception
 */
export class DocumentNotFoundException extends BusinessException {
  constructor(documentId: string | number = '', options?: ErrorOptions) {
    super(`Document${documentId ? ` with id ${documentId}` : ''} not found`, options)
  }

  readonly code = 'E_DOCUMENT_NOT_FOUND'
  readonly status = 404
}

/**
 * Dossier not found exception
 */
export class DossierNotFoundException extends BusinessException {
  constructor(dossierUuid: string = '', options?: ErrorOptions) {
    super(`Dossier${dossierUuid ? ` with uuid ${dossierUuid}` : ''} not found`, options)
  }

  readonly code = 'E_DOSSIER_NOT_FOUND'
  readonly status = 404
}

/**
 * File not found exception
 */
export class FileNotFoundException extends BusinessException {
  constructor(fileId: string | number = '', options?: ErrorOptions) {
    super(`File${fileId ? ` with id ${fileId}` : ''} not found`, options)
  }

  readonly code = 'E_FILE_NOT_FOUND'
  readonly status = 404
}

/**
 * Page not found exception
 */
export class PageNotFoundException extends BusinessException {
  constructor(pageNumber: number | string = '', options?: ErrorOptions) {
    super(`Page${pageNumber ? ` ${pageNumber}` : ''} not found`, options)
  }

  readonly code = 'E_PAGE_NOT_FOUND'
  readonly status = 404
}

/**
 * Invalid document type exception
 */
export class InvalidDocumentTypeException extends BusinessException {
  constructor(documentType: string, schema: string, options?: ErrorOptions) {
    super(`Document type '${documentType}' is not valid for schema '${schema}'`, options)
  }

  readonly code = 'E_INVALID_DOCUMENT_TYPE'
  readonly status = 400
}

/**
 * Document processing exception
 */
export class DocumentProcessingException extends BusinessException {
  constructor(message: string = 'Failed to process document', options?: ErrorOptions) {
    super(message, options)
  }

  readonly code = 'E_DOCUMENT_PROCESSING_FAILED'
  readonly status = 422
}

/**
 * File size limit exceeded exception
 */
export class FileSizeLimitException extends BusinessException {
  constructor(filename: string, maxSize: string = '50MB', options?: ErrorOptions) {
    super(`File '${filename}' exceeds the maximum size limit of ${maxSize}`, options)
  }

  readonly code = 'E_FILE_SIZE_LIMIT'
  readonly status = 413
}

/**
 * Invalid file type exception
 */
export class InvalidFileTypeException extends BusinessException {
  constructor(filename: string, allowedTypes: string[] = [], options?: ErrorOptions) {
    const typesStr = allowedTypes.length > 0 ? ` (allowed: ${allowedTypes.join(', ')})` : ''
    super(`File '${filename}' has invalid type${typesStr}`, options)
  }

  readonly code = 'E_INVALID_FILE_TYPE'
  readonly status = 400
}

/**
 * Document version exception
 */
export class DocumentVersionException extends BusinessException {
  constructor(message: string = 'Document version error', options?: ErrorOptions) {
    super(message, options)
  }

  readonly code = 'E_DOCUMENT_VERSION_ERROR'
  readonly status = 422
}

/**
 * File system operation exception
 */
export class FileSystemException extends BusinessException {
  constructor(operation: string = 'file operation', options?: ErrorOptions) {
    super(`Failed to perform ${operation}`, options)
  }

  readonly code = 'E_FILE_SYSTEM_ERROR'
  readonly status = 500
}
