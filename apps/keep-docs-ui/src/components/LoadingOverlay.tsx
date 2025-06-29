import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
}

export function LoadingOverlay({ show, message = 'Загрузка...' }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className="loading-overlay-backdrop">
      <LoadingSpinner size="large" message={message} />
    </div>
  );
}
