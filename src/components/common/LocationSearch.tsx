import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { searchLocationsApi } from "@/api/core";
import type { LocationSearchResult } from "@/types";

interface LocationSearchProps {
  onSelect: (location: LocationSearchResult) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}

export function LocationSearch({
  onSelect,
  placeholder = "Search location...",
  className,
  defaultValue,
}: LocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const displayName = defaultValue || placeholder;

  // Debounce logic for search
  useEffect(() => {
    const fetchLocations = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await searchLocationsApi(query);
        setResults(data);
      } catch (error) {
        console.error("Location search failed", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchLocations, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left bg-green-50 border-green-200 text-green-800 font-medium",
            !defaultValue && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{defaultValue || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 " align="start">
        <Command shouldFilter={false}>
          {/* Important: Disable client-side filtering */}
          <CommandInput
            placeholder="Type area or compound name..."
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && (
              <div className="py-6 text-center text-sm text-muted-foreground flex justify-center items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...
              </div>
            )}

            {!loading && results.length === 0 && query.length >= 2 && (
              <CommandEmpty>No locations found.</CommandEmpty>
            )}

            {!loading && results.length > 0 && (
              <CommandGroup heading="Suggestions">
                {results.map((loc) => (
                  <CommandItem
                    key={loc.id}
                    value={loc.name} // This is used for internal keying mostly since filtering is off
                    onSelect={() => {
                      onSelect(loc);
                      setOpen(false);
                      setQuery(""); // Reset search query
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        defaultValue === loc.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col w-full">
                      <span className="font-medium">{loc.name}</span>
                      <div className="text-[10px] text-muted-foreground flex items-center justify-between ">
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {loc.full_address}
                        </p>
                        <p className="ml-auto">{loc.type}</p>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
