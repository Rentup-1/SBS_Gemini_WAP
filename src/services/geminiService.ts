import { retryFetch } from "../utils/helpers";
import { API_URL_BASE } from "../utils/constants";

export const generateAiResonse = async (
  whatsappInput: string, model: "request" | "inventory"
): Promise<string> => {
  const payload = {
    model: model,
    message: whatsappInput,
    format: "json",
  };

  const response = await retryFetch(API_URL_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  return JSON.stringify(result);
};
