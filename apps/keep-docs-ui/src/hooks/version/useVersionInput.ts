import { useEffect, useRef } from 'react';

interface UseVersionInputProps {
  isEditing: boolean;
  isCreating: boolean;
  onEnter: () => void;
  onEscape: () => void;
}

export function useVersionInput({
  isEditing,
  isCreating,
  onEnter,
  onEscape,
}: UseVersionInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Фокус и выделение при переключении режимов
  useEffect(() => {
    if ((isEditing || isCreating) && inputRef.current) {
      inputRef.current.focus();
      if (isEditing) {
        inputRef.current.select();
      } else if (isCreating) {
        // Для создания версии ставим курсор в конец без выделения
        inputRef.current.setSelectionRange(
          inputRef.current.value.length,
          inputRef.current.value.length,
        );
      }
    }
  }, [isEditing, isCreating]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onEnter();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onEscape();
    }
  };

  return {
    inputRef,
    handleKeyDown,
  };
}