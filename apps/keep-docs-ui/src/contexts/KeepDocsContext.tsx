import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import type { DocumentManagerConfig } from '../types';
import { useDocumentManager } from '../hooks/useDocumentManager';

interface KeepDocsContextValue {
  config: DocumentManagerConfig;
  uuid: string;
  documentManager: ReturnType<typeof useDocumentManager>;
}

interface KeepDocsProviderProps {
  config: DocumentManagerConfig;
  uuid: string;
  children: ReactNode;
}

const KeepDocsContext = createContext<KeepDocsContextValue | null>(null);

export function KeepDocsProvider({ config, uuid, children }: KeepDocsProviderProps) {
  const documentManager = useDocumentManager(config);

  const contextValue = useMemo(
    () => ({
      config,
      uuid,
      documentManager,
    }),
    [config, uuid, documentManager],
  );

  return <KeepDocsContext.Provider value={contextValue}>{children}</KeepDocsContext.Provider>;
}

export function useKeepDocsContext(): KeepDocsContextValue {
  const context = useContext(KeepDocsContext);
  if (!context) {
    throw new Error('useKeepDocsContext must be used within KeepDocsProvider');
  }
  return context;
}
