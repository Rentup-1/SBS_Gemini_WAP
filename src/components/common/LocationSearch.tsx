import React, { useState, useEffect } from 'react';
import { Search, X, MapPin, Check } from 'lucide-react';
import type { Location } from '../../interfaces';

// Single select props
interface SingleSelectProps {
  mode: 'single';
  value?: Location;
  onChange: (location: Location | null) => void;
  placeholder?: string;
  hasError?: boolean;
  errorMessage?: string;
}

// Multi select props
interface MultiSelectProps {
  mode: 'multi';
  selectedLocations: Location[] | null;
  onChange: (locations: Location[]) => void;
  placeholder?: string;
  hasError?: boolean;
  errorMessage?: string;
}

type LocationSearchProps = SingleSelectProps | MultiSelectProps;

export const LocationSearch: React.FC<LocationSearchProps> = (props) => {
  const { 
    mode, 
    placeholder = "Search locations... (min 2 characters)",
    hasError = false,
    errorMessage
  } = props;
  
  const [searchText, setSearchText] = useState(
    mode === 'single' ? props.value?.name || '' : ''
  );
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ FIXED: Sync searchText with prop value in single mode
  useEffect(() => {
    if (mode === 'single') {
      setSearchText(props.value?.name || '');
    }
  }, [mode, (props as SingleSelectProps).value]);

  const fetchLocations = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setLocations([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://sbsapi.rentup.com.eg/api/locations/autocomplete?search=${encodeURIComponent(query)}&limit=10`
      );
      const data = await response.json();

      if (data.status && data.data) {
        const mappedLocations = data.data.map((item: any) => ({
          id: item.id?.toString(),
          name: item.full_name,
        }));
        setLocations(mappedLocations);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: Correct useDebounce hook
  const debouncedSearch = useDebounce(fetchLocations, 300);

  const handleInputChange = (text: string) => {
    setSearchText(text);
    debouncedSearch(text);
  };

  // Single select handler
  const handleSelectSingle = (location: Location) => {
    if (mode === 'single') {
      props.onChange(location);
      setSearchText(location.name);
      setShowDropdown(false);
      setLocations([]);
    }
  };

  // Multi-select handler
  const toggleLocationMulti = (location: Location) => {
    if (mode === 'multi') {
      const isSelected = props.selectedLocations?.some(item => item.id === location.id);
      
      let newSelected: Location[];
      if (isSelected) {
        newSelected = (props.selectedLocations || []).filter(item => item.id !== location.id);
      } else {
        newSelected = [...(props.selectedLocations || []), location];
      }
      
      props.onChange(newSelected);
    }
  };

  const removeLocation = (locationId: string) => {
    if (mode === 'multi') {
      props.onChange((props?.selectedLocations || []).filter(item => String(item.id) !== locationId));
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    if (mode === 'single') {
      props.onChange(null);
    }
    setLocations([]);
    setShowDropdown(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 200);
  };

  const isLocationSelected = (locationId: string) => {
    if (mode === 'multi' && props.selectedLocations) {
      return props.selectedLocations.some(item => String(item.id) === locationId);
    }
    return false;
  };

  const selectedLocations = mode === 'multi' ? props.selectedLocations : [];

  return (
    <div className="relative">
      {/* Selected Locations Pills (Multi-select only) */}
      {mode === 'multi' && selectedLocations && selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedLocations.map((location) => (
            <div
              key={location.id}
              className="flex items-center bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm"
            >
              <MapPin className="w-3 h-3 mr-1.5" />
              <span>{location.name}</span>
              <button
                onClick={() => removeLocation(String(location.id))}
                className="ml-2 text-blue-600 hover:text-blue-800 transition"
                aria-label="Remove location"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => searchText?.length >= 2 && setShowDropdown(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out ${
            hasError 
              ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300'
          }`}
        />
        {searchText && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && errorMessage && (
        <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
      )}

      {/* Dropdown Results */}
      {showDropdown && locations.length > 0 && (
        <div 
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          onMouseDown={(e) => e.preventDefault()}
        >
          {locations.map((location) => (
            <button
              key={location.id}
              onClick={() => mode === 'single' ? handleSelectSingle(location) : toggleLocationMulti(location)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between transition"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-800 font-medium">{location.name}</span>
              </div>
              
              {mode === 'multi' && isLocationSelected(String(location.id)) && (
                <Check className="w-4 h-4 text-green-600" />
              )}
            </button>
          ))}
        </div>
      )}

      {showDropdown && searchText.length >= 2 && locations.length === 0 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No locations found for "{searchText}"
        </div>
      )}
    </div>
  );
};

function useDebounce<T extends (...args: any[]) => any>(
  callback: T, 
  delay: number
): T {
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timer]);

  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => callback(...args), delay);
    setTimer(newTimer as unknown as number);
  }) as T;
}