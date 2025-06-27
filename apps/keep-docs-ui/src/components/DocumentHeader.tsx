import React from 'react';
import type { Document } from '../types';
import { useDocumentUrls } from '../hooks/useDocumentUrls';
import { VersionSelector } from './VersionSelector';

interface DocumentHeaderProps {
  name: string;
  document: Document;
  onVersionChange: (versionId: number) => void;
  onVersionNameUpdate: (versionId: number, newName: string) => Promise<boolean>;
  onVersionDelete?: (versionId: number) => Promise<boolean>;
  loading?: boolean;
}

export function DocumentHeader({
  name,
  document,
  onVersionChange,
  onVersionNameUpdate,
  onVersionDelete,
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
  const canDeleteVersion = !hasFiles && onVersionDelete && document.currentVersion;

  const handleDeleteVersion = async () => {
    if (!document.currentVersion || !onVersionDelete) return;
    
    if (window.confirm('Вы уверены, что хотите удалить эту версию?')) {
      await onVersionDelete(document.currentVersion.id);
    }
  };

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
            className="action-document-button download-document-button"
            onClick={handleDownloadDocument}
            title="Скачать весь документ"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '6px' }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Скачать документ
          </button>
        )}
        {canDeleteVersion && (
          <button
            type="button"
            className="action-document-button delete-version-button"
            onClick={handleDeleteVersion}
            title="Удалить версию"
            disabled={loading}
          >
            ✕ Удалить версию
          </button>
        )}
      </div>
    </div>
  );
}
