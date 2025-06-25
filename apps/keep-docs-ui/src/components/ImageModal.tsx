import React, { useState, useCallback } from 'react';

interface ImageModalProps {
  imageSrc: string;
  imageNumber: number;
  totalImages: number;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  imageSrc,
  imageNumber,
  totalImages,
  onClose,
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setRotation(0);
  }, []);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <div className="image-modal-overlay" onClick={handleOverlayClick}>
      <div className="image-modal-content">
        {/* Управляющая панель */}
        <div className="image-modal-controls">
          <div className="image-modal-info">
            <span className="image-number">Изображение #{imageNumber}</span>
            <span className="image-total">из {totalImages}</span>
          </div>
          <div className="image-modal-buttons">
            <button
              type="button"
              className="control-button zoom-out"
              onClick={handleZoomOut}
              title="Уменьшить"
              disabled={scale <= 0.25}
            >
              -
            </button>
            <span className="zoom-level">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              className="control-button zoom-in"
              onClick={handleZoomIn}
              title="Увеличить"
              disabled={scale >= 3}
            >
              +
            </button>
            <button
              type="button"
              className="control-button rotate"
              onClick={handleRotate}
              title="Повернуть на 90°"
            >
              ↻
            </button>
            <button
              type="button"
              className="control-button reset"
              onClick={handleReset}
              title="Сбросить"
            >
              ⌂
            </button>
            <button
              type="button"
              className="control-button close"
              onClick={onClose}
              title="Закрыть"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Изображение */}
        <div className="image-modal-viewport">
          <img
            src={imageSrc}
            alt={`Изображение ${imageNumber}`}
            className="image-modal-image"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};