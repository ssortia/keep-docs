import React, { useState } from 'react';
import { Modal } from './Modal';

interface VersionModalProps {
  isOpen: boolean;
  onSubmit: (versionName: string, isNewVersion: boolean) => void;
  onCancel: () => void;
  filesCount: number;
}

export function VersionModal({ isOpen, onSubmit, onCancel, filesCount }: VersionModalProps) {
  const [versionName, setVersionName] = useState('');
  const [isNewVersion, setIsNewVersion] = useState(false);

  const generateDefaultVersionName = () => {
    const now = new Date();
    const date = now.toLocaleDateString('ru-RU');
    const time = now.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${date}.${time}`;
  };

  const handleNewVersionChange = (checked: boolean) => {
    setIsNewVersion(checked);
    if (checked && !versionName) {
      setVersionName(generateDefaultVersionName());
    }
  };

  const handleSubmit = () => {
    onSubmit(versionName.trim(), isNewVersion);
  };

  const footer = (
    <div className="button-group">
      <button type="button" className="modal-button modal-button-secondary" onClick={onCancel}>
        Отмена
      </button>
      <button type="button" className="modal-button modal-button-primary" onClick={handleSubmit}>
        Загрузить
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Настройки загрузки"
      size="lg"
      variant="info"
      footer={footer}
    >
      <p
        style={{
          marginBottom: 'var(--keep-docs-spacing-lg)',
          color: 'var(--keep-docs-muted-color)',
        }}
      >
        Загрузка {filesCount} файл(ов)
      </p>

      <div className="form-group">
        <label htmlFor="isNewVersion" className="form-checkbox">
          <input
            id="isNewVersion"
            type="checkbox"
            checked={isNewVersion}
            onChange={(e) => handleNewVersionChange(e.target.checked)}
          />
          <span className="form-checkbox-label">Создать новую версию документа</span>
        </label>
      </div>

      {isNewVersion && (
        <div className="form-group">
          <label htmlFor="versionName" className="form-label">
            Название версии
            <input
              id="versionName"
              type="text"
              className="form-input"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="Введите название версии"
            />
          </label>
        </div>
      )}
    </Modal>
  );
}
