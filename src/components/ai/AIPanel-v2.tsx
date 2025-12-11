import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { FurnishedType, Message, PropertyType, Tag } from "@/types";
import {
  ArrowRightLeft
} from "lucide-react";
import { useAIParser } from "./hooks/useAIParser";
import { useLocationMatcher } from "./hooks/useLocationMatcher";
import { AIDebugView } from "./ui/AIDebugView"; 
import { AILocationManager } from "./ui/AILocationManager"; 
import { AIMessageView } from "./ui/AIMessageView"; 
import { AIPanelHeader } from "./ui/AIPanelHeader";

interface AIPanelProps {
  message: Message;
  formType: "inventory" | "request";
  onToggleType: () => void;
  form;
  propertyTypes: PropertyType[];
  furnishedTypes: FurnishedType[];
  tags: Tag[];
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  currentIndex: number;
  total: number;
}

const AIPanel = ({
  message,
  formType,
  onToggleType,
  form,
  propertyTypes,
  furnishedTypes,
  tags,
  ...navProps
}: AIPanelProps) => {
  const aiLogic = useAIParser({
    initialMessage: message.content,
    formType,
    form,
    propertyTypes,
    furnishedTypes,
    tags,
  });

  const locLogic = useLocationMatcher({
    form,
    formType,
    aiResponse: aiLogic.aiResponse,
  });

  // Combine results for display
  const allMatches = [
    ...(locLogic.results.fuzzyResults?.exact_matches || []).map((m) => ({
      ...m,
      type: "exact" as const,
    })),
    ...(locLogic.results.fuzzyResults?.suggested_matches || []).map((m) => ({
      ...m,
      type: "suggested" as const,
    })),
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <AIPanelHeader message={message} {...navProps} />

      {/* Switcher & Message Input */}
      <Button
        onClick={onToggleType}
        className="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-200"
        variant="outline"
      >
        <ArrowRightLeft className="w-4 h-4 mr-2" /> Switch to:{" "}
        {formType === "inventory" ? "Request" : "Inventory"}
      </Button>
      <AIMessageView
        text={aiLogic.msgText}
        onChange={aiLogic.setMsgText}
        onGenerate={() => aiLogic.generateData()}
        isLoading={aiLogic.isProcessing}
        date={new Date(message.timestamp).toLocaleDateString()}
      />
      <Separator />

      {/* 4. AI Debug View */}
      <AIDebugView data={aiLogic.aiResponse} />
      {/* 5. Location Manager */}
      <AILocationManager
        inputs={locLogic.inputs}
        results={locLogic.results}
        actions={locLogic.actions}
        isSearching={locLogic.isSearching}
        formType={formType}
      />

      

      <div className="h-10"></div>
    </div>
  );
};

export default AIPanel;
