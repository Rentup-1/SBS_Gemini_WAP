// All interfaces used in the application

export interface DropdownOptions {
  types?: string[];
  propertyTypes?: string[];
  furnishTypes?: string[];
  currencies?: string[];
  durationTypes?: string[];
  tags?: string[];
  dealTypes?: string[];
  listedByUsers?: string[];
  locations?: string[];
  clientNames?: string[];
  forRentTransactionTypes?: string[];
  forSaleTransactionTypes?: string[];
  requestStatuses?: string[];
  requestPrivacy?: string[];
  assignmentUsers?: string[];
  requestOptions?: string[];
}

export interface InventoryForm {
  type: string;
  property_type: string;
  furnish_type: string;
  price: number;
  currency: string;
  transaction: string;
  duration: number;
  duration_type: string;
  start_date: string;
  end_date: string;
  bedrooms: number;
  bathrooms: number;
  location: string;
  listed_by: string;
  tag: string;
  deal_type: string;
  whatsapp_message: string;
  is_urgent: boolean;
  timestamp: string;
  image_urls: string[];
  client_name: string;
  client_phone: string;
  client_email: string;
}

export interface RequestForm {
  type: string;
  status: string;
  privacy: string;
  price: number;
  currency: string;
  transaction: string;
  duration: number;
  duration_type: string;
  start_date: string;
  end_date: string;
  bedrooms: number;
  bathrooms: number;
  furnish_type: string;
  deal_type: string;
  location: string;
  property_types_required: string[];
  options_required: string[];
  client_user: string;
  assigned_agent: string;
  owner: string;
  tag: string;
  is_urgent: boolean;
}

export interface InputFieldProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  placeholder?: string;
}

export interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  options: string[];
}

export interface SearchableInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  name: string;
  options: string[];
  placeholder?: string;
}

export interface Message {
  id: number;
  contactName: string;
  contactPhone: string;
  message: string;
  sentAt: string;
  isRead: boolean;
  source: 'WAP' | 'Website';
  type: 'Inventory' | 'Request';
  userType: 'New' | 'Existing';
  userId: string;
  replied: 'Yes' | 'No';
  status: 'Not Listed' | 'Listed';
}

export type FlexibleColumnKey = 
  | 'id' | 'contactName' | 'message' | 'sentAt' 
  | 'source' | 'type' | 'userType' | 'userId' | 'replied' | 'status';

export type ColumnKey = FlexibleColumnKey | 'checkbox' | 'actions';

export type SortColumn = FlexibleColumnKey;
export type SortDirection = 'asc' | 'desc';
export type ColumnFilters = Record<FlexibleColumnKey, string>;

export interface ColumnDef {
  label: string;
  isSortable: boolean;
  isFilterable: boolean;
  icon?: React.ElementType;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  username: string | null;
  provider: string | null;
  provider_id: string | null;
  photo: string | null;
  is_corporate: number;
  address: string | null;
  nationality: string | null;
  gender: string;
  verified: number;
  email_verified_at: string | null;
  two_factor_secret: string | null;
  two_factor_recovery_codes: string | null;
  two_factor_confirmed_at: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  whatsapp: string | null;
  corporate_id: number | null;
  manager_id: number | null;
  fcm_token: string | null;
}

export interface ApiMessage {
  id: number;
  phone: string;
  username: string;
  type: string;
  message: string;
  media_type: string;
  media_urls: string[];
  sent_at: string | null;
  created_at: string;
  user: User;
}

// Map API message to our local Message type
export interface Message {
  id: number;
  contactName: string;
  contactPhone: string;
  message: string;
  sentAt: string;
  isRead: boolean;
  source: 'WAP' | 'Website';
  type: 'Inventory' | 'Request';
  userType: 'New' | 'Existing';
  userId: string;
  replied: 'Yes' | 'No';
  status: 'Not Listed' | 'Listed';
  mediaUrls?: string[];
  mediaType?: string;
}

export interface MessagesResponse {
  messages: Message[];
  meta: PaginationMeta;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}