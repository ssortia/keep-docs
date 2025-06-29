import { useCallback } from 'react';
import { useKeepDocsContext } from '../contexts/KeepDocsContext';
import { useDocumentUrls } from './useDocumentUrls';
import { useApiError } from './useApiError';
import type { Document, Dossier } from '../types';

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
  const { uuid, documentManager } = useKeepDocsContext();
  const { getPageUrl } = useDocumentUrls();
  const { handleError } = useApiError();
  // Получаем API функции из контекста
  const {
    uploadDocument,
    deletePage,
    changeCurrentVersion,
    createVersion,
    updateVersionName,
    deleteVersion,
    getDossier,
  } = documentManager;

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

  const handleDirectUpload = useCallback(
    async (files: File[]) => {
      if (!activeTab || files.length === 0) return;

      try {
        const result = await uploadDocument(
          uuid,
          activeTab,
          files,
          undefined, // versionName
          false, // isNewVersion - всегда загружаем в текущую версию
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
    [activeTab, uploadDocument, uuid, refreshDossier, onUpdate, onError, handleError],
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

  const handleVersionCreate = useCallback(
    async (name: string) => {
      if (!activeTab) return false;

      try {
        const success = await createVersion(uuid, activeTab, name);

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
          return true;
        }
      } catch (err) {
        handleError(err, onError);
      }
      return false;
    },
    [activeTab, createVersion, uuid, refreshDossier, onUpdate, onError],
  );

  const handleVersionNameUpdate = useCallback(
    async (versionId: number, newName: string) => {
      if (!activeTab) return false;

      try {
        const success = await updateVersionName(uuid, activeTab, versionId, newName);

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
          return true;
        }
      } catch (err) {
        handleError(err, onError);
      }
      return false;
    },
    [activeTab, updateVersionName, uuid, refreshDossier, onUpdate, onError],
  );

  const handleVersionDelete = useCallback(
    async (versionId: number) => {
      if (!activeTab) return false;

      try {
        const success = await deleteVersion(uuid, activeTab, versionId);

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
          return true;
        }
      } catch (err) {
        handleError(err, onError);
      }
      return false;
    },
    [activeTab, deleteVersion, uuid, refreshDossier, onUpdate, onError],
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
    handleDirectUpload,
    handlePageDelete,
    handleVersionChange,
    handleVersionCreate,
    handleVersionNameUpdate,
    handleVersionDelete,
    handlePageNavigation,
    refreshDossier,
  };
}
