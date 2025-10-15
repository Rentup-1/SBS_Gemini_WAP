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