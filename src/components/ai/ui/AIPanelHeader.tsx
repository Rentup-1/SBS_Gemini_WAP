import { Button } from "@/components/ui/button";
import {
  User,
  Phone,
  Globe,
  MessageCircle,
  TagIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Message } from "@/types";

interface AIPanelHeaderProps {
  message: Message;
  currentIndex: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export const AIPanelHeader = ({
  message,
  currentIndex,
  total,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: AIPanelHeaderProps) => {
  return (
    <div className="bg-slate-50 border rounded-lg p-4 space-y-3">
      {/* Pagination */}
      <div className="flex items-center justify-between border-b pb-3 mb-2 border-slate-200">
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

      {/* User Info Grid */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <InfoItem
          icon={User}
          label="WhatsApp Username"
          value={message.username || "Unknown"}
        />
        <InfoItem icon={Phone} label="WhatsApp Phone" value={message.phone_number} />
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
