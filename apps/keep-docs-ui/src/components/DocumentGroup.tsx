import React, { memo } from 'react';
import type { UISchemaDocument } from '../types';
import { DocumentTab } from './DocumentTab';

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

export const DocumentGroup = memo(
  ({
    groupName,
    documents,
    onTabChange,
    isExpanded,
    onToggle,
    hasActiveTab,
  }: DocumentGroupProps) => (
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
  ),
);

DocumentGroup.displayName = 'DocumentGroup';
