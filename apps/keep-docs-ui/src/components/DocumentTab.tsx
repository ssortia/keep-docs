import React, { memo, useCallback } from 'react';
import type { UISchemaDocument } from '../types';

interface DocumentTabProps {
  document: UISchemaDocument;
  isActive: boolean;
  isRequired: boolean;
  onTabChange: (type: string) => void;
}

export const DocumentTab = memo<DocumentTabProps>(
  ({ document, isActive, isRequired, onTabChange }: DocumentTabProps) => {
    const handleClick = useCallback(() => {
      onTabChange(document.type);
    }, [document.type, onTabChange]);

    const tabClassName = `document-tab ${isActive ? 'active' : ''}`;

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