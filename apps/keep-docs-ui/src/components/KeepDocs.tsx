import React, { useCallback, useEffect, useMemo } from 'react';
import { useDocumentManager } from '../hooks/useDocumentManager';
import { useKeepDocsState } from '../hooks/useKeepDocsState';
import { useKeepDocsInit } from '../hooks/useKeepDocsInit';
import { useKeepDocsModals } from '../hooks/useKeepDocsModals';
import { useKeepDocsActions } from '../hooks/useKeepDocsActions';
import { getVisibleDocuments, isDocumentEditable, type SchemaParams } from '../utils/schemaUtils';
import type { Document, DocumentManagerConfig, Dossier } from '../types';
import { KeepDocsProvider } from '../contexts/KeepDocsContext';
import { DocumentTabs } from './DocumentTabs';
import { DocumentUploadArea } from './DocumentUploadArea';
import { DocumentPreview } from './DocumentPreview';
import { VersionModal } from './VersionModal';
import { ImageModal } from './ImageModal';
import '../styles/KeepDocs.css';

export interface KeepDocsProps {
  config: DocumentManagerConfig;
  uuid: string;
  defaultTab?: string;
  params?: SchemaParams;
  documentGroups?: Record<string, readonly string[]>;
  onError?: (error: string) => void;
  onInit?: (dossier: Dossier) => void;
  onUpdate?: (document: Document) => void;
  onRemove?: (documentType: string, pageUuid: string) => void;
}

function KeepDocsContent({
  defaultTab,
  params = {},
  documentGroups,
  onError,
  onInit,
  onUpdate,
  onRemove,
}: Omit<KeepDocsProps, 'config' | 'uuid'>) {
  const { loading, error } = useDocumentManager();

  const {
    dossier,
    schema,
    activeTab,
    accordionOpen,
    updateDossier,
    updateSchema,
    setActiveTab,
    toggleAccordion,
    getCurrentDocument,
  } = useKeepDocsState();

  const {
    showVersionModal,
    pendingFiles,
    enlargedPage,
    openVersionModal,
    closeVersionModal,
    openImageModal,
    closeImageModal,
  } = useKeepDocsModals();

  const { handleVersionSubmit, handlePageDelete, handleVersionChange, handlePageNavigation } =
    useKeepDocsActions({
      activeTab,
      getCurrentDocument,
      updateDossier,
      onUpdate,
      onRemove,
      onError,
    });

  const visibleDocuments = useMemo(() => {
    if (!schema) return [];
    return getVisibleDocuments(schema.documents, params);
  }, [schema, params]);

  useKeepDocsInit({
    defaultTab,
    params,
    onInit,
    onError,
    updateDossier,
    updateSchema,
    setActiveTab,
  });

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  const currentDocument = getCurrentDocument();

  const handlePageNavigationWithModal = useCallback(
    (pageNumber: number) => {
      handlePageNavigation(pageNumber, enlargedPage, (page) =>
        openImageModal(page.src, page.pageNumber, page.total),
      );
    },
    [handlePageNavigation, enlargedPage, openImageModal],
  );

  const handleVersionSubmitWithModal = useCallback(
    async (versionName: string, isNewVersion: boolean) => {
      await handleVersionSubmit(versionName, isNewVersion, pendingFiles);
      closeVersionModal();
    },
    [handleVersionSubmit, pendingFiles, closeVersionModal],
  );

  const activeSchemaDocument = visibleDocuments.find((doc) => doc.type === activeTab);
  const isEditable = activeSchemaDocument
    ? isDocumentEditable(activeSchemaDocument, params)
    : false;

  return (
    <div className="keep-docs">
      <div className="keep-docs-layout">
        <div className="keep-docs-sidebar">
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
          <div role="button" tabIndex={0} className="accordion-header" onClick={toggleAccordion}>
            <span>Документы ({visibleDocuments.length})</span>
            <span className={`accordion-arrow ${accordionOpen ? 'open' : ''}`}>▼</span>
          </div>
          <div className={`document-tabs-container ${accordionOpen ? 'open' : ''}`}>
            <DocumentTabs
              documents={visibleDocuments}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              params={params}
              dossierDocuments={dossier?.documents || []}
              documentGroups={documentGroups}
            />
          </div>
        </div>

        <div className="keep-docs-content">
          {activeTab && dossier && (
            <>
              {isEditable && (
                <DocumentUploadArea
                  onFilesSelected={openVersionModal}
                  disabled={loading}
                  accept={activeSchemaDocument?.accept}
                />
              )}
              {currentDocument && activeSchemaDocument && (
                <DocumentPreview
                  name={activeSchemaDocument.name}
                  document={currentDocument}
                  onPageDelete={handlePageDelete}
                  onPageEnlarge={openImageModal}
                  onVersionChange={handleVersionChange}
                  canDelete={isEditable}
                  loading={loading}
                />
              )}
            </>
          )}
        </div>
      </div>

      {showVersionModal && (
        <VersionModal
          onSubmit={handleVersionSubmitWithModal}
          onCancel={closeVersionModal}
          filesCount={pendingFiles.length}
        />
      )}

      {enlargedPage && (
        <ImageModal
          imageSrc={enlargedPage.src}
          imageNumber={enlargedPage.pageNumber}
          totalImages={enlargedPage.total}
          onClose={closeImageModal}
          onPrevious={
            enlargedPage.pageNumber > 1
              ? () => handlePageNavigationWithModal(enlargedPage.pageNumber - 1)
              : undefined
          }
          onNext={
            enlargedPage.pageNumber < enlargedPage.total
              ? () => handlePageNavigationWithModal(enlargedPage.pageNumber + 1)
              : undefined
          }
        />
      )}
    </div>
  );
}

export function KeepDocs({
  config,
  uuid,
  defaultTab,
  params = {},
  documentGroups,
  onError,
  onInit,
  onUpdate,
  onRemove,
}: KeepDocsProps) {
  return (
    <KeepDocsProvider config={config} uuid={uuid}>
      <KeepDocsContent
        defaultTab={defaultTab}
        params={params}
        documentGroups={documentGroups}
        onError={onError}
        onInit={onInit}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    </KeepDocsProvider>
  );
}
