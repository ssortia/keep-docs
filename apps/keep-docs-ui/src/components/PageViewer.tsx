import React, { useEffect } from 'react';

interface PageViewerProps {
  imageSrc: string;
  imageNumber: number;
  totalImages: number;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function PageViewer({
  imageSrc,
  imageNumber,
  totalImages,
  onClose,
  onPrevious,
  onNext,
}: PageViewerProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && onPrevious) {
        onPrevious();
      } else if (event.key === 'ArrowRight' && onNext) {
        onNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevious, onNext]);

  return (
    <div className="page-viewer-overlay">
      <div className="page-viewer-container">
        <div className="page-viewer-header">
          <span className="page-viewer-counter">
            {imageNumber} из {totalImages}
          </span>
          <button
            type="button"
            className="page-viewer-close"
            onClick={onClose}
            aria-label="Закрыть просмотр"
          >
            ✕
          </button>
        </div>

        <div className="page-viewer-content">
          {onPrevious && (
            <button
              type="button"
              className="page-viewer-nav page-viewer-prev"
              onClick={onPrevious}
              aria-label="Предыдущая страница"
            >
              ‹
            </button>
          )}

          <div className="page-viewer-image-container">
            <img
              src={imageSrc}
              alt={`Страница ${imageNumber}`}
              className="page-viewer-image"
            />
          </div>

          {onNext && (
            <button
              type="button"
              className="page-viewer-nav page-viewer-next"
              onClick={onNext}
              aria-label="Следующая страница"
            >
              ›
            </button>
          )}
        </div>
      </div>
    </div>
  );
}