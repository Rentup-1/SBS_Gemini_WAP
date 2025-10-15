import type { InventoryForm, RequestForm } from "../interfaces";

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