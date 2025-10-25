import { useState, useCallback } from 'react';
import { type InventoryForm, type RequestForm, type Location, type DropdownOptions, type PropertyType, type Tag, type UnfilledFields } from '../interfaces';
import { generateAiResonse } from '../services/geminiService';
import { fetchSingleMessage } from '../services/messageApi'
import { fetchLocation } from '../services/locationService';
import { initialFormState, initialRequestFormState } from '../utils/constants';
import { capitalizeFirst } from '../utils/formats';


export const useAIParsing = (
  setInventoryForm: (form: InventoryForm) => void,
  inventoryForm : InventoryForm,
  setRequestForm: (form: RequestForm) => void,
  requestForm: RequestForm,
  setWhatsappInput: (input: string) => void,
  dropdownOptions: DropdownOptions,
  setDropdownOptions: (dropdownOptions: DropdownOptions) => void,
  setUnfilledFields: (fields: UnfilledFields) => void
) => {
  const [aiResponseRaw, setAiResponseRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Helper function to find property type object by name
  const findPropertyType = useCallback((propertyTypeName: string | undefined): PropertyType | null => {
    if (!propertyTypeName) return null;

    const normalizedName = propertyTypeName?.toLowerCase().trim();
    return dropdownOptions?.propertyTypes?.find(
      pt =>
        pt.name?.toLowerCase().trim() === normalizedName ||
        String(pt.id) === propertyTypeName
    ) || null;
  }, [dropdownOptions.propertyTypes]);

  const findTag = useCallback((tagName: string | undefined): Tag | null => {
    if (!tagName) return null;
    console.log(tagName)
    const normalizedName = tagName.toLowerCase().trim();
    return dropdownOptions.tags
      ?.flatMap((category) => category.tags).find(
        tag =>
          tag.name?.toLowerCase().trim() === normalizedName ||
          String(tag.id) === tagName
      ) || null

  }, [dropdownOptions.tags]);

  // Helper function to check if a field was filled by AI
  const checkFieldFilled = useCallback((aiValue: unknown, initialValue: unknown): boolean => {
    if (aiValue === undefined || aiValue === null) return false;
    if (typeof aiValue === 'string' && aiValue.trim() === '') return false;
    if (typeof aiValue === 'number' && aiValue === 0) return false;
    if (Array.isArray(aiValue) && aiValue.length === 0) return false;
    if (typeof aiValue === 'object' && Object.keys(aiValue).length === 0) return false;
    
    return aiValue !== initialValue;
  }, []);

  const handleGeminiParse = useCallback(async (whatsappInput: string, formType: string) => {
    if (!whatsappInput.trim()) {
      setMessage('Please paste a WhatsApp message to generate data.');
      return;
    }

    setLoading(true);
    setMessage('Generating structured data...');
    setAiResponseRaw('');

    try {
      const text = await generateAiResonse(whatsappInput, formType === "Inventory" ? 'inventory' : 'request');
      if (text) {
        setAiResponseRaw(text);
        setMessage('Data generated successfully. Please review and Confirm.');
      } else {
        setMessage('AI failed to generate a valid JSON response.');
      }
    } catch (error) {
      setMessage(`Error during AI generation: ${(error as Error).message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleConfirmParse = useCallback(async (
    aiResponseRaw: string,
    whatsappInput: string,
    formType: string
  ) => {
    if (!aiResponseRaw) {
      setMessage('No AI data to confirm. Please generate data first.');
      return;
    }

    try {
      const parsedData = JSON.parse(aiResponseRaw);
      if (formType === "Request") {
        // Handle Request Form
        const locationObjs: Location[] = [];
        if (parsedData.data.locations && parsedData.data.locations.length > 0) {
          for (const loc of parsedData.data.locations) {
            const locations = await fetchLocation(loc);
            if (locations[0]) locationObjs.push(locations[0]);
          }
        } else if (parsedData.data.location) {
          const normalizelocations = parsedData.data.location.split(',');
          const normalizeLocation = normalizelocations[normalizelocations.length - 1];
          const locations = await fetchLocation(normalizeLocation);
          if (locations[0]) locationObjs.push(locations[0]);
        }

        // Match property types from API response to dropdown objects
        const propertyTypesRequired = [];
        if (parsedData.data.property_types_required && Array.isArray(parsedData.data.property_types_required)) {
          for (const ptName of parsedData.data.property_types_required) {
            const matchedType = findPropertyType(ptName);
            if (matchedType) propertyTypesRequired.push(String(matchedType.id));
          }
        } else if (parsedData.data.property_type) {
          const matchedType = findPropertyType(parsedData.data.property_type);
          if (matchedType) propertyTypesRequired.push(String(matchedType.id));
        }

       setDropdownOptions({
        ...dropdownOptions,
        requestOptions: parsedData.data.options
       })
        const tagObj = findTag(parsedData.data.tag)
        const newRequestForm: RequestForm = {
          type: parsedData.data.type === "buy" ? "Buy" : "Rent",
          status: parsedData.data.status || initialRequestFormState.status,
          privacy: capitalizeFirst(parsedData.data.privacy) || initialRequestFormState.privacy,
          price: parsedData.data.budget?.price !== undefined ? parsedData.data.budget.price : initialRequestFormState.price,
          currency: parsedData.data.budget?.currency || initialRequestFormState.currency,
          transaction: capitalizeFirst(parsedData.data.budget.transaction) || initialRequestFormState.transaction,
          duration: parsedData.data.duration !== undefined ? parsedData.data.duration : initialRequestFormState.duration,
          duration_type: parsedData.data.duration_type || initialRequestFormState.duration_type,
          start_date: parsedData.data.start_date || initialRequestFormState.start_date,
          end_date: parsedData.data.end_date || initialRequestFormState.end_date,
          bedrooms: parsedData.data.no_bedroom !== undefined ? parsedData.data.no_bedroom : initialRequestFormState.bedrooms,
          bathrooms: parsedData.data.no_bathroom !== undefined ? parsedData.data.no_bathroom : initialRequestFormState.bathrooms,
          no_master_bedroom: parsedData.data.no_master_bedroom !== undefined ? parsedData.data.no_master_bedroom : initialRequestFormState.no_master_bedroom,
          furnish_type: capitalizeFirst(parsedData.data.furnish_type) || initialRequestFormState.furnish_type,
          deal_type: parsedData.data.deal_type ? parsedData.data.deal_type === "side-by-side"? "Side-by-Side": "50:50" : initialRequestFormState.deal_type,
          whatsapp_message: parsedData.data.whatsapp_message || whatsappInput,
          reference_id: parsedData.data.reference_id,
          locations: locationObjs.length > 0 ? locationObjs : initialRequestFormState.locations,
          property_types_required: propertyTypesRequired.length > 0 ? propertyTypesRequired : initialRequestFormState.property_types_required,
          options_required: parsedData.data.options_required || initialRequestFormState.options_required,
          assigned_agent: parsedData.data.assigned_agent || initialRequestFormState.assigned_agent,
          owner: parsedData.data.owner || initialRequestFormState.owner,
          tag: tagObj || initialRequestFormState.tag,
          is_urgent: parsedData.data.urgent !== undefined ? parsedData.data.urgent : initialRequestFormState.is_urgent,
          bua: parsedData.data.bua || initialRequestFormState.bua,
          is_direct: parsedData.data.direct || initialRequestFormState.is_direct
        };

        // Track unfilled fields for Request form
        const unfilledFields: UnfilledFields = {};
        unfilledFields.status = !checkFieldFilled(parsedData.data.status, initialRequestFormState.status);
        unfilledFields.privacy = !checkFieldFilled(parsedData.data.privacy, initialRequestFormState.privacy);
        unfilledFields.price = !checkFieldFilled(parsedData.data.budget?.price, initialRequestFormState.price);
        unfilledFields.currency = !checkFieldFilled(parsedData.data.budget?.currency, initialRequestFormState.currency);
        unfilledFields.transaction = !checkFieldFilled(parsedData.data.budget?.transaction, initialRequestFormState.transaction);
        unfilledFields.duration = !checkFieldFilled(parsedData.data.duration, initialRequestFormState.duration);
        unfilledFields.duration_type = !checkFieldFilled(parsedData.data.duration_type, initialRequestFormState.duration_type);
        unfilledFields.start_date = !checkFieldFilled(parsedData.data.start_date, initialRequestFormState.start_date);
        unfilledFields.end_date = !checkFieldFilled(parsedData.data.end_date, initialRequestFormState.end_date);
        unfilledFields.bedrooms = !checkFieldFilled(parsedData.data.no_bedroom, initialRequestFormState.bedrooms);
        unfilledFields.bathrooms = !checkFieldFilled(parsedData.data.no_bathroom, initialRequestFormState.bathrooms);
        unfilledFields.no_master_bedroom = !checkFieldFilled(parsedData.data.no_master_bedroom, initialRequestFormState.no_master_bedroom);
        unfilledFields.furnish_type = !checkFieldFilled(parsedData.data.furnish_type, initialRequestFormState.furnish_type);
        unfilledFields.deal_type = !checkFieldFilled(parsedData.data.deal_type, initialRequestFormState.deal_type);
        unfilledFields.reference_id = !checkFieldFilled(parsedData.data.reference_id, initialRequestFormState.reference_id);
        unfilledFields.locations = locationObjs.length === 0;
        unfilledFields.property_types_required = propertyTypesRequired.length === 0;
        unfilledFields.options_required = !checkFieldFilled(parsedData.data.options_required, initialRequestFormState.options_required);
        unfilledFields.assigned_agent = !checkFieldFilled(parsedData.data.assigned_agent, initialRequestFormState.assigned_agent);
        unfilledFields.owner = !checkFieldFilled(parsedData.data.owner, initialRequestFormState.owner);
        unfilledFields.tag = !tagObj;
        unfilledFields.bua = !checkFieldFilled(parsedData.data.bua, initialRequestFormState.bua);

        setRequestForm({
          ...requestForm,
          ...newRequestForm
        });
        setUnfilledFields(unfilledFields);
        setWhatsappInput(parsedData.data.whatsapp_message || whatsappInput);
        setMessage('Form fields updated successfully from AI data. Please review and save.');

      } else {
        // Handle Inventory Form
        let locationObj: Location | null = null;
        if (parsedData.data.locations && parsedData.data.locations.length > 0) {
          const locations = await fetchLocation(parsedData.data.locations[0]);
          locationObj = locations[0] || null;
        } else if (parsedData.data.location) {
          const normalizelocations = parsedData.data.location.split(',');
          const normalizeLocation = normalizelocations[normalizelocations.length - 1];
          const locations = await fetchLocation(normalizeLocation);
          locationObj = locations[0] || null;
        }
        setDropdownOptions({
        ...dropdownOptions,
        requestOptions: parsedData.data.more_options && parsedData.data.more_options !== "Not provided"? parsedData.data.more_options?.split(","): []
       })
        // Match property type from API response to dropdown object
        const propertyTypeObj = findPropertyType(parsedData.data.property_type);
        const tagObj = findTag(parsedData.data.tag)
        const newInventoryForm: InventoryForm = {
          type: parsedData.data.type === "sell" ? "For Sale" : "For Rent",
          property_type: propertyTypeObj || initialFormState.property_type,
          furnish_type: capitalizeFirst(parsedData.data.furnish_type) || initialFormState.furnish_type,
          price: parsedData.data.Price?.price !== undefined ? parsedData.data.Price.price : initialFormState.price,
          currency: parsedData.data.budget?.currency || initialFormState.currency,
          transaction: capitalizeFirst(parsedData.data.Price.transaction) || initialFormState.transaction,
          duration: parsedData.data.duration !== undefined ? parsedData.data.duration : initialFormState.duration,
          duration_type: parsedData.data.duration_type || initialFormState.duration_type,
          start_date: parsedData.data.start_date || initialFormState.start_date,
          end_date: parsedData.data.end_date || initialFormState.end_date,
          bedrooms: parsedData.data.no_bedroom !== undefined ? parsedData.data.no_bedroom : initialFormState.bedrooms,
          bathrooms: parsedData.data.no_bathroom !== undefined ? parsedData.data.no_bathroom : initialFormState.bathrooms,
          no_master_bedroom: parsedData.data.no_master_bedroom !== undefined ? parsedData.data.no_master_bedroom : initialFormState.no_master_bedroom,
          location: locationObj || initialFormState.location,
          tag: tagObj || initialFormState.tag,
          deal_type: parsedData.data.deal_type === "side-by-side"? "Side-by-Side": "50:50",
          is_urgent: parsedData.data.urgent !== undefined ? parsedData.data.urgent : initialFormState.is_urgent,
          whatsapp_message: parsedData.data.whatsapp_message || whatsappInput,
          reference_id: parsedData.data.reference_id,
          timestamp: parsedData.data.timestamp || initialFormState.timestamp,
          image_urls: parsedData.data.image_urls || initialFormState.image_urls,
          // client_name: parsedData.data.client?.name || '',
          // client_phone: parsedData.data.client?.phone || '',
          // client_email: parsedData.data.client?.email || '',
          bua: parsedData.data.bua || initialFormState.bua,
          is_direct: parsedData.data.direct || initialFormState.is_direct,
          options_required: []
        };

        // Track unfilled fields for Inventory form
        const unfilledFields: UnfilledFields = {};
        unfilledFields.property_type = !propertyTypeObj;
        unfilledFields.furnish_type = !checkFieldFilled(parsedData.data.furnish_type, initialFormState.furnish_type);
        unfilledFields.price = !checkFieldFilled(parsedData.data.Price?.price, initialFormState.price);
        unfilledFields.currency = !checkFieldFilled(parsedData.data.budget?.currency, initialFormState.currency);
        unfilledFields.transaction = !checkFieldFilled(parsedData.data.Price?.transaction, initialFormState.transaction);
        unfilledFields.duration = !checkFieldFilled(parsedData.data.duration, initialFormState.duration);
        unfilledFields.duration_type = !checkFieldFilled(parsedData.data.duration_type, initialFormState.duration_type);
        unfilledFields.start_date = !checkFieldFilled(parsedData.data.start_date, initialFormState.start_date);
        unfilledFields.end_date = !checkFieldFilled(parsedData.data.end_date, initialFormState.end_date);
        unfilledFields.bedrooms = !checkFieldFilled(parsedData.data.no_bedroom, initialFormState.bedrooms);
        unfilledFields.bathrooms = !checkFieldFilled(parsedData.data.no_bathroom, initialFormState.bathrooms);
        unfilledFields.no_master_bedroom = !checkFieldFilled(parsedData.data.no_master_bedroom, initialFormState.no_master_bedroom);
        unfilledFields.location = !locationObj;
        unfilledFields.tag = !tagObj;
        unfilledFields.deal_type = !checkFieldFilled(parsedData.data.deal_type, initialFormState.deal_type);
        unfilledFields.reference_id = !checkFieldFilled(parsedData.data.reference_id, initialFormState.reference_id);
        unfilledFields.timestamp = !checkFieldFilled(parsedData.data.timestamp, initialFormState.timestamp);
        unfilledFields.image_urls = !checkFieldFilled(parsedData.data.image_urls, initialFormState.image_urls);
        unfilledFields.client_name = !checkFieldFilled(parsedData.data.client?.name, '');
        unfilledFields.client_phone = !checkFieldFilled(parsedData.data.client?.phone, '');
        unfilledFields.client_email = !checkFieldFilled(parsedData.data.client?.email, '');
        unfilledFields.bua = !checkFieldFilled(parsedData.data.bua, initialFormState.bua);

        setInventoryForm({
          ...inventoryForm,
          ...newInventoryForm
        });
        setUnfilledFields(unfilledFields);
        setWhatsappInput(newInventoryForm.whatsapp_message);
        setMessage('Form fields updated successfully from AI data. Please review and save.');
      }

    } catch (e) {
      setMessage('Error: Invalid JSON response from AI. Cannot confirm.');
      console.error('JSON Parsing Error:', e);
    }
  }, [setInventoryForm, setRequestForm, setWhatsappInput, findPropertyType, findTag, checkFieldFilled, setUnfilledFields, dropdownOptions, inventoryForm, requestForm, setDropdownOptions]);

  const getSingleMessage = useCallback(async (id: string) => {
    try {
      const response = await fetchSingleMessage(id);
      return response;
    } catch (error) {
      console.error(error);
      setMessage('Error: Invalid JSON response from AI. Cannot confirm.');
    }
  }, []);

  return {
    aiResponseRaw,
    loading,
    message,
    setAiResponseRaw,
    setMessage,
    handleGeminiParse,
    handleConfirmParse,
    getSingleMessage
  };
};