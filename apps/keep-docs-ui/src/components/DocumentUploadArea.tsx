import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DocumentUploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string[];
}

export function DocumentUploadArea({ onFilesSelected, accept }: DocumentUploadAreaProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: accept
      ? accept.reduce<Record<string, string[]>>((acc, mimeType) => {
          acc[mimeType] = [];
          return acc;
        }, {})
      : undefined,
  });

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  };

  return (
    <div
      {...getRootProps()}
      className={`upload-area ${isDragActive ? 'drag-active' : ''}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={open}
      role="button"
      aria-label="Загрузить файлы"
    >
      <input {...getInputProps()} />
      <div className="upload-content">
        <div className="upload-icon">📁</div>
        <div className="upload-text">
          {isDragActive ? (
            <p>Отпустите файлы здесь...</p>
          ) : (
            <>
              <p className="upload-title">Загрузить файлы</p>
              <p className="upload-subtitle">Нажмите или перетащите файлы сюда</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
