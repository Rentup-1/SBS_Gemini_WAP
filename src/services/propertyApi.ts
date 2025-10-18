import type { PropertyType, TagGroup, User } from "../interfaces";
import { API_URL_BASE } from "../utils/constants";


export const fetchPropertyTypes = async (): Promise<PropertyType[]> => {
  try {
    const response = await fetch(`${API_URL_BASE}/property-types`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Adjust this based on your actual API response structure
    return data.data || data || [];
  } catch (error) {
    console.error('Failed to fetch property types:', error);
    throw new Error('Failed to fetch property types from server');
  }
};


export const fetchTags = async (formType?: "Inventory" | "Request"): Promise<TagGroup[]> => {
  try {
    // Create URL with query parameters
    const params = new URLSearchParams();
    
    if (formType === 'Inventory') {
      params.append('identity', 'inventory');
    } else if (formType === 'Request') {
      params.append('identity', 'request');
    }

    const response = await fetch(`${API_URL_BASE}/tags?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.status || !data.data) {
      return [];
    }

    const tagCategories: TagGroup[] = data.data;

    // Return the full Tag objects instead of just names
    return tagCategories;

  } catch (error) {
    console.error('Failed to fetch tags:', error);
    throw new Error('Failed to fetch tags from server');
  }
};

export const fetchAllUsers = async (): Promise<User[]> => {
  try {
    // Create URL with query parameters
 

    const response = await fetch(`${API_URL_BASE}/migrate/messages/users/fetch`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 4e14bf9daafbe8d1fba7bf82f173b873`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.status || !data.data) {
      return [];
    }

    return data.data;

  } catch (error) {
    console.error('Failed to fetch tags:', error);
    throw new Error('Failed to fetch tags from server');
  }
}