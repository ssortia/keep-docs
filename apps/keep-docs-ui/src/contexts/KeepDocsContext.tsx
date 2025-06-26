import React, { createContext, useContext, ReactNode } from 'react';
import type { DocumentManagerConfig } from '../types';

interface KeepDocsContextValue {
  config: DocumentManagerConfig;
  uuid: string;
}

interface KeepDocsProviderProps {
  config: DocumentManagerConfig;
  uuid: string;
  children: ReactNode;
}

const KeepDocsContext = createContext<KeepDocsContextValue | null>(null);

export function KeepDocsProvider({ config, uuid, children }: KeepDocsProviderProps) {
  return (
    <KeepDocsContext.Provider value={{ config, uuid }}>
      {children}
    </KeepDocsContext.Provider>
  );
}

export function useKeepDocsContext(): KeepDocsContextValue {
  const context = useContext(KeepDocsContext);
  if (!context) {
    throw new Error('useKeepDocsContext must be used within KeepDocsProvider');
  }
  return context;
}