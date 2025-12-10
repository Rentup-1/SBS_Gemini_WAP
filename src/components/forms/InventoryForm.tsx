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
import type { PropertyType, Tag, FurnishedType, Message } from "@/types";
import { LocationSearch } from "../common/LocationSearch";

interface InventoryFormProps {
  propertyTypes: PropertyType[];
  tags: Tag[];
  furnishedTypes: FurnishedType[];
  message: Message;
}

const InventoryForm = ({
  propertyTypes,
  tags,
  furnishedTypes,
  message,
}: InventoryFormProps) => {
  const { register, control, watch, setValue } = useFormContext();
  const locationName = watch("location_name");
  // const locationName = watch("locations_text_display"); // Temporary field for display
  const inventoryOptions = watch("inventory_options") || {};
  const optionsKeys = Object.keys(inventoryOptions);

  return (
    <div className="space-y-6 p-1">
      {/* header */}
      <div className="space-y-1.5">
        <h4 className="text-lg text-center font-semibold text-blue-600">
          Inventory Details
        </h4>
      </div>

      {/* 1. Core Details */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-800 border-b pb-2">
          Core Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Source</Label>
            <Input
              value={message.source || "APP"}
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
                    <SelectItem value="for_rent">For Rent</SelectItem>
                    <SelectItem value="sell">For Sale</SelectItem>
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
          <div className="space-y-1.5">
            <Label>Property Type</Label>
            <Controller
              name="property_type"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
                    <SelectValue placeholder="Select Furnish" />
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

      {/* 2. Budget & Pricing */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-800 border-b pb-2">
          Budget & Pricing
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Price (EGP)</Label>
            <Input {...register("egp_price")} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <Label>Price (USD)</Label>
            <Input {...register("usd_price")} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <Label>Transaction Type</Label>
            <Controller
              name="transaction_type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="INSTALLMENT">Installment</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Duration & Installment */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-3 rounded-md border">
          <div className="space-y-1.5">
            <Label className="text-xs">Duration Period</Label>
            <Input
              {...register("duration_period")}
              placeholder="e.g. 12"
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Duration Type</Label>
            <Controller
              name="duration_type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Months</SelectItem>
                    <SelectItem value="YEARLY">Years</SelectItem>
                    <SelectItem value="DAILY">Days</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Start Date</Label>
            <Input
              type="date"
              {...register("duration_start_date")}
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">End Date</Label>
            <Input
              type="date"
              {...register("duration_end_date")}
              className="h-8"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Inst. Period</Label>
            <Input
              {...register("installment_period")}
              placeholder="e.g. 5"
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Inst. Type</Label>
            <Controller
              name="installment_type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
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
        <div className="space-y-1.5">
          <Label>Location (Selected via AI Panel or search box below)</Label>
          <LocationSearch
            defaultValue={locationName}
            onSelect={(loc) => {
              setValue("location", loc.id, {
                shouldValidate: true,
                shouldDirty: true,
              });
              setValue("location_name", loc.name);
            }}
          />
          <input
            type="hidden"
            {...register("location", { required: "Location is required" })}
          />
        </div>
      </div>
      {/* 4. Amenities & Options (New Section) */}
      {optionsKeys.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 border-b pb-2">
            Options & Amenities
          </h4>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Detected Options</Label>
            <div className="flex flex-wrap gap-4">
              {optionsKeys.map((key) => (
                <div
                  key={key}
                  className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-md border border-blue-100"
                >
                  <Controller
                    name={`inventory_options.${key}`}
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id={`opt-${key}`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-blue-600 border-blue-400"
                      />
                    )}
                  />
                  <label
                    htmlFor={`opt-${key}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize text-blue-900"
                  >
                    {key}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* 5. Assignment & Status */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-800 border-b pb-2">
          Assignment & Status
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Deal Type</Label>
            <Controller
              name="deal_deal_type"
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

        <div className="flex flex-wrap gap-6 pt-2">
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
    </div>
  );
};

export default InventoryForm;
