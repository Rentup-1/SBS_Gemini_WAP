import { useState, useCallback } from 'react';
import { type InventoryForm, type RequestForm } from '../interfaces';
import { useDropdownData } from '../hooks/useDropdownData';
import { useFormHandlers } from '../hooks/useFormHandlers';
import { useAIParsing } from '../hooks/useAIParsing';
import { InventoryForm as InventoryFormComponent } from '../components/forms/InventoryForm';
import { RequestForm as RequestFormComponent } from '../components/forms/RequestForm';
import { AIPanel } from '../components/ai/AIPanel';

export default function Home() {
  const { dropdownOptions } = useDropdownData();
  const {
    form,
    setForm,
    requestForm,
    inventoryTransactionOptions,
    requestTransactionOptions,
    handleInventoryInputChange,
    handleRequestInputChange
  } = useFormHandlers(dropdownOptions);

  const [whatsappInput, setWhatsappInput] = useState('');
  const [phoneStatus, setPhoneStatus] = useState<'Inventory' | 'Request'>('Inventory');
  const [savedData, setSavedData] = useState<Array<InventoryForm | RequestForm>>([]);
  const [loading, setLoading] = useState(false);
  const customerName = 'New/Existing Customer';
  const customerId = 'N/A';

  const {
    aiResponseRaw,
    loading: aiLoading,
    message,
    setMessage,
    handleGeminiParse,
    handleConfirmParse
  } = useAIParsing(setForm, setWhatsappInput);

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
  }, [form, requestForm, phoneStatus, setMessage]);

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

      {phoneStatus === 'Inventory' ? (
        <InventoryFormComponent
          form={form}
          dropdownOptions={dropdownOptions}
          inventoryTransactionOptions={inventoryTransactionOptions}
          onChange={handleInventoryInputChange}
        />
      ) : (
        <RequestFormComponent
          form={requestForm}
          dropdownOptions={dropdownOptions}
          requestTransactionOptions={requestTransactionOptions}
          onChange={handleRequestInputChange}
        />
      )}

      <div className="mt-8 pt-4 border-t">
        <button
          onClick={handleSaveData}
          disabled={loading || aiLoading || (phoneStatus === 'Inventory' && (!form.location || !form.price)) || (phoneStatus === 'Request' && (!requestForm.location || !requestForm.price))}
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
          <AIPanel
            whatsappInput={whatsappInput}
            setWhatsappInput={setWhatsappInput}
            aiResponseRaw={aiResponseRaw}
            loading={aiLoading}
            message={message}
            phoneStatus={phoneStatus}
            setPhoneStatus={setPhoneStatus}
            customerName={customerName}
            customerId={customerId}
            form={form}
            onGenerate={() => handleGeminiParse(whatsappInput)}
            onConfirm={() => handleConfirmParse(aiResponseRaw, whatsappInput)}
          />
        </div>
      </div>
    </div>
  );
}