import React, { forwardRef } from 'react';
import { CheckIcon } from '../icons';

interface VersionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onSave: () => void;
  isCreating: boolean;
  width?: number;
}

export const VersionInput = forwardRef<HTMLInputElement, VersionInputProps>(
  ({ value, onChange, onKeyDown, onSave, isCreating, width }, ref) => {
    return (
      <div className="version-selector-container">
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="version-edit-input"
          placeholder={isCreating ? 'Название новой версии' : ''}
          style={width ? { width: `${width}px` } : undefined}
        />
        <button
          type="button"
          className="version-edit-button"
          aria-label={isCreating ? 'Создать версию' : 'Сохранить название версии'}
          onClick={onSave}
          title={isCreating ? 'Создать версию' : 'Сохранить название версии'}
        >
          <CheckIcon width={16} height={16} />
        </button>
      </div>
    );
  },
);