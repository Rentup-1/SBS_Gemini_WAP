import { processInventory, processRequest } from "@/api/core";
import { toast } from "@/hooks/use-toast";
import type {
  AIProcessResponse,
  FurnishedType,
  PropertyType,
  Tag,
} from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

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
    if (formType === "inventory") {
      if (data.egp_price) form.setValue("egp_price", String(data.egp_price));
      if (data.usd_price) form.setValue("usd_price", String(data.usd_price));
    } else if (formType === "request") {
      if (data.egp_budget) form.setValue("egp_budget", String(data.egp_budget));
      if (data.usd_budget) form.setValue("usd_budget", String(data.usd_budget));
    }

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
    if (data.duration_type) {
      // const lowerType = data.duration_type.toLowerCase();
      // if (lowerType.includes("years") || lowerType.includes("year")) {
      //   form.setValue("duration_type", "YEARLY");
      // } else {
      form.setValue("duration_type", data.duration_type.toUpperCase());
      // }
    }
    if (data.installment_period)
      form.setValue("installment_period", String(data.installment_period));
    if (data.installment_type)
      form.setValue("installment_type", data.installment_type.toUpperCase());

    // 7. Deal Type & Meta
    if (data.deal_deal_type) {
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
    if (data.urgent === true) form.setValue("urgent", true);
    if (data.direct === true) form.setValue("direct", true);
    if (data.active === true) form.setValue("active", true);

    // 10. Options Parsing
    // Helper function to convert options (Array/String) to UI Object format
    const normalizeOptions = (
      input: string | string[] | undefined
    ): Record<string, boolean> => {
      if (!input) return {};

      // Case 1: If it's an Array (e.g. ["air conditioning", "tv"])
      if (Array.isArray(input)) {
        return input.reduce((acc, curr) => {
          if (typeof curr === "string") {
            acc[curr.trim()] = true;
          }
          return acc;
        }, {} as Record<string, boolean>);
      }

      // Case 2: If it's a comma-separated String (e.g. "air conditioning, tv")
      if (typeof input === "string") {
        return input.split(",").reduce((acc, curr) => {
          const key = curr.trim();
          if (key) acc[key] = true;
          return acc;
        }, {} as Record<string, boolean>);
      }

      return {};
    };

    if (
      formType === "inventory" &&
      typeof data.inventory_options === "string"
    ) {
      form.setValue(
        "inventory_options",
        normalizeOptions(data.inventory_options)
      );
    } else if (formType === "request" && data.request_options) {
      form.setValue("request_options", normalizeOptions(data.request_options));
    }

    const normalizeToTextArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === "string") {
        return val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (typeof val === "object") {
        return Object.keys(val);
      }
      return [];
    };

    if (formType === "inventory") {
      if (data.locations_text) {
        form.setValue(
          "locations_text",
          normalizeToTextArray(data.locations_text)
        );
      }
    } else {
      // Request Logic (Arrays Always)
      if (data.exact_locations_text) {
        form.setValue(
          "exact_locations_text",
          normalizeToTextArray(data.exact_locations_text)
        );
      } else {
        form.setValue("exact_locations_text", []);
      }

      if (data.suggested_locations_text) {
        form.setValue(
          "suggested_locations_text",
          normalizeToTextArray(data.suggested_locations_text)
        );
      } else {
        form.setValue("suggested_locations_text", []);
      }
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
