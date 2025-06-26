import React from 'react';
import type { Document, DocumentManagerConfig } from '../types';
import { VersionSelector } from './VersionSelector';

interface DocumentPreviewProps {
  uuid: string;
  name: string;
  document: Document;
  onPageDelete: (pageUuid: string) => void;
  onPageEnlarge: (imageSrc: string, pageNumber: number, totalPages: number) => void;
  onVersionChange: (versionId: number) => void;
  canDelete: boolean;
  config: DocumentManagerConfig;
  loading?: boolean;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  uuid,
  name,
  document,
  onPageDelete,
  onPageEnlarge,
  onVersionChange,
  canDelete,
  config,
  loading = false,
}) => {
  const getPageUrl = (pageNumber: number): string => {
    return `${config.baseUrl}/${uuid}/documents/${document.code}/${pageNumber}`;
  };

  const getDocumentDownloadUrl = (): string => {
    return `${config.baseUrl}/${uuid}/documents/${document.code}`;
  };

  const handleDownloadDocument = () => {
    const link = window.document.createElement('a');
    link.href = getDocumentDownloadUrl();
    link.download = `${name}.pdf`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handleDownloadPage = (pageNumber: number, fileName: string) => {
    const link = window.document.createElement('a');
    link.href = getPageUrl(pageNumber);
    link.download = fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };
  const getPageThumbnail = (file: any): string => {
    // Для изображений возвращаем прямую ссылку
    if (file.mimeType.startsWith('image/')) {
      return getPageUrl(file.pageNumber);
    }

    // Для других форматов возвращаем заглушку с расширением файла
    const extension = file.extension.toUpperCase();
    const svgPlaceholder = `
      <svg width="200" height="250" viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="250" fill="#F5F5F5"/>
        <rect x="20" y="40" width="160" height="8" fill="#DDDDDF"/>
        <rect x="20" y="60" width="120" height="8" fill="#DDDDDF"/>
        <rect x="20" y="80" width="140" height="8" fill="#DDDDDF"/>
        <text x="100" y="140" text-anchor="middle" fill="#999999" font-size="14">${extension} file</text>
      </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svgPlaceholder);
  };

  if (!document.files || document.files.length === 0) {
    return (
      <div className="document-preview-empty">
        <p>Нет загруженных страниц для этого документа</p>
      </div>
    );
  }

  return (
    <div className="document-preview">
      <div className="preview-header">
        <h4>{name}</h4>
        <div className="preview-header-controls">
          <VersionSelector
            versions={document.versions || []}
            currentVersion={document.currentVersion}
            onVersionChange={onVersionChange}
            disabled={loading}
          />
          <button
            type="button"
            className="download-document-button"
            onClick={handleDownloadDocument}
            title="Скачать весь документ"
          >
            ⬇ Скачать документ
          </button>
        </div>
      </div>

      <div className="preview-grid">
        {document.files.map((file) => (
          <div key={file.uuid} className="preview-item">
            <div className="preview-image-container">
              <img
                src={getPageThumbnail(file)}
                alt={`Страница ${file.pageNumber}`}
                className={`preview-image ${file.mimeType.startsWith('image/') ? 'clickable' : 'non-clickable'}`}
                onClick={
                  file.mimeType.startsWith('image/')
                    ? () =>
                        onPageEnlarge(
                          getPageThumbnail(file),
                          file.pageNumber,
                          (document.files as []).length,
                        )
                    : undefined
                }
              />

              <button
                type="button"
                className="download-page-button"
                onClick={() =>
                  handleDownloadPage(
                    file.pageNumber,
                    file.originalName || `page_${file.pageNumber}.${file.extension}`,
                  )
                }
                title="Скачать страницу"
              >
                ⬇
              </button>

              {canDelete && (
                <button
                  type="button"
                  className="delete-page-button"
                  onClick={() => onPageDelete(file.uuid)}
                  title="Удалить страницу"
                >
                  ×
                </button>
              )}
            </div>

            <div className="preview-info">
              <span className="page-number">
                {file.originalName || `Страница ${file.pageNumber}`}
              </span>
              <span className="file-type">{file.extension.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
