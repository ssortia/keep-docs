import { useCallback } from 'react';
import { useKeepDocsContext } from '../contexts/KeepDocsContext';

export function useDocumentUrls() {
  const { config, uuid } = useKeepDocsContext();

  const getPageUrl = useCallback(
    (documentCode: string, pageUuid: string): string =>
      `${config.baseUrl}/${uuid}/documents/${documentCode}/${pageUuid}`,
    [config.baseUrl, uuid],
  );

  const getDocumentUrl = useCallback(
    (documentCode: string): string => `${config.baseUrl}/${uuid}/documents/${documentCode}`,
    [config.baseUrl, uuid],
  );

  return {
    getPageUrl,
    getDocumentUrl,
  };
}
