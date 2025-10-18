import type { ColumnDef, ColumnKey, FlexibleColumnKey, InventoryForm, RequestForm} from "../interfaces";

export const API_URL_BASE = `https://sbsapi.rentup.com.eg/api`;
export const MAX_RETRIES = 5;

export const initialFormState: InventoryForm = {
  type: 'For Rent',  furnish_type: '',
  price: 0, currency: 'EGP', transaction: 'Monthly',
  duration: 12, duration_type: 'Months', start_date: '', end_date: '',
  bedrooms: 1, bathrooms: 1,
 deal_type: 'Side-by-Side',
  whatsapp_message: '', is_urgent: false,
  timestamp: new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
  image_urls: [],
  client_name: '', client_phone: '', client_email: '', reference_id: ''
};

export const initialRequestFormState: RequestForm = {
  type: 'Rent', status: 'Pending', privacy: 'Public',
  price: 0, currency: 'EGP', transaction: 'Monthly',
  duration: 12, duration_type: 'Months', start_date: '', end_date: '',
  bedrooms: 1, bathrooms: 1, furnish_type: '',
  deal_type: 'Side-by-Side', 
  options_required: [],
   assigned_agent: 'None', owner: 'None',
  is_urgent: false, reference_id: "", whatsapp_message: ''
};

export const COLUMN_METADATA: Record<ColumnKey, ColumnDef> = {
  // checkbox: { label: '', isSortable: false, isFilterable: false },
  id: { label: 'ID', isSortable: true, isFilterable: true },
  contactName: { label: 'CONTACT', isSortable: true, isFilterable: true},
  message: { label: 'MESSAGE', isSortable: true, isFilterable: true},
  sentAt: { label: 'SENT AT', isSortable: true, isFilterable: true},
  // source: { label: 'SOURCE', isSortable: true, isFilterable: true},
  type: { label: 'TYPE', isSortable: true, isFilterable: true },
  // userType: { label: 'USER', isSortable: true, isFilterable: true},
  userId: { label: 'USER ID', isSortable: true, isFilterable: true },
  // replied: { label: 'REPLIED', isSortable: true, isFilterable: true },
  // status: { label: 'STATUS', isSortable: true, isFilterable: true },
  actions: { label: 'ACTIONS', isSortable: false, isFilterable: false },
};

export const INITIAL_FLEXIBLE_ORDER: FlexibleColumnKey[] = [
  'id', 'contactName', 'message', 'sentAt', 
   'type',  'userId'
];
