import { useCallback } from 'react';
import type { Document, DocumentManagerConfig, Dossier } from '../types';

interface UseKeepDocsActionsProps {
  uuid: string;
  config: DocumentManagerConfig;
  activeTab: string;
  getCurrentDocument: () => Document | undefined;
  onUpdate?: (document: Document) => void;
  onRemove?: (documentType: string, pageUuid: string) => void;
  onError?: (error: string) => void;
  uploadDocument: (
    uuid: string,
    documentType: string,
    files: File[],
    versionName: string,
    isNewVersion: boolean,
  ) => Promise<unknown>;
  deletePage: (uuid: string, documentType: string, pageUuid: string) => Promise<boolean>;
  changeCurrentVersion: (uuid: string, documentType: string, versionId: number) => Promise<boolean>;
  getDossier: (uuid: string) => Promise<Dossier | null>;
  updateDossier: (dossier: Dossier) => void;
}

export function useKeepDocsActions({
  uuid,
  config,
  activeTab,
  getCurrentDocument,
  onUpdate,
  onRemove,
  onError,
  uploadDocument,
  deletePage,
  changeCurrentVersion,
  getDossier,
  updateDossier,
}: UseKeepDocsActionsProps) {
  const refreshDossier = useCallback(async () => {
    try {
      const updatedDossier = await getDossier(uuid);
      if (updatedDossier) {
        updateDossier(updatedDossier);
        return updatedDossier;
      }
    } catch (err) {
      console.error('Ошибка обновления досье:', err);
    }
    return null;
  }, [getDossier, uuid, updateDossier]);

  const handleVersionSubmit = useCallback(
    async (versionName: string, isNewVersion: boolean, pendingFiles: File[]) => {
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
          const updatedDossier = await refreshDossier();
          if (updatedDossier) {
            const updatedDocument = updatedDossier.documents.find(
              (doc: Document) => doc.code === activeTab,
            );
            if (updatedDocument) {
              onUpdate?.(updatedDocument);
            }
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки файлов';
        onError?.(errorMessage);
      }
    },
    [activeTab, uploadDocument, uuid, refreshDossier, onUpdate, onError],
  );

  const handlePageDelete = useCallback(
    async (pageUuid: string) => {
      if (!activeTab) return;

      try {
        const success = await deletePage(uuid, activeTab, pageUuid);

        if (success) {
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
            const updatedDocument = updatedDossier.documents.find(
              (doc: Document) => doc.code === activeTab,
            );
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

  const handlePageNavigation = useCallback(
    (
      pageNumber: number,
      enlargedPage: { total: number } | null,
      setEnlargedPage: (page: { src: string; pageNumber: number; total: number }) => void,
    ) => {
      const currentDocument = getCurrentDocument();
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
    [getCurrentDocument, config.baseUrl, uuid],
  );

  return {
    handleVersionSubmit,
    handlePageDelete,
    handleVersionChange,
    handlePageNavigation,
    refreshDossier,
  };
}
