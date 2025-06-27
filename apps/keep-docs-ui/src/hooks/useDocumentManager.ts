import { useCallback, useState } from 'react';
import { DocumentApiClient } from '../utils/api';
import { useKeepDocsContext } from '../contexts/KeepDocsContext';
import { useApiError } from './useApiError';
import type { DocumentUploadResponse, Dossier, UISchema } from '../types';

export const useDocumentManager = () => {
  const { config } = useKeepDocsContext();
  const { handleError: handleApiError } = useApiError();
  const [client] = useState(() => new DocumentApiClient(config));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback(
    (err: any) => {
      const message = handleApiError(err);
      setError(message);
      setLoading(false);
    },
    [handleApiError],
  );

  const executeApiCall = useCallback(
    async <T>(apiCall: () => Promise<T>, defaultReturn: T): Promise<T> => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        setLoading(false);
        return result;
      } catch (err) {
        handleError(err);
        return defaultReturn;
      }
    },
    [handleError],
  );

  const getDossier = useCallback(
    async (uuid: string): Promise<Dossier | null> =>
      executeApiCall(() => client.getDossier(uuid), null),
    [client, executeApiCall],
  );

  const uploadDocument = useCallback(
    async (
      uuid: string,
      documentType: string,
      files: File[],
      versionName?: string,
      isNewVersion: boolean = false,
    ): Promise<DocumentUploadResponse | null> =>
      executeApiCall(
        () => client.uploadDocument(uuid, documentType, files, versionName, isNewVersion),
        null,
      ),
    [client, executeApiCall],
  );

  const downloadDocument = useCallback(
    async (uuid: string, documentType: string): Promise<Blob | null> =>
      executeApiCall(() => client.downloadDocument(uuid, documentType), null),
    [client, executeApiCall],
  );

  const downloadPage = useCallback(
    async (uuid: string, documentType: string, pageUuid: string): Promise<Blob | null> =>
      executeApiCall(() => client.downloadPage(uuid, documentType, pageUuid), null),
    [client, executeApiCall],
  );

  const deletePage = useCallback(
    async (uuid: string, documentType: string, pageUuid: string): Promise<boolean> =>
      executeApiCall(async () => {
        await client.deletePage(uuid, documentType, pageUuid);
        return true;
      }, false),
    [client, executeApiCall],
  );

  const changeCurrentVersion = useCallback(
    async (uuid: string, documentType: string, versionId: number): Promise<boolean> =>
      executeApiCall(async () => {
        await client.changeCurrentVersion(uuid, documentType, versionId);
        return true;
      }, false),
    [client, executeApiCall],
  );

  const updateVersionName = useCallback(
    async (uuid: string, documentType: string, versionId: number, name: string): Promise<boolean> =>
      executeApiCall(async () => {
        await client.updateVersionName(uuid, documentType, versionId, name);
        return true;
      }, false),
    [client, executeApiCall],
  );

  const getSchema = useCallback(
    async (): Promise<UISchema | null> => executeApiCall(() => client.getSchema(), null),
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
    updateVersionName,
    getSchema,
  };
};
