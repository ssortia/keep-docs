import React, { useState } from 'react';
import type { DocumentVersion } from '../types';

interface VersionSelectorProps {
  versions: DocumentVersion[];
  currentVersion?: DocumentVersion;
  onVersionChange: (versionId: number) => void;
  disabled?: boolean;
}

export const VersionSelector: React.FC<VersionSelectorProps> = ({
  versions,
  currentVersion,
  onVersionChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (versions.length <= 1) {
    return null; // Не показываем селектор если версия одна или нет версий
  }

  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const handleVersionSelect = (versionId: number) => {
    onVersionChange(versionId);
    setIsOpen(false);
  };

  return (
    <div className="version-selector">
      <button
        type="button"
        className={`version-selector-trigger ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="version-label">Текущая версия:</span>
        <span className="version-name">{currentVersion?.name || 'Без версии'}</span>
        <span className="version-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="version-dropdown">
          {sortedVersions.map((version) => (
            <button
              key={version.id}
              type="button"
              className={`version-option ${version.id === currentVersion?.id ? 'active' : ''}`}
              onClick={() => handleVersionSelect(version.id)}
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
      )}
    </div>
  );
};
