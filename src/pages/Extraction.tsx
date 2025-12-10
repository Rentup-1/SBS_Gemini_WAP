import {
  getFurnishedTypes,
  getPropertyTypes,
  getTags,
  saveInventory,
  saveRequest,
} from "@/api/core";
import AIPanel from "@/components/ai/AIPanel";
import InventoryForm from "@/components/forms/InventoryForm";
import RequestForm from "@/components/forms/RequestForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { InventoryPayload, Message, RequestPayload } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ArrowLeft, Loader2, LogOut, Sparkles } from "lucide-react";
import { useState } from "react";
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
      whatsapp_msg: message?.content || "",
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
      whatsapp_msg: message?.content || "",
      property_type_ids: [],
      tag: 0,
      furnish_type: null,
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
      // navigate("/");
    },
    onError: (error) => {
      const err = error as AxiosError<{ furnish_type: string[] }>;
      console.log(err);

      toast({
        title: "Error Saving Inventory",
        description: err.response?.data?.furnish_type[0],
      });
    },

    //   if (isAxiosError(error) && error.response?.data) {
    //     const errorData = error.response.data;

    //     if (errorData.detail) {
    //       toast({
    //         title: "Operation Failed",
    //         description: errorData.detail,
    //         variant: "destructive",
    //       });
    //       return;
    //     }

    //     if (Array.isArray(errorData.non_field_errors)) {
    //       toast({
    //         title: "Error",
    //         description: errorData.non_field_errors[0],
    //         variant: "destructive",
    //       });
    //       return;
    //     }
    //     const apiErrors = errorData as Record<string, string[]>;
    //     let firstErrorMessage = "";

    //     Object.keys(apiErrors).forEach((key, index) => {
    //       const msg = apiErrors[key][0];

    //       if (index === 0) firstErrorMessage = `${key}: ${msg}`;

    //       if (formType === "inventory") {
    //         inventoryForm.setError(key as any, {
    //           type: "server",
    //           message: msg,
    //         });
    //       } else {
    //         requestForm.setError(key as any, { type: "server", message: msg });
    //       }
    //     });

    //     toast({
    //       title: "Validation Error",
    //       description: firstErrorMessage
    //         ? `${firstErrorMessage} (and others)`
    //         : "Please check the form fields.",
    //       variant: "destructive",
    //     });
    //   } else {
    //     toast({
    //       title: "Network Error",
    //       description: "Something went wrong. Please check your connection.",
    //       variant: "destructive",
    //     });
    //   }
    // },
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
    inventoryMutation.mutate({
      ...data,
      phone: message.phone_number,
      message_id: message.id,
    });
  };

  const handleSaveRequest = (data: RequestPayload) => {
    if (!currentMessage) return;
    requestMutation.mutate({
      ...data,
      phone: message.phone_number,
      message_id: message.id,
    });
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

  console.log(currentMessage);

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
