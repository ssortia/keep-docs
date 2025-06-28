import { useState, useCallback } from 'react';

export enum VersionMode {
  VIEW = 'view',
  EDITING = 'editing',
  CREATING = 'creating',
  DROPDOWN_OPEN = 'dropdown_open',
}

interface UseVersionSelectorProps {
  onVersionChange: (versionId: number) => void;
  onVersionNameUpdate: (versionId: number, newName: string) => Promise<boolean>;
  onVersionCreate: (name: string) => Promise<boolean>;
}

export function useVersionSelector({
  onVersionChange,
  onVersionNameUpdate,
  onVersionCreate,
}: UseVersionSelectorProps) {
  const [mode, setMode] = useState<VersionMode>(VersionMode.VIEW);
  const [editValue, setEditValue] = useState('');

  const isDropdownOpen = mode === VersionMode.DROPDOWN_OPEN;
  const isEditing = mode === VersionMode.EDITING;
  const isCreating = mode === VersionMode.CREATING;
  const isInputMode = isEditing || isCreating;

  const openDropdown = useCallback(() => {
    setMode(VersionMode.DROPDOWN_OPEN);
  }, []);

  const closeDropdown = useCallback(() => {
    setMode(VersionMode.VIEW);
  }, []);

  const startEditing = useCallback((currentName: string) => {
    setMode(VersionMode.EDITING);
    setEditValue(currentName);
  }, []);

  const startCreating = useCallback((defaultName: string) => {
    setMode(VersionMode.CREATING);
    setEditValue(defaultName);
  }, []);

  const cancelEdit = useCallback(() => {
    setMode(VersionMode.VIEW);
    setEditValue('');
  }, []);

  const handleVersionSelect = useCallback(
    (versionId: number) => {
      onVersionChange(versionId);
      closeDropdown();
    },
    [onVersionChange, closeDropdown],
  );

  const handleEditSave = useCallback(
    async (versionId: number) => {
      if (!editValue.trim()) {
        cancelEdit();
        return;
      }

      const success = await onVersionNameUpdate(versionId, editValue.trim());
      if (success) {
        cancelEdit();
      }
    },
    [editValue, onVersionNameUpdate, cancelEdit],
  );

  const handleCreateSave = useCallback(async () => {
    if (!editValue.trim()) {
      cancelEdit();
      return;
    }

    const success = await onVersionCreate(editValue.trim());
    if (success) {
      cancelEdit();
    }
  }, [editValue, onVersionCreate, cancelEdit]);

  return {
    // State
    mode,
    editValue,
    setEditValue,
    
    // Computed
    isDropdownOpen,
    isEditing,
    isCreating,
    isInputMode,
    
    // Actions
    openDropdown,
    closeDropdown,
    startEditing,
    startCreating,
    cancelEdit,
    handleVersionSelect,
    handleEditSave,
    handleCreateSave,
  };
}