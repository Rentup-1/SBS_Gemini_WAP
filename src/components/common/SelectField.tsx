import React from 'react';
import { type SelectFieldProps } from '../../interfaces';

export const SelectField: React.FC<SelectFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  name, 
  options 
}) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white"
    >
      <option value="" disabled>Select...</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);