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
  const [selectedLocations, setSelectedLocations] = useState<FuzzyMatchItem[]>(
    []
  );

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
    onSuccess: (data) => setFuzzyResults(data),
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

  const toggleLocation = (item: FuzzyMatchItem) => {
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
      toast({ title: "Locations Set", description: `${ids.length} selected` });
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
