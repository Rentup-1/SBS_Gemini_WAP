import type { ApiMessage, Message, MessagesResponse, ApiResponse } from '../interfaces';

const API_BASE_URL ='https://sbsapi.rentup.com.eg/api';

// Helper function to map API message to local Message type
const mapApiMessageToMessage = (apiMessage: ApiMessage): Message => {
  // Determine source based on phone number or other criteria
  console.log(apiMessage)
  const source: 'WAP' | 'Website' = apiMessage.phone.includes('+20') ? 'WAP' : 'Website';
  
  // Map type from API to our local types
  const type: 'Inventory' | 'Request' = apiMessage.type === 'inventory' ? 'Inventory' : 'Request';
  
  // Determine user type (you might want to adjust this logic)
  const userType: 'New' | 'Existing' = apiMessage?.user?.created_at > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() ? 'New' : 'Existing';
  
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
    const response = await fetch(`${API_BASE_URL}/migrate/messages`, {
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

export const deleteMessage = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: ApiResponse<null> = await response.json();
    
    if (!apiResponse.status) {
      throw new Error(apiResponse.message || 'Failed to delete message');
    }

    console.log(`Message ${id} deleted successfully`);
  } catch (error) {
    console.error('Failed to delete message:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to delete message'
    );
  }
};

export const deleteMessagesBulk = async (ids: number[]): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: ApiResponse<null> = await response.json();
    
    if (!apiResponse.status) {
      throw new Error(apiResponse.message || 'Failed to delete messages');
    }

    console.log(`Messages ${ids.join(', ')} deleted successfully`);
  } catch (error) {
    console.error('Failed to delete messages:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to delete messages'
    );
  }
};

export const updateMessage = async (id: number, updates: Partial<Message>): Promise<Message> => {
  try {
    // Map local updates to API format if needed
    const apiUpdates: any = {
      // Add mapping logic here based on your API requirements
      message: updates.message,
      // Add other fields as needed
    };

    const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(apiUpdates),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: ApiResponse<ApiMessage> = await response.json();
    
    if (!apiResponse.status) {
      throw new Error(apiResponse.message || 'Failed to update message');
    }

    const updatedMessage = mapApiMessageToMessage(apiResponse.data);
    console.log(`Message ${id} updated successfully`);
    return updatedMessage;
  } catch (error) {
    console.error('Failed to update message:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to update message'
    );
  }
};

// Additional API functions you might need
export const markMessageAsRead = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${id}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: ApiResponse<null> = await response.json();
    
    if (!apiResponse.status) {
      throw new Error(apiResponse.message || 'Failed to mark message as read');
    }

    console.log(`Message ${id} marked as read`);
  } catch (error) {
    console.error('Failed to mark message as read:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to mark message as read'
    );
  }
};

export const replyToMessage = async (id: number, reply: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${id}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ reply }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: ApiResponse<null> = await response.json();
    
    if (!apiResponse.status) {
      throw new Error(apiResponse.message || 'Failed to send reply');
    }

    console.log(`Reply sent to message ${id}`);
  } catch (error) {
    console.error('Failed to send reply:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to send reply'
    );
  }
};