import { useEffect, useRef } from 'react';

interface UseClickOutsideProps {
  isActive: boolean;
  onClickOutside: () => void;
}

export function useClickOutside({ isActive, onClickOutside }: UseClickOutsideProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActive, onClickOutside]);

  return ref;
}