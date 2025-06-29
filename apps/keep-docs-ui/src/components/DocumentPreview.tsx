import React from 'react';
import type { Document } from '../types';
import { PreviewGrid } from './PreviewGrid';
import { EmptyPreview } from './EmptyPreview';
import { InlinePageViewer } from './InlinePageViewer';

interface DocumentPreviewProps {
  document: Document;
  onPageDelete: (pageUuid: string) => void;
  onPageEnlarge: (imageSrc: string, pageIndex: number, totalPages: number) => void;
  canDelete: boolean;
  viewedPage?: {
    src: string;
    pageIndex: number;
    total: number;
  } | null;
  onCloseViewer?: () => void;
  onNavigateViewer?: (pageIndex: number) => void;
}

export function DocumentPreview({
  document,
  onPageDelete,
  onPageEnlarge,
  canDelete,
  viewedPage,
  onCloseViewer,
  onNavigateViewer,
}: DocumentPreviewProps) {
  const hasFiles = document.files && document.files.length > 0;

  // Если открыт просмотр страницы, показываем его
  if (viewedPage && onCloseViewer && onNavigateViewer) {
    return (
      <div className="document-preview">
        <InlinePageViewer
          imageSrc={viewedPage.src}
          imageNumber={viewedPage.pageIndex + 1}
          totalImages={viewedPage.total}
          onClose={onCloseViewer}
          onPrevious={
            viewedPage.pageIndex > 0 ? () => onNavigateViewer(viewedPage.pageIndex - 1) : undefined
          }
          onNext={
            viewedPage.pageIndex < viewedPage.total - 1
              ? () => onNavigateViewer(viewedPage.pageIndex + 1)
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="document-preview">
      {!hasFiles ? (
        <EmptyPreview />
      ) : (
        <PreviewGrid
          document={document}
          onPageDelete={onPageDelete}
          onPageEnlarge={onPageEnlarge}
          canDelete={canDelete}
        />
      )}
    </div>
  );
}
