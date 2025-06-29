import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ImageControls } from './ImageControls';

interface InlinePageViewerProps {
  imageSrc: string;
  imageNumber: number;
  totalImages: number;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function InlinePageViewer({
  imageSrc,
  imageNumber,
  totalImages,
  onClose,
  onPrevious,
  onNext,
}: InlinePageViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleZoomIn = useCallback(() => setScale((prev) => Math.min(prev + 0.25, 3)), []);
  const handleZoomOut = useCallback(() => setScale((prev) => Math.max(prev - 0.25, 0.25)), []);
  const handleRotate = useCallback(() => setRotation((prev) => (prev + 90) % 360), []);
  const handleReset = useCallback(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        });
      }
    },
    [position],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (scale > 1) {
        e.preventDefault();
      }
    },
    [scale],
  );

  const getCursorStyle = useCallback(() => (isDragging ? 'grabbing' : 'grab'), [isDragging]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        return;
      }

      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && onPrevious) {
        onPrevious();
      } else if (event.key === 'ArrowRight' && onNext) {
        onNext();
      } else if (event.key === '+' || event.key === '=') {
        handleZoomIn();
      } else if (event.key === '-') {
        handleZoomOut();
      } else if (event.key === 'r' || event.key === 'R') {
        handleRotate();
      } else if (event.key === '0') {
        handleReset();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevious, onNext, handleZoomIn, handleZoomOut, handleRotate, handleReset]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
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

  return (
    <div className="inline-page-viewer">
      <div className="inline-page-viewer-header">
        <ImageControls
          imageNumber={imageNumber}
          totalImages={totalImages}
          scale={scale}
          onPrevious={onPrevious}
          onNext={onNext}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRotate={handleRotate}
          onReset={handleReset}
          onClose={onClose}
        />
      </div>

      <div
        className="inline-page-viewer-content"
        style={{
          cursor: getCursorStyle(),
        }}
      >
        <div
          className="inline-page-viewer-image-container"
          onMouseDown={handleMouseDown}
          onContextMenu={handleContextMenu}
          role="button"
          tabIndex={0}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt={`Страница ${imageNumber}`}
            className={`inline-page-viewer-image ${isDragging ? 'dragging' : ''}`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.2s ease-in-out',
            }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
