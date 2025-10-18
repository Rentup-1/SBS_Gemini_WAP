import type { ApiMessage, Message, MessagesResponse, ApiResponse } from '../interfaces';
import { API_URL_BASE } from '../utils/constants';

// Helper function to map API message to local Message type
const mapApiMessageToMessage = (apiMessage: ApiMessage): Message => {
  // Determine source based on phone number or other criteria
  const source: 'WAP' | 'Website' = apiMessage.phone.includes('+20') ? 'WAP' : 'Website';
  
  // Map type from API to our local types
  const type: 'Inventory' | 'Request' = apiMessage.type === 'inventory' ? 'Inventory' : 'Request';
  
  // Determine user type (you might want to adjust this logic)
  const userType: 'New' | 'Existing' = apiMessage?.user?.created_at && apiMessage.user.created_at > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() ? 'New' : 'Existing';
  
  // Determine replied status (you might need additional logic)
  const replied: 'Yes' | 'No' = apiMessage.message.includes('replied') || apiMessage.message.includes('contacted') ? 'Yes' : 'No';
  
  // Determine status (you might need additional logic)
  const status: 'Not Listed' | 'Listed' = apiMessage.type === 'inventory' ? 'Listed' : 'Not Listed';
  
  return {
    id: apiMessage.id,
    contactName: apiMessage?.user?.name || apiMessage.username || 'Unknown User',
    contactPhone: apiMessage.phone,
    message: apiMessage.message,
    sentAt: apiMessage.sent_at || apiMessage.created_at || "",
    isRead: false, // You might need to get this from API
    source,
    type,
    userType,
    userId: `u${apiMessage?.user?.id}`,
    replied,
    status,
    mediaUrls: apiMessage.media_urls,
    mediaType: apiMessage.media_type,
  };
};

// Real API fetch function
export const fetchMessages = async (page: number = 1, filters: any = {}): Promise<MessagesResponse> => {
  try {
    console.log(filters)
    const response = await fetch(`${API_URL_BASE}/migrate/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 4e14bf9daafbe8d1fba7bf82f173b873`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: ApiResponse<ApiMessage[]> = await response.json();
    
    if (!apiResponse.status) {
      throw new Error(apiResponse.message || 'Failed to fetch messages');
    }

    // Map API messages to local Message format
    const messages: Message[] = apiResponse.data.map(mapApiMessageToMessage);
    
    // You might need to adjust this based on your actual pagination response
    const paginationMeta = {
      current_page: page,
      total_pages: Math.ceil(apiResponse.data.length / 20), // Adjust based on your API
      total_count: apiResponse.data.length,
      per_page: 20,
    };

    return {
      messages,
      meta: paginationMeta,
    };

  } catch (error) {
    console.error('Failed to fetch messages:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to fetch messages from server'
    );
  }
};

export const fetchSingleMessage = async (id: string): Promise<Message> => {
  try {
    const response = await fetch(`${API_URL_BASE}/migrate/messages/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 4e14bf9daafbe8d1fba7bf82f173b873`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: ApiResponse<ApiMessage> = await response.json();
    
    if (!apiResponse.status) {
      throw new Error(apiResponse.message || 'Failed to fetch message');
    }

    // Map API message to local Message format
    const message: Message = mapApiMessageToMessage(apiResponse.data);
    
    return message;

  } catch (error) {
    console.error('Failed to fetch message:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to fetch message from server'
    );
  }
};