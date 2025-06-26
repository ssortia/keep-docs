import { useMemo } from 'react';
import type { UISchemaDocument } from '../types';

interface DocumentTabData {
  document: UISchemaDocument;
  isActive: boolean;
  isRequired: boolean;
  filesCount: number;
}

interface UseDocumentGroupsProps {
  tabsData: DocumentTabData[];
  documentGroups: Record<string, readonly string[]>;
}

export function useDocumentGroups({ tabsData, documentGroups }: UseDocumentGroupsProps) {
  const getDocumentGroup = (documentType: string): string | null => {
    const entries = Object.entries(documentGroups);
    for (const [groupName, documentTypes] of entries) {
      if (documentTypes.includes(documentType)) {
        return groupName;
      }
    }
    return null;
  };

  const { groupedTabs, ungroupedTabs } = useMemo(() => {
    const grouped: Record<string, DocumentTabData[]> = {};
    const ungrouped: DocumentTabData[] = [];

    tabsData.forEach((tabData) => {
      const group = getDocumentGroup(tabData.document.type);
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

  return {
    groupedTabs,
    ungroupedTabs,
    getDocumentGroup,
  };
}
