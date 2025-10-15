export const retryFetch = async (url: string, options: RequestInit): Promise<Response> => {
  const MAX_RETRIES = 5;
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed: ${(error as Error).message}`);
      if (i === MAX_RETRIES - 1) throw error;
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
};