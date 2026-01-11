import { getUserByPhone } from "@/api/auth";
import {
  getFurnishedTypes,
  getPropertyTypes,
  getTags,
  saveInventory,
  saveRequest,
} from "@/api/core";
import AIPanel from "@/components/ai/AIPanel-v2";
import InventoryForm from "@/components/forms/InventoryForm";
import RequestForm from "@/components/forms/RequestForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { InventoryPayload, Message, RequestPayload, Tag } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ArrowLeft, Loader2, LogOut, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

const Extraction = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();

  const state = location.state as {
    fullMessage: Message;
    contextList?: Message[];
  } | null;
  const message = state?.fullMessage;
  const AllMessages = state?.contextList;
  const [currentMessage, setCurrentMessage] = useState<Message | null>(
    message || null
  );
  // --- Fetch Existing User Logic ---
  const { data: existingUser, isLoading: isUserLoading } = useQuery({
    queryKey: ["check-user", currentMessage?.phone_number],
    queryFn: () => getUserByPhone(currentMessage?.phone_number || ""),
    enabled: !!currentMessage?.phone_number,
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache result for 5 mins
  });
  const handleNavigateMessage = (direction: "next" | "prev") => {
    if (!AllMessages || !currentMessage) return;

    // know the index of the current message
    const currentIndex = AllMessages.findIndex(
      (m) => m.id === currentMessage.id
    );
    if (currentIndex === -1) return;

    const nextIndex =
      direction === "next" ? currentIndex + 1 : currentIndex - 1;

    // check if the next index is valid
    if (nextIndex >= 0 && nextIndex < state.contextList.length) {
      const nextMessage = AllMessages[nextIndex];

      // update the current message
      setCurrentMessage(nextMessage);

      // update the URL with the new message to be extracted when user refresh the page
      navigate("/extraction", {
        state: {
          fullMessage: nextMessage,
          contextList: state.contextList,
        },
        replace: true,
      });
      // scroll to the top of the page
      window.scrollTo(0, 0);
      setFormType(
        nextMessage.type?.toLowerCase() === "request" ? "request" : "inventory"
      );
    }
  };

  const currentIndex = AllMessages
    ? state.contextList.findIndex((m) => m.id === currentMessage?.id)
    : 0;
  const totalMessages = AllMessages?.length || 0;
  const hasNext = currentIndex < totalMessages - 1;
  const hasPrev = currentIndex > 0;

  const [formType, setFormType] = useState<"inventory" | "request">(
    message?.type?.toLowerCase() === "request" ? "request" : "inventory"
  );

  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ["tags", formType],
    queryFn: () => getTags(formType),
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
      source: "wap",
      type: "for_rent",
      privacy: "public",
      deal_type: "Side-by-Side",
      urgent: false,
      direct: false,
      active: false,
      whatsapp_msg: currentMessage?.content || "",
      property_type: null,
      tag: null,
      furnish_type: null,
      location: null,
      egp_price: "0",
      usd_price: "0",
      no_bedroom: 0,
      no_bathroom: 0,
      no_master_room: 0,
      bua: 0,
      additional_notes: "",
      inventory_options: {},
      locations_text: [],
      rent_duration_period: "",
      rent_duration_type: "monthly",
      rent_duration_start_date: new Date().toISOString().split("T")[0],
      rent_duration_end_date: new Date().toISOString().split("T")[0],
      installment_period_type: "monthly",
      installment_amount: "0",
      total_installment_period: "0",
      installment_payment_plan: "",
      listing_code: "",
      transaction_type: "monthly",
      fuzzy_status: "DONE",
    },
  });

  // 2. Request Form Definition
  const requestForm = useForm<RequestPayload>({
    defaultValues: {
      source: "wap",
      type: "rent",
      privacy: "public",
      deal_type: "Side-by-Side",
      urgent: false,
      direct: false,
      active: false,
      whatsapp_msg: currentMessage?.content || "",
      property_type_ids: [],
      tag: 0,
      furnish_type: null,
      exact_location_ids: [],
      suggested_location_ids: [],
      exact_locations_text: [],
      suggested_locations_text: [],
      egp_budget: "0",
      usd_budget: "0",
      no_bedroom: 0,
      no_bathroom: 0,
      no_master_room: 0,
      bua: 0,
      transaction_type: "monthly",
      rent_duration_period: "",
      rent_duration_type: "monthly",
      rent_duration_start_date: new Date().toISOString().split("T")[0],
      rent_duration_end_date: new Date().toISOString().split("T")[0],
      installment_period_type: "monthly",
      installment_amount: "0",
      total_installment_period: "0",
      installment_payment_plan: "",
    },
  });

  // Reset forms when currentMessage changes
  useEffect(() => {
    if (!currentMessage) return;

    const today = new Date().toISOString().split("T")[0];

    // Reset inventory form with new message data
    inventoryForm.reset({
      source: "wap",
      type: "for_rent",
      privacy: "public",
      deal_type: "Side-by-Side",
      urgent: false,
      direct: false,
      active: false,
      whatsapp_msg: currentMessage.content || "",
      property_type: null,
      tag: null,
      furnish_type: null,
      location: null,
      egp_price: "0",
      usd_price: "0",
      no_bedroom: 0,
      no_bathroom: 0,
      no_master_room: 0,
      bua: 0,
      additional_notes: "",
      inventory_options: {},
      locations_text: [],
      rent_duration_period: "",
      rent_duration_type: "monthly",
      rent_duration_start_date: today,
      rent_duration_end_date: today,
      installment_period_type: "monthly",
      installment_amount: "0",
      total_installment_period: "0",
      installment_payment_plan: "",
      listing_code: "",
      transaction_type: "monthly",
      fuzzy_status: "DONE",
    });

    // Reset request form with new message data
    requestForm.reset({
      source: "wap",
      type: "rent",
      privacy: "public",
      deal_type: "Side-by-Side",
      urgent: false,
      direct: false,
      active: false,
      whatsapp_msg: currentMessage.content || "",
      property_type_ids: [],
      tag: 0,
      furnish_type: null,
      exact_location_ids: [],
      suggested_location_ids: [],
      exact_locations_text: [],
      suggested_locations_text: [],
      egp_budget: "0",
      usd_budget: "0",
      no_bedroom: 0,
      no_bathroom: 0,
      no_master_room: 0,
      bua: 0,
      transaction_type: "monthly",
      rent_duration_period: "",
      rent_duration_type: "monthly",
      rent_duration_start_date: today,
      rent_duration_end_date: today,
      installment_period_type: "monthly",
      installment_amount: "0",
      total_installment_period: "0",
      installment_payment_plan: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMessage?.id]);

  const inventoryMutation = useMutation({
    mutationFn: (data: InventoryPayload) => saveInventory(data),
    onSuccess: () => {
      toast({ title: "Success", description: "Inventory saved successfully!" });
      // navigate("/");
    },
    onError: (error) => {
      const err = error as AxiosError<{ furnish_type: string[] }>;
      console.error("Inventory save error:", err);
      toast({
        title: "Error Saving Inventory",
        description:
          err.response?.data?.furnish_type?.[0] || "Failed to save inventory",
        variant: "destructive",
      });
    },
  });

  const requestMutation = useMutation({
    mutationFn: (data: RequestPayload) => saveRequest(data),
    onSuccess: () => {
      toast({ title: "Success", description: "Request saved successfully!" });
      // navigate("/");
    },
    onError: (error) => {
      const err = error as AxiosError<{ message: string }>;
      console.log(err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to save",
        variant: "destructive",
      });
    },
  });

  const handleSaveInventory = (data: InventoryPayload) => {
    if (!currentMessage) return;

    // Determine which fields to null out based on type and transaction_type
    const isRent = data.type === "for_rent";
    const isSale = data.type === "for_sale";
    const isInstallment = data.transaction_type === "installment";

    // Build payload with nulled fields based on business logic
    const payload: InventoryPayload = {
      ...data,
      phone: message.phone_number,
      message_id: message.id,
      // for_rent: keep rent_duration, null installment
      // for_sale + cash: null both
      // for_sale + installment: null rent_duration, keep installment
      rent_duration_period: isRent ? data.rent_duration_period : null,
      rent_duration_type: isRent ? data.rent_duration_type : null,
      rent_duration_start_date: isRent ? data.rent_duration_start_date : null,
      rent_duration_end_date: isRent ? data.rent_duration_end_date : null,
      installment_period_type:
        isSale && isInstallment ? data.installment_period_type : null,
      installment_amount:
        isSale && isInstallment ? data.installment_amount : null,
      total_installment_period:
        isSale && isInstallment ? data.total_installment_period : null,
      installment_payment_plan:
        isSale && isInstallment ? data.installment_payment_plan : null,
    };

    inventoryMutation.mutate(payload);
  };

  const handleSaveRequest = (data: RequestPayload) => {
    if (!currentMessage) return;

    // Determine which fields to null out based on type and transaction_type
    const isRent = data.type === "rent";
    const isBuy = data.type === "buy";
    const isInstallment = data.transaction_type === "installment";

    // Build payload with nulled fields based on business logic
    const payload: RequestPayload = {
      ...data,
      phone: message.phone_number,
      message_id: message.id,
      // Convert null/undefined to 0 for room fields (backend rejects null)
      no_bedroom: data.no_bedroom ?? 0,
      no_bathroom: data.no_bathroom ?? 0,
      no_master_room: data.no_master_room ?? 0,
      // rent: keep rent_duration, null installment
      // buy + cash: null both
      // buy + installment: null rent_duration, keep installment
      rent_duration_period: isRent ? data.rent_duration_period : null,
      rent_duration_type: isRent ? data.rent_duration_type : null,
      rent_duration_start_date: isRent ? data.rent_duration_start_date : null,
      rent_duration_end_date: isRent ? data.rent_duration_end_date : null,
      installment_period_type:
        isBuy && isInstallment ? data.installment_period_type : null,
      installment_amount:
        isBuy && isInstallment ? data.installment_amount : null,
      total_installment_period:
        isBuy && isInstallment ? data.total_installment_period : null,
      installment_payment_plan:
        isBuy && isInstallment ? data.installment_payment_plan : null,
    };

    requestMutation.mutate(payload);
  };

  if (!currentMessage) {
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
                <FormProvider key={currentMessage.id} {...inventoryForm}>
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
                <FormProvider key={currentMessage.id} {...requestForm}>
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
                  key={currentMessage.id}
                  message={currentMessage}
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
                  onNext={() => handleNavigateMessage("next")}
                  onPrev={() => handleNavigateMessage("prev")}
                  hasNext={hasNext}
                  hasPrev={hasPrev}
                  currentIndex={currentIndex + 1}
                  total={totalMessages}
                  existingUser={existingUser}
                  isUserLoading={isUserLoading}
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
