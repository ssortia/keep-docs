import React, { ReactNode, useState, useEffect } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

function ErrorFallback({ onReset }: { onReset: () => void }) {
  return (
    <div className="error-boundary">
      <h3>Что-то пошло не так</h3>
      <p>Произошла ошибка при отображении вкладок документов.</p>
      <button type="button" onClick={onReset}>
        Попробовать снова
      </button>
    </div>
  );
}

export function ErrorBoundary({ children, fallback }: Props) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('ErrorBoundary caught an error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const resetError = () => {
    setHasError(false);
  };

  if (hasError) {
    return fallback || <ErrorFallback onReset={resetError} />;
  }

  return children;
}
