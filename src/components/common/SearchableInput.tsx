// SearchableInput.tsx
import React, { useState, useEffect, useCallback } from 'react';
import type { Tag, PropertyType, User } from '../../interfaces';

type SelectableItem = Tag | PropertyType | User;

interface SelectOption {
  value: string; // ID as string
  label: string; // Display name
  original?: SelectableItem;
}

interface SearchableInputProps {
  label: string;
  // Accept either a string (free text) OR a full object (pre-selected item)
  value: string | SelectableItem | null;
  // 🔸 onObjectSelect: called when user picks an item from the list
  onObjectSelect?: (item: SelectableItem | null) => void;
  // 🔸 onTextChange: called when user types free text
  onTextChange?: (text: string) => void;
  name: string;
  options?: string[] | SelectableItem[] | SelectOption[];
  placeholder?: string;
  // Optional: for compatibility, but prefer onObjectSelect + onTextChange
  onSelect?: (item: SelectableItem | string) => void;
}

export const SearchableInput: React.FC<SearchableInputProps> = ({ 
  label, 
  value, 
  onObjectSelect,
  onTextChange,
  name, 
  options, 
  placeholder = 'Search or enter new value',
  onSelect // legacy, optional
}) => {
  // Display text shown in the input
  const [displayText, setDisplayText] = useState<string>(() => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.name || '';
  });

  const [isFocused, setIsFocused] = useState(false);

  // Update display when external value changes (e.g., form reset)
  useEffect(() => {
    if (!value) {
      setDisplayText('');
    } else if (typeof value === 'string') {
      setDisplayText(value);
    } else {
      setDisplayText(value.name || '');
    }
  }, [value]);

  const normalizeOptions = useCallback((): (SelectOption & { original?: SelectableItem })[] => {
    if (!options || options.length === 0) return [];
    
    const firstItem = options[0];
    
    if (typeof firstItem === 'string') {
      return (options as string[]).map(opt => ({ value: opt, label: opt }));
    } else if (firstItem && typeof firstItem === 'object' && 'id' in firstItem && 'name' in firstItem) {
      return (options as SelectableItem[]).map(item => ({
        value: String(item.id),
        label: item.name,
        original: item
      }));
    } else if (firstItem && 'value' in firstItem && 'label' in firstItem) {
      return options as SelectOption[];
    }
    
    return [];
  }, [options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setDisplayText(text);
    onTextChange?.(text); // Notify parent of free-text change
  };

  const handleSelect = (option: SelectOption & { original?: SelectableItem }) => {
    const display = option.label;
    const item = option.original;

    setDisplayText(display);
    setIsFocused(false);

    if (item) {
      onObjectSelect?.(item); // ✅ Send full object up
      onSelect?.(item);        // legacy fallback
    } else {
      // Fallback: treat as string
      onTextChange?.(option.value);
      onSelect?.(option.value);
    }
  };

  const normalizedOptions = normalizeOptions();
  const filteredOptions = normalizedOptions.filter(option =>
    option.label.toLowerCase().includes(displayText.toLowerCase())
  ).slice(0, 10);

  return (
    <div className="flex flex-col space-y-1 relative">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        type="text"
        name={name}
        value={displayText}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder={placeholder}
        className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
      />
      {isFocused && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md top-full mt-1 shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.map(option => (
            <div
              key={option.value}
              onMouseDown={() => handleSelect(option)}
              className="p-2 text-sm hover:bg-blue-100 cursor-pointer"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};