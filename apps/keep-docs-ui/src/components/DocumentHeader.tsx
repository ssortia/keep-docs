import React from 'react';
import type { Document } from '../types';
import { useDocumentUrls } from '../hooks/useDocumentUrls';
import { VersionSelector } from './VersionSelector';

interface DocumentHeaderProps {
  name: string;
  document: Document;
  onVersionChange: (versionId: number) => void;
  onVersionNameUpdate: (versionId: number, newName: string) => Promise<boolean>;
  loading?: boolean;
}

export function DocumentHeader({
  name,
  document,
  onVersionChange,
  onVersionNameUpdate,
  loading = false,
}: DocumentHeaderProps) {
  const { getDocumentUrl } = useDocumentUrls();

  const getDocumentDownloadUrl = (): string => getDocumentUrl(document.code);

  const handleDownloadDocument = () => {
    const link = window.document.createElement('a');
    link.href = getDocumentDownloadUrl();
    link.download = `${name}.pdf`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const hasFiles = document.files && document.files.length > 0;

  return (
    <div className="document-header">
      <h4>{name}</h4>
      <div className="document-header-controls">
        <VersionSelector
          versions={document.versions || []}
          currentVersion={document.currentVersion}
          onVersionChange={onVersionChange}
          onVersionNameUpdate={onVersionNameUpdate}
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
  );
}
