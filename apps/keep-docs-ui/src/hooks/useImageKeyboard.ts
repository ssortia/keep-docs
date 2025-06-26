import { useEffect } from 'react';

interface UseImageKeyboardProps {
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  imageNumber: number;
  totalImages: number;
}

export function useImageKeyboard({
  onClose,
  onPrevious,
  onNext,
  imageNumber,
  totalImages,
}: UseImageKeyboardProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft' && onPrevious && imageNumber > 1) {
        e.preventDefault();
        onPrevious();
      } else if (e.key === 'ArrowRight' && onNext && imageNumber < totalImages) {
        e.preventDefault();
        onNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onPrevious, onNext, imageNumber, totalImages]);
}