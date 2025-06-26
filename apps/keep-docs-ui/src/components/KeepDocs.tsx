import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDocumentManager } from '../hooks/useDocumentManager';
import { getVisibleDocuments, isDocumentEditable } from '../utils/schemaUtils';
import type { Document, DocumentManagerConfig, Dossier, UISchema } from '../types';
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
  params?: { [key: string]: any };
  onError?: (error: string) => void;
  onInit?: (dossier: Dossier) => void;
  onUpdate?: (document: Document) => void;
  onRemove?: (documentType: string, pageUuid: string) => void;
}

export const KeepDocs: React.FC<KeepDocsProps> = ({
  config,
  uuid,
  defaultTab,
  params = {},
  onError,
  onInit,
  onUpdate,
  onRemove,
}) => {
  const {
    getDossier,
    uploadDocument,
    deletePage,
    changeCurrentVersion,
    getSchema,
    loading,
    error,
  } = useDocumentManager(config);

  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [schema, setSchema] = useState<UISchema | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [enlargedPage, setEnlargedPage] = useState<{
    src: string;
    pageNumber: number;
    total: number;
  } | null>(null);
  const [accordionOpen, setAccordionOpen] = useState(false);

  // Мемоизируем visibleDocuments чтобы избежать ререндеров
  const visibleDocuments = useMemo(() => {
    if (!schema) return [];
    return getVisibleDocuments(schema.documents, params);
  }, [schema, params]);

  // Используем ref для отслеживания инициализации
  const isInitialized = useRef(false);

  // Инициализация компонента - параллельные запросы схемы и досье
  useEffect(() => {
    if (isInitialized.current || !uuid || !config.schema) {
      return;
    }

    const initComponent = async () => {
      try {
        isInitialized.current = true;
        // Параллельные запросы схемы и досье
        const [schemaData, dossierData] = await Promise.all([
          getSchema(),
          getDossier(uuid),
        ]);

        if (schemaData) {
          setSchema(schemaData);
        }

        if (dossierData) {
          setDossier(dossierData);
          onInit?.(dossierData);
        }

        // Установка активной вкладки после получения схемы
        if (schemaData && schemaData.documents) {
          const visibleDocs = getVisibleDocuments(schemaData.documents, params);
          if (defaultTab && visibleDocs.find((doc) => doc.type === defaultTab)) {
            setActiveTab(defaultTab);
          } else if (visibleDocs.length > 0) {
            setActiveTab(visibleDocs[0].type);
          }
        }
      } catch (err) {
        isInitialized.current = false;
        const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки данных';
        onError?.(errorMessage);
      }
    };
    initComponent();
  }, [uuid, config.schema, defaultTab, params, getDossier, getSchema, onInit, onError]);

  // Обработка ошибок от хука
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  const handleFilesSelected = useCallback((files: File[]) => {
    setPendingFiles(files);
    setShowVersionModal(true);
  }, []);

  // Функция для обновления данных досье
  const refreshDossier = useCallback(async () => {
    try {
      const updatedDossier = await getDossier(uuid);
      if (updatedDossier) {
        setDossier(updatedDossier);
        return updatedDossier;
      }
    } catch (err) {
      console.error('Ошибка обновления досье:', err);
    }
    return null;
  }, [getDossier, uuid, config.schema]);

  const handleVersionSubmit = useCallback(
    async (versionName: string, isNewVersion: boolean) => {
      if (!activeTab || pendingFiles.length === 0) return;

      try {
        const result = await uploadDocument(
          uuid,
          activeTab,
          pendingFiles,
          versionName,
          isNewVersion,
        );

        if (result) {
          // Обновляем данные досье
          const updatedDossier = await refreshDossier();
          if (updatedDossier) {
            const updatedDocument = updatedDossier.documents.find((doc) => doc.code === activeTab);
            if (updatedDocument) {
              onUpdate?.(updatedDocument);
            }
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки файлов';
        onError?.(errorMessage);
      } finally {
        setShowVersionModal(false);
        setPendingFiles([]);
      }
    },
    [activeTab, pendingFiles, uploadDocument, uuid, refreshDossier, onUpdate, onError],
  );

  const handlePageDelete = useCallback(
    async (pageUuid: string) => {
      if (!activeTab) return;

      try {
        const success = await deletePage(uuid, activeTab, pageUuid);

        if (success) {
          // Обновляем данные досье
          await refreshDossier();
          onRemove?.(activeTab, pageUuid);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления страницы';
        onError?.(errorMessage);
      }
    },
    [activeTab, deletePage, uuid, refreshDossier, onRemove, onError],
  );

  const handleVersionChange = useCallback(
    async (versionId: number) => {
      if (!activeTab) return;

      try {
        const success = await changeCurrentVersion(uuid, activeTab, versionId);

        if (success) {
          const updatedDossier = await refreshDossier();
          if (updatedDossier) {
            const updatedDocument = updatedDossier.documents.find((doc) => doc.code === activeTab);
            if (updatedDocument) {
              onUpdate?.(updatedDocument);
            }
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ошибка изменения версии';
        onError?.(errorMessage);
      }
    },
    [activeTab, changeCurrentVersion, uuid, refreshDossier, onUpdate, onError],
  );
  const currentDocument = dossier?.documents.find((doc) => doc.code === activeTab);

  const handlePageNavigation = useCallback(
    (pageNumber: number) => {
      if (!currentDocument || !currentDocument.files || !enlargedPage) return;

      const targetFile = currentDocument.files.find((file) => file.pageNumber === pageNumber);
      if (!targetFile || !targetFile.mimeType.startsWith('image/')) return;

      const pageUrl = `${config.baseUrl}/${uuid}/documents/${currentDocument.code}/${pageNumber}`;
      setEnlargedPage({
        src: pageUrl,
        pageNumber,
        total: enlargedPage.total,
      });
    },
    [currentDocument, enlargedPage, config.baseUrl, uuid],
  );

  const activeSchemaDocument = visibleDocuments.find((doc) => doc.type === activeTab);
  const isEditable = activeSchemaDocument
    ? isDocumentEditable(activeSchemaDocument, params)
    : false;

  return (
    <div className="keep-docs">
      <div className="keep-docs-layout">
        <div className="keep-docs-sidebar">
          <div className="accordion-header" onClick={() => setAccordionOpen(!accordionOpen)}>
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
            />
          </div>
        </div>

        <div className="keep-docs-content">
          {activeTab && dossier && (
            <>
              {isEditable && (
                <DocumentUploadArea
                  onFilesSelected={handleFilesSelected}
                  disabled={loading}
                  accept={activeSchemaDocument?.accept}
                />
              )}
              {currentDocument && activeSchemaDocument && (
                <DocumentPreview
                  uuid={dossier.uuid}
                  name={activeSchemaDocument.name}
                  document={currentDocument}
                  onPageDelete={handlePageDelete}
                  onPageEnlarge={(src, pageNumber, total) =>
                    setEnlargedPage({ src, pageNumber, total })
                  }
                  onVersionChange={handleVersionChange}
                  canDelete={isEditable}
                  config={config}
                  loading={loading}
                />
              )}
            </>
          )}
        </div>
      </div>

      {showVersionModal && (
        <VersionModal
          onSubmit={handleVersionSubmit}
          onCancel={() => {
            setShowVersionModal(false);
            setPendingFiles([]);
          }}
          filesCount={pendingFiles.length}
        />
      )}

      {enlargedPage && (
        <ImageModal
          imageSrc={enlargedPage.src}
          imageNumber={enlargedPage.pageNumber}
          totalImages={enlargedPage.total}
          onClose={() => setEnlargedPage(null)}
          onPrevious={
            enlargedPage.pageNumber > 1
              ? () => handlePageNavigation(enlargedPage.pageNumber - 1)
              : undefined
          }
          onNext={
            enlargedPage.pageNumber < enlargedPage.total
              ? () => handlePageNavigation(enlargedPage.pageNumber + 1)
              : undefined
          }
        />
      )}
    </div>
  );
};
