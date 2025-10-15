import React, { useState, useEffect } from 'react';
import { type SearchableInputProps } from '../../interfaces';

export const SearchableInput: React.FC<SearchableInputProps> = ({ 
  label, 
  value, 
  onChange, 
  name, 
  options, 
  placeholder = 'Search or enter new value' 
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onChange(e);
  };

  const handleSelectOption = (option: string) => {
    setSearchTerm(option);
    setIsFocused(false);
    
    const syntheticEvent = {
      target: {
        name,
        value: option,
        type: 'text'
      } as HTMLInputElement
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
  };

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10);

  return (
    <div className="flex flex-col space-y-1 relative">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
      <input
        id={name}
        type="text"
        name={name}
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder={placeholder}
        className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
      />
      {isFocused && searchTerm && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-10 shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.map(option => (
            <div
              key={option}
              onMouseDown={() => handleSelectOption(option)}
              className="p-2 text-sm hover:bg-blue-100 cursor-pointer"
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};