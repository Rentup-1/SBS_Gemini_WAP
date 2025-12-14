import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { sendWhatsAppReply } from "@/api/messages";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Send } from "lucide-react";

interface WhatsAppReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string | null;
  defaultMessage?: string;
  phone_number_type?: string;
  onSuccess?: () => void;
}

export const WhatsAppReplyDialog = ({
  open,
  onOpenChange,
  phoneNumber,
  phone_number_type,
  defaultMessage = "",
  onSuccess,
}: WhatsAppReplyDialogProps) => {
  const [replyText, setReplyText] = useState(defaultMessage);

  useEffect(() => {
    if (open) {
      setReplyText(defaultMessage);
    }
  }, [open, defaultMessage]);

  const replyMutation = useMutation({
    mutationFn: async () => {
      if (!phoneNumber) throw new Error("No phone number provided");

      return sendWhatsAppReply({
        phone_number: phoneNumber,
        message: replyText,
        phone_number_type: phone_number_type,
      });
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: `Reply sent successfully to ${phoneNumber}`,
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Failed to Send",
        description: "Could not send WhatsApp message.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send WhatsApp Reply</DialogTitle>
          <DialogDescription>
            Sending message to:{" "}
            <span className="font-semibold">{phoneNumber}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="message">Message Body</Label>
            <Textarea
              id="message"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="h-32"
              placeholder="Type your message here..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={replyMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={() => replyMutation.mutate()}
            disabled={replyMutation.isPending || !replyText.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {replyMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
