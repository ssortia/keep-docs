import { useCallback } from 'react';
import { useKeepDocsContext } from '../contexts/KeepDocsContext';

export function useDocumentUrls() {
  const { config, uuid } = useKeepDocsContext();

  const getPageUrl = useCallback(
    (documentCode: string, pageNumber: number): string =>
      `${config.baseUrl}/${uuid}/documents/${documentCode}/${pageNumber}`,
    [config.baseUrl, uuid],
  );

  const getDocumentUrl = useCallback(
    (documentCode: string): string => `${config.baseUrl}/${uuid}/documents/${documentCode}`,
    [config.baseUrl, uuid],
  );

  const getDownloadUrl = useCallback(
    (documentCode: string, pageNumber?: number): string => {
      const baseUrl = `${config.baseUrl}/${uuid}/documents/${documentCode}`;
      return pageNumber ? `${baseUrl}/${pageNumber}/download` : `${baseUrl}/download`;
    },
    [config.baseUrl, uuid],
  );

  return {
    getPageUrl,
    getDocumentUrl,
    getDownloadUrl,
  };
}
