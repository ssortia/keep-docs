import React from 'react';

interface CheckIconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function CheckIcon({ 
  width = 16, 
  height = 16, 
  color = '#666666',
  className = ''
}: CheckIconProps) {
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
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}