import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { PropertyType, Tag, FurnishedType, Message } from "@/types";
import { LocationSearch } from "../common/LocationSearch";
import { MediaPreview } from "../common/MediaPreview";
import { Separator } from "@radix-ui/react-separator";

interface RequestFormProps {
  propertyTypes: PropertyType[];
  tags: Tag[];
  furnishedTypes: FurnishedType[];
  message: Message;
}

const RequestForm = ({
  propertyTypes,
  tags,
  furnishedTypes,
  message,
}: RequestFormProps) => {
  const { register, control, watch, setValue } = useFormContext();

  // Watch type and transaction_type for conditional field visibility
  const type = watch("type");
  const transactionType = watch("transaction_type");

  // Determine which sections to show
  const isRent = type === "rent";
  const isBuy = type === "buy";
  const isInstallment = transactionType === "installment";

  // rent: show rent_duration, hide installment
  // buy + cash: hide both
  // buy + installment: hide rent_duration, show installment
  const showRentDuration = isRent;
  const showInstallment = isBuy && isInstallment;

  // Custom Logic for Multi-select Property Types
  const selectedPropTypes = watch("property_type_ids") || [];

  const exactIds = watch("exact_location_ids") || [];
  const rawExactNames = watch("exact_locations_text");
  const exactNames = Array.isArray(rawExactNames) ? rawExactNames : [];
  const suggestedIds = watch("suggested_location_ids") || [];
  const rawSuggestedNames = watch("suggested_locations_text");
  const suggestedNames = Array.isArray(rawSuggestedNames)
    ? rawSuggestedNames
    : [];
  // Remove Exact Location and Suggested Location
  const removeExactLocation = (index: number) => {
    setValue(
      "exact_locations_text",
      exactNames.filter((_, i: number) => i !== index)
    );
    setValue(
      "exact_location_ids",
      exactIds.filter((_, i: number) => i !== index)
    );
  };
  const removeSuggestedLocation = (index: number) => {
    setValue(
      "suggested_locations_text",
      suggestedNames.filter((_, i: number) => i !== index)
    );
    setValue(
      "suggested_location_ids",
      suggestedIds.filter((_, i: number) => i !== index)
    );
  };
  // Toggle Property Type
  const togglePropertyType = (id: number) => {
    const current = Array.isArray(selectedPropTypes) ? selectedPropTypes : [];
    if (current.includes(id))
      setValue(
        "property_type_ids",
        current.filter((x: number) => x !== id)
      );
    else setValue("property_type_ids", [...current, id]);
  };

  // watch for request options
  const requestOptions = watch("request_options") || [];
  const optionsKeys = Object.keys(requestOptions);

  return (
    <div className="space-y-6 p-1">
      {/* header */}
      <div className="space-y-1.5">
        <h4 className="text-lg text-center font-semibold text-blue-600">
          Request Details
        </h4>
      </div>
      {/* 1. Core Details */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-800 border-b pb-2">
          Core Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Source</Label>
            <Input
              value={message.source || "ADMIN"}
              disabled
              className="bg-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="buy">Buy</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tag</Label>
            <Controller
              name="tag"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Privacy</Label>
            <Controller
              name="privacy"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label>Property Types (Multi-select)</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-white min-h-[42px]">
              {selectedPropTypes.map((id: number) => {
                const pt = propertyTypes.find((p) => p.id === id);
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="gap-1 cursor-pointer"
                    onClick={() => togglePropertyType(id)}
                  >
                    {pt?.name} <X className="w-3 h-3" />
                  </Badge>
                );
              })}
              <Select onValueChange={(val) => togglePropertyType(Number(val))}>
                <SelectTrigger className="border-0 p-0 h-auto w-auto focus:ring-0 shadow-none">
                  <span className="text-muted-foreground text-xs hover:text-primary cursor-pointer">
                    + Add Type
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Furnish Type</Label>
            <Controller
              name="furnish_type"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {furnishedTypes.map((f) => (
                      <SelectItem key={f.id} value={f.id.toString()}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>BUA (m²)</Label>
            <Input
              type="number"
              {...register("bua", { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      {/* 2. Budget */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-800 border-b pb-2">
          Budget & Payment
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Budget (EGP)</Label>
            <Input {...register("egp_budget")} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <Label>Budget (USD)</Label>
            <Input {...register("usd_budget")} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <Label>Transaction</Label>
            <Controller
              name="transaction_type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="installment">Installment</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Rent Duration Section - Only for rent */}
        {showRentDuration && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-slate-600">
              Rent Duration
            </h5>
            <div className="grid grid-cols-4 gap-4 bg-blue-50 p-3 rounded-md border border-blue-200">
              <div className="space-y-1.5">
                <Label className="text-xs">Duration Period</Label>
                <Input
                  {...register("rent_duration_period")}
                  placeholder="e.g. 12"
                  className="h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Duration Type</Label>
                <Controller
                  name="rent_duration_type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  {...register("rent_duration_start_date")}
                  className="h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  {...register("rent_duration_end_date")}
                  className="h-8"
                />
              </div>
            </div>
          </div>
        )}

        {/* Installment Section - Only for buy + installment */}
        {showInstallment && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-slate-600">
              Installment Details
            </h5>
            <div className="grid grid-cols-4 gap-4 bg-amber-50 p-3 rounded-md border border-amber-200">
              <div className="space-y-1.5">
                <Label className="text-xs">Period Type</Label>
                <Controller
                  name="installment_period_type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Total Periods</Label>
                <Input
                  {...register("total_installment_period")}
                  className="h-8"
                  placeholder="e.g. 5"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Amount</Label>
                <Input
                  {...register("installment_amount")}
                  className="h-8"
                  placeholder="Amount"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Payment Plan</Label>
                <Input
                  {...register("installment_payment_plan")}
                  className="h-8"
                  placeholder="Plan"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Specs & Location */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-800 border-b pb-2">
          Specs & Location
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Bedrooms</Label>
            <Input
              type="number"
              {...register("no_bedroom", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Bathrooms</Label>
            <Input
              type="number"
              {...register("no_bathroom", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Master Rooms</Label>
            <Input
              type="number"
              {...register("no_master_room", { valueAsNumber: true })}
            />
          </div>
        </div>

        <Separator />

        {/* location search */}

        <div className="space-y-4">
          <h3 className="font-medium text-sm text-gray-900">Locations</h3>

          {/* 1. Exact Locations Section */}
          <div className="space-y-2 p-3 border rounded-md bg-green-50/30 border-green-100">
            {/* <FormLabel className="text-green-800">Exact Locations</FormLabel> */}

            {/* Search Input for Exact */}
            <LocationSearch
              placeholder="+ Add Exact Location..."
              onSelect={(loc) => {
                if (!exactIds.includes(loc.id)) {
                  setValue("exact_location_ids", [...exactIds, loc.id], {
                    shouldDirty: true,
                  });
                  setValue("exact_locations_text", [...exactNames, loc.name]);
                }
              }}
            />

            {/* Badges for Exact */}
            <div className="flex flex-wrap gap-2 min-h-[30px]">
              {exactNames.length === 0 ? (
                <span className="text-xs text-muted-foreground py-1">
                  No exact locations selected.
                </span>
              ) : (
                exactNames.map((name: string, idx: number) => (
                  <Badge
                    key={`exact-${idx}`}
                    variant="secondary"
                    className="bg-green-100 text-green-800 hover:bg-green-200 gap-1 pr-1"
                  >
                    {name}
                    <div
                      className="hover:bg-green-300 rounded-full p-0.5 cursor-pointer"
                      onClick={() => removeExactLocation(idx)}
                    >
                      <X className="w-3 h-3" />
                    </div>
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* 2. Suggested Locations Section */}
          <div className="space-y-2 p-3 border rounded-md bg-amber-50/30 border-amber-100">
            {/* <FormLabel className="text-amber-800">
              Suggested Locations
            </FormLabel> */}

            {/* Search Input for Suggested */}
            <LocationSearch
              placeholder="+ Add Suggested Location..."
              onSelect={(loc) => {
                if (!suggestedIds.includes(loc.id)) {
                  setValue(
                    "suggested_location_ids",
                    [...suggestedIds, loc.id],
                    { shouldDirty: true }
                  );
                  setValue("suggested_locations_text", [
                    ...suggestedNames,
                    loc.name,
                  ]);
                }
              }}
            />

            {/* Badges for Suggested */}
            <div className="flex flex-wrap gap-2 min-h-[30px]">
              {suggestedNames.length === 0 ? (
                <span className="text-xs text-muted-foreground py-1">
                  No suggested locations selected.
                </span>
              ) : (
                suggestedNames.map((name: string, idx: number) => (
                  <Badge
                    key={`sugg-${idx}`}
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 hover:bg-amber-200 gap-1 pr-1"
                  >
                    {name}
                    <div
                      className="hover:bg-amber-300 rounded-full p-0.5 cursor-pointer"
                      onClick={() => removeSuggestedLocation(idx)}
                    >
                      <X className="w-3 h-3" />
                    </div>
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>
        <Separator />
      </div>
      {/* Amenities & Options (UI Only Section) */}
      {optionsKeys.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 border-b pb-2">
            Requested Options
          </h4>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Detected Options</Label>
            <div className="flex flex-wrap gap-4">
              {optionsKeys.map((key) => (
                <div
                  key={key}
                  className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-md border border-slate-200"
                >
                  <Controller
                    name={`request_options.${key}`}
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id={`req-opt-${key}`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor={`req-opt-${key}`}
                    className="text-sm font-medium leading-none cursor-pointer capitalize text-slate-700"
                  >
                    {key}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Assignment & Status */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-800 border-b pb-2">
          Assignment & Status
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Deal Type</Label>
            <Controller
              name="deal_type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Side-by-Side">Side-by-Side</SelectItem>
                    <SelectItem value="Direct">Direct</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Listing Code</Label>
            <Input {...register("listing_code")} placeholder="Optional" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>WhatsApp Message</Label>
          <Textarea {...register("whatsapp_msg")} className="h-16" />
        </div>
        <div className="space-y-1.5">
          <Label>Additional Notes</Label>
          <Textarea {...register("additional_notes")} className="h-16" />
        </div>

        <div className="flex gap-6 pt-2">
          <div className="flex items-center space-x-2">
            <Controller
              name="urgent"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="urgent"
                />
              )}
            />
            <label htmlFor="urgent" className="text-sm font-medium">
              Urgent
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Controller
              name="direct"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="direct"
                />
              )}
            />
            <label htmlFor="direct" className="text-sm font-medium">
              Direct
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="active"
                />
              )}
            />
            <label htmlFor="active" className="text-sm font-medium">
              Active
            </label>
          </div>
        </div>
      </div>

      {/* 5. Media Attachment Preview */}
      <MediaPreview
        imageUrl={message.image}
        videoUrl={message.video}
        mediaType={message.media_type}
      />
    </div>
  );
};

export default RequestForm;
