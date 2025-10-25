import React from 'react';
import { type InputFieldProps } from '../../interfaces';

export const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  name, 
  placeholder = 'Enter value',
  readOnly,
  trailingDiv,
  hasError = false,
  errorMessage
}) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        disabled={readOnly}
        placeholder={placeholder}
        className={`p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out w-full ${
          hasError 
            ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300'
        }`}
      />
      {trailingDiv && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {trailingDiv}
        </div>
      )}
    </div>
    {hasError && errorMessage && (
      <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
    )}
  </div>
);