import React from 'react';
import type { DocumentVersion } from '../../types';

interface VersionDropdownProps {
  versions: DocumentVersion[];
  currentVersion?: DocumentVersion;
  onVersionSelect: (versionId: number) => void;
}

export function VersionDropdown({ versions, currentVersion, onVersionSelect }: VersionDropdownProps) {
  return (
    <div className="version-dropdown">
      {versions.map((version) => (
        <button
          key={version.id}
          type="button"
          className={`version-option ${version.id === currentVersion?.id ? 'active' : ''}`}
          onClick={() => onVersionSelect(version.id)}
        >
          <div className="version-option-content">
            <span className="version-option-name">{version.name}</span>
            <span className="version-option-date">
              {new Date(version.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>
          {version.id === currentVersion?.id && (
            <span className="version-current-indicator">✓</span>
          )}
        </button>
      ))}
    </div>
  );
}