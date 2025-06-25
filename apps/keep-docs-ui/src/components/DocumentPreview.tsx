import React from 'react';
import type { Document, DocumentManagerConfig } from '../types';
import { VersionSelector } from './VersionSelector';

interface DocumentPreviewProps {
  uuid: string;
  name: string;
  document: Document;
  onPageDelete: (pageUuid: string) => void;
  onPageEnlarge: (imageSrc: string) => void;
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
  const getPageThumbnail = (file: any): string => {
    // Для изображений возвращаем прямую ссылку
    if (file.mimeType.startsWith('image/')) {
      return getPageUrl(file.pageNumber);
    }

    // Для PDF и других форматов возвращаем заглушку
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDIwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxyZWN0IHg9IjIwIiB5PSI0MCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSI4IiBmaWxsPSIjRERERERGIi8+CjxyZWN0IHg9IjIwIiB5PSI2MCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSI4IiBmaWxsPSIjRERERERGIi8+CjxyZWN0IHg9IjIwIiB5PSI4MCIgd2lkdGg9IjE0MCIgaGVpZ2h0PSI4IiBmaWxsPSIjRERERERGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LXNpemU9IjE0Ij5QREYgZmlsZTwvdGV4dD4KPC9zdmc+';
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
          <span className="files-count">Страниц: {document.files.length}</span>
        </div>
      </div>

      <div className="preview-grid">
        {document.files.map((file) => (
          <div key={file.uuid} className="preview-item">
            <div className="preview-image-container">
              <img
                src={getPageThumbnail(file)}
                alt={`Страница ${file.pageNumber}`}
                className="preview-image"
                onClick={() => onPageEnlarge(getPageThumbnail(file))}
              />

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
