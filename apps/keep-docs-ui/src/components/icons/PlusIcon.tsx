import React from 'react';

interface PlusIconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function PlusIcon({ 
  width = 20, 
  height = 20, 
  color = '#666666',
  className = ''
}: PlusIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}