import React, { forwardRef } from 'react';
import type { DocumentVersion } from '../../types';

interface VersionTriggerProps {
  currentVersion?: DocumentVersion;
  isOpen: boolean;
  disabled: boolean;
  onClick: () => void;
}

export const VersionTrigger = forwardRef<HTMLButtonElement, VersionTriggerProps>(
  ({ currentVersion, isOpen, disabled, onClick }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={`version-selector-trigger ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && onClick()}
        disabled={disabled}
      >
        <span className="version-label">Версия:</span>
        <span className="version-name">{currentVersion?.name || 'Без версии'}</span>
        <span className="version-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
    );
  },
);