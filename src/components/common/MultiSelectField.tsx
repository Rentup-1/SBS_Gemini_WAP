import React, { useState } from 'react';
import type { PropertyType, Tag, User } from '../../interfaces';

interface SelectOption {
  value: string;
  label: string;
}

interface MultiSelectFieldProps {
  label: string;
  name: string;
  value?: string[]| any[]; // Array of selected IDs
  onChange: (name: string, value: string[]) => void;
  options?: string[] | PropertyType[] | Tag[] | User[] | SelectOption[];
  placeholder?: string;
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  name,
  value = [],
  onChange,
  options,
  placeholder = 'Select options...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const normalizeOptions = (): SelectOption[] => {
    if (!options || options.length === 0) return [];
    
    const firstItem = options[0];
    
    if (typeof firstItem === 'string') {
      return (options as string[]).map(opt => ({
        value: opt,
        label: opt
      }));
    } else if ('id' in firstItem && 'name' in firstItem) {
      return (options as Array<PropertyType | Tag | User>).map(item => ({
        value: item.id.toString(),
        label: item.name
      }));
    } else if ('value' in firstItem && 'label' in firstItem) {
      return options as SelectOption[];
    }
    
    return [];
  };

  const normalizedOptions = normalizeOptions();
  
  const filteredOptions = normalizedOptions.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = normalizedOptions.filter(option => 
    value.includes(option.value)
  );

  const handleToggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    
    onChange(name, newValue);
  };

  const handleRemoveOption = (optionValue: string) => {
    const newValue = value.filter(v => v !== optionValue);
    onChange(name, newValue);
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      
      {/* Selected items display */}
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border border-gray-300 rounded-md bg-white">
        {selectedOptions.length > 0 ? (
          selectedOptions.map(option => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
            >
              {option.label}
              <button
                type="button"
                onClick={() => handleRemoveOption(option.value)}
                className="hover:text-blue-600 focus:outline-none"
              >
                ×
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        )}
      </div>

      {/* Dropdown toggle */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Search options..."
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
        />

        {/* Options dropdown */}
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.map(option => {
              const isSelected = value.includes(option.value);
              return (
                <div
                  key={option.value}
                  onMouseDown={() => handleToggleOption(option.value)}
                  className={`p-2 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{option.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};