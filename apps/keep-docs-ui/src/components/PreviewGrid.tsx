import React from 'react';
import type { Document } from '../types';
import { PreviewItem } from './PreviewItem';

interface PreviewGridProps {
  document: Document;
  onPageDelete: (pageUuid: string) => void;
  onPageEnlarge: (imageSrc: string, pageIndex: number, totalPages: number) => void;
  canDelete: boolean;
}

export function PreviewGrid({
  document,
  onPageDelete,
  onPageEnlarge,
  canDelete,
}: PreviewGridProps) {
  return (
    <div className="preview-grid">
      {(document.files || []).map((file) => (
        <PreviewItem
          key={file.uuid}
          file={file}
          document={document}
          onPageDelete={onPageDelete}
          onPageEnlarge={onPageEnlarge}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}