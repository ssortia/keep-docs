import { useState, useCallback, useMemo } from 'react';
import { isDocumentRequired } from '../utils/schemaUtils';
import type { Document, UISchemaDocument } from '../types';
import type { SchemaParams } from '../utils/schemaUtils';

interface UseDocumentTabsStateProps {
  documents: UISchemaDocument[];
  params: SchemaParams;
  dossierDocuments: Document[];
  activeTab: string;
}

export function useDocumentTabsState({
  documents,
  params,
  dossierDocuments,
  activeTab,
}: UseDocumentTabsStateProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const documentMap = useMemo(() => {
    const map = new Map<string, Document>();
    dossierDocuments.forEach((doc) => {
      map.set(doc.code, doc);
    });
    return map;
  }, [dossierDocuments]);

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

  return {
    tabsData,
    expandedGroups,
    toggleGroup,
  };
}