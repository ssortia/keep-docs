import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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
    getViewVersion,
    setViewVersion,
    clearViewVersion,
    getDocumentForView,
  } = useKeepDocsState();

  const { viewedPage, openPageViewer, closePageViewer, autoClosePageViewer } = useKeepDocsModals();

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
  const documentForView = getDocumentForView();
  const prevActiveTab = useRef(activeTab);
  const prevVersionId = useRef(currentDocument?.currentVersion?.id);

  const handleViewVersionChange = useCallback(
    (versionId: number) => {
      if (activeTab) {
        setViewVersion(activeTab, versionId);
      }
    },
    [activeTab, setViewVersion],
  );

  const handlePageNavigationWithViewer = useCallback(
    (pageIndex: number) => {
      handlePageNavigation(pageIndex, viewedPage, (page) =>
        openPageViewer(page.src, page.pageIndex, page.total),
      );
    },
    [handlePageNavigation, viewedPage, openPageViewer],
  );

  // Автоматическое закрытие просмотра при смене контекста
  useEffect(() => {
    const tabChanged = prevActiveTab.current !== activeTab;
    const versionChanged = prevVersionId.current !== currentDocument?.currentVersion?.id;

    if ((tabChanged || versionChanged) && viewedPage) {
      autoClosePageViewer();
    }

    prevActiveTab.current = activeTab;
    prevVersionId.current = currentDocument?.currentVersion?.id;
  }, [activeTab, currentDocument?.currentVersion?.id, viewedPage, autoClosePageViewer]);

  const activeSchemaDocument = visibleDocuments.find((doc) => doc.type === activeTab);
  const viewVersionId = getViewVersion(activeTab || '');
  const currentVersionId = currentDocument?.currentVersion?.id;
  const isViewingCurrentVersion = !viewVersionId || viewVersionId === currentVersionId;
  const isEditable = activeSchemaDocument
    ? isDocumentEditable(activeSchemaDocument, params) && isViewingCurrentVersion
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
                  viewVersion={documentForView?.currentVersion}
                  onVersionChange={handleVersionChange}
                  onViewVersionChange={handleViewVersionChange}
                  onVersionNameUpdate={handleVersionNameUpdate}
                  onVersionCreate={handleVersionCreate}
                  onVersionDelete={handleVersionDelete}
                  loading={loading}
                />
              )}
              {isEditable && !viewedPage && (
                <DocumentUploadArea
                  onFilesSelected={handleDirectUpload}
                  accept={activeSchemaDocument?.accept}
                />
              )}
              {documentForView && activeSchemaDocument && (
                <DocumentPreview
                  document={documentForView}
                  onPageDelete={handlePageDelete}
                  onPageEnlarge={openPageViewer}
                  canDelete={isEditable}
                  viewedPage={viewedPage}
                  onCloseViewer={closePageViewer}
                  onNavigateViewer={handlePageNavigationWithViewer}
                />
              )}
            </>
          )}
        </div>
      </div>
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
