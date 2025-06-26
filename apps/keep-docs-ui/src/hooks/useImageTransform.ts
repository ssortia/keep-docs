import { useCallback, useEffect, useState } from 'react';

interface ImageTransform {
  scale: number;
  rotation: number;
  position: { x: number; y: number };
}

interface DragState {
  isDragging: boolean;
  dragStart: { x: number; y: number };
}

export function useImageTransform() {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.25));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0 && scale > 1) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        });
      }
    },
    [scale, position],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (scale > 1) {
        e.preventDefault();
      }
    },
    [scale],
  );

  const getCursorStyle = useCallback(() => {
    if (scale <= 1) return 'default';
    return isDragging ? 'grabbing' : 'grab';
  }, [scale, isDragging]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && scale > 1) {
        e.preventDefault();
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        setPosition({ x: newX, y: newY });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalContextMenu = (e: Event) => {
      if (isDragging || scale > 1) {
        e.preventDefault();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('contextmenu', handleGlobalContextMenu);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('contextmenu', handleGlobalContextMenu);
    };
  }, [isDragging, dragStart, scale]);

  return {
    scale,
    rotation,
    position,
    isDragging,
    handleZoomIn,
    handleZoomOut,
    handleRotate,
    handleReset,
    handleMouseDown,
    handleContextMenu,
    getCursorStyle,
  };
}
