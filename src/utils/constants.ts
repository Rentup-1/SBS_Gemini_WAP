import type { Message } from "postcss";
import type { ColumnDef, ColumnKey, FlexibleColumnKey, InventoryForm, RequestForm } from "../interfaces";

export const API_URL_BASE = `https://sbsapi.rentup.com.eg/api/gemini/extract`;
export const MAX_RETRIES = 5;

export const geminiResponseSchema = {
  type: "OBJECT",
  properties: {
    type: { type: "STRING", description: "e.g., 'For rent', 'For sale'" },
    property_type: { type: "STRING", description: "e.g., 'Apartment', 'Villa'" },
    furnish_type: { type: "STRING", description: "e.g., 'Furnished', 'Unfurnished'" },
    price: { type: "NUMBER" },
    currency: { type: "STRING", description: "e.g., 'EGP', 'USD'" },
    transaction: { type: "STRING", description: "e.g., 'Monthly', 'Yearly', 'Total', 'Cash', 'Installment'" },
    duration: { type: "NUMBER", description: "Only if 'For rent'. Number of months/years." },
    duration_type: { type: "STRING", description: "e.g., 'Months', 'Years'" },
    start_date: { type: "STRING", description: "Date in 'DD-MM-YYYY' or 'YYYY-MM-DD' format." },
    end_date: { type: "STRING", description: "Date in 'DD-MM-YYYY' or 'YYYY-MM-DD' format." },
    bedrooms: { type: "NUMBER" },
    bathrooms: { type: "NUMBER" },
    location: { type: "STRING", description: "Specific location/area name." },
    listed_by: { type: "STRING", description: "The user who listed it." },
    tag: { type: "STRING", description: "e.g., 'Premium', 'Exclusive', 'Standard'" },
    deal_type: { type: "STRING", description: "e.g., 'Side-by-Side', 'Direct'" },
    is_urgent: { type: "BOOLEAN" },
    whatsapp_message: { type: "STRING", description: "The original, raw whatsapp message text used for parsing." },
    timestamp: { type: "STRING", description: "The message timestamp in DD/MM/YYYY HH:MM format." },
    image_urls: { type: "ARRAY", items: { type: "STRING" }, description: "List of media URLs extracted from the message or metadata." },
    client: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING" },
        phone: { type: "STRING" },
        email: { type: "STRING" }
      }
    },
    installment_period: { type: "STRING", description: "e.g. 'Monthly', 'Quarterly'. Null if not applicable." },
    options: { type: "ARRAY", items: { type: "STRING" }, description: "Amenities like 'pool', 'garden', 'security'" }
  },
  required: ["type", "price", "bedrooms", "location"]
};

export const initialFormState: InventoryForm = {
  type: 'For rent', property_type: '', furnish_type: '',
  price: 0, currency: 'EGP', transaction: 'Monthly',
  duration: 12, duration_type: 'Months', start_date: '', end_date: '',
  bedrooms: 1, bathrooms: 1, location: '',
  listed_by: '', tag: '', deal_type: 'Side-by-Side',
  whatsapp_message: '', is_urgent: false,
  timestamp: new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
  image_urls: [],
  client_name: '', client_phone: '', client_email: '',
};

export const initialRequestFormState: RequestForm = {
  type: 'Rent', status: 'Pending', privacy: 'Public',
  price: 0, currency: 'EGP', transaction: 'Monthly',
  duration: 12, duration_type: 'Months', start_date: '', end_date: '',
  bedrooms: 1, bathrooms: 1, furnish_type: '',
  deal_type: 'Side-by-Side', location: '',
  property_types_required: ['Apartment'],
  options_required: [],
  client_user: '', assigned_agent: 'None', owner: 'None',
  tag: 'Standard', is_urgent: false,
};

export const COLUMN_METADATA: Record<ColumnKey, ColumnDef> = {
  checkbox: { label: '', isSortable: false, isFilterable: false },
  id: { label: 'ID', isSortable: true, isFilterable: true },
  contactName: { label: 'CONTACT', isSortable: true, isFilterable: true},
  message: { label: 'MESSAGE', isSortable: true, isFilterable: true},
  sentAt: { label: 'SENT AT', isSortable: true, isFilterable: true},
  source: { label: 'SOURCE', isSortable: true, isFilterable: true},
  type: { label: 'TYPE', isSortable: true, isFilterable: true },
  userType: { label: 'USER', isSortable: true, isFilterable: true},
  userId: { label: 'USER ID', isSortable: true, isFilterable: true },
  replied: { label: 'REPLIED', isSortable: true, isFilterable: true },
  status: { label: 'STATUS', isSortable: true, isFilterable: true },
  actions: { label: 'ACTIONS', isSortable: false, isFilterable: false },
};

export const INITIAL_FLEXIBLE_ORDER: FlexibleColumnKey[] = [
  'id', 'contactName', 'message', 'sentAt', 
  'status', 'source', 'type', 'userType', 'userId', 'replied'
];

export const initialMessages: Message[] = [
  {
    id: 1004,
    contactName: 'Yahya Negm',
    contactPhone: '+201006531212',
    message: 'i want to buy an apt in el patio new cairo bgt 25k egp',
    sentAt: 'Oct 15, 2025 18:10 PM',
    isRead: false,
    source: 'Website',
    type: 'Request',
    userType: 'Existing',
    userId: 'u400',
    replied: 'No',
    status: 'Not Listed',
  },
  {
    id: 1003,
    contactName: 'Yahya Negm',
    contactPhone: '+201006531212',
    message: '.',
    sentAt: 'Oct 15, 2025 18:01 PM',
    isRead: true,
    source: 'WAP',
    type: 'Request',
    userType: 'Existing',
    userId: 'u400',
    replied: 'Yes',
    status: 'Listed',
  },
  {
    id: 1002,
    contactName: 'Test User',
    contactPhone: '+1234567890',
    message: 'Test message for error trace',
    sentAt: 'Oct 11, 2025 08:50 AM',
    isRead: true,
    source: 'Website',
    type: 'Inventory',
    userType: 'New',
    userId: 'u305',
    replied: 'Yes',
    status: 'Listed',
  },
  {
    id: 1001,
    contactName: 'Jane Doe',
    contactPhone: '+9876543210',
    message: 'Checking in on the project status.',
    sentAt: 'Oct 10, 2025 10:00 AM',
    isRead: false,
    source: 'WAP',
    type: 'Inventory',
    userType: 'New',
    userId: 'u112',
    replied: 'No',
    status: 'Not Listed',
  },
  {
    id: 1000,
    contactName: 'Support Team',
    contactPhone: '+1928374650',
    message: 'Your ticket has been updated.',
    sentAt: 'Oct 9, 2025 04:20 PM',
    isRead: true,
    source: 'Website',
    type: 'Request',
    userType: 'Existing',
    userId: 'u007',
    replied: 'Yes',
    status: 'Listed',
  },
];