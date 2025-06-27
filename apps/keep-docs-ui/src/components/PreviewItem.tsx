import React from 'react';
import type { Document } from '../types';
import { useDocumentUrls } from '../hooks/useDocumentUrls';

interface PreviewItemProps {
  file: any;
  document: Document;
  onPageDelete: (pageUuid: string) => void;
  onPageEnlarge: (imageSrc: string, pageIndex: number, totalPages: number) => void;
  canDelete: boolean;
}

export function PreviewItem({
  file,
  document,
  onPageDelete,
  onPageEnlarge,
  canDelete,
}: PreviewItemProps) {
  const { getPageUrl } = useDocumentUrls();

  const getDocumentPageUrl = (pageUuid: string): string => getPageUrl(document.code, pageUuid);

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

  const pageIndex = (document.files || []).indexOf(file);
  const totalPages = (document.files as []).length;

  return (
    <div className="preview-item">
      <div className="preview-image-container">
        {file.mimeType.startsWith('image/') ? (
          <button
            type="button"
            className="preview-image clickable"
            onClick={() => onPageEnlarge(getPageThumbnail(file), pageIndex, totalPages)}
            title="Открыть изображение"
          >
            <img src={getPageThumbnail(file)} alt={`Страница ${pageIndex + 1}`} />
          </button>
        ) : (
          <img
            src={getPageThumbnail(file)}
            alt={`Страница ${pageIndex + 1}`}
            className="preview-image non-clickable"
          />
        )}

        <button
          type="button"
          className="download-page-button"
          onClick={() =>
            handleDownloadPage(
              file.uuid,
              file.originalName || `page_${pageIndex + 1}.${file.extension}`,
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
        <span className="page-number">{file.originalName || `Страница ${pageIndex + 1}`}</span>
        <span className="file-type">{file.extension.toUpperCase()}</span>
      </div>
    </div>
  );
}
