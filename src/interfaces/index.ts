
export interface DropdownOptions {
  types?: string[];
  propertyTypes?: PropertyType[];
  furnishTypes?: string[];
  currencies?: string[];
  durationTypes?: string[];
  tags?: TagGroup[];
  dealTypes?: string[];
  listedByUsers?: User[];
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
  type: "For Sale" | "For Rent";
  property_type?: PropertyType;
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
  location?: Location;
  listed_by?: User;
  tag?: Tag;
  deal_type: string;
  reference_id: string;
  whatsapp_message: string;
  is_urgent: boolean;
  timestamp: string;
  image_urls: string[];
  client_name: string;
  client_phone: string;
  client_email: string;
}

export interface RequestForm {
  type:  "Buy" | "Rent";
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
  reference_id: string;
  locations?: Location[];
  property_types_required?: string[];
  options_required: string[];
  client_user?: User;
  assigned_agent: string;
  owner: string;
  tag?: string[];
  is_urgent: boolean;
  whatsapp_message: string;
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
  value: string | Tag | PropertyType;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  options: string[] | Tag[] | PropertyType[];
}

export interface SearchableInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  name: string;
  options: string[] | User[];
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
   'id' | 'contactName' | 'message' | 'sentAt' | 'type' | 'userId' ;

export type ColumnKey = FlexibleColumnKey | 'actions';

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
  email?: string | null;
  phone?: string;
  username?: string | null;
  provider?: string | null;
  provider_id?: string | null;
  photo?: string | null;
  is_corporate?: number;
  address?: string | null;
  nationality?: string | null;
  gender?: string;
  verified?: number;
  email_verified_at?: string | null;
  two_factor_secret?: string | null;
  two_factor_recovery_codes?: string | null;
  two_factor_confirmed_at?: string | null;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  whatsapp?: string | null;
  corporate_id?: number | null;
  manager_id?: number | null;
  fcm_token?: string | null;
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
export interface Location {
  id: number;
  name: string;
}
export interface PropertyType {
  id: number;
  name: string;
  icon: string;
}

export interface Tag {
  id: number;
  name: string;
  type: { value: string; display: string };
  icon: string;
}

export interface TagGroup {
  name: "Rent" | "Buy" | "Sell";
  tags: Tag[];
}

export interface FurnishType {
  id: number;
  name: string;
}

export interface LocationState {
  state: {
    id: string;
    type: "Inventory" | "Request";
  }
}