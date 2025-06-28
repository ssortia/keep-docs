import React from 'react';

interface EditIconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function EditIcon({ 
  width = 20, 
  height = 20, 
  color = '#666666',
  className = ''
}: EditIconProps) {
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
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4Z" />
    </svg>
  );
}