import { useEffect, useRef, useState } from 'react';
import type { DocumentVersion } from '../../types';

interface UseTriggerWidthProps {
  isEditing: boolean;
  isCreating: boolean;
  currentVersion?: DocumentVersion;
}

export function useTriggerWidth({ isEditing, isCreating, currentVersion }: UseTriggerWidthProps) {
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Сохранить ширину триггера когда он доступен
  useEffect(() => {
    if (triggerRef.current && !isEditing && !isCreating) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [isEditing, isCreating, currentVersion]);

  const saveTriggerWidth = () => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  };

  // Ширина input с учетом исчезнувшей кнопки действия
  const getInputWidth = () => {
    return triggerWidth ? triggerWidth + 32 : undefined;
  };

  return {
    triggerRef,
    triggerWidth,
    saveTriggerWidth,
    getInputWidth,
  };
}