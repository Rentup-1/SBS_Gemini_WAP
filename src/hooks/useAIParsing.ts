import { useState, useCallback } from 'react';
import { type InventoryForm } from '../interfaces';
import { generateAiResonse } from '../services/geminiService';
import { initialFormState } from '../utils/constants';

export const useAIParsing = (setForm: (form: InventoryForm) => void, setWhatsappInput: (input: string) => void) => {
  const [aiResponseRaw, setAiResponseRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGeminiParse = useCallback(async (whatsappInput: string) => {
    if (!whatsappInput.trim()) {
      setMessage('Please paste a WhatsApp message to generate data.');
      return;
    }

    setLoading(true);
    setMessage('Generating structured data...');
    setAiResponseRaw('');

    try {
      const text = await generateAiResonse(whatsappInput, "request");
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

  const handleConfirmParse = useCallback((aiResponseRaw: string, whatsappInput: string) => {
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

    } catch (e) {
      setMessage('Error: Invalid JSON response from AI. Cannot confirm.');
      console.error('JSON Parsing Error:', e);
    }
  }, [setForm, setWhatsappInput]);

  return {
    aiResponseRaw,
    loading,
    message,
    setMessage,
    handleGeminiParse,
    handleConfirmParse
  };
};