import { coreApi, messagesApi } from "./axios";
import type { Message } from "@/types";

export const getMessages = async (): Promise<Message[]> => {
  const response = await coreApi.get("/whatsapp/messages/");
  return response.data;
};
