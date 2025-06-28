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
import { DocumentHeader } from './DocumentHeader';
import { ImageModal } from './ImageModal';
import '../styles/index.css';

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
    enlargedPage,
    openImageModal,
    closeImageModal,
  } = useKeepDocsModals();

  const {
    handleDirectUpload,
    handlePageDelete,
    handleVersionChange,
    handleVersionCreate,
    handleVersionNameUpdate,
    handleVersionDelete,
    handlePageNavigation,
  } = useKeepDocsActions({
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
    (pageIndex: number) => {
      handlePageNavigation(pageIndex, enlargedPage, (page) =>
        openImageModal(page.src, page.pageIndex, page.total),
      );
    },
    [handlePageNavigation, enlargedPage, openImageModal],
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
              {currentDocument && activeSchemaDocument && (
                <DocumentHeader
                  name={activeSchemaDocument.name}
                  document={currentDocument}
                  onVersionChange={handleVersionChange}
                  onVersionNameUpdate={handleVersionNameUpdate}
                  onVersionCreate={handleVersionCreate}
                  onVersionDelete={handleVersionDelete}
                  loading={loading}
                />
              )}
              {isEditable && (
                <DocumentUploadArea
                  onFilesSelected={handleDirectUpload}
                  accept={activeSchemaDocument?.accept}
                />
              )}
              {currentDocument && activeSchemaDocument && (
                <DocumentPreview
                  document={currentDocument}
                  onPageDelete={handlePageDelete}
                  onPageEnlarge={openImageModal}
                  canDelete={isEditable}
                />
              )}
            </>
          )}
        </div>
      </div>

      {enlargedPage && (
        <ImageModal
          imageSrc={enlargedPage.src}
          imageNumber={enlargedPage.pageIndex + 1}
          totalImages={enlargedPage.total}
          onClose={closeImageModal}
          onPrevious={
            enlargedPage.pageIndex > 0
              ? () => handlePageNavigationWithModal(enlargedPage.pageIndex - 1)
              : undefined
          }
          onNext={
            enlargedPage.pageIndex < enlargedPage.total - 1
              ? () => handlePageNavigationWithModal(enlargedPage.pageIndex + 1)
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
