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

  // Custom Logic for Multi-select Property Types
  const selectedPropTypes = watch("property_type_ids") || [];
  const locationNames = watch("location_names_display") || [];
  const locationIds = watch("exact_location_ids") || [];

  const togglePropertyType = (id: number) => {
    const current = Array.isArray(selectedPropTypes) ? selectedPropTypes : [];
    if (current.includes(id))
      setValue(
        "property_type_ids",
        current.filter((x: number) => x !== id)
      );
    else setValue("property_type_ids", [...current, id]);
  };

  const removeLocation = (index: number) => {
    setValue(
      "location_names_display",
      locationNames.filter((_, i: number) => i !== index)
    );
    setValue(
      "exact_location_ids",
      locationIds.filter((_, i: number) => i !== index)
    );
    setValue("suggested_location_ids", []); // Clear suggested if removing manually to be safe
  };

  // watch for request options
  const requestOptions = watch("request_options_ui") || {};
  const optionsKeys = Object.keys(requestOptions);
  return (
    <div className="space-y-6 p-1">
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

        {/* Duration Details */}
        <div className="grid grid-cols-4 gap-4 bg-slate-50 p-3 rounded-md border">
          <div className="space-y-1.5">
            <Label className="text-xs">Duration Type</Label>
            <Controller
              name="duration_type"
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
            <Input {...register("installment_period")} className="h-8" />
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

        <div className="space-y-1.5 mt-2">
          <Label>Locations (Selected via AI Panel)</Label>
          <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-green-50 border-green-200 min-h-[42px]">
            {locationNames.length === 0 ? (
              <span className="text-sm text-green-800 self-center">
                No locations selected yet.
              </span>
            ) : (
              locationNames.map((name: string, idx: number) => (
                <Badge key={idx} variant="outline" className="bg-white gap-1">
                  {name}{" "}
                  <X
                    className="w-3 h-3 cursor-pointer text-muted-foreground hover:text-red-500"
                    onClick={() => removeLocation(idx)}
                  />
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Amenities & Options (UI Only Section) */}
      {optionsKeys.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 border-b pb-2">
            Requested Options (UI View Only)
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
                    name={`request_options_ui.${key}`}
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
            <p className="text-[10px] text-muted-foreground">
              * These options are extracted for reference but are not currently
              sent to the database.
            </p>
          </div>
        </div>
      )}

      {/* 4. Assignment & Status */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-800 border-b pb-2">
          Assignment & Status
        </h4>
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
          <Label>WhatsApp Message</Label>
          <Textarea {...register("whatsapp_msg")} className="h-16" />
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
        </div>
      </div>
    </div>
  );
};

export default RequestForm;
