import React from 'react';
import { type InventoryForm as InventoryFormType, type DropdownOptions } from '../../interfaces';
import { InputField, SearchableInput, SelectField } from '../common';


interface InventoryFormProps {
  form: InventoryFormType;
  dropdownOptions: DropdownOptions;
  inventoryTransactionOptions: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({
  form,
  dropdownOptions,
  inventoryTransactionOptions,
  onChange
}) => {
  const renderCoreDetails = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Core Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField label="Type" name="type" value={form.type} onChange={onChange} options={dropdownOptions.types || []} />
        <SelectField label="Property Type" name="property_type" value={form.property_type} onChange={onChange} options={dropdownOptions.propertyTypes || []} />
        <SelectField label="Furnish Type" name="furnish_type" value={form.furnish_type} onChange={onChange} options={dropdownOptions.furnishTypes || []} />
      </div>
    </div>
  );

  const renderBudgetPricing = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Budget & Pricing</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InputField label="Price" name="price" type="number" value={form.price} onChange={onChange} placeholder="0" />
        <SelectField label="Currency" name="currency" value={form.currency} onChange={onChange} options={dropdownOptions.currencies || []} />
        <SelectField
          label="Transaction Type"
          name="transaction"
          value={form.transaction}
          onChange={onChange}
          options={inventoryTransactionOptions}
        />
      </div>

      {form.type === 'For rent' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
          <InputField label="Duration Period" name="duration" type="number" value={form.duration} onChange={onChange} placeholder="12" />
          <SelectField label="Duration Type" name="duration_type" value={form.duration_type} onChange={onChange} options={dropdownOptions.durationTypes || []} />
          <InputField label="Start Date" name="start_date" type="date" value={form.start_date} onChange={onChange} placeholder="dd/mm/yyyy" />
          <InputField label="End Date" name="end_date" type="date" value={form.end_date} onChange={onChange} placeholder="dd/mm/yyyy" />
        </div>
      )}
    </div>
  );

  const renderSpecsLocation = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Specs & Location</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InputField label="Bedrooms" name="bedrooms" type="number" value={form.bedrooms} onChange={onChange} placeholder="1" />
        <InputField label="Bathrooms" name="bathrooms" type="number" value={form.bathrooms} onChange={onChange} placeholder="1" />
      </div>
      <div className="col-span-4 mt-4">
        <SearchableInput
          label="Location"
          name="location"
          value={form.location}
          onChange={onChange}
          options={dropdownOptions.locations || []}
          placeholder="Start typing to search for a location..."
        />
      </div>
    </div>
  );

  const renderAssignmentDetails = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Assignment & Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField label="Tag" name="tag" value={form.tag} onChange={onChange} options={dropdownOptions.tags || []} />
        <SelectField label="Deal Type" name="deal_type" value={form.deal_type} onChange={onChange} options={dropdownOptions.dealTypes || []} />
      </div>

      <InputField label="WhatsApp Message (Original)" name="whatsapp_message" value={form.whatsapp_message} onChange={onChange} placeholder="Original WhatsApp text after confirmation" />

      <div className="flex items-center pt-2">
        <input
          id="is_urgent_inv"
          name="is_urgent"
          type="checkbox"
          checked={form.is_urgent}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_urgent_inv" className="ml-2 block text-sm text-gray-900">
          Mark as Urgent
        </label>
      </div>
    </div>
  );

  const renderClientDetails = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Client Contact Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SearchableInput
          label="Listed By (User)"
          name="listed_by"
          value={form.listed_by}
          onChange={onChange}
          options={dropdownOptions.listedByUsers || []}
          placeholder="Search or enter user name/ID"
        />
        <SearchableInput
          label="Client Name"
          name="client_name"
          value={form.client_name}
          onChange={onChange}
          options={dropdownOptions.clientNames || []}
          placeholder="Search or enter new client name"
        />
        <InputField label="Client Phone" name="client_phone" value={form.client_phone} onChange={onChange} placeholder="Phone Number" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField label="Client Email" name="client_email" value={form.client_email} onChange={onChange} placeholder="Email" />
      </div>
    </div>
  );

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory Listing Form</h1>
      {renderCoreDetails()}
      {renderBudgetPricing()}
      {renderSpecsLocation()}
      {renderAssignmentDetails()}
      {renderClientDetails()}

      <div className="space-y-4 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Images</h3>
        <div className="flex items-center">
          <button className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 transition">Browse...</button>
          <span className="ml-3 text-sm text-gray-500">No files selected. (Simulated)</span>
        </div>
      </div>
    </>
  );
};