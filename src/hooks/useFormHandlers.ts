import { useState, useCallback, useMemo } from "react";
import type {
  InventoryForm,
  RequestForm,
  DropdownOptions,
  PropertyLocation as AppLocation, // ✅ Fix: Alias here specifically
  PropertyType,
  Tag,
  User,
} from "../interfaces";
import { initialFormState, initialRequestFormState } from "../utils/constants";

export const useFormHandlers = (dropdownOptions: DropdownOptions) => {
  const [form, setForm] = useState<InventoryForm>(initialFormState);
  const [requestForm, setRequestForm] = useState<RequestForm>(
    initialRequestFormState
  );

  // Generic updaters
  const updateInventoryField = useCallback(
    <K extends keyof InventoryForm>(name: K, value: InventoryForm[K]) => {
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const updateRequestField = useCallback(
    <K extends keyof RequestForm>(name: K, value: RequestForm[K]) => {
      setRequestForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      formType: "Inventory" | "Request"
    ) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      if (name === "type") {
        if (formType === "Inventory") {
          const properType = (
            value === "For Rent" ? "For Rent" : "For Sale"
          ) as InventoryForm["type"];
          const defaultTransaction =
            properType === "For Rent" ? "Monthly" : "Cash";
          setForm((prev) => ({
            ...prev,
            type: properType,
            transaction: defaultTransaction,
          }));
        } else {
          const properType = (
            value === "Rent" ? "Rent" : "Buy"
          ) as RequestForm["type"];
          const defaultTransaction = properType === "Rent" ? "Monthly" : "Cash";
          setRequestForm((prev) => ({
            ...prev,
            type: properType,
            transaction: defaultTransaction,
          }));
        }
        return;
      }

      if (type === "checkbox") {
        if (name === "options_required" || name === "property_types_required") {
          const isInventory = formType === "Inventory";
          if (isInventory) {
            setForm((prev) => {
              const key = name as "options_required";
              const currentList = prev[key] || [];
              return {
                ...prev,
                [key]: checked
                  ? [...currentList, value]
                  : currentList.filter((item) => item !== value),
              };
            });
          } else {
            setRequestForm((prev) => {
              const key = name as
                | "options_required"
                | "property_types_required";
              const currentList = prev[key] || [];
              return {
                ...prev,
                [key]: checked
                  ? [...currentList, value]
                  : currentList.filter((item) => item !== value),
              };
            });
          }
          return;
        }
        if (formType === "Inventory")
          setForm((prev) => ({ ...prev, [name]: checked }));
        else setRequestForm((prev) => ({ ...prev, [name]: checked }));
        return;
      }

      if (formType === "Inventory")
        setForm((prev) => ({ ...prev, [name]: value }));
      else setRequestForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleInventoryInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      handleInputChange(e, "Inventory");
    },
    [handleInputChange]
  );

  const handleRequestInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      handleInputChange(e, "Request");
    },
    [handleInputChange]
  );

  // ✅ Fix: Use AppLocation alias here to match the Component's expectation
  const handleObjectChanges = useCallback(
    (
      object: Tag | PropertyType | User | AppLocation,
      fieldName: string,
      formType: string = "Inventory"
    ) => {
      if (formType === "Inventory") {
        setForm((prev) => ({
          ...prev,
          [fieldName as keyof InventoryForm]: object,
        }));
      } else {
        setRequestForm((prev) => ({
          ...prev,
          [fieldName as keyof RequestForm]: object,
        }));
      }
    },
    []
  );

  const inventoryTransactionOptions = useMemo(
    () =>
      form.type === "For Rent"
        ? dropdownOptions.forRentTransactionTypes || []
        : dropdownOptions.forSaleTransactionTypes || [],
    [form.type, dropdownOptions]
  );

  const requestTransactionOptions = useMemo(
    () =>
      requestForm.type === "Rent"
        ? dropdownOptions.forRentTransactionTypes || []
        : dropdownOptions.forSaleTransactionTypes || [],
    [requestForm.type, dropdownOptions]
  );

  return {
    form,
    setForm,
    requestForm,
    setRequestForm,
    inventoryTransactionOptions,
    requestTransactionOptions,
    handleInventoryInputChange,
    handleRequestInputChange,
    handleObjectChanges,
    updateInventoryField,
    updateRequestField,
  };
};
