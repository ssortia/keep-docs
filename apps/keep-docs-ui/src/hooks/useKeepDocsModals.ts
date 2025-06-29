import { useCallback, useState } from 'react';

interface ViewedPage {
  src: string;
  pageIndex: number;
  total: number;
}

export function useKeepDocsModals() {
  const [viewedPage, setViewedPage] = useState<ViewedPage | null>(null);

  const openPageViewer = useCallback((src: string, pageIndex: number, total: number) => {
    setViewedPage({ src, pageIndex, total });
  }, []);

  const closePageViewer = useCallback(() => {
    setViewedPage(null);
  }, []);

  const navigateToPage = useCallback((pageIndex: number) => {
    setViewedPage((prev) => (prev ? { ...prev, pageIndex } : null));
  }, []);

  // Автоматическое закрытие при смене контекста
  const autoClosePageViewer = useCallback(() => {
    if (viewedPage) {
      setViewedPage(null);
    }
  }, [viewedPage]);

  return {
    viewedPage,
    openPageViewer,
    closePageViewer,
    navigateToPage,
    autoClosePageViewer,
  };
}
