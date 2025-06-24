import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDocumentManager } from '../hooks/useDocumentManager';
import { getVisibleDocuments, isDocumentEditable } from '../utils/schemaUtils';
import type { UISchema } from '../exampleSchema';
import type { Document, DocumentManagerConfig, Dossier } from '../types';
import { DocumentTabs } from './DocumentTabs';
import { DocumentUploadArea } from './DocumentUploadArea';
import { DocumentPreview } from './DocumentPreview';
import { VersionModal } from './VersionModal';
import '../styles/KeepDocs.css';

export interface KeepDocsProps {
  config: DocumentManagerConfig;
  schema: UISchema;
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
  schema,
  uuid,
  defaultTab,
  params = {},
  onError,
  onInit,
  onUpdate,
  onRemove,
}) => {
  const { getDossier, uploadDocument, deletePage, loading, error } = useDocumentManager(config);

  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [enlargedPage, setEnlargedPage] = useState<string | null>(null);

  // Мемоизируем visibleDocuments чтобы избежать ререндеров
  const visibleDocuments = useMemo(() => {
    return getVisibleDocuments(schema.documents, params);
  }, [schema.documents, params]);

  // Используем ref для отслеживания инициализации
  const isInitialized = useRef(false);

  // Инициализация компонента
  useEffect(() => {
    if (isInitialized.current || !uuid || visibleDocuments.length === 0) {
      return;
    }

    const initComponent = async () => {
      try {
        isInitialized.current = true;
        const dossierData = await getDossier(uuid);
        if (dossierData) {
          setDossier(dossierData);
          onInit?.(dossierData);

          // Установка активной вкладки
          if (defaultTab && visibleDocuments.find((doc) => doc.type === defaultTab)) {
            setActiveTab(defaultTab);
          } else if (visibleDocuments.length > 0) {
            setActiveTab(visibleDocuments[0].type);
          }
        }
      } catch (err) {
        isInitialized.current = false;
        const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки данных';
        onError?.(errorMessage);
      }
    };

    initComponent();
  }, [uuid, defaultTab, visibleDocuments, getDossier, onInit, onError]);

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
  }, [getDossier, uuid]);

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

  const currentDocument = dossier?.documents.find((doc) => doc.code === activeTab);
  const activeSchemaDocument = visibleDocuments.find((doc) => doc.type === activeTab);
  const isEditable = activeSchemaDocument
    ? isDocumentEditable(activeSchemaDocument, params)
    : false;

  if (visibleDocuments.length === 0) {
    return <div className="keep-docs-empty">Нет доступных документов для отображения</div>;
  }

  return (
    <div className="keep-docs">
      <div className="keep-docs-layout">
        <div className="keep-docs-sidebar">
          <DocumentTabs
            documents={visibleDocuments}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            params={params}
            dossierDocuments={dossier?.documents || []}
          />
        </div>

        <div className="keep-docs-content">
          {activeTab && (
            <>
              {isEditable && (
                <DocumentUploadArea
                  onFilesSelected={handleFilesSelected}
                  disabled={loading}
                  accept={activeSchemaDocument?.accept}
                />
              )}
              {currentDocument && (
                <DocumentPreview
                  uuid={dossier?.uuid}
                  document={currentDocument}
                  onPageDelete={handlePageDelete}
                  onPageEnlarge={setEnlargedPage}
                  canDelete={isEditable}
                  config={config}
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
        <div className="keep-docs-enlarged-overlay" onClick={() => setEnlargedPage(null)}>
          <div className="keep-docs-enlarged-content">
            <button className="keep-docs-close-button" onClick={() => setEnlargedPage(null)}>
              ×
            </button>
            <img
              src={enlargedPage}
              alt="Увеличенная страница"
              className="keep-docs-enlarged-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};
