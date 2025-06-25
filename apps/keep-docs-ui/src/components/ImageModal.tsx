import React, { useCallback, useEffect, useRef, useState } from 'react';

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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

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
    setScale(1); // Сброс к стандартному масштабу 150%
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Обработчики для перетаскивания изображения
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0 && scale > 1) {
        // Левая кнопка мыши и изображение увеличено (временно для тестирования)
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

  // Запрет контекстного меню при перетаскивании
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (scale > 1) {
        e.preventDefault();
      }
    },
    [scale],
  );

  // Эффект для добавления глобальных обработчиков
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

  // Обработчик закрытия по клавише Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

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
        <div className="image-modal-viewport" onMouseUp={handleViewportMouseUp}>
          <img
            ref={imageRef}
            src={imageSrc}
            alt={`Изображение ${imageNumber}`}
            className={`image-modal-image ${isDragging ? 'dragging' : ''}`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
              transformOrigin: 'center center',
            }}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};
