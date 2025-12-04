export const generateAiResonse = async (
  whatsappInput: string,
  model: "request" | "inventory"
) => {
  if (model === "request") {
    const response = await fetch(`/api/v1/process-request/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ whatsapp_msg: whatsappInput }),
    });
    const result = await response.json();
    return JSON.stringify(result);
  } else if (model === "inventory") {
    const response = await fetch(`/api/v1/process-inventory/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsapp_msg: whatsappInput }),
    });
    const result = await response.json();
    return JSON.stringify(result);
  }
};
