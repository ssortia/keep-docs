import React from 'react';
import { Modal } from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  variant = 'danger',
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'modal-button-danger';
      case 'warning':
        return 'modal-button-warning';
      case 'info':
        return 'modal-button-primary';
      default:
        return 'modal-button-primary';
    }
  };

  const footer = (
    <div className="button-group">
      <button type="button" className="modal-button modal-button-secondary" onClick={onClose}>
        {cancelText}
      </button>
      <button
        type="button"
        className={`modal-button ${getButtonVariant()}`}
        onClick={handleConfirm}
      >
        {confirmText}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      variant={variant}
      footer={footer}
    >
      <p style={{ margin: 0, lineHeight: 1.5 }}>{message}</p>
    </Modal>
  );
}
