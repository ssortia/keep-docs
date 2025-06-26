import React, { memo, useCallback, useMemo } from 'react';
import { isDocumentRequired } from '../utils/schemaUtils';
import type { Document, UISchemaDocument } from '../types';
import { ErrorBoundary } from './ErrorBoundary';

interface DocumentTabProps {
  document: UISchemaDocument;
  isActive: boolean;
  isRequired: boolean;
  onTabChange: (type: string) => void;
}

const DocumentTab = memo<DocumentTabProps>(
  ({ document, isActive, isRequired, onTabChange }: DocumentTabProps) => {
    const handleClick = useCallback(() => {
      onTabChange(document.type);
    }, [document.type, onTabChange]);

    const tabClassName = useMemo(() => `document-tab ${isActive ? 'active' : ''}`, [isActive]);

    return (
      <button type="button" className={tabClassName} onClick={handleClick}>
        <span className="tab-name">
          {document.name}
          {isRequired && <span className="required-indicator">*</span>}
        </span>
      </button>
    );
  },
);

DocumentTab.displayName = 'DocumentTab';

interface DocumentTabsProps {
  documents: UISchemaDocument[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  params: { [key: string]: any };
  dossierDocuments: Document[];
}

const useDocumentData = (dossierDocuments: Document[]) =>
  useMemo(() => {
    const documentMap = new Map<string, Document>();
    dossierDocuments.forEach((doc) => {
      documentMap.set(doc.code, doc);
    });
    return documentMap;
  }, [dossierDocuments]);

export const DocumentTabs = memo<DocumentTabsProps>(
  ({ documents, activeTab, onTabChange, params, dossierDocuments }: DocumentTabsProps) => {
    const documentMap = useDocumentData(dossierDocuments);

    const tabsData = useMemo(
      () =>
        documents.map((document) => {
          const isRequired = isDocumentRequired(document, params);
          const filesCount = documentMap.get(document.type)?.filesCount || 0;
          const isActive = activeTab === document.type;

          return {
            document,
            isActive,
            isRequired,
            filesCount,
          };
        }),
      [documents, params, documentMap, activeTab],
    );

    if (!documents?.length) {
      return null;
    }

    return (
      <ErrorBoundary>
        <div className="document-tabs">
          {tabsData.map(({ document, isActive, isRequired }) => (
            <DocumentTab
              key={document.type}
              document={document}
              isActive={isActive}
              isRequired={isRequired}
              onTabChange={onTabChange}
            />
          ))}
        </div>
      </ErrorBoundary>
    );
  },
);

DocumentTabs.displayName = 'DocumentTabs';
