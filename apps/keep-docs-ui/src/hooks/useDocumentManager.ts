import { useCallback, useMemo, useState } from 'react';
import { DocumentApiClient } from '../utils/api';
import { useKeepDocsContext } from '../contexts/KeepDocsContext';
import { useApiError } from './useApiError';

export const useDocumentManager = () => {
  const { config } = useKeepDocsContext();
  const { handleError: handleApiError } = useApiError();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = useMemo(() => new DocumentApiClient(config), [config]);

  const handleError = useCallback(
    (err: unknown) => {
      const message = handleApiError(err);
      setError(message);
      setLoading(false);
    },
    [handleApiError],
  );

  const executeApiCall = useCallback(
    async <T>(apiCall: () => Promise<T>, fallback: T): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiCall();
        return result;
      } catch (err) {
        handleError(err);
        return fallback;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  // Утилита для обёртки вызовов, которые возвращают просто true/false
  const executeBooleanCall = useCallback(
    (fn: () => Promise<void>) =>
      executeApiCall(async () => {
        await fn();
        return true;
      }, false),
    [executeApiCall],
  );

  const getDossier = useCallback(
    (uuid: string) => executeApiCall(() => client.getDossier(uuid), null),
    [client, executeApiCall],
  );

  const uploadDocument = useCallback(
    (
      uuid: string,
      documentType: string,
      files: File[],
      versionName?: string,
      isNewVersion = false,
    ) =>
      executeApiCall(
        () => client.uploadDocument(uuid, documentType, files, versionName, isNewVersion),
        null,
      ),
    [client, executeApiCall],
  );

  const downloadDocument = useCallback(
    (uuid: string, documentType: string) =>
      executeApiCall(() => client.downloadDocument(uuid, documentType), null),
    [client, executeApiCall],
  );

  const downloadPage = useCallback(
    (uuid: string, documentType: string, pageUuid: string) =>
      executeApiCall(() => client.downloadPage(uuid, documentType, pageUuid), null),
    [client, executeApiCall],
  );

  const deletePage = useCallback(
    (uuid: string, documentType: string, pageUuid: string) =>
      executeBooleanCall(() => client.deletePage(uuid, documentType, pageUuid)),
    [client, executeBooleanCall],
  );

  const changeCurrentVersion = useCallback(
    (uuid: string, documentType: string, versionId: number) =>
      executeBooleanCall(() => client.changeCurrentVersion(uuid, documentType, versionId)),
    [client, executeBooleanCall],
  );

  const createVersion = useCallback(
    (uuid: string, documentType: string, name: string) =>
      executeBooleanCall(() => client.createVersion(uuid, documentType, name)),
    [client, executeBooleanCall],
  );

  const updateVersionName = useCallback(
    (uuid: string, documentType: string, versionId: number, name: string) =>
      executeBooleanCall(() => client.updateVersionName(uuid, documentType, versionId, name)),
    [client, executeBooleanCall],
  );

  const deleteVersion = useCallback(
    (uuid: string, documentType: string, versionId: number) =>
      executeBooleanCall(() => client.deleteVersion(uuid, documentType, versionId)),
    [client, executeBooleanCall],
  );

  const getSchema = useCallback(
    () => executeApiCall(() => client.getSchema(), null),
    [client, executeApiCall],
  );

  return {
    loading,
    error,
    getDossier,
    uploadDocument,
    downloadDocument,
    downloadPage,
    deletePage,
    changeCurrentVersion,
    createVersion,
    updateVersionName,
    deleteVersion,
    getSchema,
  };
};
