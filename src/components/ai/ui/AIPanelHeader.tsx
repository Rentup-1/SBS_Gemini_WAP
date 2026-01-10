import { sendWhatsAppReply } from "@/api/messages";
import { WhatsAppReplyDialog } from "@/components/dialogs/WhatsAppReplyDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { Message, UserType } from "@/types";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Loader2,
  MessageCircle,
  Phone,
  TagIcon,
  User,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useState } from "react";

interface AIPanelHeaderProps {
  message: Message;
  currentIndex: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  existingUser?: UserType | null;
  isLoadingUser?: boolean;
}

export const AIPanelHeader = ({
  message,
  currentIndex,
  total,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  existingUser,
  isLoadingUser,
}: AIPanelHeaderProps) => {
  // State for the reply message
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Default message template (Optional)
  const defaultTemplate = `Welcome to SBS Brokerz! \nSince you are a new user, please complete your registration here: \nhttps://sbs-brokerz.com/register?phone=${message.phone_number}`;
  return (
    <div className="bg-slate-50 border rounded-lg p-4 space-y-3">
      {/* 1. The Reusable Dialog Component */}
      <WhatsAppReplyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        phoneNumber={message.phone_number}
        phone_number_type={message.type}
        defaultMessage={defaultTemplate}
      />
      {/*  Pagination */}
      <div className="flex items-center justify-between border-b pb-3 mb-2 border-slate-200">
        <div className=" flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrev}
            disabled={!hasPrev}
            className="h-8 w-8 p-0 hover:bg-slate-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-semibold text-slate-500">
            Message {currentIndex} of {total}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            disabled={!hasNext}
            className="h-8 w-8 p-0 hover:bg-slate-200"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {/* --- User Status Badge --- */}
        <div>
          {isLoadingUser ? (
            <Badge variant="outline" className="text-slate-500 bg-white gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Checking...
            </Badge>
          ) : existingUser ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 gap-1.5 px-3 py-1">
              <UserCheck className="w-4 h-4" />
              <span>Existing: {existingUser.name || "Unknown Name"}</span>
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 gap-1.5 px-3 py-1 cursor-pointer"
              onClick={() => setIsDialogOpen(true)}
            >
              <UserPlus className="w-4 h-4" />
              <span>New User (Click to Reply)</span>
            </Badge>
          )}
        </div>
      </div>

      {/* User Info Grid */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <InfoItem
          icon={User}
          label="WhatsApp Username"
          value={message.username || "Unknown"}
        />
        <InfoItem
          icon={Phone}
          label="WhatsApp Phone"
          value={message.phone_number}
        />
        <InfoItem
          icon={Globe}
          label="Status"
          value={message.listing_status || "Unknown"}
          valueClass={
            message.listing_status === "not_listed"
              ? "text-red-600"
              : "text-green-600"
          }
        />
        <InfoItem icon={MessageCircle} label="Message ID" value={message.id} />
        <InfoItem
          icon={TagIcon}
          label="Type"
          value={message.type}
          valueClass="text-blue-700 capitalize"
        />
        {existingUser && (
          <InfoItem
            icon={UserCheck}
            label="System User ID"
            value={`#${existingUser.id}`}
            valueClass="text-green-700 font-bold"
          />
        )}
      </div>
    </div>
  );
};

const InfoItem = ({
  icon: Icon,
  label,
  value,
  valueClass = "text-slate-800",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | null;
  valueClass?: string;
}) => (
  <div className="space-y-1">
    <span className="text-xs text-muted-foreground flex items-center gap-1">
      <Icon className="w-3 h-3" /> {label}
    </span>
    <p className={`font-medium ${valueClass}`}>{value}</p>
  </div>
);
