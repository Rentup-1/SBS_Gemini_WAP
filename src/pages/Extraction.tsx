import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import {
  getTags,
  getPropertyTypes,
  getFurnishedTypes,
  saveInventory,
  saveRequest,
} from "@/api/core";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, LogOut, Sparkles } from "lucide-react";
import InventoryForm from "@/components/forms/InventoryForm";
import RequestForm from "@/components/forms/RequestForm";
import AIPanel from "@/components/ai/AIPanel";
import type { InventoryPayload, RequestPayload, Message } from "@/types"; 
import { AxiosError } from "axios";

const Extraction = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();

  const state = location.state as { fullMessage: Message } | null;
  const message = state?.fullMessage;

  const [formType, setFormType] = useState<"inventory" | "request">(
    message?.type?.toLowerCase() === "request" ? "request" : "inventory"
  );

  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });
  const { data: propertyTypes = [] } = useQuery({
    queryKey: ["propertyTypes"],
    queryFn: getPropertyTypes,
  });
  const { data: furnishedTypes = [] } = useQuery({
    queryKey: ["furnishedTypes"],
    queryFn: getFurnishedTypes,
  });

  // 1. Inventory Form Definition
  const inventoryForm = useForm<InventoryPayload>({
    defaultValues: {
      source: "APP",
      type: "for_rent",
      privacy: "public",
      deal_deal_type: "Side-by-Side",
      urgent: false,
      direct: false,
      active: false,
      whatsapp_msg: message?.message || "",
      property_type: 0,
      tag: 0,
      furnish_type: 0,
      location: 0,
      egp_price: "0",
      usd_price: "0",
      no_bedroom: 0,
      no_bathroom: 0,
      no_master_room: 0,
      bua: 0,
      additional_notes: "",
      inventory_options: {},
      locations_text: {},
      duration_period: "0",
      duration_type: "MONTHLY",
      installment_period: "0",
      installment_type: "MONTHLY",
      listing_code: "0",
      transaction_type: "MONTHLY",
      duration_start_date: new Date().toISOString().split("T")[0],
      duration_end_date: new Date().toISOString().split("T")[0],
      fuzzy_status: "DONE",
    },
  });

  // 2. Request Form Definition
  const requestForm = useForm<RequestPayload>({
    defaultValues: {
      source: "APP",
      type: "rent",
      privacy: "public",
      deal_type: "Side-by-Side",
      urgent: true,
      direct: true,
      whatsapp_msg: message?.message || "",
      property_type_ids: [],
      tag: 0,
      furnish_type: 0,
      exact_location_ids: [],
      suggested_location_ids: [],
      exact_locations_text: {},
      suggested_locations_text: {},
      egp_budget: "0",
      usd_budget: "0",
      no_bedroom: 0,
      no_bathroom: 0,
      no_master_room: 0,
      bua: 0,
      transaction_type: "MONTHLY",
      duration_type: "MONTHLY",
      installment_period: "0",
      installment_type: "MONTHLY",
      duration_start_date: new Date().toISOString().split("T")[0],
      duration_end_date: new Date().toISOString().split("T")[0],
    },
  });

  const inventoryMutation = useMutation({
    mutationFn: (data: InventoryPayload) => saveInventory(data),
    onSuccess: () => {
      toast({ title: "Success", description: "Inventory saved successfully!" });
      navigate("/");
    },
    onError: (error) => {
      const err = error as AxiosError<{ message: string }>;
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to save",
        variant: "destructive",
      });
    },
  });

  const requestMutation = useMutation({
    mutationFn: (data: RequestPayload) => saveRequest(data),
    onSuccess: () => {
      toast({ title: "Success", description: "Request saved successfully!" });
      navigate("/");
    },
    onError: (error) => {
      const err = error as AxiosError<{ message: string }>;
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to save",
        variant: "destructive",
      });
    },
  });

  const handleSaveInventory = (data: InventoryPayload) => {
    if (!message) return;
    inventoryMutation.mutate({
      ...data,
    });
  };

  const handleSaveRequest = (data: RequestPayload) => {
    if (!message) return;
    requestMutation.mutate({
      ...data,
    });
  };

  if (!message) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="p-8 text-center shadow-lg border">
          <p className="text-muted-foreground mb-4">No message selected</p>
          <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const activeForm = formType === "inventory" ? inventoryForm : requestForm;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-xl font-bold text-slate-800">
            AI Ingestion System
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      <div className="flex-1 p-4 md:p-6 w-full max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT COLUMN: FORM */}
          <div className="w-full lg:w-7/12 flex flex-col gap-4">
            <Card className="bg-white border shadow-sm p-4 md:p-6">
              {formType === "inventory" ? (
                <FormProvider {...inventoryForm}>
                  <form
                    onSubmit={inventoryForm.handleSubmit(handleSaveInventory)}
                  >
                    <InventoryForm
                      propertyTypes={propertyTypes}
                      tags={tags}
                      furnishedTypes={furnishedTypes}
                      message={message}
                    />
                    <div className="sticky bottom-0 bg-white pt-4 mt-4 border-t z-10">
                      <Button
                        type="submit"
                        disabled={inventoryMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700 text-white h-11"
                      >
                        {inventoryMutation.isPending ? (
                          <Loader2 className="animate-spin mr-2" />
                        ) : null}{" "}
                        Save Inventory
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              ) : (
                <FormProvider {...requestForm}>
                  <form onSubmit={requestForm.handleSubmit(handleSaveRequest)}>
                    <RequestForm
                      propertyTypes={propertyTypes}
                      tags={tags}
                      furnishedTypes={furnishedTypes}
                      message={message}
                    />
                    <div className="sticky bottom-0 bg-white pt-4 mt-4 border-t z-10">
                      <Button
                        type="submit"
                        disabled={requestMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700 text-white h-11"
                      >
                        {requestMutation.isPending ? (
                          <Loader2 className="animate-spin mr-2" />
                        ) : null}{" "}
                        Save Request
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              )}
            </Card>
          </div>

          {/* RIGHT COLUMN: AI PANEL */}
          <div className="w-full lg:w-5/12 lg:sticky lg:top-20">
            <Card className="bg-white border shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-100px)]">
              <div className="p-4 border-b bg-slate-50 font-semibold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Parsing WhatsApp Message
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <AIPanel
                  message={message}
                  formType={formType}
                  onToggleType={() =>
                    setFormType((prev) =>
                      prev === "inventory" ? "request" : "inventory"
                    )
                  }
                  form={activeForm}
                  propertyTypes={propertyTypes}
                  furnishedTypes={furnishedTypes}
                  tags={tags}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Extraction;
