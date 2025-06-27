import React from 'react';
import type { Document } from '../types';
import { useDocumentUrls } from '../hooks/useDocumentUrls';
import { VersionSelector } from './VersionSelector';

interface DocumentPreviewProps {
  name: string;
  document: Document;
  onPageDelete: (pageUuid: string) => void;
  onPageEnlarge: (imageSrc: string, pageIndex: number, totalPages: number) => void;
  onVersionChange: (versionId: number) => void;
  canDelete: boolean;
  loading?: boolean;
}

export function DocumentPreview({
  name,
  document,
  onPageDelete,
  onPageEnlarge,
  onVersionChange,
  canDelete,
  loading = false,
}: DocumentPreviewProps) {
  const { getPageUrl, getDocumentUrl } = useDocumentUrls();

  const getDocumentPageUrl = (pageUuid: string): string => getPageUrl(document.code, pageUuid);
  const getDocumentDownloadUrl = (): string => getDocumentUrl(document.code);

  const handleDownloadDocument = () => {
    const link = window.document.createElement('a');
    link.href = getDocumentDownloadUrl();
    link.download = `${name}.pdf`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handleDownloadPage = (pageUuid: string, fileName: string) => {
    const link = window.document.createElement('a');
    link.href = getDocumentPageUrl(pageUuid);
    link.download = fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };
  const getPageThumbnail = (file: any): string => {
    if (file.mimeType.startsWith('image/')) {
      return getDocumentPageUrl(file.uuid);
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
    return `data:image/svg+xml;base64,${btoa(svgPlaceholder)}`;
  };

  const hasFiles = document.files && document.files.length > 0;

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
          {hasFiles && (
            <button
              type="button"
              className="download-document-button"
              onClick={handleDownloadDocument}
              title="Скачать весь документ"
            >
              ⬇ Скачать документ
            </button>
          )}
        </div>
      </div>

      {!hasFiles ? (
        <div className="document-preview-empty">
          <p>Нет загруженных страниц для этого документа</p>
        </div>
      ) : (
        <div className="preview-grid">
          {(document.files || []).map((file) => (
            <div key={file.uuid} className="preview-item">
              <div className="preview-image-container">
                {file.mimeType.startsWith('image/') ? (
                  <button
                    type="button"
                    className="preview-image clickable"
                    onClick={() =>
                      onPageEnlarge(
                        getPageThumbnail(file),
                        (document.files || []).indexOf(file),
                        (document.files as []).length,
                      )
                    }
                    title="Открыть изображение"
                  >
                    <img
                      src={getPageThumbnail(file)}
                      alt={`Страница ${(document.files || []).indexOf(file) + 1}`}
                    />
                  </button>
                ) : (
                  <img
                    src={getPageThumbnail(file)}
                    alt={`Страница ${(document.files || []).indexOf(file) + 1}`}
                    className="preview-image non-clickable"
                  />
                )}

                <button
                  type="button"
                  className="download-page-button"
                  onClick={() =>
                    handleDownloadPage(
                      file.uuid,
                      file.originalName ||
                        `page_${(document.files || []).indexOf(file) + 1}.${file.extension}`,
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
                  {file.originalName || `Страница ${(document.files || []).indexOf(file) + 1}`}
                </span>
                <span className="file-type">{file.extension.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
