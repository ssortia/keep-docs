import React, { memo, useCallback, useMemo, useState } from 'react';
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
  documentGroups?: Record<string, readonly string[]>;
}

const useDocumentData = (dossierDocuments: Document[]) =>
  useMemo(() => {
    const documentMap = new Map<string, Document>();
    dossierDocuments.forEach((doc) => {
      documentMap.set(doc.code, doc);
    });
    return documentMap;
  }, [dossierDocuments]);

const getDocumentGroup = (
  documentType: string,
  documentGroups: Record<string, readonly string[]> = {},
): string | null => {
  for (const [groupName, documentTypes] of Object.entries(documentGroups)) {
    if (documentTypes.includes(documentType)) {
      return groupName;
    }
  }
  return null;
};

interface DocumentGroupProps {
  groupName: string;
  documents: Array<{
    document: UISchemaDocument;
    isActive: boolean;
    isRequired: boolean;
    filesCount: number;
  }>;
  onTabChange: (tab: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
  hasActiveTab: boolean;
}

const DocumentGroup = memo<DocumentGroupProps>(
  ({ groupName, documents, onTabChange, isExpanded, onToggle, hasActiveTab }) => {
    return (
      <div className="document-group">
        <button
          type="button"
          className={`document-group-header ${hasActiveTab ? 'active' : ''}`}
          onClick={onToggle}
        >
          <span className="group-name">{groupName}</span>
          <span className={`group-arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
        </button>
        <div className={`document-group-content ${!isExpanded ? 'collapsed' : ''}`}>
          {documents.map(({ document, isActive, isRequired }) => (
            <DocumentTab
              key={document.type}
              document={document}
              isActive={isActive}
              isRequired={isRequired}
              onTabChange={onTabChange}
            />
          ))}
        </div>
      </div>
    );
  },
);

DocumentGroup.displayName = 'DocumentGroup';

export const DocumentTabs = memo<DocumentTabsProps>(
  ({
    documents,
    activeTab,
    onTabChange,
    params,
    dossierDocuments,
    documentGroups = {},
  }: DocumentTabsProps) => {
    const documentMap = useDocumentData(dossierDocuments);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    const toggleGroup = useCallback((groupName: string) => {
      setExpandedGroups((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(groupName)) {
          newSet.delete(groupName);
        } else {
          newSet.add(groupName);
        }
        return newSet;
      });
    }, []);

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

    const { groupedTabs, ungroupedTabs } = useMemo(() => {
      const grouped: Record<string, typeof tabsData> = {};
      const ungrouped: typeof tabsData = [];

      tabsData.forEach((tabData) => {
        const group = getDocumentGroup(tabData.document.type, documentGroups);
        if (group) {
          if (!grouped[group]) {
            grouped[group] = [];
          }
          grouped[group].push(tabData);
        } else {
          ungrouped.push(tabData);
        }
      });

      return { groupedTabs: grouped, ungroupedTabs: ungrouped };
    }, [tabsData, documentGroups]);

    if (!documents?.length) {
      return null;
    }

    return (
      <ErrorBoundary>
        <div className="document-tabs">
          {ungroupedTabs.map(({ document, isActive, isRequired }) => (
            <DocumentTab
              key={document.type}
              document={document}
              isActive={isActive}
              isRequired={isRequired}
              onTabChange={onTabChange}
            />
          ))}
          {Object.entries(groupedTabs).map(([groupName, groupDocuments]) => {
            const hasActiveTab = groupDocuments.some(({ isActive }) => isActive);
            return (
              <DocumentGroup
                key={groupName}
                groupName={groupName}
                documents={groupDocuments}
                onTabChange={onTabChange}
                isExpanded={expandedGroups.has(groupName)}
                onToggle={() => toggleGroup(groupName)}
                hasActiveTab={hasActiveTab}
              />
            );
          })}
        </div>
      </ErrorBoundary>
    );
  },
);

DocumentTabs.displayName = 'DocumentTabs';
