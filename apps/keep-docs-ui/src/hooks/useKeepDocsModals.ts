import { useCallback, useState } from 'react';

interface EnlargedPage {
  src: string;
  pageIndex: number;
  total: number;
}

export function useKeepDocsModals() {
  const [enlargedPage, setEnlargedPage] = useState<EnlargedPage | null>(null);

  const openImageModal = useCallback((src: string, pageIndex: number, total: number) => {
    setEnlargedPage({ src, pageIndex, total });
  }, []);

  const closeImageModal = useCallback(() => {
    setEnlargedPage(null);
  }, []);

  const navigateToPage = useCallback((pageIndex: number) => {
    setEnlargedPage((prev) => (prev ? { ...prev, pageIndex } : null));
  }, []);

  return {
    enlargedPage,
    openImageModal,
    closeImageModal,
    navigateToPage,
  };
}
