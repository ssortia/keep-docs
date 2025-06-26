import { useCallback, useState } from 'react';

interface EnlargedPage {
  src: string;
  pageNumber: number;
  total: number;
}

export function useKeepDocsModals() {
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [enlargedPage, setEnlargedPage] = useState<EnlargedPage | null>(null);

  const openVersionModal = useCallback((files: File[]) => {
    setPendingFiles(files);
    setShowVersionModal(true);
  }, []);

  const closeVersionModal = useCallback(() => {
    setShowVersionModal(false);
    setPendingFiles([]);
  }, []);

  const openImageModal = useCallback((src: string, pageNumber: number, total: number) => {
    setEnlargedPage({ src, pageNumber, total });
  }, []);

  const closeImageModal = useCallback(() => {
    setEnlargedPage(null);
  }, []);

  const navigateToPage = useCallback((pageNumber: number) => {
    setEnlargedPage((prev) => (prev ? { ...prev, pageNumber } : null));
  }, []);

  return {
    showVersionModal,
    pendingFiles,
    enlargedPage,
    openVersionModal,
    closeVersionModal,
    openImageModal,
    closeImageModal,
    navigateToPage,
  };
}
