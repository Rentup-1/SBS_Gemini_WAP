import React from 'react';
import type { FlexibleColumnKey } from '../../interfaces';
import { Search } from 'lucide-react';

interface FilterInputProps {
  columnKey: FlexibleColumnKey;
  placeholder: string;
  value: string;
  onChange: (column: FlexibleColumnKey, value: string) => void;
}

export const FilterInput: React.FC<FilterInputProps> = ({ 
  columnKey, 
  placeholder, 
  value, 
  onChange 
}) => (
  <div className="relative px-2">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
    <input
      type="text"
      placeholder={placeholder}
      defaultValue={value}
      onBlur={(e) => onChange(columnKey, e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.stopPropagation();
          onChange(columnKey, e.currentTarget.value);
          e.currentTarget.blur(); // Optional: remove focus after Enter
        }
      }}
      className="w-full text-xs pl-7 pr-1 py-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
    />
  </div>
);