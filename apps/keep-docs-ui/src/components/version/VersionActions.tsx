import React from 'react';
import { EditIcon, PlusIcon } from '../icons';
import type { DocumentVersion } from '../../types';

interface VersionActionsProps {
  currentVersion?: DocumentVersion;
  disabled: boolean;
  onEdit: (event: React.MouseEvent) => void;
  onCreate: (event: React.MouseEvent) => void;
}

export function VersionActions({
  currentVersion,
  disabled,
  onEdit,
  onCreate,
}: VersionActionsProps) {
  if (disabled) return null;

  return (
    <>
      {currentVersion && (
        <button
          aria-label="Редактировать название версии"
          type="button"
          className="version-edit-button"
          onClick={onEdit}
          title="Редактировать название версии"
        >
          <EditIcon />
        </button>
      )}
      <button
        aria-label="Создать новую версию"
        type="button"
        className="version-edit-button"
        onClick={onCreate}
        title="Создать новую версию"
      >
        <PlusIcon />
      </button>
    </>
  );
}
