import { useState, useCallback } from 'react';
import { DocumentApiClient } from '../utils/api';
import type { 
  Dossier, 
  DocumentUploadResponse, 
  DocumentManagerConfig 
} from '../types';

export const useDocumentManager = (config: DocumentManagerConfig) => {
  const [client] = useState(() => new DocumentApiClient(config));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: any) => {
    const message = err.response?.data?.message || err.message || 'Произошла ошибка';
    setError(message);
    setLoading(false);
  }, []);

  const getDossier = useCallback(async (uuid: string): Promise<Dossier | null> => {
    try {
      setLoading(true);
      setError(null);
      const dossier = await client.getDossier(uuid);
      setLoading(false);
      return dossier;
    } catch (err) {
      handleError(err);
      return null;
    }
  }, [client, handleError]);

  const uploadDocument = useCallback(async (
    uuid: string,
    documentType: string,
    files: File[],
    versionName?: string,
    isNewVersion: boolean = false
  ): Promise<DocumentUploadResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.uploadDocument(uuid, documentType, files, versionName, isNewVersion);
      setLoading(false);
      return result;
    } catch (err) {
      handleError(err);
      return null;
    }
  }, [client, handleError]);

  const downloadDocument = useCallback(async (uuid: string, documentType: string): Promise<Blob | null> => {
    try {
      setLoading(true);
      setError(null);
      const blob = await client.downloadDocument(uuid, documentType);
      setLoading(false);
      return blob;
    } catch (err) {
      handleError(err);
      return null;
    }
  }, [client, handleError]);

  const downloadPage = useCallback(async (
    uuid: string, 
    documentType: string, 
    pageNumber: number
  ): Promise<Blob | null> => {
    try {
      setLoading(true);
      setError(null);
      const blob = await client.downloadPage(uuid, documentType, pageNumber);
      setLoading(false);
      return blob;
    } catch (err) {
      handleError(err);
      return null;
    }
  }, [client, handleError]);

  const deletePage = useCallback(async (
    uuid: string, 
    documentType: string, 
    pageUuid: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await client.deletePage(uuid, documentType, pageUuid);
      setLoading(false);
      return true;
    } catch (err) {
      handleError(err);
      return false;
    }
  }, [client, handleError]);

  const changeCurrentVersion = useCallback(async (
    uuid: string, 
    documentType: string, 
    versionId: number
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await client.changeCurrentVersion(uuid, documentType, versionId);
      setLoading(false);
      return true;
    } catch (err) {
      handleError(err);
      return false;
    }
  }, [client, handleError]);

  const getSchema = useCallback(async (schemaName: string): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      const schema = await client.getSchema(schemaName);
      setLoading(false);
      return schema;
    } catch (err) {
      handleError(err);
      return null;
    }
  }, [client, handleError]);

  return {
    loading,
    error,
    getDossier,
    uploadDocument,
    downloadDocument,
    downloadPage,
    deletePage,
    changeCurrentVersion,
    getSchema,
  };
};