import { coreApi, messagesApi } from "./axios";
import type { Message, ReplyPayload } from "@/types";

export const getMessages = async (): Promise<Message[]> => {
  const response = await coreApi.get("/whatsapp/messages/");
  return response.data;
};
export const sendWhatsAppReply = async (payload: ReplyPayload) => {
  const response = await coreApi.post("/whatsapp/messages/reply/", payload);
  return response.data;
};
