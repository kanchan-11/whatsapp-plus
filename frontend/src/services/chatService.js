import api from './api';

export const chatService = {
  async getChats() {
    const res = await api.get('/chats');
    return res.data;
  },

  async getChatById(chatId) {
    const res = await api.get(`/chats/${chatId}`);
    return res.data;
  },

  async getOrCreateDirectChat(targetUserId) {
    const res = await api.post('/chats/direct', { targetUserId });
    return res.data;
  },

  async createGroupChat(data) {
    const res = await api.post('/chats/group', data);
    return res.data;
  },

  async updateGroupChat(chatId, data) {
    const res = await api.put(`/chats/group/${chatId}`, data);
    return res.data;
  },

  async getMessages(chatId) {
    const res = await api.get(`/messages/chat/${chatId}`);
    return res.data;
  },

  async sendMessage(data) {
    const res = await api.post('/messages', data);
    return res.data;
  },

  async markAsRead(chatId) {
    const res = await api.post(`/messages/read/${chatId}`);
    return res.data;
  },

  async toggleReaction(messageId, emoji) {
    const res = await api.post(`/messages/${messageId}/reactions`, { emoji });
    return res.data;
  },

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
