import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface DropdownOptions {
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

interface InventoryForm {
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

interface RequestForm {
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

interface InputFieldProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  placeholder?: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  options: string[];
}

interface SearchableInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string; type: string } }) => void;
  name: string;
  options: string[];
  placeholder?: string;
}

// --- Configuration ---
const apiKey = "";
const API_URL_BASE = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
const MAX_RETRIES = 5;

// --- Utility Functions ---
const retryFetch = async (url: string, options: RequestInit): Promise<Response> => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed: ${(error as Error).message}`);
      if (i === MAX_RETRIES - 1) throw error;
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
};

// --- Data Simulation ---
const mockFetchDropdownData = async (): Promise<DropdownOptions> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    types: ['For rent', 'For sale', 'Investment'],
    propertyTypes: ['Apartment', 'Villa', 'Chalet', 'Studio', 'Office', 'Town House', 'Twin House', 'House'],
    furnishTypes: ['Furnished', 'Unfurnished', 'Semi-Furnished'],
    currencies: ['EGP', 'USD', 'EUR'],
    durationTypes: ['Months', 'Years'],
    tags: ['Premium', 'Exclusive', 'Standard', 'Urgent'],
    dealTypes: ['Side-by-Side', 'Direct'],
    listedByUsers: ['User 1 (Admin)', 'User 2 (Agent)', 'User 3 (Associate)', 'John Doe', 'Jane Smith', 'The Listing Team'],
    locations: ['Zamalek', 'New Cairo', 'Sheikh Zayed', 'Madinaty', '6th of October', 'Shorouk City', 'Heliopolis'],
    clientNames: ['Ahmed Said (01012345678)', 'Jane Doe (01198765432)', 'Mohamed Ali (01234567890)', 'New Client'],
    forRentTransactionTypes: ['Monthly', 'Yearly', 'Total'],
    forSaleTransactionTypes: ['Cash', 'Installment'],
    requestStatuses: ['Pending', 'Active', 'Closed'],
    requestPrivacy: ['Public', 'Private'],
    assignmentUsers: ['None', 'Agent A', 'Agent B', 'Owner C'],
    requestOptions: ['Pool', 'Garden', 'Security', 'AC', 'Elevator'],
  };
};

// --- Gemini AI JSON Schema ---
const geminiResponseSchema = {
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

// --- Initial State ---
const initialFormState: InventoryForm = {
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

const initialRequestFormState: RequestForm = {
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

const InputField: React.FC<InputFieldProps> = ({ label, type = 'text', value, onChange, name, placeholder = 'Enter value' }) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
    />
  </div>
);

const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, name, options }) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white"
    >
      <option value="" disabled>Select...</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const SearchableInput: React.FC<SearchableInputProps> = ({ label, value, onChange, name, options, placeholder = 'Search or enter new value' }) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onChange(e);
  };

  const handleSelectOption = (option: string) => {
    setSearchTerm(option);
    setIsFocused(false);
    onChange({ target: { name, value: option, type: 'text' } });
  };

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10);

  return (
    <div className="flex flex-col space-y-1 relative">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
      <input
        id={name}
        type="text"
        name={name}
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder={placeholder}
        className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
      />
      {isFocused && searchTerm && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-10 shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.map(option => (
            <div
              key={option}
              onMouseDown={() => handleSelectOption(option)}
              className="p-2 text-sm hover:bg-blue-100 cursor-pointer"
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [form, setForm] = useState<InventoryForm>(initialFormState);
  const [requestForm, setRequestForm] = useState<RequestForm>(initialRequestFormState);
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>({});
  const [whatsappInput, setWhatsappInput] = useState('');
  const [aiResponseRaw, setAiResponseRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [customerName, setCustomerName] = useState('New/Existing Customer');
  const [customerId, setCustomerId] = useState('N/A');
  const [phoneStatus, setPhoneStatus] = useState<'Inventory' | 'Request'>('Inventory');
  const [savedData, setSavedData] = useState<Array<InventoryForm | RequestForm>>([]);

  const inventoryTransactionOptions = useMemo(() => {
    if (form.type === 'For rent') {
      return dropdownOptions.forRentTransactionTypes || [];
    }
    if (form.type === 'For sale') {
      return dropdownOptions.forSaleTransactionTypes || [];
    }
    return [];
  }, [form.type, dropdownOptions]);

  const requestTransactionOptions = useMemo(() => {
    if (requestForm.type === 'Rent') {
      return dropdownOptions.forRentTransactionTypes || [];
    }
    if (requestForm.type === 'Sale') {
      return dropdownOptions.forSaleTransactionTypes || [];
    }
    return [];
  }, [requestForm.type, dropdownOptions]);

  useEffect(() => {
    mockFetchDropdownData().then(data => setDropdownOptions(data));
    setMessage('App ready. Paste message and click Generate Data.');
  }, []);

  const handleInventoryInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'type') {
      const defaultTransaction = value === 'For rent' ? 'Monthly' :
                                 value === 'For sale' ? 'Cash' :
                                 '';

      setForm(prev => ({
        ...prev,
        [name]: value,
        transaction: defaultTransaction
      }));
      return;
    }

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleRequestInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'type') {
      const defaultTransaction = value === 'Rent' ? 'Monthly' :
                                 value === 'Sale' ? 'Cash' :
                                 '';

      setRequestForm(prev => ({
        ...prev,
        [name]: value,
        transaction: defaultTransaction
      }));
      return;
    }

    if (type === 'checkbox') {
      if (name === 'is_urgent') {
        setRequestForm(prev => ({
          ...prev,
          [name]: checked
        }));
      }

      if (name === 'property_types_required' || name === 'options_required') {
        const listName = name as 'property_types_required' | 'options_required';
        const optionValue = (e.target as HTMLInputElement).value;

        setRequestForm(prev => {
          const currentList = prev[listName];
          if (checked) {
            return { ...prev, [listName]: [...currentList, optionValue] };
          } else {
            return { ...prev, [listName]: currentList.filter(item => item !== optionValue) };
          }
        });
      }
      return;
    }

    setRequestForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleGeminiParse = useCallback(async () => {
    if (!whatsappInput.trim()) {
      setMessage('Please paste a WhatsApp message to generate data.');
      return;
    }

    setLoading(true);
    setMessage('Generating structured data...');
    setAiResponseRaw('');

    const systemPrompt = `You are an expert Inventory Parsing Agent. Your task is to extract all relevant property and transaction details from the user-provided unstructured WhatsApp message. You MUST return a JSON object that strictly adheres to the provided schema. If a field is not found, omit it or set it to a reasonable default based on context (e.g., set 'is_urgent' to false). Extract any client contact details present in the message. The original message must be stored in the 'whatsapp_message' field. Also, provide a realistic timestamp and extract any potential image or media URLs mentioned in the message or assume mock URLs if applicable.`;

    const payload = {
      contents: [{ parts: [{ text: whatsappInput }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: geminiResponseSchema,
      }
    };

    try {
      const response = await retryFetch(API_URL_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        setAiResponseRaw(text);
        setMessage('Data generated successfully. Please review and Confirm.');
      } else {
        setMessage('AI failed to generate a valid JSON response.');
        console.error('AI Response Error:', result);
      }
    } catch (error) {
      setMessage(`Error during AI generation: ${(error as Error).message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [whatsappInput]);

  const handleConfirmParse = useCallback(() => {
    if (!aiResponseRaw) {
      setMessage('No AI data to confirm. Please generate data first.');
      return;
    }
    try {
      const parsedData = JSON.parse(aiResponseRaw);

      const newFormState: InventoryForm = {
        ...initialFormState,
        type: parsedData.type || initialFormState.type,
        property_type: parsedData.property_type || initialFormState.property_type,
        furnish_type: parsedData.furnish_type || initialFormState.furnish_type,
        price: parsedData.price !== undefined ? parsedData.price : initialFormState.price,
        currency: parsedData.currency || initialFormState.currency,
        transaction: parsedData.transaction || initialFormState.transaction,
        duration: parsedData.duration !== undefined ? parsedData.duration : initialFormState.duration,
        duration_type: parsedData.duration_type || initialFormState.duration_type,
        start_date: parsedData.start_date || initialFormState.start_date,
        end_date: parsedData.end_date || initialFormState.end_date,
        bedrooms: parsedData.bedrooms !== undefined ? parsedData.bedrooms : initialFormState.bedrooms,
        bathrooms: parsedData.bathrooms !== undefined ? parsedData.bathrooms : initialFormState.bathrooms,
        location: parsedData.location || initialFormState.location,
        listed_by: parsedData.listed_by || initialFormState.listed_by,
        tag: parsedData.tag || initialFormState.tag,
        deal_type: parsedData.deal_type || initialFormState.deal_type,
        is_urgent: parsedData.is_urgent !== undefined ? parsedData.is_urgent : initialFormState.is_urgent,
        whatsapp_message: parsedData.whatsapp_message || whatsappInput,
        timestamp: parsedData.timestamp || initialFormState.timestamp,
        image_urls: parsedData.image_urls || initialFormState.image_urls,
        client_name: parsedData.client?.name || '',
        client_phone: parsedData.client?.phone || '',
        client_email: parsedData.client?.email || '',
      };

      setForm(newFormState);
      setWhatsappInput(newFormState.whatsapp_message);
      setMessage('Form fields updated successfully from AI data. Please review and save.');

      if (parsedData.client?.name) {
        setCustomerName(parsedData.client.name);
        setCustomerId('Client Parsed');
      }

      setPhoneStatus('Inventory');

    } catch (e) {
      setMessage('Error: Invalid JSON response from AI. Cannot confirm.');
      console.error('JSON Parsing Error:', e);
    }
  }, [aiResponseRaw, whatsappInput]);

  const handleSaveData = useCallback(() => {
    setLoading(true);
    setMessage(`Saving ${phoneStatus.toLowerCase()} listing...`);

    const dataToSave = phoneStatus === 'Inventory' ? form : requestForm;

    const payload = {
      ...dataToSave,
      createdAt: new Date().toISOString(),
      status: (dataToSave as any).status || 'Draft',
      id: Date.now().toString(),
    };

    setTimeout(() => {
      setSavedData(prev => [...prev, payload]);
      setMessage(`${phoneStatus} listing saved successfully!`);
      console.log('Saved Data:', payload);
      setLoading(false);
    }, 500);
  }, [form, requestForm, phoneStatus]);

  const renderCoreDetails = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Core Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField label="Type" name="type" value={form.type} onChange={handleInventoryInputChange} options={dropdownOptions.types || []} />
        <SelectField label="Property Type" name="property_type" value={form.property_type} onChange={handleInventoryInputChange} options={dropdownOptions.propertyTypes || []} />
        <SelectField label="Furnish Type" name="furnish_type" value={form.furnish_type} onChange={handleInventoryInputChange} options={dropdownOptions.furnishTypes || []} />
      </div>
    </div>
  );

  const renderBudgetPricing = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Budget & Pricing</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InputField label="Price" name="price" type="number" value={form.price} onChange={handleInventoryInputChange} placeholder="0" />
        <SelectField label="Currency" name="currency" value={form.currency} onChange={handleInventoryInputChange} options={dropdownOptions.currencies || []} />
        <SelectField
          label="Transaction Type"
          name="transaction"
          value={form.transaction}
          onChange={handleInventoryInputChange}
          options={inventoryTransactionOptions}
        />
      </div>

      {form.type === 'For rent' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
          <InputField label="Duration Period" name="duration" type="number" value={form.duration} onChange={handleInventoryInputChange} placeholder="12" />
          <SelectField label="Duration Type" name="duration_type" value={form.duration_type} onChange={handleInventoryInputChange} options={dropdownOptions.durationTypes || []} />
          <InputField label="Start Date" name="start_date" type="date" value={form.start_date} onChange={handleInventoryInputChange} placeholder="dd/mm/yyyy" />
          <InputField label="End Date" name="end_date" type="date" value={form.end_date} onChange={handleInventoryInputChange} placeholder="dd/mm/yyyy" />
        </div>
      )}
    </div>
  );

  const renderSpecsLocation = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Specs & Location</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InputField label="Bedrooms" name="bedrooms" type="number" value={form.bedrooms} onChange={handleInventoryInputChange} placeholder="1" />
        <InputField label="Bathrooms" name="bathrooms" type="number" value={form.bathrooms} onChange={handleInventoryInputChange} placeholder="1" />
      </div>
      <div className="col-span-4 mt-4">
        <SearchableInput
          label="Location"
          name="location"
          value={form.location}
          onChange={handleInventoryInputChange}
          options={dropdownOptions.locations || []}
          placeholder="Start typing to search for a location..."
        />
      </div>
    </div>
  );

  const renderAssignmentDetails = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Assignment & Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField label="Tag" name="tag" value={form.tag} onChange={handleInventoryInputChange} options={dropdownOptions.tags || []} />
        <SelectField label="Deal Type" name="deal_type" value={form.deal_type} onChange={handleInventoryInputChange} options={dropdownOptions.dealTypes || []} />
      </div>

      <InputField label="WhatsApp Message (Original)" name="whatsapp_message" value={form.whatsapp_message} onChange={handleInventoryInputChange} placeholder="Original WhatsApp text after confirmation" />

      <div className="flex items-center pt-2">
        <input
          id="is_urgent_inv"
          name="is_urgent"
          type="checkbox"
          checked={form.is_urgent}
          onChange={handleInventoryInputChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_urgent_inv" className="ml-2 block text-sm text-gray-900">
          Mark as Urgent
        </label>
      </div>
    </div>
  );

  const renderClientDetails = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Client Contact Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SearchableInput
          label="Listed By (User)"
          name="listed_by"
          value={form.listed_by}
          onChange={handleInventoryInputChange}
          options={dropdownOptions.listedByUsers || []}
          placeholder="Search or enter user name/ID"
        />
        <SearchableInput
          label="Client Name"
          name="client_name"
          value={form.client_name}
          onChange={handleInventoryInputChange}
          options={dropdownOptions.clientNames || []}
          placeholder="Search or enter new client name"
        />
        <InputField label="Client Phone" name="client_phone" value={form.client_phone} onChange={handleInventoryInputChange} placeholder="Phone Number" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField label="Client Email" name="client_email" value={form.client_email} onChange={handleInventoryInputChange} placeholder="Email" />
      </div>
    </div>
  );

  const renderInventoryFormContent = () => (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory Listing Form</h1>
      {renderCoreDetails()}
      {renderBudgetPricing()}
      {renderSpecsLocation()}
      {renderAssignmentDetails()}
      {renderClientDetails()}

      <div className="space-y-4 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Images</h3>
        <div className="flex items-center">
          <button className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 transition">Browse...</button>
          <span className="ml-3 text-sm text-gray-500">No files selected. (Simulated)</span>
        </div>
      </div>
    </>
  );

  const renderRequestCoreDetails = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Core Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField label="Type" name="type" value={requestForm.type} onChange={handleRequestInputChange} options={['Rent', 'Sale', 'Investment']} />
        <SelectField label="Status" name="status" value={requestForm.status} onChange={handleRequestInputChange} options={dropdownOptions.requestStatuses || []} />
        <SelectField label="Privacy" name="privacy" value={requestForm.privacy} onChange={handleRequestInputChange} options={dropdownOptions.requestPrivacy || []} />
      </div>
    </div>
  );

  const renderRequestBudgetPricing = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Budget</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InputField label="Price" name="price" type="number" value={requestForm.price} onChange={handleRequestInputChange} placeholder="0" />
        <SelectField label="Currency" name="currency" value={requestForm.currency} onChange={handleRequestInputChange} options={dropdownOptions.currencies || []} />
        <SelectField
          label="Transaction Type"
          name="transaction"
          value={requestForm.transaction}
          onChange={handleRequestInputChange}
          options={requestTransactionOptions}
        />
      </div>

      {requestForm.type === 'Rent' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
          <InputField label="Duration Period" name="duration" type="number" value={requestForm.duration} onChange={handleRequestInputChange} placeholder="12" />
          <SelectField label="Duration Type" name="duration_type" value={requestForm.duration_type} onChange={handleRequestInputChange} options={dropdownOptions.durationTypes || []} />
          <InputField label="Start Date" name="start_date" type="date" value={requestForm.start_date} onChange={handleRequestInputChange} placeholder="dd/mm/yyyy" />
          <InputField label="End Date" name="end_date" type="date" value={requestForm.end_date} onChange={handleRequestInputChange} placeholder="dd/mm/yyyy" />
        </div>
      )}
    </div>
  );

  const renderRequestSpecs = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Property Specs</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField label="Bedrooms" name="bedrooms" type="number" value={requestForm.bedrooms} onChange={handleRequestInputChange} placeholder="1" />
        <InputField label="Bathrooms" name="bathrooms" type="number" value={requestForm.bathrooms} onChange={handleRequestInputChange} placeholder="1" />
        <SelectField label="Furnish Type" name="furnish_type" value={requestForm.furnish_type} onChange={handleRequestInputChange} options={dropdownOptions.furnishTypes || []} />
        <SelectField label="Deal Type" name="deal_type" value={requestForm.deal_type} onChange={handleRequestInputChange} options={dropdownOptions.dealTypes || []} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="md:col-span-1">
          <SearchableInput
            label="Locations"
            name="location"
            value={requestForm.location}
            onChange={handleRequestInputChange}
            options={dropdownOptions.locations || []}
            placeholder="Search locations..."
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">Property Types</label>
          <div className="flex flex-wrap gap-2 text-sm max-h-40 overflow-y-auto">
            {dropdownOptions.propertyTypes?.map(type => (
              <label key={type} className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  name="property_types_required"
                  value={type}
                  checked={requestForm.property_types_required.includes(type)}
                  onChange={handleRequestInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">Options</label>
          <div className="flex flex-wrap gap-2 text-sm max-h-40 overflow-y-auto">
            {dropdownOptions.requestOptions?.map(option => (
              <label key={option} className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  name="options_required"
                  value={option}
                  checked={requestForm.options_required.includes(option)}
                  onChange={handleRequestInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRequestAssignment = () => (
    <div className="space-y-4 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Assignment & Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SearchableInput
          label="Client / User"
          name="client_user"
          value={requestForm.client_user}
          onChange={handleRequestInputChange}
          options={dropdownOptions.clientNames || []}
          placeholder="Search client"
        />
        <SelectField label="Assigned Agent" name="assigned_agent" value={requestForm.assigned_agent} onChange={handleRequestInputChange} options={dropdownOptions.assignmentUsers || []} />
        <SelectField label="Owner" name="owner" value={requestForm.owner} onChange={handleRequestInputChange} options={dropdownOptions.assignmentUsers || []} />
        <SelectField label="Tag" name="tag" value={requestForm.tag} onChange={handleRequestInputChange} options={dropdownOptions.tags || []} />
      </div>

      <div className="flex items-center pt-2">
        <input
          id="is_urgent_req"
          name="is_urgent"
          type="checkbox"
          checked={requestForm.is_urgent}
          onChange={handleRequestInputChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_urgent_req" className="ml-2 block text-sm text-gray-900">
          Mark as Urgent
        </label>
      </div>
    </div>
  );

  const renderRequestFormContent = () => (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Client Request</h1>
      {renderRequestCoreDetails()}
      {renderRequestBudgetPricing()}
      {renderRequestSpecs()}
      {renderRequestAssignment()}
    </>
  );

  const renderMainFormWrapper = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full overflow-y-auto">
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {['Inventory', 'Request'].map(tab => (
            <button
              key={tab}
              onClick={() => setPhoneStatus(tab as 'Inventory' | 'Request')}
              className={`
                ${phoneStatus === tab ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                whitespace-nowrap py-3 px-1 border-b-2 text-sm transition duration-150
              `}
            >
              {tab} Form
            </button>
          ))}
        </nav>
      </div>

      {phoneStatus === 'Inventory' ? renderInventoryFormContent() : renderRequestFormContent()}

      <div className="mt-8 pt-4 border-t">
        <button
          onClick={handleSaveData}
          disabled={loading || (phoneStatus === 'Inventory' && (!form.location || !form.price)) || (phoneStatus === 'Request' && (!requestForm.location || !requestForm.price))}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Saving...
            </>
          ) : `Save ${phoneStatus} Data`}
        </button>
      </div>

      {savedData.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Saved Items ({savedData.length})</h4>
          <div className="text-xs text-gray-600 space-y-1 max-h-40 overflow-y-auto">
            {savedData.map((item, idx) => (
              <div key={idx} className="p-2 bg-white rounded border">
                {(item as any).id} - {(item as any).location || 'No location'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">AI Ingestion System</h1>
      </header>
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        <div className="lg:w-7/12">
          {renderMainFormWrapper()}
        </div>
        <div className="lg:w-5/12">
          <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Parsing WhatsApp Message</h1>

            <div className="bg-gray-50 p-4 rounded-lg mb-4 grid grid-cols-2 gap-4 text-sm">
              <p>WAP Message Type: <span className="font-semibold text-blue-600">{phoneStatus}</span></p>
              <p>Telephone Number: <span className="font-semibold">+201006531212</span></p>
              <p>Username: <span className="font-semibold">Yahya Negm</span></p>
              <p>Customer ID: <span className="font-semibold">12541</span></p>
              <p className="col-span-2">Customer Status: <span className="font-semibold">{customerName} ({customerId})</span></p>

              <button
                onClick={() => setPhoneStatus(prev => prev === 'Inventory' ? 'Request' : 'Inventory')}
                className="col-span-2 bg-yellow-200 text-yellow-800 py-1 rounded-md text-xs font-semibold hover:bg-yellow-300 transition"
              >
                Toggle Message Type: {phoneStatus}
              </button>
            </div>

            <div className="flex-shrink-0 mb-4 border p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">WAP Message</label>
                <div className="text-xs text-gray-500 text-right">
                  <span className="block">Timestamp: <span className="font-semibold">{form.timestamp}</span></span>
                  <span className="block text-gray-700">
                    Incoming: <span className="font-semibold">+2010054542313</span>
                    <span className="text-xs ml-1 font-normal text-gray-500">({phoneStatus})</span>
                  </span>
                </div>
              </div>
              <textarea
                rows={4}
                value={whatsappInput}
                onChange={(e) => setWhatsappInput(e.target.value)}
                placeholder="Paste the raw WhatsApp inventory message here..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition resize-y"
                disabled={loading}
              ></textarea>
              <button
                onClick={handleGeminiParse}
                disabled={loading || !whatsappInput.trim()}
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Data'}
              </button>
              <div className="mt-3 p-2 bg-white rounded-md border border-dashed">
                <p className="font-semibold text-xs text-gray-700 mb-1">Image/Media URLs ({form.image_urls.length}):</p>
                {form.image_urls.length > 0 ? (
                  <ul className="space-y-1 text-blue-600 text-xs">
                    {form.image_urls.map((url, index) => (
                      <li key={index} className="truncate hover:underline cursor-pointer" title={url}>{url}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic text-xs">No media URLs attached. (AI will try to extract them)</p>
                )}
              </div>
            </div>

            <div className="flex-grow flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">AI Response: Structured JSON Output</label>
              <textarea
                rows={10}
                readOnly
                value={aiResponseRaw || 'Structured JSON output will appear here after generation.'}
                className="flex-grow w-full p-3 border border-gray-300 rounded-md bg-gray-50 font-mono text-xs overflow-auto"
              ></textarea>
              <button
                onClick={handleConfirmParse}
                disabled={!aiResponseRaw || loading}
                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Confirm & Fill Form
              </button>
            </div>

            <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message || 'App ready. Paste message and click Generate Data.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


