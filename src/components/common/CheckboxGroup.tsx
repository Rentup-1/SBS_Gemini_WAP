import React from "react";

export interface CheckboxOption {
  value: string;
  label: string;
  icon?: string;
}

export interface CheckboxGroupProps {
  label: string;
  name: string;
  options: string[] | CheckboxOption[];
  selectedValues: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxHeight?: string;
  className?: string;
  selectAllByDefault?: boolean;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  name,
  options,
  selectedValues,
  onChange,
  maxHeight = "max-h-40",
  className = "",
  selectAllByDefault = true // Default to true - all options selected
}) => {
  const isObjectArray = options.length > 0 && typeof options[0] === 'object' && 'value' in (options[0] as any);

  // Get all option values for select all functionality
  const allOptionValues = options.map(option => 
    isObjectArray ? (option as CheckboxOption).value : option as string
  );

  // If selectAllByDefault is true and no values are selected, select all
  const effectiveSelectedValues = selectAllByDefault && selectedValues.length === 0 
    ? allOptionValues 
    : selectedValues;

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className={`flex flex-wrap gap-2 text-sm overflow-y-auto ${maxHeight}`}>
        {options?.map(option => {
          const value = isObjectArray ? (option as CheckboxOption).value : option as string;
          const labelText = isObjectArray ? (option as CheckboxOption).label : option as string;
          const icon = isObjectArray ? (option as CheckboxOption).icon : undefined;

          return (
            <label key={value} className="flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                name={name}
                value={value}
                checked={effectiveSelectedValues.includes(value)}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              {icon && <img src={icon} alt="" className="w-4 h-4" />}
              <span className="text-gray-700">{labelText}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};