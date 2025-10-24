import { useState, useEffect } from 'react';
import type { DropdownOptions } from '../interfaces';
import { fetchAllUsers, fetchPropertyTypes, fetchTags } from '../services/propertyApi';

// Hardcoded data as you specified
const HARDCODED_DATA = {
  types: ["For Rent", "For Sale"],
  furnishTypes: ['Furnished', 'Unfurnished'],
  currencies: ['EGP', 'USD'],
  durationTypes: ['Months', 'Years'],
  dealTypes: ["Side-by-Side", "50:50"],
  listedByUsers: ['User 1 (Admin)', 'User 2 (Agent)', 'User 3 (Associate)', 'John Doe', 'Jane Smith', 'The Listing Team'],
  locations: ['Zamalek', 'New Cairo', 'Sheikh Zayed', 'Madinaty', '6th of October', 'Shorouk City', 'Heliopolis'],
  clientNames: ['Ahmed Said (01012345678)', 'Jane Doe (01198765432)', 'Mohamed Ali (01234567890)', 'New Client'],
  forRentTransactionTypes: ['Monthly', 'Yearly'],
  forSaleTransactionTypes: ['Cash', 'Installment'],
  requestStatuses: ['Pending', 'Active', 'Closed'],
  requestPrivacy: ['Public', 'Private'],
  assignmentUsers: ['None', 'Agent A', 'Agent B', 'Owner C'],
  requestOptions: [],
};
export type FormType = 'Inventory' | 'Request';

export interface UseDropdownDataProps {
  formType?: FormType;
}
export const useDropdownData = ({ formType }: UseDropdownDataProps = {}) => {
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch real data from APIs
        const [propertyTypes, tags, users] = await Promise.all([
          fetchPropertyTypes(),
          fetchTags(formType),
          fetchAllUsers()
        ]);

        // Combine real API data with hardcoded data
        setDropdownOptions({
          ...HARDCODED_DATA,
          propertyTypes,
          tags,
          listedByUsers:users
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dropdown data';
        setError(errorMessage);
        console.error('Failed to fetch dropdown data:', err);
        
        // Fallback to hardcoded data even if API fails
        setDropdownOptions({
          ...HARDCODED_DATA,
          listedByUsers: HARDCODED_DATA.listedByUsers.map((name, index) => ({ id: index, name }))
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formType]);

  return { dropdownOptions, loading, error, setDropdownOptions };
};