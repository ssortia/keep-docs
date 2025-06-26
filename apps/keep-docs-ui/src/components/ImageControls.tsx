import React, { memo } from 'react';

interface ImageControlsProps {
  imageNumber: number;
  totalImages: number;
  scale: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onReset: () => void;
  onClose: () => void;
}

export const ImageControls = memo(
  ({
    imageNumber,
    totalImages,
    scale,
    onPrevious,
    onNext,
    onZoomIn,
    onZoomOut,
    onRotate,
    onReset,
    onClose,
  }: ImageControlsProps) => (
    <div className="image-modal-controls">
      <div className="image-modal-info">
        <span className="image-number">Изображение #{imageNumber}</span>
        <span className="image-total">из {totalImages}</span>
      </div>
      <div className="image-modal-navigation">
        <button
          type="button"
          className="control-button nav-prev"
          onClick={onPrevious}
          title="Предыдущее изображение"
          disabled={!onPrevious || imageNumber <= 1}
        >
          ←
        </button>
        <button
          type="button"
          className="control-button nav-next"
          onClick={onNext}
          title="Следующее изображение"
          disabled={!onNext || imageNumber >= totalImages}
        >
          →
        </button>
      </div>
      <div className="image-modal-buttons">
        <button
          type="button"
          className="control-button zoom-out"
          onClick={onZoomOut}
          title="Уменьшить"
          disabled={scale <= 0.25}
        >
          -
        </button>
        <span className="zoom-level">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          className="control-button zoom-in"
          onClick={onZoomIn}
          title="Увеличить"
          disabled={scale >= 3}
        >
          +
        </button>
        <button
          type="button"
          className="control-button rotate"
          onClick={onRotate}
          title="Повернуть на 90°"
        >
          ↻
        </button>
        <button type="button" className="control-button reset" onClick={onReset} title="Сбросить">
          ⌂
        </button>
        <button type="button" className="control-button close" onClick={onClose} title="Закрыть">
          ✕
        </button>
      </div>
    </div>
  ),
);

ImageControls.displayName = 'ImageControls';
