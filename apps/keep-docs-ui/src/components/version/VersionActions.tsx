import React from 'react';
import { EditIcon, PlusIcon } from '../icons';
import type { DocumentVersion } from '../../types';

interface VersionActionsProps {
  currentVersion?: DocumentVersion;
  viewVersion?: DocumentVersion;
  disabled: boolean;
  onEdit: (event: React.MouseEvent) => void;
  onCreate: (event: React.MouseEvent) => void;
  onMakeCurrent?: (event: React.MouseEvent) => void;
}

export function VersionActions({
  currentVersion,
  viewVersion,
  disabled,
  onEdit,
  onCreate,
  onMakeCurrent,
}: VersionActionsProps) {
  if (disabled) return null;

  const isViewingNonCurrentVersion = viewVersion && currentVersion && viewVersion.id !== currentVersion.id;

  return (
    <>
      {isViewingNonCurrentVersion && onMakeCurrent ? (
        <button
          aria-label="Сделать текущей версией"
          type="button"
          className="version-edit-button make-current-button"
          onClick={onMakeCurrent}
          title="Сделать текущей версией"
        >
          ✓
        </button>
      ) : (
        currentVersion && (
          <button
            aria-label="Редактировать название версии"
            type="button"
            className="version-edit-button"
            onClick={onEdit}
            title="Редактировать название версии"
          >
            <EditIcon />
          </button>
        )
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
