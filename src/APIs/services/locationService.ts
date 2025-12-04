import type { PropertyLocation as Location } from "../../interfaces";
import { API_URL_BASE } from "../../utils/constants";
import { retryFetch } from "../../utils/helpers";

export const fetchLocation = async (
  locationName: string
): Promise<Location[]> => {
  try {
    const params = new URLSearchParams({
      search: locationName,
      limit: "10",
    });
    const response = await fetch(
      `${API_URL_BASE}/locations/autocomplete?${params}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Map API response to Location objects
    if (data.status && data.data) {
      return data.data.map((item: { id: string; full_name: string }) => ({
        id: item.id,
        name: item.full_name,
      }));
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch message:", error);
    throw new Error("Failed to fetch message from server");
  }
};

// ... (Imports existing)
// تأكد من استدعاء retryFetch لو موجودة في utils، لو مش موجودة استخدم fetch العادية

// 1. تعريف شكل الداتا اللي رايحة واللي جاية (Interfaces)
export interface FuzzyMatchPayload {
  locale?: string;
  exact_locations: string[];
  suggested_locations?: string[];
  parent_context?: string;
}

export interface FuzzyMatchResponse {
  exact_matches: [];
  fuzzy_matches: [];
  unmatched: [];
}

export const matchFuzzyLocations = async (
  locations: string[]
  // parentContext: string = "cairo"
): Promise<FuzzyMatchResponse> => {
  try {
    const url = "/api/v1/fuzzy/match/";

    const payload: FuzzyMatchPayload = {
      // locale: "en",
      exact_locations: locations,
      // suggested_locations: [],
      // parent_context: parentContext,
    };

    const response = await retryFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to match fuzzy locations:", error);
    throw error;
  }
};
