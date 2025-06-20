import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import React from 'react';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  style?: React.CSSProperties;
}

export default function SearchInput({ 
  placeholder = 'Поиск...', 
  value, 
  onChange, 
  onSearch,
  style 
}: SearchInputProps) {
  return (
    <Input
      placeholder={placeholder}
      prefix={<SearchOutlined />}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onPressEnter={onSearch ? () => onSearch(value) : undefined}
      style={{ width: 300, ...style }}
      allowClear
    />
  );
}
