import type {
  AIInventoryResponse,
  AIRequestResponse,
  FurnishedType,
  FuzzyResponse,
  InventoryPayload,
  LocationSearchResult,
  PropertyType,
  RequestPayload,
  Tag,
} from "@/types";
import { coreApi } from "./axios";

// Fetch tags with optional filter
export const getTags = async (
  appliesTo?: "inventory" | "request"
): Promise<Tag[]> => {
  const response = await coreApi.get("/tags/", {
    params: appliesTo ? { applies_to: appliesTo } : undefined,
  });
  return response.data;
};

// Fetch property types
export const getPropertyTypes = async (): Promise<PropertyType[]> => {
  const response = await coreApi.get("/property-types/");
  return response.data;
};

// Fetch furnished types
export const getFurnishedTypes = async (): Promise<FurnishedType[]> => {
  const response = await coreApi.get("/furnished-types/");
  return response.data;
};

// Location autocomplete
export const searchLocationsApi = async (
  query: string
): Promise<LocationSearchResult[]> => {
  if (!query || query.length < 2) return [];

  const response = await coreApi.get<LocationSearchResult[]>(
    "/locations/autocomplete/",
    {
      params: {
        q: query,
        "X-Localization": "en",
      },
    }
  );

  return response.data;
};

// Fuzzy location match
export const fuzzyMatch = async (
  exactLocations: string[],
  parentContext: string = "cairo"
): Promise<FuzzyResponse> => {
  const response = await coreApi.post("/fuzzy/match/", {
    exact_locations: exactLocations,
    parent_context: parentContext,
  });
  return response.data;
};

// AI Process Inventory
export const processInventory = async (
  message: string
): Promise<AIInventoryResponse> => {
  const response = await coreApi.post("/process-inventory/", {
    whatsapp_msg: message,
  });
  // API returns { data: [...] }, take first item
  return response.data.data?.[0] || response.data;
};

// AI Process Request
export const processRequest = async (
  message: string
): Promise<AIRequestResponse> => {
  const response = await coreApi.post("/process-request/", {
    whatsapp_msg: message,
  });
  // API returns { data: [...] }, take first item
  return response.data.data?.[0] || response.data;
};

// Save Inventory
export const saveInventory = async (
  data: InventoryPayload
): Promise<InventoryPayload> => {
  const response = await coreApi.post("/inventories/", data);
  return response.data;
};

// Save Request
export const saveRequest = async (
  data: RequestPayload
): Promise<RequestPayload> => {
  const response = await coreApi.post("/requests/", data);
  return response.data;
};
