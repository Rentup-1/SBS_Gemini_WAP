import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { AIProcessResponse } from "@/types";

export const AIDebugView = ({ data }: { data: AIProcessResponse | null }) => {
  if (!data) return null;

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-center">
        <Label className="text-xs font-semibold text-slate-700">
          AI Response JSON
        </Label>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[10px]"
          onClick={() =>
            navigator.clipboard.writeText(JSON.stringify(data, null, 2))
          }
        >
          <Copy className="w-3 h-3 mr-1" /> Copy
        </Button>
      </div>
      <Textarea
        value={JSON.stringify(data, null, 2)}
        readOnly
        className="font-mono text-[10px] h-40 bg-slate-900 text-green-400 border-slate-800 rounded-md p-3"
      />
    </div>
  );
};
