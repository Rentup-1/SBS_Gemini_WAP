// get list of users
export interface UserType {
  id: number;
  name: string;
  phone: string;
  email?: string;
  data_joined?: string;
}
// Message to WhatsApp API
export interface ReplyPayload {
  phone_number: string;
  message: string;
  phone_number_type: string; // "request" or others
}
// Message from WhatsApp API
export interface Message {
  id: number;
  username: string;
  phone_number: string;
  type: "request" | "inventory" | string;
  content: string;
  source?: string;
  listing_status: string;
  timestamp?: string;
  media_type?: string;
  image?: string | null;
  video?: string | null;
}

// Tags for categorization
export interface Tag {
  id: number;
  name: string;
  type: "Rent" | "Buy" | "Sell" | "For Rent";
  applies_to: "Inventory" | "Request";
}

// Property Types
export interface PropertyType {
  id: number;
  name: string;
}

// Furnished Types
export interface FurnishedType {
  id: number;
  name: string;
}

// Location from fuzzy match response
export interface Location {
  id: number;
  name: string;
  full_address: string;
}

// Location search result from autocomplete
export interface LocationSearchResult {
  id: number;
  full_address: string;
  type: string; // "area", "compound", etc.
  lat: number;
  lng: number;
  radius: number;
  parent_id: number | null;
  name: string;
}

// Fuzzy match result item
export interface FuzzyMatchItem {
  matched_id: number;
  name_en: string;
  full_path: string;
  score: number;
  type?: "exact" | "suggested";
}

// Fuzzy match response
export interface FuzzyResponse {
  exact_matches: FuzzyMatchItem[];
  suggested_matches: FuzzyMatchItem[];
  unmatched: [];
}

export interface AIProcessResponse {
  fuzzy_status?: string;
  type?: string;
  tag?: string;

  // Locations can be object keys or string array
  exact_locations_text?: Record<string, string> | string[];
  suggested_locations_text?: Record<string, string> | string[];
  locations_text?: string; // For older inventory format compatibility

  parent_context?: string;

  egp_price?: number | string;
  usd_price?: number | string;
  egp_budget?: number | string;
  usd_budget?: number | string;

  transaction_type?: string;

  // Property Types can be object keys or string
  property_types?: Record<string, string> | string;
  property_type?: string;

  // Furnish Types
  furnish_types?: string;
  furnish_type?: string;

  no_bedroom?: number;
  no_master_room?: number;
  no_bathroom?: number;
  bua?: number;

  additional_notes?: string;
  whatsapp_msg?: string;
  deal_deal_type?: string;
  active?: boolean;
  urgent?: boolean;
  privacy?: string;
  direct?: boolean;
  source?: string;
  listing_code?: string;
  duration_period?: string;
  duration_type?: string;
  installment_period?: string;
  installment_type?: string;

  inventory_options?: string;
  request_options?: string;
}

// AI Process Response for Inventory
export interface AIInventoryResponse {
  fuzzy_status?: string;
  type?: string;
  tag?: string; // String from AI
  locations_text?: string;
  location: number; // ID
  parent_context?: string;
  egp_price?: string | number;
  usd_price?: string | number;
  transaction_type?: string;
  property_type?: string;
  furnish_type?: string;
  no_bedroom?: number;
  no_master_room?: number;
  no_bathroom?: number;
  bua?: number;
  whatsapp_msg?: string;
  additional_notes?: string;
  active?: boolean;
  urgent?: boolean;
  privacy?: string;
  direct?: boolean;
  source?: string;
  duration_period?: string;
  duration_type?: string;
  installment_period?: string;
  installment_type?: string;
  listing_code?: string;
  agent_assigned?: number;
}

// AI Process Response for Request
export interface AIRequestResponse {
  fuzzy_status?: string;
  type?: string;
  tag?: string; // String
  exact_locations_text?: Record<string, string> | string[];
  exact_location_ids?: number[];
  suggested_locations_text?: Record<string, string> | string[];
  suggested_location_ids?: number[];
  parent_context?: string;
  District_Name?: string;
  "City Name"?: string;
  egp_budget?: string | number;
  usd_budget?: string | number;
  transaction_type?: string;
  property_types?: Record<string | number, string> | string[];
  furnish_types?: string;
  no_bedroom?: number;
  no_master_room?: number;
  no_bathroom?: number;
  bua?: number;
  request_options?: string;
  additional_notes?: string;
  whatsapp_msg?: string;
  deal_deal_type?: string;
  active?: boolean;
  urgent?: boolean;
  privacy?: string;
  direct?: boolean;
  source?: string;
  duration_period?: string;
  duration_type?: string;
  installment_period?: string;
  installment_type?: string;
  listing_code?: string;
  agent_assigned?: number;
}

// Auth types
export interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

// Form Data Types (Payloads)
export interface InventoryPayload {
  reference_id?: string;
  user_id?: number;
  message_id?: number;
  phone?: string;

  source: string;
  type: string; // "for_rent" | "for_sale"

  // IDs
  property_type: number;
  tag: number;
  furnish_type: number;
  location: number | null;
  // agent_assigned: number;

  // Specs
  bua: number;
  no_bedroom: number;
  no_bathroom: number;
  no_master_room: number;

  // Budget & Deal
  egp_price: string; // API expects string
  usd_price: string; // API expects string
  transaction_type: string; // DAILY, MONTHLY, CASH, INSTALLMENT
  deal_type: string; // Side-by-Side, Direct

  // Duration & Installment
  duration_period: string;
  duration_type: string;
  duration_start_date: string; // YYYY-MM-DD
  duration_end_date: string; // YYYY-MM-DD
  installment_period: string;
  installment_type: string;

  // Meta
  whatsapp_msg: string;
  additional_notes: string; // Description
  listing_code: string;
  locations_text: string[];
  inventory_options: Record<string, boolean>; // Empty object

  // Status flags
  active: boolean;
  urgent: boolean;
  direct: boolean;
  privacy: string;
  fuzzy_status: string; // "DONE"
}

export interface RequestPayload {
  phone?: string;
  message_id?: number;

  duration_period?: string;

  source: string;
  type: string; // "rent" | "buy" (Note: your JSON showed "rent" not "for_rent" here, but usually consistent)

  // IDs
  property_type_ids: number[]; // Array
  tag: number;
  furnish_type: number;

  // Locations (Arrays)
  exact_location_ids: number[];
  suggested_location_ids: number[];
  exact_locations_text: string[];
  suggested_locations_text: string[];

  // Specs
  bua: number;
  no_bedroom: number;
  no_bathroom: number;
  no_master_room: number;

  // Budget & Deal
  egp_budget: string;
  usd_budget: string;
  transaction_type: string;
  deal_type: string; // Note: Payload says "deal_type", Inventory says "deal_deal_type"

  // Duration & Installment
  duration_type: string;
  duration_start_date: string;
  duration_end_date: string;
  installment_period: string;
  installment_type: string;

  // Meta
  whatsapp_msg: string;

  // Status
  urgent: boolean;
  direct: boolean;
  privacy: string;
  active?: boolean;
}
