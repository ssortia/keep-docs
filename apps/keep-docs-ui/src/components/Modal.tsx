import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'danger' | 'warning' | 'info';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  footer,
}: ModalProps) {
  const [isClosing, setIsClosing] = React.useState(false);

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape]);

  if (!isOpen && !isClosing) return null;

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnBackdrop) {
      closeModal();
    }
  };

  return (
    <div className={`modal-backdrop ${isClosing ? 'modal-backdrop-closing' : ''}`} onClick={handleBackdropClick}>
      <div className={`modal modal-${size} modal-${variant} ${isClosing ? 'modal-closing' : ''}`}>
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h3 className="modal-title">{title}</h3>}
            {showCloseButton && (
              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                aria-label="Закрыть"
              >
                ×
              </button>
            )}
          </div>
        )}
        
        <div className="modal-body">
          {children}
        </div>
        
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}