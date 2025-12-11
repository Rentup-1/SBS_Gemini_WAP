import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { UseFormReturn } from "react-hook-form";
import { processInventory, processRequest } from "@/api/core";
import { toast } from "@/hooks/use-toast";
import type {
  AIProcessResponse,
  PropertyType,
  FurnishedType,
  Tag,
} from "@/types";

interface UseAIParserProps {
  initialMessage: string;
  formType: "inventory" | "request";
  form;
  propertyTypes: PropertyType[];
  furnishedTypes: FurnishedType[];
  tags: Tag[];
}

export const useAIParser = ({
  initialMessage,
  formType,
  form,
  propertyTypes,
  furnishedTypes,
  tags,
}: UseAIParserProps) => {
  const [msgText, setMsgText] = useState(initialMessage);
  const [aiResponse, setAiResponse] = useState<AIProcessResponse | null>(null);

  const autoFillForm = (data: AIProcessResponse) => {
    // 1. Budget & Price
    if (data.egp_price) form.setValue("egp_price", String(data.egp_price));
    if (data.usd_price) form.setValue("usd_price", String(data.usd_price));
    if (data.egp_budget) form.setValue("egp_budget", String(data.egp_budget));
    if (data.usd_budget) form.setValue("usd_budget", String(data.usd_budget));

    // 2. BUA & Specs
    if (data.bua) form.setValue("bua", Number(data.bua));
    if (data.no_bedroom !== undefined)
      form.setValue("no_bedroom", data.no_bedroom);
    if (data.no_bathroom !== undefined)
      form.setValue("no_bathroom", data.no_bathroom);
    if (data.no_master_room !== undefined)
      form.setValue("no_master_room", data.no_master_room);

    // 3. Tags
    if (data.tag) {
      const foundTag = tags.find(
        (t) => t.name.toLowerCase() === data.tag?.toLowerCase()
      );
      if (foundTag) form.setValue("tag", foundTag.id);
    }

    // 4. Property Types
    if (formType === "request") {
      let typeKeys: string[] = [];
      if (Array.isArray(data.property_types))
        typeKeys = data.property_types as string[];
      else if (typeof data.property_types === "object" && data.property_types)
        typeKeys = Object.keys(data.property_types);
      else if (typeof data.property_types === "string")
        typeKeys = [data.property_types];

      const ids: number[] = [];
      typeKeys.forEach((k) => {
        const pt = propertyTypes.find((p) =>
          p.name.toLowerCase().includes(k.toLowerCase())
        );
        if (pt) ids.push(pt.id);
      });
      if (ids.length > 0) form.setValue("property_type_ids", ids);
    } else if (formType === "inventory" && data.property_type) {
      const pt = propertyTypes.find((p) =>
        p.name.toLowerCase().includes(data.property_type!.toLowerCase())
      );
      if (pt) form.setValue("property_type", pt.id);
    }

    // 5. Furnish Types
    const fType = data.furnish_type || data.furnish_types;
    if (fType) {
      const ft = furnishedTypes.find((f) =>
        f.name.toLowerCase().includes(fType.toLowerCase())
      );
      if (ft) form.setValue("furnish_type", ft.id);
    }

    // 6. Transaction & Duration
    if (data.transaction_type)
      form.setValue("transaction_type", data.transaction_type.toUpperCase());
    if (data.duration_period)
      form.setValue("duration_period", String(data.duration_period));
    if (data.duration_type)
      form.setValue("duration_type", data.duration_type.toUpperCase());
    if (data.installment_period)
      form.setValue("installment_period", String(data.installment_period));
    if (data.installment_type)
      form.setValue("installment_type", data.installment_type.toUpperCase());

    // 7. Deal Type & Meta
    if (data.deal_deal_type) {
      form.setValue("deal_deal_type", data.deal_deal_type);
      form.setValue("deal_type", data.deal_deal_type);
    }
    if (data.listing_code) form.setValue("listing_code", data.listing_code);
    if (data.additional_notes)
      form.setValue("additional_notes", data.additional_notes);
    form.setValue("whatsapp_msg", msgText);

    // 8. Type Logic
    if (data.type) {
      const t = data.type.toLowerCase();
      const val =
        t.includes("sale") || t.includes("buy")
          ? formType === "inventory"
            ? "for_sale"
            : "buy"
          : formType === "inventory"
          ? "for_rent"
          : "rent";
      form.setValue("type", val);
    }

    // 9. Checkboxes
    if (data.urgent) form.setValue("urgent", true);
    if (data.direct) form.setValue("direct", true);
    if (data.active) form.setValue("active", true);

    // 10. Options Parsing
    const parseOptions = (optString: string) => {
      if (!optString) return {};
      return optString.split(",").reduce((acc, curr) => {
        const key = curr.trim();
        if (key) acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>);
    };
    if (
      formType === "inventory" &&
      typeof data.inventory_options === "string"
    ) {
      form.setValue("inventory_options", parseOptions(data.inventory_options));
    } else if (
      formType === "request" &&
      typeof data.request_options === "string"
    ) {
      form.setValue("request_options_ui", parseOptions(data.request_options));
    }
  };

  const aiMutation = useMutation({
    mutationFn: async () => {
      const response =
        formType === "inventory"
          ? await processInventory(msgText)
          : await processRequest(msgText);
      return response as unknown as AIProcessResponse;
    },
    onSuccess: (data) => {
      setAiResponse(data);
      autoFillForm(data);
      toast({
        title: "Data Extracted",
        description: "Form fields updated successfully.",
      });
    },
    onError: () => {
      toast({ title: "Extraction Failed", variant: "destructive" });
    },
  });

  return {
    msgText,
    setMsgText,
    aiResponse,
    generateData: aiMutation.mutate,
    isProcessing: aiMutation.isPending,
  };
};
