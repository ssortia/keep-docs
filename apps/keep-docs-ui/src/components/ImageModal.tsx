import React, { useCallback, useRef } from 'react';
import { useImageTransform } from '../hooks/useImageTransform';
import { useImageKeyboard } from '../hooks/useImageKeyboard';
import { ImageControls } from './ImageControls';

interface ImageModalProps {
  imageSrc: string;
  imageNumber: number;
  totalImages: number;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function ImageModal({
  imageSrc,
  imageNumber,
  totalImages,
  onClose,
  onPrevious,
  onNext,
}: ImageModalProps) {
  const imageRef = useRef<HTMLImageElement>(null);

  const {
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
  } = useImageTransform();

  useImageKeyboard({
    onClose,
    onPrevious,
    onNext,
    imageNumber,
    totalImages,
  });

  // Обработчик клика вне изображения
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      // Закрываем только при клике по оверлею (не по содержимому)
      if (e.target === e.currentTarget && !isDragging) {
        onClose();
      }
    },
    [onClose, isDragging],
  );

  // Обработчик клика по свободному месту в viewport
  const handleViewportMouseUp = useCallback(
    (e: React.MouseEvent) => {
      // Закрываем при клике не по изображению, только левой кнопкой и если не было перетаскивания
      if (e.target === e.currentTarget && !isDragging && e.button === 0) {
        onClose();
      }
    },
    [onClose, isDragging],
  );

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      className="image-modal-overlay"
      onClick={handleOverlayClick}
      role="button"
      tabIndex={0}
      aria-label="Закрыть модальное окно"
    >
      <div className="image-modal-content">
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

        <div
          className="image-modal-viewport"
          onMouseUp={handleViewportMouseUp}
          onMouseDown={handleMouseDown}
          onContextMenu={handleContextMenu}
          role="button"
          tabIndex={0}
          style={{
            cursor: getCursorStyle(),
          }}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt={`Изображение ${imageNumber}`}
            className={`image-modal-image ${isDragging ? 'dragging' : ''}`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
