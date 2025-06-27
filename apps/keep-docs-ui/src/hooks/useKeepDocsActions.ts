import { useCallback } from 'react';
import { useKeepDocsContext } from '../contexts/KeepDocsContext';
import { useDocumentUrls } from './useDocumentUrls';
import { useApiError } from './useApiError';
import type { Document, Dossier } from '../types';
import { useDocumentManager } from './useDocumentManager';

interface UseKeepDocsActionsProps {
  activeTab: string;
  getCurrentDocument: () => Document | undefined;
  updateDossier: (dossier: Dossier) => void;
  onUpdate?: (document: Document) => void;
  onRemove?: (documentType: string, pageUuid: string) => void;
  onError?: (error: string) => void;
}

export function useKeepDocsActions({
  activeTab,
  getCurrentDocument,
  updateDossier,
  onUpdate,
  onRemove,
  onError,
}: UseKeepDocsActionsProps) {
  const { uuid } = useKeepDocsContext();
  const { getPageUrl } = useDocumentUrls();
  const { handleError } = useApiError();
  // Получаем API функции локально, чтобы избежать циклических зависимостей
  const { uploadDocument, deletePage, changeCurrentVersion, getDossier } = useDocumentManager();

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
        handleError(err, onError);
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
        handleError(err, onError);
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
        handleError(err, onError);
      }
    },
    [activeTab, changeCurrentVersion, uuid, refreshDossier, onUpdate, onError],
  );

  const handlePageNavigation = useCallback(
    (
      pageIndex: number,
      enlargedPage: { total: number } | null,
      setEnlargedPage: (page: { src: string; pageIndex: number; total: number }) => void,
    ) => {
      const currentDocument = getCurrentDocument();
      if (!currentDocument || !currentDocument.files || !enlargedPage) return;

      const targetFile = currentDocument.files[pageIndex];
      if (!targetFile || !targetFile.mimeType.startsWith('image/')) return;

      const pageUrl = getPageUrl(currentDocument.code, targetFile.uuid);
      setEnlargedPage({
        src: pageUrl,
        pageIndex,
        total: enlargedPage.total,
      });
    },
    [getCurrentDocument, getPageUrl],
  );

  return {
    handleVersionSubmit,
    handlePageDelete,
    handleVersionChange,
    handlePageNavigation,
    refreshDossier,
  };
}
