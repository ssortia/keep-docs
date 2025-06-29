import React, { useState } from 'react';
import type { Document } from '../types';
import { useDocumentUrls } from '../hooks/useDocumentUrls';
import { VersionSelector } from './VersionSelector';
import { ConfirmationModal } from './ConfirmationModal';
import { DownloadIcon } from './icons';

interface DocumentHeaderProps {
  name: string;
  document: Document;
  viewVersion?: any;
  onVersionChange: (versionId: number) => void;
  onViewVersionChange?: (versionId: number) => void;
  onVersionNameUpdate: (versionId: number, newName: string) => Promise<boolean>;
  onVersionCreate: (name: string) => Promise<boolean>;
  onVersionDelete?: (versionId: number) => Promise<boolean>;
}

export function DocumentHeader({
  name,
  document,
  viewVersion,
  onVersionChange,
  onViewVersionChange,
  onVersionNameUpdate,
  onVersionCreate,
  onVersionDelete,
}: DocumentHeaderProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
    await onVersionDelete(document.currentVersion.id);
  };

  return (
    <div className="document-header">
      <h4>{name}</h4>
      <div className="document-header-controls">
        <VersionSelector
          versions={document.versions || []}
          currentVersion={document.currentVersion}
          viewVersion={viewVersion}
          onVersionChange={onVersionChange}
          onViewVersionChange={onViewVersionChange}
          onVersionNameUpdate={onVersionNameUpdate}
          onVersionCreate={onVersionCreate}
        />
        {hasFiles && (
          <button
            type="button"
            className="action-document-button download-document-button"
            onClick={handleDownloadDocument}
            title="Скачать весь документ"
          >
            <DownloadIcon />
            <span className="download-document-button-text">Скачать документ</span>
          </button>
        )}
        {canDeleteVersion && (
          <button
            type="button"
            className="action-document-button delete-version-button"
            onClick={() => setShowDeleteModal(true)}
            title="Удалить версию"
          >
            ✕ Удалить версию
          </button>
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteVersion}
        title="Удаление версии"
        message={`Вы уверены, что хотите удалить версию "${document.currentVersion?.name}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      />
    </div>
  );
}
