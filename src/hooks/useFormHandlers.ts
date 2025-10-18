import { useState, useCallback, useMemo } from 'react';
import type { InventoryForm, RequestForm, DropdownOptions, Location, PropertyType, Tag, User } from '../interfaces';
import { initialFormState, initialRequestFormState } from '../utils/constants';

export const useFormHandlers = (dropdownOptions: DropdownOptions) => {
  const [form, setForm] = useState<InventoryForm>(initialFormState);
  const [requestForm, setRequestForm] = useState<RequestForm>(initialRequestFormState);

  const inventoryTransactionOptions = useMemo(() => {
    if (form.type === 'For Rent') {
      return dropdownOptions.forRentTransactionTypes || [];
    }
    if (form.type === 'For Sale') {
      return dropdownOptions.forSaleTransactionTypes || [];
    }
    return [];
  }, [form.type, dropdownOptions]);

  const requestTransactionOptions = useMemo(() => {
    if (requestForm.type === 'Rent') {
      return dropdownOptions.forRentTransactionTypes || [];
    }
    if (requestForm.type === 'Buy') {
      return dropdownOptions.forSaleTransactionTypes || [];
    }
    return [];
  }, [requestForm.type, dropdownOptions]);

  const handleInventoryInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'type') {
      const properType = value === 'For Rent' ? 'For Rent' :
        value === 'For Sale' ? 'For Sale' :
          'For Sale';
      const defaultTransaction = value === 'For Rent' ? 'Monthly' :
        value === 'For Sale' ? 'Cash' :
          '';

      setForm(prev => ({
        ...prev,
        [name]: properType,
        transaction: defaultTransaction
      }));
      return;
    }

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleRequestInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'type') {
      const typedType = value === 'Rent' ? 'Rent' :
        value === 'Buy' ? 'Buy' :
          'Rent';
      const defaultTransaction = value === 'Rent' ? 'Monthly' :
        value === 'Buy' ? 'Cash' :
          '';

      setRequestForm(prev => ({
        ...prev,
        type: typedType,
        transaction: defaultTransaction
      }));
      return;
    }

    if (type === 'checkbox') {
      if (name === 'is_urgent') {
        setRequestForm(prev => ({
          ...prev,
          [name]: checked
        }));
      }

      if (name === 'property_types_required' || name === 'options_required') {
        const listName = name as 'property_types_required' | 'options_required';
        const optionValue = (e.target as HTMLInputElement).value;

        setRequestForm(prev => {
          const currentList = prev[listName];
          if (checked) {
            return { ...prev, [listName]: [...(currentList || []), optionValue] };
          } else {
            return { ...prev, [listName]: (currentList || []).filter(item => item !== optionValue) };
          }
        });
      }
      return;
    }

    setRequestForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleLocationChange = useCallback((locations: Location[]) => {
    setRequestForm(prev => ({
      ...prev,
      locations: locations
    }));
  }, []);

  // New handler for multi-select fields (returns array of IDs directly)
  const handleMultiSelectChange = useCallback((name: string, value: string[]) => {
    setRequestForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleObjectChanges = useCallback((object: Tag | PropertyType | User, fieldName: string) => {
    console.log(object)
    setForm((prev) => ({
      ...prev,
      [fieldName]: object,
    }));
  }, []);

return {
  form,
  setForm,
  requestForm,
  setRequestForm,
  inventoryTransactionOptions,
  requestTransactionOptions,
  handleInventoryInputChange,
  handleRequestInputChange,
  handleLocationChange,
  handleMultiSelectChange,
  handleObjectChanges
};
};