import { useState, useCallback, useMemo } from 'react';
import { type InventoryForm, type RequestForm, type DropdownOptions } from '../interfaces';
import { initialFormState, initialRequestFormState } from '../utils/constants';

export const useFormHandlers = (dropdownOptions: DropdownOptions) => {
  const [form, setForm] = useState<InventoryForm>(initialFormState);
  const [requestForm, setRequestForm] = useState<RequestForm>(initialRequestFormState);

  const inventoryTransactionOptions = useMemo(() => {
    if (form.type === 'For rent') {
      return dropdownOptions.forRentTransactionTypes || [];
    }
    if (form.type === 'For sale') {
      return dropdownOptions.forSaleTransactionTypes || [];
    }
    return [];
  }, [form.type, dropdownOptions]);

  const requestTransactionOptions = useMemo(() => {
    if (requestForm.type === 'Rent') {
      return dropdownOptions.forRentTransactionTypes || [];
    }
    if (requestForm.type === 'Sale') {
      return dropdownOptions.forSaleTransactionTypes || [];
    }
    return [];
  }, [requestForm.type, dropdownOptions]);

  const handleInventoryInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'type') {
      const defaultTransaction = value === 'For rent' ? 'Monthly' :
                                 value === 'For sale' ? 'Cash' :
                                 '';

      setForm(prev => ({
        ...prev,
        [name]: value,
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
      const defaultTransaction = value === 'Rent' ? 'Monthly' :
                                 value === 'Sale' ? 'Cash' :
                                 '';

      setRequestForm(prev => ({
        ...prev,
        [name]: value,
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
            return { ...prev, [listName]: [...currentList, optionValue] };
          } else {
            return { ...prev, [listName]: currentList.filter(item => item !== optionValue) };
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

  return {
    form,
    setForm,
    requestForm,
    setRequestForm,
    inventoryTransactionOptions,
    requestTransactionOptions,
    handleInventoryInputChange,
    handleRequestInputChange
  };
};