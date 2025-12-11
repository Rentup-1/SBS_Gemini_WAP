import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";

interface AIMessageViewProps {
  text: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  date: string;
}

export const AIMessageView = ({
  text,
  onChange,
  onGenerate,
  isLoading,
  date,
}: AIMessageViewProps) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <Label className="text-xs text-muted-foreground">
          WAP Message (Editable)
        </Label>
        <span className="text-[10px] text-muted-foreground">{date}</span>
      </div>
      <Textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] text-sm bg-white focus-visible:ring-blue-500"
      />
      <Button
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Sparkles className="w-4 h-4 mr-2" />
        )}
        Regenerate AI Data
      </Button>
    </div>
  );
};
