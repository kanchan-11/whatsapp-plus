import api from './api';

export const callService = {
  getCallHistory: async () => {
    const response = await api.get('/calls/history');
    return response.data;
  },

  recordCallLog: async (logData) => {
    const response = await api.post('/calls/log', logData);
    return response.data;
  },

  getAllActiveGroupCalls: async () => {
    const response = await api.get('/calls/active');
    return response.data;
  },

  getActiveCallForChat: async (chatId) => {
    try {
      const response = await api.get(`/calls/active/${chatId}`);
      return response.data;
    } catch {
      return null;
    }
  },
};
