import React, { memo, useCallback } from 'react';
import type { SchemaParams } from '../utils/schemaUtils';
import type { Document, UISchemaDocument } from '../types';
import { useDocumentTabsState } from '../hooks/useDocumentTabsState';
import { useDocumentGroups } from '../hooks/useDocumentGroups';
import { DocumentTab } from './DocumentTab';
import { DocumentGroup } from './DocumentGroup';
import { ErrorBoundary } from './ErrorBoundary';

interface DocumentTabsProps {
  documents: UISchemaDocument[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  params: SchemaParams;
  dossierDocuments: Document[];
  documentGroups?: Record<string, readonly string[]>;
}

export const DocumentTabs = memo<DocumentTabsProps>(
  ({
    documents,
    activeTab,
    onTabChange,
    params,
    dossierDocuments,
    documentGroups = {},
  }: DocumentTabsProps) => {
    const { tabsData, expandedGroups, toggleGroup } = useDocumentTabsState({
      documents,
      params,
      dossierDocuments,
      activeTab,
    });

    const { groupedTabs, ungroupedTabs } = useDocumentGroups({
      tabsData,
      documentGroups,
    });

    const handleToggleGroup = useCallback(
      (groupName: string) => () => toggleGroup(groupName),
      [toggleGroup],
    );

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
                onToggle={handleToggleGroup(groupName)}
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
