import React, { useEffect, useRef, useState } from 'react';
import type { DocumentVersion } from '../types';

interface VersionSelectorProps {
  versions: DocumentVersion[];
  currentVersion?: DocumentVersion;
  onVersionChange: (versionId: number) => void;
  onVersionNameUpdate: (versionId: number, newName: string) => Promise<boolean>;
  disabled?: boolean;
}

export function VersionSelector({
  versions,
  currentVersion,
  onVersionChange,
  onVersionNameUpdate,
  disabled = false,
}: VersionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };

    if (isOpen || isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleVersionSelect = (versionId: number) => {
    onVersionChange(versionId);
    setIsOpen(false);
  };

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!currentVersion) return;
    setIsEditing(true);
    setEditValue(currentVersion.name);
    setIsOpen(false);
  };

  const handleEditSave = async () => {
    if (!currentVersion || !editValue.trim()) {
      setIsEditing(false);
      return;
    }

    const success = await onVersionNameUpdate(currentVersion.id, editValue.trim());
    if (success) {
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleEditSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleEditCancel();
    }
  };

  return (
    <div className="version-selector" ref={dropdownRef}>
      {isEditing ? (
        <div className="version-edit-container">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleEditSave}
            className="version-edit-input"
          />
        </div>
      ) : (
        <div className="version-selector-container" style={{ display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            className={`version-selector-trigger ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <span className="version-label">Версия:</span>
            <span className="version-name">{currentVersion?.name || 'Без версии'}</span>
            <span className="version-arrow">{isOpen ? '▲' : '▼'}</span>
          </button>
          {currentVersion && !disabled && (
            <button
              type="button"
              className="version-edit-button"
              onClick={handleEditClick}
              title="Редактировать название версии"
              style={{
                border: 'none',
                background: 'transparent',
                padding: '0',
                margin: '0 0 0 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                height: '100%'
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#666666"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4Z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {isOpen && !isEditing && (
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
}
