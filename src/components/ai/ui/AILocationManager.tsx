import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Loader2, CheckCircle2, Copy } from "lucide-react";
import type { FuzzyMatchItem, FuzzyResponse } from "@/types";
import { Textarea } from "@/components/ui/textarea";

interface AILocationManagerProps {
  inputs: {
    exactLocs: string[];
    setExactLocs: (v: string[]) => void;
    suggestedLocs: string[];
    setSuggestedLocs: (v: string[]) => void;
    parentContext: string;
    setParentContext: (v: string) => void;
  };
  results: {
    fuzzyResults: FuzzyResponse | null;
    selectedLocations: FuzzyMatchItem[];
  };
  actions: {
    searchLocations: () => void;
    toggleLocation: (item: FuzzyMatchItem) => void;
    confirmSelection: () => void;
  };
  isSearching: boolean;
  formType: "inventory" | "request";
}

export const AILocationManager = ({
  inputs,
  results,
  actions,
  isSearching,
  formType,
}: AILocationManagerProps) => {
  // Combine results logic here for display
  const allMatches = [
    ...(results.fuzzyResults?.exact_matches || []).map((m) => ({
      ...m,
      type: "exact" as const,
    })),
    ...(results.fuzzyResults?.suggested_matches || []).map((m) => ({
      ...m,
      type: "suggested" as const,
    })),
  ];

  return (
    <div className="space-y-4">
      {/* Search Inputs Section */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <Label className="text-sm font-semibold text-blue-900">
            Location Extraction
          </Label>
        </div>
        <div className="grid gap-3">
          <Input
            value={inputs.exactLocs.join(", ")}
            onChange={(e) =>
              inputs.setExactLocs(
                e.target.value.split(",")
              )
            }
            className="bg-white h-8 text-sm"
            placeholder="Exact Locations"
          />
          <Input
            value={inputs.suggestedLocs.join(", ")}
            onChange={(e) =>
              inputs.setSuggestedLocs(
                e.target.value.split(",")
              )
            }
            className="bg-white h-8 text-sm"
            placeholder="Suggested Locations"
          />
          <Input
            value={inputs.parentContext}
            onChange={(e) => inputs.setParentContext(e.target.value)}
            className="bg-white h-8 text-sm"
            placeholder="Context (e.g. Cairo)"
          />
          <Button
            onClick={actions.searchLocations}
            disabled={isSearching}
            className="w-full h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isSearching ? (
              <Loader2 className="w-3 h-3 animate-spin mr-2" />
            ) : (
              <Search className="w-3 h-3 mr-2" />
            )}
            Search Locations
          </Button>
        </div>
      </div>
      {/* 5. Fuzzy JSON View */}
      {results.fuzzyResults && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold text-slate-700">
              Fuzzy Results JSON
            </Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px]"
              onClick={() =>
                navigator.clipboard.writeText(
                  JSON.stringify(results.fuzzyResults, null, 2)
                )
              }
            >
              <Copy className="w-3 h-3 mr-1" /> Copy
            </Button>
          </div>
          <Textarea
            value={JSON.stringify(results.fuzzyResults, null, 2)}
            readOnly
            className="font-mono text-[10px] h-40 bg-slate-900 text-green-400 border-slate-800 rounded-md p-3 "
          />
        </div>
      )}
      {/* Results List Section */}
      {results.fuzzyResults && (
        <div className="bg-green-50/60 border border-green-100 rounded-lg p-4 space-y-4">
          <Label className="text-sm font-semibold text-green-900 flex justify-between">
            <span>Select Location(s)</span>
            <span className="text-[10px] font-normal bg-green-100 px-2 py-0.5 rounded text-green-700">
              {formType === "inventory" ? "Single Select" : "Multi Select"}
            </span>
          </Label>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {allMatches.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">
                No matches found.
              </div>
            ) : (
              allMatches.map((match, idx) => {
                const isSelected = results.selectedLocations.some(
                  (l) => l.matched_id === match.matched_id
                );
                return (
                  <div
                    key={`${match.matched_id}-${idx}`}
                    onClick={() => actions.toggleLocation(match)}
                    className={`flex items-center justify-between p-2 rounded border cursor-pointer text-xs transition-colors ${
                      isSelected
                        ? "bg-green-100 border-green-300"
                        : "bg-white border-gray-200 hover:border-green-200"
                    }`}
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
                      <Badge
                        variant="default"
                        className="text-[9px] h-4 px-1 bg-green-600"
                      >
                        {match.type === "exact" ? "Exact" : "Suggested"}
                      </Badge>

                      <Badge
                        variant={match.score > 0.9 ? "default" : "secondary"}
                        className="text-[10px] h-5 px-1 min-w-[35px] justify-center"
                      >
                        {Math.round(match.score)}%
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Button
            onClick={actions.confirmSelection}
            disabled={results.selectedLocations.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-8 text-xs mt-2"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Selection (
            {results.selectedLocations.length})
          </Button>
        </div>
      )}
    </div>
  );
};
