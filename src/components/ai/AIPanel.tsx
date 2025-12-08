import { coreApi } from "@/api/axios";
import { processInventory, processRequest } from "@/api/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type {
  AIProcessResponse,
  FurnishedType,
  FuzzyMatchItem,
  FuzzyResponse,
  Message,
  PropertyType,
  Tag,
} from "@/types";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowRightLeft,
  CheckCircle2,
  Copy,
  Loader2,
  MapPin,
  Phone,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AIPanelProps {
  message: Message;
  formType: "inventory" | "request";
  onToggleType: () => void;
  form; // Keep generic for form strictly, or define specific form type
  propertyTypes: PropertyType[];
  furnishedTypes: FurnishedType[];
  tags: Tag[];
}

interface FuzzyPayload {
  exact_locations: string[];
  suggested_locations: string[];
  parent_context: string;
}

const customFuzzyMatch = async (
  payload: FuzzyPayload
): Promise<FuzzyResponse> => {
  const response = await coreApi.post<FuzzyResponse>("/fuzzy/match/", payload);
  return response.data;
};

const AIPanel = ({
  message,
  formType,
  onToggleType,
  form,
  propertyTypes,
  furnishedTypes,
  tags,
}: AIPanelProps) => {
  const [msgText, setMsgText] = useState(message.message);

  const [aiResponse, setAiResponse] = useState<AIProcessResponse | null>(null);
  const [fuzzyResults, setFuzzyResults] = useState<FuzzyResponse | null>(null);

  // Fuzzy Search Inputs
  const [exactLocs, setExactLocs] = useState<string[]>([]);
  const [suggestedLocs, setSuggestedLocs] = useState<string[]>([]);
  const [parentContext, setParentContext] = useState("");

  const [selectedLocations, setSelectedLocations] = useState<FuzzyMatchItem[]>(
    []
  );

  // 1. AI Processing Mutation
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

      let exact: string[] = [];
      let suggested: string[] = [];
      const context = data.parent_context || "";

      if (data.exact_locations_text) {
        if (Array.isArray(data.exact_locations_text)) {
          exact = data.exact_locations_text;
        } else if (typeof data.exact_locations_text === "object") {
          exact = Object.keys(data.exact_locations_text);
        } else if (typeof data.exact_locations_text === "string") {
          exact = [data.exact_locations_text as string];
        }
      } else if (data.locations_text) {
        // Fallback for inventory format
        exact = [data.locations_text];
      }

      if (data.suggested_locations_text) {
        if (Array.isArray(data.suggested_locations_text)) {
          suggested = data.suggested_locations_text;
        } else if (typeof data.suggested_locations_text === "object") {
          suggested = Object.keys(data.suggested_locations_text);
        }
      }

      setExactLocs(exact);
      setSuggestedLocs(suggested);
      setParentContext(context);

      if (exact.length > 0 || suggested.length > 0) {
        setTimeout(() => {
          fuzzyMutation.mutate({
            exact_locations: exact,
            suggested_locations: suggested,
            parent_context: context,
          });
        }, 500);
      }
    },
    onError: () => {
      toast({ title: "AI Extraction Failed", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (msgText) {
      aiMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Fuzzy Search Mutation
  const fuzzyMutation = useMutation({
    mutationFn: (payload: FuzzyPayload) => customFuzzyMatch(payload),
    onSuccess: (data) => {
      setFuzzyResults(data);
    },
    onError: () => {
      toast({ title: "Fuzzy Search Failed", variant: "destructive" });
    },
  });

  // function to auto fill form
  const autoFillForm = (data: AIProcessResponse) => {
    // 1. Budget & Price
    if (data.egp_price) form.setValue("egp_price", String(data.egp_price));
    if (data.usd_price) form.setValue("usd_price", String(data.usd_price));

    if (data.egp_budget) form.setValue("egp_budget", String(data.egp_budget));
    if (data.usd_budget) form.setValue("usd_budget", String(data.usd_budget));

    // 2. BUA
    if (data.bua) form.setValue("bua", Number(data.bua));

    // 3. Bedrooms & Bathrooms
    if (data.no_bedroom !== undefined)
      form.setValue("no_bedroom", data.no_bedroom);
    if (data.no_bathroom !== undefined)
      form.setValue("no_bathroom", data.no_bathroom);
    if (data.no_master_room !== undefined)
      form.setValue("no_master_room", data.no_master_room);

    // 4. Tag Mapping
    if (data.tag) {
      const foundTag = tags.find(
        (t) => t.name.toLowerCase() === data.tag?.toLowerCase()
      );
      if (foundTag) form.setValue("tag", foundTag.id);
    }

    //  3. Property Type Mapping (The Fix for Arrays)
    if (formType === "request") {
      let typeKeys: string[] = [];

      // Check if array of strings ["Apartment"]
      if (Array.isArray(data.property_types)) {
        typeKeys = data.property_types as string[];
      }
      // Check if object keys {"Apartment": {}}
      else if (
        typeof data.property_types === "object" &&
        data.property_types !== null
      ) {
        typeKeys = Object.keys(data.property_types);
      }
      // Check if single string
      else if (typeof data.property_types === "string") {
        typeKeys = [data.property_types];
      }

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

    // 5. Property Type Mapping
    if (formType === "request" && data.property_types) {
      let keys: string[] = [];
      if (
        typeof data.property_types === "object" &&
        data.property_types !== null
      ) {
        keys = Object.keys(data.property_types);
      } else if (typeof data.property_types === "string") {
        keys = [data.property_types];
      }

      const ids: number[] = [];
      keys.forEach((k) => {
        const pt = propertyTypes.find((p) =>
          p.name.toLowerCase().includes(k.toLowerCase())
        );
        if (pt) ids.push(pt.id);
      });

      if (ids.length > 0 && formType === "request")
        form.setValue("property_type_ids", ids);
    } else if (formType === "inventory" && data.property_type) {
      const pt = propertyTypes.find((p) =>
        p.name.toLowerCase().includes(data.property_type!.toLowerCase())
      );
      if (pt) form.setValue("property_type", pt.id);
    }

    // 6. Furnish Type
    const fType = data.furnish_type || data.furnish_types;
    if (fType) {
      const ft = furnishedTypes.find((f) =>
        f.name.toLowerCase().includes(fType.toLowerCase())
      );
      if (ft) form.setValue("furnish_type", ft.id);
    }

    // 7. Transaction
    if (data.transaction_type)
      form.setValue("transaction_type", data.transaction_type.toUpperCase());

    // 8. Duration & Installment
    if (data.duration_period)
      form.setValue("duration_period", String(data.duration_period));
    if (data.duration_type)
      form.setValue("duration_type", data.duration_type.toUpperCase());
    if (data.installment_period)
      form.setValue("installment_period", String(data.installment_period));
    if (data.installment_type)
      form.setValue("installment_type", data.installment_type.toUpperCase());

    // 9. Deal Type
    if (data.deal_deal_type) {
      form.setValue("deal_deal_type", data.deal_deal_type);
      form.setValue("deal_type", data.deal_deal_type); // For Request
    }

    // 10. Listing Code & Notes
    if (data.listing_code) form.setValue("listing_code", data.listing_code);
    if (data.additional_notes)
      form.setValue("additional_notes", data.additional_notes);
    form.setValue("whatsapp_msg", msgText);

    // 11. Type
    if (data.type) {
      const t = data.type.toLowerCase();
      if (formType === "inventory") {
        form.setValue("type", t.includes("sale") ? "for_sale" : "for_rent");
      } else {
        form.setValue("type", t.includes("sale") ? "buy" : "rent");
      }
    }
    if (data.urgent === true) form.setValue("urgent", true);
    if (data.direct === true) form.setValue("direct", true);
    if (data.active === true) form.setValue("active", true);

    const parseOptions = (optString: string) => {
      if (!optString) return {};
      return optString.split(",").reduce((acc, curr) => {
        const key = curr.trim();
        if (key) acc[key] = true; // Default selected
        return acc;
      }, {} as Record<string, boolean>);
    };
    if (formType === "inventory" && data.inventory_options) {
      const optionsObj = parseOptions(data.inventory_options);
      form.setValue("inventory_options", optionsObj);
    } else if (formType === "request" && data.request_options) {
      const optionsObj = parseOptions(data.request_options);
      form.setValue("request_options_ui", optionsObj);
    }
  };

  // Location Selection Handler
  const handleLocationSelect = (item: FuzzyMatchItem) => {
    if (formType === "inventory") {
      setSelectedLocations([item]);
    } else {
      const exists = selectedLocations.find(
        (l) => l.matched_id === item.matched_id
      );
      if (exists) {
        setSelectedLocations((prev) =>
          prev.filter((l) => l.matched_id !== item.matched_id)
        );
      } else {
        setSelectedLocations((prev) => [...prev, item]);
      }
    }
  };

  // Confirm Selection and Update Form
  const confirmLocations = () => {
    if (formType === "inventory") {
      if (selectedLocations.length > 0) {
        form.setValue("location", selectedLocations[0].matched_id);
        form.setValue("location_name", selectedLocations[0].name_en);
        toast({
          title: "Location Set",
          description: selectedLocations[0].name_en,
        });
      }
    } else {
      const ids = selectedLocations.map((l) => l.matched_id);
      const names = selectedLocations.map((l) => l.name_en);
      form.setValue("exact_location_ids", ids);
      form.setValue("location_names_display", names);
      toast({
        title: "Locations Set",
        description: `${ids.length} locations selected`,
      });
    }
  };

  // Combine Matches safely
  const exactMatches = (fuzzyResults?.exact_matches || []).map((m) => ({
    ...m,
    type: "exact" as const,
  }));
  const suggestedMatches = (fuzzyResults?.suggested_matches || []).map((m) => ({
    ...m,
    type: "suggested" as const,
  }));
  const allMatches = [...exactMatches, ...suggestedMatches];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Info */}
      <div className="bg-slate-50 border rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="w-3 h-3" /> Username
            </span>
            <p className="font-medium text-slate-800">
              {message.username || "Unknown"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="w-3 h-3" /> Phone
            </span>
            <p className="font-medium text-slate-800">{message.phone}</p>
          </div>
        </div>
      </div>

      {/* 2. Toggle & Message Edit */}
      <Button
        onClick={onToggleType}
        className="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-200"
        variant="outline"
      >
        <ArrowRightLeft className="w-4 h-4 mr-2" />
        Switch to:{" "}
        {formType === "inventory" ? "Request Form" : "Inventory Form"}
      </Button>

      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <Label className="text-xs text-muted-foreground">
            WAP Message (Editable)
          </Label>
          <span className="text-[10px] text-muted-foreground">
            {new Date(message.created_at).toLocaleDateString()}
          </span>
        </div>
        <Textarea
          value={msgText}
          onChange={(e) => setMsgText(e.target.value)}
          className="min-h-[100px] text-sm bg-white focus-visible:ring-blue-500"
        />
        <Button
          onClick={() => aiMutation.mutate()}
          disabled={aiMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {aiMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Regenerate AI Data
        </Button>
      </div>

      <Separator />

      {/* 3. AI JSON View */}
      {aiResponse && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold text-slate-700">
              AI Response JSON
            </Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px]"
              onClick={() =>
                navigator.clipboard.writeText(
                  JSON.stringify(aiResponse, null, 2)
                )
              }
            >
              <Copy className="w-3 h-3 mr-1" /> Copy
            </Button>
          </div>
          <Textarea
            value={JSON.stringify(aiResponse, null, 2)}
            readOnly
            className="font-mono text-[10px] h-40 bg-slate-900 text-green-400 border-slate-800 rounded-md p-3"
          />
        </div>
      )}

      {/* 4. Location Search (Fuzzy Inputs) */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <Label className="text-sm font-semibold text-blue-900">
            Location Extraction
          </Label>
        </div>

        <div className="grid gap-3">
          <div>
            <Label className="text-xs text-blue-700 mb-1 block">
              Exact Locations (comma separated)
            </Label>
            <Input
              value={exactLocs.join(", ")}
              onChange={(e) =>
                setExactLocs(e.target.value.split(",").map((s) => s.trim()))
              }
              className="bg-white h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-blue-700 mb-1 block">
              Suggested Locations (comma separated)
            </Label>
            <Input
              value={suggestedLocs.join(", ")}
              onChange={(e) =>
                setSuggestedLocs(e.target.value.split(",").map((s) => s.trim()))
              }
              className="bg-white h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-blue-700 mb-1 block">
              Parent Context
            </Label>
            <Input
              value={parentContext}
              onChange={(e) => setParentContext(e.target.value)}
              className="bg-white h-8 text-sm"
            />
          </div>
          <Button
            onClick={() =>
              fuzzyMutation.mutate({
                exact_locations: exactLocs,
                suggested_locations: suggestedLocs,
                parent_context: parentContext,
              })
            }
            disabled={fuzzyMutation.isPending}
            className="w-full h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white"
          >
            {fuzzyMutation.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin mr-2" />
            ) : (
              <Search className="w-3 h-3 mr-2" />
            )}
            Search Locations
          </Button>
        </div>
      </div>

      {/* 5. Fuzzy JSON View */}
      {fuzzyResults && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold text-slate-700">
              Fuzzy Result JSON
            </Label>
          </div>
          <Textarea
            value={JSON.stringify(fuzzyResults, null, 2)}
            readOnly
            className="font-mono text-[10px] h-32 bg-white"
          />
        </div>
      )}

      {/* 6. Location Selection List */}
      {fuzzyResults && (
        <div className="bg-green-50/60 border border-green-100 rounded-lg p-4 space-y-4">
          <Label className="text-sm font-semibold text-green-900 flex justify-between">
            <span>Select Location(s)</span>
            <span className="text-[10px] font-normal bg-green-100 px-2 py-0.5 rounded text-green-700">
              {formType === "inventory" ? "Single Select" : "Multi Select"}
            </span>
          </Label>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {allMatches.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">
                No matches found.
              </div>
            ) : (
              allMatches.map((match, idx) => {
                const isSelected = selectedLocations.some(
                  (l) => l.matched_id === match.matched_id
                );
                return (
                  <div
                    key={`${match.matched_id}-${idx}`}
                    onClick={() => handleLocationSelect(match)}
                    className={`
                      flex items-center justify-between p-2 rounded border cursor-pointer text-xs transition-colors
                      ${
                        isSelected
                          ? "bg-green-100 border-green-300"
                          : "bg-white border-gray-200 hover:border-green-200"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      {formType === "request" ? (
                        <Checkbox checked={isSelected} className="h-3 w-3" />
                      ) : (
                        <div
                          className={`w-3 h-3 rounded-full border flex-shrink-0 ${
                            isSelected ? "bg-green-600" : "border-slate-400"
                          }`}
                        />
                      )}
                      <div className="truncate">
                        <div className="font-medium truncate">
                          {match.name_en}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {match.full_path}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-2">
                      {match.type === "exact" && (
                        <Badge
                          variant="default"
                          className="text-[9px] h-4 px-1 bg-green-600"
                        >
                          Exact
                        </Badge>
                      )}
                      <Badge
                        variant={match.score > 0.9 ? "default" : "secondary"}
                        className="text-[10px] h-5 px-1 min-w-[35px] justify-center"
                      >
                        {Math.round(match.score * 100)}%
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Button
            onClick={confirmLocations}
            disabled={selectedLocations.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-8 text-xs mt-2"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Confirm Selection
          </Button>
        </div>
      )}

      <div className="h-10"></div>
    </div>
  );
};

export default AIPanel;
