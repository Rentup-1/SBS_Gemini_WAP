import { useState, useEffect } from 'react';
import { type DropdownOptions } from '../interfaces';
import { mockFetchDropdownData } from '../services/api';

export const useDropdownData = () => {
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await mockFetchDropdownData();
        setDropdownOptions(data);
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { dropdownOptions, loading };
};