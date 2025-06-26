import React, { useState } from 'react';

interface VersionModalProps {
  onSubmit: (versionName: string, isNewVersion: boolean) => void;
  onCancel: () => void;
  filesCount: number;
}

export const VersionModal: React.FC<VersionModalProps> = ({ onSubmit, onCancel, filesCount }) => {
  const [versionName, setVersionName] = useState('');
  const [isNewVersion, setIsNewVersion] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(versionName.trim(), isNewVersion);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Настройки загрузки</h3>
        <p>Загрузка {filesCount} файл(ов)</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="versionName">Название версии (необязательно):</label>
            <input
              id="versionName"
              type="text"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="Введите название версии"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isNewVersion}
                onChange={(e) => setIsNewVersion(e.target.checked)}
              />
              Создать новую версию документа
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              Отмена
            </button>
            <button type="submit" className="submit-button">
              Загрузить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
