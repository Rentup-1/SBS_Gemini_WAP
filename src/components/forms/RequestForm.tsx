import React from "react";
import {
  type RequestForm as RequestFormType,
  type DropdownOptions,
  type Location,
} from "../../interfaces";
import {
  InputField,
  LocationSearch,
  MultiSelectField,
  SearchableInput,
  SelectField,
} from "../common";

interface RequestFormProps {
  form: RequestFormType;
  dropdownOptions: DropdownOptions;
  requestTransactionOptions: string[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onLocationChange: (locations: Location[]) => void;
  handleMultiSelectChange: (name: string, value: string[]) => void;
}

export const RequestForm: React.FC<RequestFormProps> = ({
  form,
  dropdownOptions,
  requestTransactionOptions,
  onChange,
  onLocationChange,
  handleMultiSelectChange,
}) => {
  const renderCoreDetails = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
        Core Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          label="Type"
          name="type"
          value={form.type}
          onChange={onChange}
          options={["Rent", "Buy"]}
        />
        <SelectField
          label="Status"
          name="status"
          value={form.status}
          onChange={onChange}
          options={dropdownOptions.requestStatuses || []}
        />
        <SelectField
          label="Privacy"
          name="privacy"
          value={form.privacy}
          onChange={onChange}
          options={dropdownOptions.requestPrivacy || []}
        />
      </div>
    </div>
  );

  const renderBudgetPricing = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
        Budget
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InputField
          label="Price"
          name="price"
          type="number"
          value={form.price}
          onChange={onChange}
          placeholder="0"
        />
        <SelectField
          label="Currency"
          name="currency"
          value={form.currency}
          onChange={onChange}
          options={dropdownOptions.currencies || []}
        />
        <SelectField
          label="Transaction Type"
          name="transaction"
          value={form.transaction}
          onChange={onChange}
          options={requestTransactionOptions}
        />
      </div>

      {form.type === "Rent" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
          <InputField
            label="Duration Period"
            name="duration"
            type="number"
            value={form.duration}
            onChange={onChange}
            placeholder="12"
          />
          <SelectField
            label="Duration Type"
            name="duration_type"
            value={form.duration_type}
            onChange={onChange}
            options={dropdownOptions.durationTypes || []}
          />
          <InputField
            label="Start Date"
            name="start_date"
            type="date"
            value={form.start_date}
            onChange={onChange}
            placeholder="dd/mm/yyyy"
          />
          <InputField
            label="End Date"
            name="end_date"
            type="date"
            value={form.end_date}
            onChange={onChange}
            placeholder="dd/mm/yyyy"
          />
        </div>
      )}
      <InputField
        label="WhatsApp Message (Original)"
        name="whatsapp_message"
        value={form.whatsapp_message}
        onChange={onChange}
        placeholder="Original WhatsApp text after confirmation"
      />
    </div>
  );

  const renderSpecs = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
        Property Specs
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="Bedrooms"
          name="bedrooms"
          type="number"
          value={form.bedrooms}
          onChange={onChange}
          placeholder="1"
        />
        <InputField
          label="Bathrooms"
          name="bathrooms"
          type="number"
          value={form.bathrooms}
          onChange={onChange}
          placeholder="1"
        />
        <SelectField
          label="Furnish Type"
          name="furnish_type"
          value={form.furnish_type}
          onChange={onChange}
          options={dropdownOptions.furnishTypes || []}
        />
        <SelectField
          label="Deal Type"
          name="deal_type"
          value={form.deal_type}
          onChange={onChange}
          options={dropdownOptions.dealTypes || []}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <LocationSearch
          mode="multi"
          selectedLocations={form.locations || []}
          onChange={onLocationChange}
        />

        <MultiSelectField
          label="Property Types"
          name="property_types_required"
          value={form.property_types_required}
          onChange={handleMultiSelectChange}
          options={dropdownOptions.propertyTypes || []}
          placeholder="Select property types..."
        />
      </div>
    </div>
  );

  const renderAssignment = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
        Assignment & Status
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SearchableInput
          label="Listed By (User)"
          name="listed_by"
          value={form.client_user || null}
          onObjectSelect={(user) => {
            console.log("User Selected is ", user)
          }}
          onSelect={(selected) => {
            // selected will be the full User object
            console.log("Selected user:", selected);
          }}
          options={dropdownOptions.listedByUsers || []}
          placeholder="Search or enter user name/ID"
        />
        
        <MultiSelectField
          label="Tag"
          name="tag"
          value={form.tag} 
          onChange={handleMultiSelectChange}
          options={dropdownOptions.tags
              ?.filter((category) => category.name === form.type)
              ?.flatMap((category) => category.tags) || []}
          placeholder="Select Tags..."
        />
      </div>

      <div className="flex items-center pt-2">
        <input
          id="is_urgent_req"
          name="is_urgent"
          type="checkbox"
          checked={form.is_urgent}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label
          htmlFor="is_urgent_req"
          className="ml-2 block text-sm text-gray-900"
        >
          Mark as Urgent
        </label>
      </div>
    </div>
  );

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create New Client Request
      </h1>
      {renderCoreDetails()}
      {renderBudgetPricing()}
      {renderSpecs()}
      {renderAssignment()}
    </>
  );
};
