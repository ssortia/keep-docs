import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DocumentUploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  accept?: string[];
}

export const DocumentUploadArea: React.FC<DocumentUploadAreaProps> = ({
  onFilesSelected,
  disabled = false,
  accept,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept: accept
      ? accept.reduce<Record<string, string[]>>((acc, mimeType) => {
          acc[mimeType] = [];
          return acc;
        }, {})
      : undefined,
  });

  return (
    <div
      {...getRootProps()}
      className={`upload-area ${isDragActive ? 'drag-active' : ''} ${
        disabled ? 'disabled' : ''
      }`}
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
              <p className="upload-subtitle">
                Нажмите или перетащите файлы сюда
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};