import React from 'react';
import { isDocumentRequired } from '../utils/schemaUtils';
import type { UISchemaDocument } from '../exampleSchema';
import type { Document } from '../types';

interface DocumentTabsProps {
  documents: UISchemaDocument[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  params: { [key: string]: any };
  dossierDocuments: Document[];
}

export const DocumentTabs: React.FC<DocumentTabsProps> = ({
  documents,
  activeTab,
  onTabChange,
  params,
  dossierDocuments,
}) => {
  const getDocumentFilesCount = (type: string): number => {
    const document = dossierDocuments.find((doc) => doc.code === type);
    return document?.filesCount || 0;
  };

  return (
    <div className="document-tabs">
      {documents.map((document) => {
        const isActive = activeTab === document.type;
        const isRequired = isDocumentRequired(document, params);
        const filesCount = getDocumentFilesCount(document.type);

        return (
          <button
            key={document.type}
            type="button"
            className={`document-tab ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(document.type)}
          >
            <span className="tab-name">
              {document.name}
              {isRequired && <span className="required-indicator">*</span>}
            </span>
            {filesCount > 0 && (
              <span className="files-count">({filesCount})</span>
            )}
          </button>
        );
      })}
    </div>
  );
};