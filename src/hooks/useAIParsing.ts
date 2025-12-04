import { useState, useCallback } from "react";
import {
  type InventoryForm,
  type RequestForm,
  type DropdownOptions,
  type PropertyType,
  type Tag,
  type UnfilledFields,
} from "../interfaces";
import { generateAiResonse } from "../APIs/services/geminiService";
import { fetchSingleMessage } from "../APIs/services/messageApi";
import { initialFormState, initialRequestFormState } from "../utils/constants";
import { capitalizeFirst } from "../utils/formats";

export const useAIParsing = (
  setInventoryForm: React.Dispatch<React.SetStateAction<InventoryForm>>,
  inventoryForm: InventoryForm,
  setRequestForm: React.Dispatch<React.SetStateAction<RequestForm>>,
  requestForm: RequestForm,
  setWhatsappInput: (input: string) => void,
  dropdownOptions: DropdownOptions,
  setDropdownOptions: (dropdownOptions: DropdownOptions) => void,
  setUnfilledFields: (fields: UnfilledFields) => void
) => {
  const [aiResponseRaw, setAiResponseRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // -----------------------------------------------------------
  // Helpers (Pure Functions)
  // -----------------------------------------------------------
  const findPropertyType = useCallback(
    (propertyTypeName: string | undefined): PropertyType | null => {
      if (
        !propertyTypeName ||
        propertyTypeName === "Not provided" ||
        propertyTypeName === "0"
      )
        return null;
      const normalizedName = String(propertyTypeName).toLowerCase().trim();
      return (
        dropdownOptions?.propertyTypes?.find(
          (pt) =>
            pt.name?.toLowerCase().trim() === normalizedName ||
            String(pt.id) === String(propertyTypeName)
        ) || null
      );
    },
    [dropdownOptions.propertyTypes]
  );

  const findTag = useCallback(
    (tagName: string | number | undefined): Tag | null => {
      if (
        !tagName ||
        tagName === "Not provided" ||
        tagName === 0 ||
        tagName === "0"
      )
        return null;
      const normalizedName = String(tagName).toLowerCase().trim();
      return (
        dropdownOptions.tags
          ?.flatMap((category) => category.tags)
          .find(
            (tag) =>
              tag.name?.toLowerCase().trim() === normalizedName ||
              String(tag.id) === String(tagName)
          ) || null
      );
    },
    [dropdownOptions.tags]
  );

  const checkFieldFilled = useCallback(
    (aiValue: unknown, initialValue: unknown): boolean => {
      if (
        aiValue === undefined ||
        aiValue === null ||
        aiValue === "Not provided"
      )
        return false;
      if (typeof aiValue === "string" && aiValue.trim() === "") return false;
      if (typeof aiValue === "number" && aiValue === 0) return false;
      if (Array.isArray(aiValue) && aiValue.length === 0) return false;
      if (typeof aiValue === "object" && Object.keys(aiValue).length === 0)
        return false;
      return aiValue != initialValue;
    },
    []
  );

  // -----------------------------------------------------------
  // 1. Generate Data (Call AI API)
  // -----------------------------------------------------------
  const handleGeminiParse = useCallback(
    async (whatsappInput: string, formType: string) => {
      if (!whatsappInput.trim()) {
        setMessage("Please paste a WhatsApp message to generate data.");
        return;
      }

      setLoading(true);
      setMessage("Generating structured data...");
      setAiResponseRaw("");

      try {
        const text = await generateAiResonse(
          whatsappInput,
          formType === "Inventory" ? "inventory" : "request"
        );
        if (text) {
          setAiResponseRaw(text);
          setMessage("Data generated successfully.");
        } else {
          setMessage("AI failed to generate a valid JSON response.");
        }
      } catch (error) {
        setMessage(`Error during AI generation: ${(error as Error).message}`);
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // -----------------------------------------------------------
  // 2. Confirm Parse (Updated Mapping Logic)
  // -----------------------------------------------------------
  const handleConfirmParse = useCallback(
    async (aiResponseRaw: string, whatsappInput: string, formType: string) => {
      if (!aiResponseRaw) return;

      try {
        const parsedData = JSON.parse(aiResponseRaw);

        // Handle Array vs Object structure
        let aiData = parsedData.data;
        if (Array.isArray(parsedData.data)) {
          aiData = parsedData.data.length > 0 ? parsedData.data[0] : {};
        }

        if (formType === "Request") {
          // =========================================================
          // REQUEST MAPPING
          // =========================================================

          // Property Types
          const propertyTypesRequired = [];
          if (
            aiData.property_types_required &&
            Array.isArray(aiData.property_types_required)
          ) {
            for (const ptName of aiData.property_types_required) {
              const matchedType = findPropertyType(ptName);
              if (matchedType)
                propertyTypesRequired.push(String(matchedType.id));
            }
          } else if (aiData.property_type) {
            const matchedType = findPropertyType(aiData.property_type);
            if (matchedType) propertyTypesRequired.push(String(matchedType.id));
          }

          // Options & Furnish extraction
          const requestOptionsRaw = aiData.options || aiData.more_options;
          const requestOptions =
            requestOptionsRaw && requestOptionsRaw !== "Not provided"
              ? Array.isArray(requestOptionsRaw)
                ? requestOptionsRaw
                : String(requestOptionsRaw).split(",")
              : [];

          // Extract furnish type
          let furnishType =
            capitalizeFirst(aiData.furnish_type) ||
            initialRequestFormState.furnish_type;
          if (!aiData.furnish_type && requestOptions.includes("furnished"))
            furnishType = "Furnished";
          if (!aiData.furnish_type && requestOptions.includes("unfurnished"))
            furnishType = "Unfurnished";

          const tagObj = findTag(aiData.tag);

          // Budget Mapping
          const budgetObj = aiData.budget || {};
          const durationObj = budgetObj.duration || {};

          const updateData: Partial<RequestForm> = {
            type: aiData.type === "buy" ? "Buy" : "Rent",
            status: aiData.status || initialRequestFormState.status,
            privacy:
              capitalizeFirst(aiData.privacy) ||
              initialRequestFormState.privacy,

            price:
              budgetObj.price !== undefined
                ? Number(budgetObj.price)
                : initialRequestFormState.price,
            currency: budgetObj.currency || initialRequestFormState.currency,
            transaction:
              capitalizeFirst(budgetObj.transaction) ||
              initialRequestFormState.transaction,

            duration:
              durationObj.period !== undefined && durationObj.period !== null
                ? Number(durationObj.period)
                : initialRequestFormState.duration,
            duration_type:
              durationObj.type || initialRequestFormState.duration_type,
            start_date:
              durationObj.start_date || initialRequestFormState.start_date,
            end_date: durationObj.end_date || initialRequestFormState.end_date,

            bedrooms:
              aiData.no_bedroom !== undefined
                ? Number(aiData.no_bedroom)
                : initialRequestFormState.bedrooms,
            bathrooms:
              aiData.no_bathroom !== undefined
                ? Number(aiData.no_bathroom)
                : initialRequestFormState.bathrooms,
            no_master_bedroom:
              aiData.no_master_room !== undefined
                ? Number(aiData.no_master_room)
                : initialRequestFormState.no_master_bedroom,

            furnish_type: furnishType,
            deal_type: aiData.deal_type
              ? aiData.deal_type.toLowerCase() === "side-by-side"
                ? "Side-by-Side"
                : "50:50"
              : initialRequestFormState.deal_type,
            whatsapp_message: aiData.whatsapp_message || whatsappInput,
            reference_id: aiData.reference_id,

            // locations: ... (Skipped here)

            property_types_required:
              propertyTypesRequired.length > 0
                ? propertyTypesRequired
                : initialRequestFormState.property_types_required,
            options_required: requestOptions,

            client_name: aiData.client?.name || "",
            client_phone: aiData.client?.phone || "",
            client_email: aiData.client?.email || "",

            tag: tagObj,
            is_urgent:
              aiData.urgent !== undefined
                ? aiData.urgent
                : initialRequestFormState.is_urgent,
            bua: aiData.bua || initialRequestFormState.bua,
            is_direct:
              aiData.direct && aiData.direct != "Not provided"
                ? aiData.direct
                : initialRequestFormState.is_direct,
            source: aiData.source || initialRequestFormState.source,
          };

          setRequestForm((prev) => ({ ...prev, ...updateData }));

          const unfilledFields: UnfilledFields = {};
          unfilledFields.price = !checkFieldFilled(
            budgetObj.price,
            initialRequestFormState.price
          );
          setUnfilledFields(unfilledFields);
        } else {
          // =========================================================
          // INVENTORY MAPPING
          // =========================================================

          const requestOptions =
            aiData.inventory_options &&
            typeof aiData.inventory_options === "object" &&
            !Array.isArray(aiData.inventory_options)
              ? Object.keys(aiData.inventory_options)
              : aiData.more_options
              ? String(aiData.more_options).split(",")
              : [];

          const propertyTypeObj = findPropertyType(aiData.property_type);
          const tagObj = findTag(aiData.tag);

          // Price Logic
          const priceObj = aiData.Price || {};
          const finalPrice =
            aiData.egp_price !== undefined
              ? Number(aiData.egp_price)
              : priceObj.price !== undefined
              ? priceObj.price
              : initialFormState.price;

          const finalTransaction = aiData.transaction_type
            ? aiData.transaction_type
            : priceObj.transaction || initialFormState.transaction;

          const updateData: Partial<InventoryForm> = {
            type: aiData.type === "sell" ? "For Sale" : "For Rent",
            property_type: propertyTypeObj || initialFormState.property_type,
            furnish_type:
              capitalizeFirst(aiData.furnish_type) ||
              initialFormState.furnish_type,

            price: finalPrice,
            currency: priceObj.currency || "EGP",
            transaction: capitalizeFirst(finalTransaction),

            duration:
              aiData.duration_period !== undefined
                ? Number(aiData.duration_period)
                : priceObj.duration?.period || initialFormState.duration,
            duration_type:
              aiData.duration_type ||
              priceObj.duration?.type ||
              initialFormState.duration_type,
            start_date:
              priceObj.duration?.start_date || initialFormState.start_date,
            end_date: priceObj.duration?.end_date || initialFormState.end_date,

            bedrooms:
              aiData.no_bedroom !== undefined
                ? Number(aiData.no_bedroom)
                : initialFormState.bedrooms,
            bathrooms:
              aiData.no_bathroom !== undefined
                ? Number(aiData.no_bathroom)
                : initialFormState.bathrooms,
            no_master_bedroom:
              aiData.no_master_room !== undefined
                ? Number(aiData.no_master_room)
                : initialFormState.no_master_bedroom,

            // location: ... (Skipped)

            tag: tagObj || initialFormState.tag,
            deal_type: aiData.deal_deal_type
              ? aiData.deal_deal_type === "Side-by-Side"
                ? "Side-by-Side"
                : "50:50"
              : initialFormState.deal_type,
            is_urgent:
              aiData.urgent !== undefined
                ? aiData.urgent
                : initialFormState.is_urgent,
            whatsapp_message: aiData.whatsapp_message || whatsappInput,
            reference_id: aiData.reference_id,

            bua: aiData.bua || initialFormState.bua,
            is_direct:
              aiData.direct && aiData.direct != "Not provided"
                ? aiData.direct
                : initialFormState.is_direct,
            options_required: requestOptions,

            privacy:
              capitalizeFirst(aiData.privacy) || initialFormState.privacy,
            source: aiData.source || initialFormState.source,
          };

          setInventoryForm((prev) => ({ ...prev, ...updateData }));

          const unfilledFields: UnfilledFields = {};
          unfilledFields.price = !checkFieldFilled(
            finalPrice,
            initialFormState.price
          );
          setUnfilledFields(unfilledFields);
        }

        setWhatsappInput(aiData.whatsapp_message || whatsappInput);
        setMessage(
          "Form fields auto-filled (except location). Please verify location below."
        );
      } catch (e) {
        console.error("JSON Parsing Error:", e);
      }
      // ✅ تم إزالة dropdownOptions و setDropdownOptions من هنا لأنهم غير مستخدمين داخلياً
    },
    [
      setInventoryForm,
      setRequestForm,
      setWhatsappInput,
      findPropertyType,
      findTag,
      checkFieldFilled,
      setUnfilledFields,
    ]
  );

  const getSingleMessage = useCallback(async (id: string) => {
    try {
      const response = await fetchSingleMessage(id);
      return response;
    } catch (error) {
      console.error(error);
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
    getSingleMessage,
  };
};
