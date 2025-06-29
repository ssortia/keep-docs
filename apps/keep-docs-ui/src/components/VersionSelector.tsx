import React from 'react';
import type { DocumentVersion } from '../types';
import {
  useClickOutside,
  useTriggerWidth,
  useVersionInput,
  useVersionSelector,
} from '../hooks/version';
import { generateDefaultVersionName, sortVersionsByDate } from '../utils/version/versionUtils';
import { VersionActions, VersionDropdown, VersionInput, VersionTrigger } from './version';

interface VersionSelectorProps {
  versions: DocumentVersion[];
  currentVersion?: DocumentVersion;
  viewVersion?: DocumentVersion;
  onVersionChange: (versionId: number) => void;
  onViewVersionChange?: (versionId: number) => void;
  onVersionNameUpdate: (versionId: number, newName: string) => Promise<boolean>;
  onVersionCreate: (name: string) => Promise<boolean>;
  disabled?: boolean;
}

export function VersionSelector({
  versions,
  currentVersion,
  viewVersion,
  onVersionChange,
  onViewVersionChange,
  onVersionNameUpdate,
  onVersionCreate,
  disabled = false,
}: VersionSelectorProps) {
  const sortedVersions = sortVersionsByDate(versions);
  const displayedVersion = viewVersion || currentVersion;

  const {
    editValue,
    setEditValue,
    isDropdownOpen,
    isEditing,
    isCreating,
    isInputMode,
    openDropdown,
    startEditing,
    startCreating,
    cancelEdit,
    handleVersionSelect,
    handleEditSave,
    handleCreateSave,
  } = useVersionSelector({
    onVersionChange: onViewVersionChange || onVersionChange,
    onVersionNameUpdate,
    onVersionCreate,
  });

  const { triggerRef, getInputWidth, saveTriggerWidth } = useTriggerWidth({
    isEditing,
    isCreating,
    currentVersion: displayedVersion,
  });

  const { inputRef, handleKeyDown } = useVersionInput({
    isEditing,
    isCreating,
    onEnter: () => {
      if (isCreating) {
        handleCreateSave().catch(() => {});
      } else {
        handleEditSave(currentVersion?.id || 0).catch(() => {});
      }
    },
    onEscape: cancelEdit,
  });

  const dropdownRef = useClickOutside({
    isActive: isDropdownOpen || isInputMode,
    onClickOutside: cancelEdit,
  });

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!currentVersion) return;
    saveTriggerWidth();
    startEditing(currentVersion.name);
  };

  const handleCreateClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    saveTriggerWidth();
    startCreating(generateDefaultVersionName());
  };

  return (
    <div className="version-selector" ref={dropdownRef}>
      {isInputMode ? (
        <VersionInput
          ref={inputRef}
          value={editValue}
          onChange={setEditValue}
          onKeyDown={handleKeyDown}
          onSave={isCreating ? handleCreateSave : () => handleEditSave(currentVersion?.id || 0)}
          isCreating={isCreating}
          width={getInputWidth()}
        />
      ) : (
        <div className="version-selector-container">
          <VersionTrigger
            ref={triggerRef}
            currentVersion={displayedVersion}
            isOpen={isDropdownOpen}
            disabled={disabled}
            onClick={openDropdown}
          />
          <VersionActions
            currentVersion={currentVersion}
            viewVersion={viewVersion}
            disabled={disabled}
            onEdit={handleEditClick}
            onCreate={handleCreateClick}
            onMakeCurrent={
              viewVersion && viewVersion.id !== currentVersion?.id
                ? () => onVersionChange(viewVersion.id)
                : undefined
            }
          />
        </div>
      )}

      {isDropdownOpen && !isInputMode && (
        <VersionDropdown
          versions={sortedVersions}
          currentVersion={displayedVersion}
          onVersionSelect={handleVersionSelect}
        />
      )}
    </div>
  );
}
