// SelectField.tsx
import React from 'react';
import type { PropertyType, Tag, User } from '../../interfaces';

type SelectableItem = Tag | PropertyType | User;

interface SelectOption {
  value: string; // always the ID as string
  label: string;
  originalItem?: SelectableItem; // keep reference to full object
}

interface SelectFieldProps {
  label: string;
  value?: string | SelectableItem | null;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void; // for string mode
  onObjectChange?: (item: SelectableItem | null) => void; // 👈 NEW: for object mode
  name: string;
  options?: string[] | SelectableItem[] | SelectOption[];
}

export const SelectField: React.FC<SelectFieldProps> = ({ 
  label, 
  value, 
  onChange,
  onObjectChange,
  name, 
  options 
}) => {
  // Determine if we're in "object mode"
  const isObjectMode = !!onObjectChange;

  const normalizeOptions = (): SelectOption[] => {
    if (!options || options.length === 0) return [];
    
    const firstItem = options[0];
    
    if (typeof firstItem === 'string') {
      return (options as string[]).map(opt => ({ value: opt, label: opt }));
    } else if (typeof firstItem === 'object' && 'id' in firstItem && 'name' in firstItem) {
      return (options as SelectableItem[]).map(item => ({
        value: item.id.toString(),
        label: item.name,
        originalItem: item,
      }));
    } else {
      return options as SelectOption[];
    }
  };

  const getSelectedItemId = (): string | undefined => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && 'id' in value) return value.id.toString();
    return undefined;
  };

  const normalizedOptions = normalizeOptions();
  const selectedId = getSelectedItemId();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    if (isObjectMode) {
      if (selectedValue === '') {
        onObjectChange(null);
      } else {
        const selectedItem = normalizedOptions.find(opt => opt.value === selectedValue)?.originalItem;
        onObjectChange(selectedItem || null);
      }
    } else {
      // Fallback to standard string-based onChange
      onChange?.(e);
    }
  };

  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={selectedId || ''}
        onChange={handleChange}
        className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white"
      >
        <option value="">Select...</option>
        {normalizedOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};