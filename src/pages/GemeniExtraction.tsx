import { useState, useCallback, useEffect } from "react";
import {
  type InventoryForm,
  type LocationState,
  type Message,
  type RequestForm,
} from "../interfaces";
import { useDropdownData } from "../hooks/useDropdownData";
import { useFormHandlers } from "../hooks/useFormHandlers";
import { useAIParsing } from "../hooks/useAIParsing";
import { InventoryForm as InventoryFormComponent } from "../components/forms/InventoryForm";
import { RequestForm as RequestFormComponent } from "../components/forms/RequestForm";
import { AIPanel } from "../components/ai/AIPanel";
import { useLocation } from "react-router-dom";

export default function GemeniExtraction() {
  const [phoneStatus, setPhoneStatus] = useState<"Inventory" | "Request">(
    "Inventory"
  );
  const [response, setResonse] = useState<Message>();
  const { dropdownOptions } = useDropdownData({ formType: phoneStatus });
  const {
    form,
    setForm,
    requestForm,
    setRequestForm,
    inventoryTransactionOptions,
    requestTransactionOptions,
    handleInventoryInputChange,
    handleRequestInputChange,
    handleLocationChange,
    handleMultiSelectChange,
    handleObjectChanges,
  } = useFormHandlers(dropdownOptions);

  const [whatsappInput, setWhatsappInput] = useState("");
  const [savedData] = useState<Array<InventoryForm | RequestForm>>([]);
  const [loading, setLoading] = useState(false);
  const location: LocationState = useLocation();

  const {
    aiResponseRaw,
    loading: aiLoading,
    message,
    setMessage,
    handleGeminiParse,
    handleConfirmParse,
    getSingleMessage,
    setAiResponseRaw,
  } = useAIParsing(setForm, setRequestForm, setWhatsappInput);

  useEffect(() => {
    if (location && location?.state && location?.state?.type) {
      setPhoneStatus(location?.state?.type);
    }
    const fetchSingleMessage = async () => {
      if (location && location?.state && location?.state?.id) {
        const res = await getSingleMessage(location?.state?.id);
        setResonse(res);
        setWhatsappInput(res?.message || "");
      }
    };
    fetchSingleMessage();
  }, [location, getSingleMessage]);
  function formatDateToDDMMYYYY(isoString: string): string {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const handleSaveData = useCallback(async () => {
    try {
      setLoading(true);
      setMessage(`Saving ${phoneStatus.toLowerCase()} listing...`);

      const isInventory = phoneStatus === "Inventory";
      const data = isInventory ? form : requestForm;

      const submissionData = {
        type: isInventory
          ? data.type === "For Rent"
            ? "for_rent"
            : "sell"
          : data.type === "Rent"
          ? "rent"
          : "buy",
        deal_type: data.deal_type,
        property_type_id: isInventory
          ? (data as InventoryForm).property_type?.id
          : (data as RequestForm).property_types_required,
        location_id: isInventory
          ? (data as InventoryForm).location?.id
          : (data as RequestForm).locations?.map((loc) => loc.id),
        no_bedroom: data.bedrooms,
        no_bathroom: data.bathrooms,
        user_id: isInventory
          ? (data as InventoryForm).listed_by?.id
          : (data as RequestForm).client_user?.id,
        agent_assigned_id: isInventory
          ? (data as InventoryForm).listed_by?.id
          : (data as RequestForm).client_user?.id,
        urgent: data.is_urgent,
        privacy: isInventory ? "public" : (data as RequestForm).privacy,
        tag_id: (data as InventoryForm).tag?.id ?? (data as RequestForm).tag,
        furnish_type_id:
          dropdownOptions.furnishTypes?.indexOf(data.furnish_type) ?? -1,
        budget: {
          transaction: data.transaction?.toLowerCase(),
          price: data.price,
          currency: data.currency,
          ...(data.type === "For Rent" || data.type === "Rent"
            ? {
                duration: {
                  period: data.duration,
                  type: data.duration_type,
                  start_date: formatDateToDDMMYYYY(data.start_date?.toString()),
                  end_date: formatDateToDDMMYYYY(data.end_date?.toString()),
                },
              }
            : {}),
          // instalment_period: {
          //   period: data.duration || 12,
          //   type: "months",
          // },
        },
      };

      const endpoint = isInventory
        ? "https://sbsapi.rentup.com.eg/api/inventories/add"
        : "https://sbsapi.rentup.com.eg/api/requests/add";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer 4e14bf9daafbe8d1fba7bf82f173b873",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Success:", result);

      setMessage(`${phoneStatus} listing saved successfully!`);
    } catch (error) {
      console.error("❌ Error saving data:", error);
      setMessage("Failed to save listing. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [form, requestForm, phoneStatus, dropdownOptions, setMessage]);

  const renderMainFormWrapper = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full overflow-y-auto">
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {["Inventory", "Request"].map((tab) => (
            <button
              key={tab}
              onClick={() => setPhoneStatus(tab as "Inventory" | "Request")}
              className={`
                ${
                  phoneStatus === tab
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
                whitespace-nowrap py-3 px-1 border-b-2 text-sm transition duration-150
              `}
            >
              {tab} Form
            </button>
          ))}
        </nav>
      </div>

      {phoneStatus === "Inventory" ? (
        <InventoryFormComponent
          form={form}
          dropdownOptions={dropdownOptions}
          inventoryTransactionOptions={inventoryTransactionOptions}
          onChange={handleInventoryInputChange}
          handleObjectChanges={handleObjectChanges}
        />
      ) : (
        <RequestFormComponent
          form={requestForm}
          dropdownOptions={dropdownOptions}
          requestTransactionOptions={requestTransactionOptions}
          onChange={handleRequestInputChange}
          onLocationChange={handleLocationChange}
          handleMultiSelectChange={handleMultiSelectChange}
        />
      )}

      <div className="mt-8 pt-4 border-t">
        <button
          onClick={handleSaveData}
          disabled={
            loading ||
            aiLoading ||
            (phoneStatus === "Inventory" && (!form.location || !form.price)) ||
            (phoneStatus === "Request" &&
              (!requestForm.locations || !requestForm.price))
          }
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            `Save ${phoneStatus} Data`
          )}
        </button>
      </div>

      {savedData.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Saved Items ({savedData.length})
          </h4>
          <div className="text-xs text-gray-600 space-y-1 max-h-40 overflow-y-auto">
            {savedData.map((item, idx) => (
              <div key={idx} className="p-2 bg-white rounded border">
                {(item as any).id} - {(item as any).location || "No location"}
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
        <h1 className="text-3xl font-extrabold text-gray-900">
          AI Ingestion System
        </h1>
      </header>
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        <div className="lg:w-7/12">{renderMainFormWrapper()}</div>
        <div className="lg:w-5/12">
          <AIPanel
            whatsappInput={whatsappInput}
            setWhatsappInput={setWhatsappInput}
            aiResponseRaw={aiResponseRaw}
            setAiResponseRaw={setAiResponseRaw}
            loading={aiLoading}
            message={message}
            phoneStatus={phoneStatus}
            setPhoneStatus={setPhoneStatus}
            customerName={response?.contactName}
            customerId={response?.userId}
            userName={response?.contactName}
            userPhone={response?.contactPhone}
            form={form}
            onGenerate={() => handleGeminiParse(whatsappInput, phoneStatus)}
            onConfirm={() =>
              handleConfirmParse(aiResponseRaw, whatsappInput, phoneStatus)
            }
          />
        </div>
      </div>
    </div>
  );
}
