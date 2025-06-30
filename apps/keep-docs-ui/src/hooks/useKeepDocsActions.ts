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

  const updateDocumentAfterOperation = useCallback(async () => {
    const updatedDossier = await refreshDossier();
    if (updatedDossier) {
      const updatedDocument = updatedDossier.documents.find(
        (doc: Document) => doc.code === activeTab,
      );
      if (updatedDocument) {
        onUpdate?.(updatedDocument);
      }
    }
  }, [refreshDossier, activeTab, onUpdate]);

  const executeWithErrorHandling = useCallback(
    async <T>(
      operation: () => Promise<T>,
      onSuccess?: () => Promise<void> | void,
    ): Promise<T | null> => {
      try {
        const result = await operation();
        if (result && onSuccess) {
          await onSuccess();
        }
        return result;
      } catch (err) {
        handleError(err, onError);
        return null;
      }
    },
    [handleError, onError],
  );

  const handleDirectUpload = useCallback(
    async (files: File[]) => {
      if (!activeTab || files.length === 0) return;

      await executeWithErrorHandling(
        () => uploadDocument(uuid, activeTab, files, undefined, false),
        updateDocumentAfterOperation,
      );
    },
    [activeTab, uploadDocument, uuid, executeWithErrorHandling, updateDocumentAfterOperation],
  );

  const handlePageDelete = useCallback(
    async (pageUuid: string) => {
      if (!activeTab) return;

      await executeWithErrorHandling(
        () => deletePage(uuid, activeTab, pageUuid),
        async () => {
          await refreshDossier();
          onRemove?.(activeTab, pageUuid);
        },
      );
    },
    [activeTab, deletePage, uuid, executeWithErrorHandling, refreshDossier, onRemove],
  );

  const handleVersionChange = useCallback(
    async (versionId: number) => {
      if (!activeTab) return;

      await executeWithErrorHandling(
        () => changeCurrentVersion(uuid, activeTab, versionId),
        updateDocumentAfterOperation,
      );
    },
    [activeTab, changeCurrentVersion, uuid, executeWithErrorHandling, updateDocumentAfterOperation],
  );

  const handleVersionCreate = useCallback(
    async (name: string) => {
      if (!activeTab) return false;

      const result = await executeWithErrorHandling(
        () => createVersion(uuid, activeTab, name),
        updateDocumentAfterOperation,
      );
      return Boolean(result);
    },
    [activeTab, createVersion, uuid, executeWithErrorHandling, updateDocumentAfterOperation],
  );

  const handleVersionNameUpdate = useCallback(
    async (versionId: number, newName: string) => {
      if (!activeTab) return false;

      const result = await executeWithErrorHandling(
        () => updateVersionName(uuid, activeTab, versionId, newName),
        updateDocumentAfterOperation,
      );
      return Boolean(result);
    },
    [activeTab, updateVersionName, uuid, executeWithErrorHandling, updateDocumentAfterOperation],
  );

  const handleVersionDelete = useCallback(
    async (versionId: number) => {
      if (!activeTab) return false;

      const result = await executeWithErrorHandling(
        () => deleteVersion(uuid, activeTab, versionId),
        updateDocumentAfterOperation,
      );
      return Boolean(result);
    },
    [activeTab, deleteVersion, uuid, executeWithErrorHandling, updateDocumentAfterOperation],
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
