import { coreApi } from "@/api/axios";
import { toast } from "@/hooks/use-toast";
import type { AIProcessResponse, FuzzyMatchItem, FuzzyResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";

interface UseLocationMatcherProps {
  form;
  formType: "inventory" | "request";
  aiResponse: AIProcessResponse | null;
}
interface FuzzyPayload {
  exact_locations: string[];
  suggested_locations: string[];
  parent_context: string;
}
type ExtendedFuzzyItem = FuzzyMatchItem & { type?: "exact" | "suggested" };
export const useLocationMatcher = ({
  form,
  formType,
  aiResponse,
}: UseLocationMatcherProps) => {
  // Fuzzy Search Inputs
  const [exactLocs, setExactLocs] = useState<string[]>([]);
  const [suggestedLocs, setSuggestedLocs] = useState<string[]>([]);
  const [parentContext, setParentContext] = useState("");
  const [fuzzyResults, setFuzzyResults] = useState<FuzzyResponse | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<
    ExtendedFuzzyItem[]
  >([]);

  // Effect to parse locations from AI Response automatically
  useEffect(() => {
    if (!aiResponse) return;

    let exact: string[] = [];
    let suggested: string[] = [];
    const context = aiResponse.parent_context || "";

    if (aiResponse.exact_locations_text) {
      if (Array.isArray(aiResponse.exact_locations_text))
        exact = aiResponse.exact_locations_text as string[];
      else if (typeof aiResponse.exact_locations_text === "object")
        exact = Object.keys(aiResponse.exact_locations_text);
      else if (typeof aiResponse.exact_locations_text === "string")
        exact = [aiResponse.exact_locations_text];
    } else if (aiResponse.locations_text) {
      exact = [aiResponse.locations_text];
    }

    if (aiResponse.suggested_locations_text) {
      if (Array.isArray(aiResponse.suggested_locations_text))
        suggested = aiResponse.suggested_locations_text as string[];
      else if (typeof aiResponse.suggested_locations_text === "object")
        suggested = Object.keys(aiResponse.suggested_locations_text);
    }

    setExactLocs(exact);
    setSuggestedLocs(suggested);
    setParentContext(context);

    if (exact.length > 0 || suggested.length > 0) {
      setTimeout(() => searchLocations(exact, suggested, context), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiResponse]);

  const searchLocations = (
    exact = exactLocs,
    suggested = suggestedLocs,
    context = parentContext
  ) => {
    fuzzyMutation.mutate({
      exact_locations: exact,
      suggested_locations: suggested,
      parent_context: context,
    });
  };

  // Fuzzy Search Mutation
  const fuzzyMutation = useMutation({
    mutationFn: async (payload: FuzzyPayload) => {
      const res = await coreApi.post<FuzzyResponse>("/fuzzy/match/", payload);
      return res.data;
    },
    onSuccess: (data) => {
      setFuzzyResults(data);
      
      if (formType === "request") {
        // set selected locations
        const exactItems = (data.exact_matches || []).map((item) => ({
          ...item,
          type: "exact" as const,
        }));

        const suggestedItems = (data.suggested_matches || []).map((item) => ({
          ...item,
          type: "suggested" as const,
        }));

        // merge exact and suggested items together and set as selected locations
        setSelectedLocations([...exactItems, ...suggestedItems]);
      } else if (formType === "inventory") {
        if (data.exact_matches && data.exact_matches.length > 0) {
          const firstExact = {
            ...data.exact_matches[0],
            type: "exact" as const,
          };
          setSelectedLocations([firstExact]);
        }
      }
    },
    onError: (err) => {
      const error = err as AxiosError<{
        error: {
          non_field_errors: string[];
        };
      }>;
      if (error?.response?.data?.error?.non_field_errors) {
        toast({
          title: "Search Failed",
          description: error?.response?.data?.error?.non_field_errors?.[0],
          variant: "destructive",
        });
      }
    },
  });

  const toggleLocation = (item: ExtendedFuzzyItem) => {
    if (formType === "inventory") {
      setSelectedLocations([item]);
    } else {
      const exists = selectedLocations.find(
        (l) => l.matched_id === item.matched_id
      );
      if (exists)
        setSelectedLocations((prev) =>
          prev.filter((l) => l.matched_id !== item.matched_id)
        );
      else setSelectedLocations((prev) => [...prev, item]);
    }
  };

  const confirmSelection = () => {
    if (selectedLocations.length === 0) return;

    if (formType === "inventory") {
      // Inventory: Single Location
      const loc = selectedLocations[0];
      form.setValue("location", loc.matched_id);
      form.setValue("locations_text", [loc.name_en]);
      form.setValue("location_name", loc.name_en);
      toast({ title: "Location Set", description: loc.name_en });
    } else {
      // Request: Multi Location (Separated)

      // 1. Filter Exact vs Suggested
      const exactItems = selectedLocations.filter(
        (l) => l.type === "exact" || !l.type
      );
      const suggestedItems = selectedLocations.filter(
        (l) => l.type === "suggested"
      );

      // 2. Prepare IDs
      const exactIds = exactItems.map((l) => l.matched_id);
      const suggestedIds = suggestedItems.map((l) => l.matched_id);

      // 3. Prepare Text Objects
      // const exactTextObj = createLocationTextObj(exactItems);
      const exactTextObj = exactItems.map((l) => l.name_en);
      const suggestedTextObj = suggestedItems.map((l) => l.name_en);

      // 4. Prepare UI Names
      const allNames = selectedLocations.map((l) => l.name_en);

      // --- Inject into Form ---

      // Exact Fields
      form.setValue("exact_location_ids", exactIds);
      form.setValue("exact_locations_text", exactTextObj);

      // Suggested Fields
      form.setValue("suggested_location_ids", suggestedIds);
      form.setValue("suggested_locations_text", suggestedTextObj);

      // UI Display
      form.setValue("location_names_display", allNames);

      toast({
        title: "Locations Set",
        description: `${exactIds.length} Exact, ${suggestedIds.length} Suggested`,
      });
    }
  };

  return {
    inputs: {
      exactLocs,
      setExactLocs,
      suggestedLocs,
      setSuggestedLocs,
      parentContext,
      setParentContext,
    },
    results: { fuzzyResults, selectedLocations },
    actions: {
      searchLocations: () => searchLocations(),
      toggleLocation,
      confirmSelection,
    },
    isSearching: fuzzyMutation.isPending,
  };
};
