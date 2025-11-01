import React, { useEffect } from "react";
import {
  type RequestForm as RequestFormType,
  type DropdownOptions,
  type Location,
  type User,
  type UnfilledFields,
  type PropertyType,
  type Tag,
} from "../../interfaces";
import {
  CheckboxGroup,
  InputField,
  LocationSearch,
  MultiSelectField,
  SearchableInput,
  SelectField,
} from "../common";
import { extractNameAndNumber } from "../../utils/formats";

interface RequestFormProps {
  form: RequestFormType;
  dropdownOptions: DropdownOptions;
  requestTransactionOptions: string[];
  user: User | null;
  messageId: string | null;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onLocationChange: (locations: Location[]) => void;
  handleMultiSelectChange: (name: string, value: string[]) => void;
  handleObjectChanges: (
    object: Tag | PropertyType | User,
    fieldName: string,
    formType: string
  ) => void;
  unfilledFields?: UnfilledFields;
}

export const RequestForm: React.FC<RequestFormProps> = ({
  form,
  dropdownOptions,
  requestTransactionOptions,
  user,
  messageId,
  onChange,
  onLocationChange,
  handleMultiSelectChange,
  handleObjectChanges,
  unfilledFields = {},
}) => {
  // Effect to set client_user from user prop on mount
  useEffect(() => {
    if (user && !form.client_user) {
      handleObjectChanges(user, "client_user", "Request");
    }
  }, [user, form.client_user, handleObjectChanges]);

  // Effect to auto-populate client details when client_user changes
  useEffect(() => {
    if (form.client_user) {
      const { name, number } = extractNameAndNumber(form.client_user.name);

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
  }, [form.client_user, onChange]);

  useEffect(() => {
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
          options={["Rent", "Buy"]}
        />
        <SelectField
          label="Tag"
          name="tag"
          value={form.tag}
          onObjectChange={(tag) => {
            if (tag) {
              handleObjectChanges(tag, "tag", "Request");
            }
          }}
          options={
            dropdownOptions.tags
              ?.filter(
                (category) =>
                  category.name === (form.type === "Buy" ? "Buy" : "Rent")
              )
              ?.flatMap((category) => category.tags) || []
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
        <MultiSelectField
          label="Property Types"
          name="property_types_required"
          value={form.property_types_required}
          onChange={handleMultiSelectChange}
          options={dropdownOptions.propertyTypes || []}
          placeholder="Select property types..."
          hasError={unfilledFields.property_types_required}
          errorMessage={
            unfilledFields.property_types_required
              ? "AI could not determine Property Types"
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
          options={requestTransactionOptions}
          hasError={unfilledFields.transaction}
          errorMessage={
            unfilledFields.transaction
              ? "AI could not determine transaction type"
              : undefined
          }
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <LocationSearch
          mode="multi"
          selectedLocations={form.locations || []}
          onChange={onLocationChange}
          hasError={unfilledFields.locations}
          errorMessage={
            unfilledFields.locations
              ? "AI could not determine Location"
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
          name="client_user"
          value={form.client_user || null}
          onObjectSelect={(user) => {
            if (user) {
              handleObjectChanges(user, "client_user", "Request");
            }
          }}
          options={dropdownOptions.listedByUsers || []}
          placeholder="Search or enter user name/ID"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
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
        <InputField
          label="Message ID"
          name="message_id"
          value={form.message_id || ""}
          onChange={onChange}
          placeholder="Message ID"
          readOnly
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
      <div className="flex items-center pt-2">
        <input
          id="is_direct_req"
          name="is_direct"
          type="checkbox"
          checked={form.is_direct}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label
          htmlFor="is_direct_req"
          className="ml-2 block text-sm text-gray-900"
        >
          Mark as Direct
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
