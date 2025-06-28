import React from 'react';

interface DownloadIconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function DownloadIcon({ 
  width = 14, 
  height = 14, 
  color = 'currentColor',
  className = ''
}: DownloadIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}