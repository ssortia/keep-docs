import React from 'react';
import type { DocumentVersion } from '../types';
import { useVersionSelector, useVersionInput, useTriggerWidth, useClickOutside } from '../hooks/version';
import { generateDefaultVersionName, sortVersionsByDate } from '../utils/version/versionUtils';
import { VersionTrigger, VersionInput, VersionDropdown, VersionActions } from './version';

interface VersionSelectorProps {
  versions: DocumentVersion[];
  currentVersion?: DocumentVersion;
  onVersionChange: (versionId: number) => void;
  onVersionNameUpdate: (versionId: number, newName: string) => Promise<boolean>;
  onVersionCreate: (name: string) => Promise<boolean>;
  disabled?: boolean;
}

export function VersionSelector({
  versions,
  currentVersion,
  onVersionChange,
  onVersionNameUpdate,
  onVersionCreate,
  disabled = false,
}: VersionSelectorProps) {
  const sortedVersions = sortVersionsByDate(versions);

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
    onVersionChange,
    onVersionNameUpdate,
    onVersionCreate,
  });

  const { triggerRef, getInputWidth, saveTriggerWidth } = useTriggerWidth({
    isEditing,
    isCreating,
    currentVersion,
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
            currentVersion={currentVersion}
            isOpen={isDropdownOpen}
            disabled={disabled}
            onClick={openDropdown}
          />
          <VersionActions
            currentVersion={currentVersion}
            disabled={disabled}
            onEdit={handleEditClick}
            onCreate={handleCreateClick}
          />
        </div>
      )}

      {isDropdownOpen && !isInputMode && (
        <VersionDropdown
          versions={sortedVersions}
          currentVersion={currentVersion}
          onVersionSelect={handleVersionSelect}
        />
      )}
    </div>
  );
}
