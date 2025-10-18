import { useState, useCallback } from 'react';
import { type InventoryForm, type RequestForm, type Location } from '../interfaces';
import { generateAiResonse } from '../services/geminiService';
import { fetchSingleMessage } from '../services/messageApi'
import { fetchLocation } from '../services/locationService';
import { initialFormState, initialRequestFormState } from '../utils/constants';


export const useAIParsing = (
  setInventoryForm: (form: InventoryForm) => void,
  setRequestForm: (form: RequestForm) => void,
  setWhatsappInput: (input: string) => void
) => {
  const [aiResponseRaw, setAiResponseRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
      console.log(parsedData)
      if (formType === "Request") {
        // Handle Request Form
        let locationObjs: Location[] = [];
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

        const newRequestForm: RequestForm = {
          type: parsedData.data.type === "buy" ? "Buy" : "Rent",
          status: parsedData.data.status || initialRequestFormState.status,
          privacy: parsedData.data.privacy || initialRequestFormState.privacy,
          price: parsedData.data.budget?.price !== undefined ? parsedData.data.budget.price : initialRequestFormState.price,
          currency: parsedData.data.budget?.currency || initialRequestFormState.currency,
          transaction: parsedData.data.budget.transaction === "yearly"? "Yearly": "Monthly",
          duration: parsedData.data.duration !== undefined ? parsedData.data.duration : initialRequestFormState.duration,
          duration_type: parsedData.data.duration_type || initialRequestFormState.duration_type,
          start_date: parsedData.data.start_date || initialRequestFormState.start_date,
          end_date: parsedData.data.end_date || initialRequestFormState.end_date,
          bedrooms: parsedData.data.no_bedroom !== undefined ? parsedData.data.no_bedroom : initialRequestFormState.bedrooms,
          bathrooms: parsedData.data.no_bathroom !== undefined ? parsedData.data.no_bathroom : initialRequestFormState.bathrooms,
          furnish_type: parsedData.data.furnish_type || initialRequestFormState.furnish_type,
          deal_type: parsedData.data.deal_type || initialRequestFormState.deal_type,
          whatsapp_message: parsedData.data.whatsapp_message || whatsappInput,
          reference_id: parsedData.data.reference_id,
          locations: locationObjs.length > 0 ? locationObjs : initialRequestFormState.locations,
          property_types_required: parsedData.data.property_types_required || parsedData.data.property_type ? [parsedData.data.property_type] : initialRequestFormState.property_types_required,
          options_required: parsedData.data.options_required || initialRequestFormState.options_required,
          client_user: parsedData.data.client_user || parsedData.data.client?.id || initialRequestFormState.client_user,
          assigned_agent: parsedData.data.assigned_agent || initialRequestFormState.assigned_agent,
          owner: parsedData.data.owner || initialRequestFormState.owner,
          tag: parsedData.data.tag || initialRequestFormState.tag,
          is_urgent: parsedData.data.is_urgent !== undefined ? parsedData.data.is_urgent : initialRequestFormState.is_urgent,
        };

        setRequestForm(newRequestForm);
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

        const newInventoryForm: InventoryForm = {
          type: parsedData.data.type === "sell" ? "For Sale": "For Rent",
          property_type: parsedData.data.property_type || initialFormState.property_type,
          furnish_type: parsedData.data.furnish_type || initialFormState.furnish_type,
          price: parsedData.data.budget?.price !== undefined ? parsedData.data.budget.price : initialFormState.price,
          currency: parsedData.data.budget?.currency || initialFormState.currency,
          transaction: parsedData.data.budget.transaction || initialFormState.transaction,
          duration: parsedData.data.duration !== undefined ? parsedData.data.duration : initialFormState.duration,
          duration_type: parsedData.data.duration_type || initialFormState.duration_type,
          start_date: parsedData.data.start_date || initialFormState.start_date,
          end_date: parsedData.data.end_date || initialFormState.end_date,
          bedrooms: parsedData.data.no_bedroom !== undefined ? parsedData.data.no_bedroom : initialFormState.bedrooms,
          bathrooms: parsedData.data.no_bathroom !== undefined ? parsedData.data.no_bathroom : initialFormState.bathrooms,
          location: locationObj || initialFormState.location,
          listed_by: parsedData.data.listed_by || initialFormState.listed_by,
          tag: parsedData.data.tag || initialFormState.tag,
          deal_type: parsedData.data.deal_type || initialFormState.deal_type,
          is_urgent: parsedData.data.is_urgent !== undefined ? parsedData.data.is_urgent : initialFormState.is_urgent,
          whatsapp_message: parsedData.data.whatsapp_message || whatsappInput,
          reference_id: parsedData.data.reference_id,
          timestamp: parsedData.data.timestamp || initialFormState.timestamp,
          image_urls: parsedData.data.image_urls || initialFormState.image_urls,
          client_name: parsedData.data.client?.name || '',
          client_phone: parsedData.data.client?.phone || '',
          client_email: parsedData.data.client?.email || '',
        };

        setInventoryForm(newInventoryForm);
        setWhatsappInput(newInventoryForm.whatsapp_message);
        setMessage('Form fields updated successfully from AI data. Please review and save.');
      }

    } catch (e) {
      setMessage('Error: Invalid JSON response from AI. Cannot confirm.');
      console.error('JSON Parsing Error:', e);
    }
  }, [setInventoryForm, setRequestForm, setWhatsappInput]);

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