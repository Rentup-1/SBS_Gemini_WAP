import { messagesApi } from './axios';
import type { Message } from '@/types';

export const getMessages = async (): Promise<Message[]> => {
  const response = await messagesApi.get('/migrate/messages');
  return response.data.data;
};
