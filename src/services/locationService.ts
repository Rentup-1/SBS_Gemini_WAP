import type { PropertyLocation as Location } from "../interfaces";
import { API_URL_BASE } from "../utils/constants";

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
