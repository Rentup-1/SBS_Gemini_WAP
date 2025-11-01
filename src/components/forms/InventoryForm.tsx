import React, { useEffect } from "react";
import {
  type InventoryForm as InventoryFormType,
  type DropdownOptions,
  type User,
  type UnfilledFields,
} from "../../interfaces";
import {
  InputField,
  SearchableInput,
  SelectField,
  LocationSearch,
  CheckboxGroup,
} from "../common";
import { extractNameAndNumber } from "../../utils/formats";

interface InventoryFormProps {
  form: InventoryFormType;
  dropdownOptions: DropdownOptions;
  inventoryTransactionOptions: string[];
  user: User | null;
  messageId: string | null;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleObjectChanges: (object: any, fieldName: string) => void;
  unfilledFields?: UnfilledFields;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({
  form,
  dropdownOptions,
  inventoryTransactionOptions,
  user,
  messageId,
  onChange,
  handleObjectChanges,
  unfilledFields = {},
}) => {
  // Effect to set listed_by from user prop on mount
  useEffect(() => {
    if (user && !form.listed_by) {
      handleObjectChanges(user, "listed_by");
    }
  }, [user, form.listed_by, handleObjectChanges]);

  // Effect to handle user changes and auto-populate client details
  useEffect(() => {
    if (form.listed_by) {
      console.log("form.listed_by", form.listed_by);
      const { name, number } = extractNameAndNumber(form.listed_by.name);
      console.log("name", name);
      console.log("number", number);
      // Create synthetic events for form field updates
      const clientNameEvent = {
        target: {
          name: "client_name",
          type: "text",
          value: name || "",
        },
      } as React.ChangeEvent<HTMLInputElement>;

      const clientPhoneEvent = {
        target: {
          name: "client_phone",
          type: "text",
          value: number || "",
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange(clientNameEvent);
      onChange(clientPhoneEvent);
    }
  }, [form.listed_by, onChange]);

  useEffect(() => {
    console.log(messageId);
    const messageIdEvent = {
      target: {
        name: "message_id",
        type: "text",
        value: messageId || "",
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(messageIdEvent);
  }, []);

  const renderCoreDetails = () => (
    <div className="space-y-4">
      <SelectField
          label="Source"
          name="source"
          value={form.source}
          onChange={onChange}
          options={dropdownOptions.sourceOptions || []}
        />
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
        Core Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          label="Type"
          name="type"
          value={form.type}
          onChange={onChange}
          options={dropdownOptions.types || []}
        />
        <SelectField
          label="Tag"
          name="tag"
          value={form.tag}
          onObjectChange={(tag) => {
            handleObjectChanges(tag, "tag");
          }}
          options={
            dropdownOptions.tags
              ?.filter(
                (category) =>
                  category.name === (form.type === "For Sale" ? "Sell" : "Rent")
              )
              ?.flatMap((category) => category.tags) || []
          }
          hasError={unfilledFields.tag}
          errorMessage={
            unfilledFields.tag ? "AI could not determine Tag" : undefined
          }
        />
        <SelectField
          label="Privacy"
          name="privacy"
          value={form.privacy}
          onChange={onChange}
          options={dropdownOptions.requestPrivacy || []}
          hasError={unfilledFields.privacy}
          errorMessage={
            unfilledFields.privacy
              ? "AI could not determine privacy setting"
              : undefined
          }
        />
        <SelectField
          label="Property Type"
          value={form.property_type}
          onObjectChange={(propertyType) => {
            handleObjectChanges(propertyType, "property_type");
          }}
          name="property_type"
          options={dropdownOptions.propertyTypes || []}
          hasError={unfilledFields.property_type}
          errorMessage={
            unfilledFields.property_type
              ? "AI could not determine property type"
              : undefined
          }
        />
        <SelectField
          label="Furnish Type"
          name="furnish_type"
          value={form.furnish_type}
          onChange={onChange}
          options={dropdownOptions.furnishTypes || []}
          hasError={unfilledFields.furnish_type}
          errorMessage={
            unfilledFields.furnish_type
              ? "AI could not determine furnish type"
              : undefined
          }
        />
        <InputField
          label="BUA"
          name="bua"
          type="number"
          value={form.bua}
          onChange={onChange}
          placeholder="0"
          trailingDiv={<span className="text-gray-500">m²</span>}
          hasError={unfilledFields.bua}
          errorMessage={
            unfilledFields.bua ? "AI could not determine BUA" : undefined
          }
        />
      </div>
    </div>
  );

  const renderBudgetPricing = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
        Budget & Pricing
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InputField
          label="Price"
          name="price"
          type="number"
          value={form.price}
          onChange={onChange}
          placeholder="0"
          hasError={unfilledFields.price}
          errorMessage={
            unfilledFields.price ? "AI could not determine price" : undefined
          }
        />
        <SelectField
          label="Currency"
          name="currency"
          value={form.currency}
          onChange={onChange}
          options={dropdownOptions.currencies || []}
          hasError={unfilledFields.currency}
          errorMessage={
            unfilledFields.currency
              ? "AI could not determine currency"
              : undefined
          }
        />
        <SelectField
          label="Transaction Type"
          name="transaction"
          value={form.transaction}
          onChange={onChange}
          options={inventoryTransactionOptions}
          hasError={unfilledFields.transaction}
          errorMessage={
            unfilledFields.transaction
              ? "AI could not determine transaction type"
              : undefined
          }
        />
      </div>

      {form.type === "For Rent" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
          <InputField
            label="Duration Period"
            name="duration"
            type="number"
            value={form.duration}
            onChange={onChange}
            placeholder="12"
            hasError={unfilledFields.duration}
            errorMessage={
              unfilledFields.duration
                ? "AI could not determine duration"
                : undefined
            }
          />
          <SelectField
            label="Duration Type"
            name="duration_type"
            value={form.duration_type}
            onChange={onChange}
            options={dropdownOptions.durationTypes || []}
            hasError={unfilledFields.duration_type}
            errorMessage={
              unfilledFields.duration_type
                ? "AI could not determine duration type"
                : undefined
            }
          />
          <InputField
            label="Start Date"
            name="start_date"
            type="date"
            value={form.start_date}
            onChange={onChange}
            placeholder="dd/mm/yyyy"
            hasError={unfilledFields.start_date}
            errorMessage={
              unfilledFields.start_date
                ? "AI could not determine start date"
                : undefined
            }
          />
          <InputField
            label="End Date"
            name="end_date"
            type="date"
            value={form.end_date}
            onChange={onChange}
            placeholder="dd/mm/yyyy"
            hasError={unfilledFields.end_date}
            errorMessage={
              unfilledFields.end_date
                ? "AI could not determine end date"
                : undefined
            }
          />
        </div>
      )}
    </div>
  );

  const renderSpecsLocation = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
        Specs & Location
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InputField
          label="Bedrooms"
          name="bedrooms"
          type="number"
          value={form.bedrooms}
          onChange={onChange}
          placeholder="1"
          hasError={unfilledFields.bedrooms}
          errorMessage={
            unfilledFields.bedrooms
              ? "AI could not determine bedrooms"
              : undefined
          }
        />
        <InputField
          label="Bathrooms"
          name="bathrooms"
          type="number"
          value={form.bathrooms}
          onChange={onChange}
          placeholder="1"
          hasError={unfilledFields.bathrooms}
          errorMessage={
            unfilledFields.bathrooms
              ? "AI could not determine bathrooms"
              : undefined
          }
        />
        <InputField
          label="Master Bedrooms"
          name="no_master_bedroom"
          type="number"
          value={form.no_master_bedroom}
          onChange={onChange}
          placeholder="1"
          hasError={unfilledFields.no_master_bedroom}
          errorMessage={
            unfilledFields.no_master_bedroom
              ? "AI could not determine master bedrooms"
              : undefined
          }
        />
      </div>
      <div className="col-span-4 mt-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Location
        </label>
        <LocationSearch
          mode="single"
          value={form?.location ?? undefined}
          onChange={(location) => handleObjectChanges(location, "location")}
          placeholder="Start typing to search for a location..."
          hasError={unfilledFields.location}
          errorMessage={
            unfilledFields.location
              ? "AI could not determine Location"
              : undefined
          }
        />
      </div>
    </div>
  );

  const renderAssignmentDetails = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
        Assignment & Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          label="Deal Type"
          name="deal_type"
          value={form.deal_type}
          onChange={onChange}
          options={dropdownOptions.dealTypes || []}
          hasError={unfilledFields.deal_type}
          errorMessage={
            unfilledFields.deal_type
              ? "AI could not determine deal type"
              : undefined
          }
        />
      </div>
      {dropdownOptions.requestOptions &&
      dropdownOptions.requestOptions?.length > 0 ? (
        <CheckboxGroup
          label="Options"
          name="options_required"
          options={dropdownOptions.requestOptions || []}
          selectedValues={form.options_required || []}
          onChange={onChange}
          maxHeight="max-h-40"
          selectAllByDefault={false}
        />
      ) : null}
      <InputField
        label="Reference ID"
        name="reference_id"
        type="text"
        value={form.reference_id}
        onChange={onChange}
        placeholder="Type the Refrence Id"
        hasError={unfilledFields.reference_id}
        errorMessage={
          unfilledFields.reference_id
            ? "AI could not determine reference ID"
            : undefined
        }
      />
      <InputField
        label="WhatsApp Message (Original)"
        name="whatsapp_message"
        value={form.whatsapp_message}
        onChange={onChange}
        placeholder="Original WhatsApp text after confirmation"
      />

      <div className="flex items-center pt-2">
        <input
          id="is_urgent_inv"
          name="is_urgent"
          type="checkbox"
          checked={form.is_urgent}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label
          htmlFor="is_urgent_inv"
          className="ml-2 block text-sm text-gray-900"
        >
          Mark as Urgent
        </label>
      </div>
      <div className="flex items-center pt-2">
        <input
          id="is_direct_inv"
          name="is_direct"
          type="checkbox"
          checked={form.is_direct}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label
          htmlFor="is_direct_inv"
          className="ml-2 block text-sm text-gray-900"
        >
          Mark as Direct
        </label>
      </div>
    </div>
  );

  const renderClientDetails = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
        Client Contact Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SearchableInput
          label="Listed By (User)"
          name="listed_by"
          value={form.listed_by || null}
          onObjectSelect={(user) => {
            handleObjectChanges(user, "listed_by");
          }}
          options={dropdownOptions.listedByUsers || []}
          placeholder="Search or enter user name/ID"
        />
        <InputField
          label="Client Name"
          name="client_name"
          value={form.client_name || ""}
          onChange={onChange}
          placeholder="Auto-filled from user"
          readOnly
        />

        <InputField
          label="Client Phone"
          name="client_phone"
          value={form.client_phone || ""}
          onChange={onChange}
          placeholder="Auto-filled from user"
          readOnly
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="Message ID"
          name="message_id"
          value={form.message_id || ""}
          onChange={onChange}
          placeholder="Message ID"
          readOnly
        />
      </div>
    </div>
  );

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Inventory Listing Form
      </h1>
      {renderCoreDetails()}
      {renderBudgetPricing()}
      {renderSpecsLocation()}
      {renderAssignmentDetails()}
      {renderClientDetails()}

      <div className="space-y-4 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
          Images
        </h3>
        <div className="flex items-center">
          <button className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 transition">
            Browse...
          </button>
          <span className="ml-3 text-sm text-gray-500">
            No files selected. (Simulated)
          </span>
        </div>
      </div>
    </>
  );
};
