import api from './api'

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
}

export const knowledgeBaseAPI = {
  addWebsite: (userId, data) =>
    api.post(`/knowledge-base/website?user_id=${userId}`, data),
  uploadDocument: (userId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/knowledge-base/document?user_id=${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getKnowledgeBase: (userId) => api.get(`/knowledge-base/?user_id=${userId}`),
  deleteItem: (userId, itemId) =>
    api.delete(`/knowledge-base/${itemId}?user_id=${userId}`),
}

export const chatAPI = {
  startConversation: (userId, visitorName, visitorEmail) =>
    api.post('/chat/start', {
      user_id: userId,
      visitor_name: visitorName,
      visitor_email: visitorEmail,
    }),
  sendMessage: (data) => api.post('/chat/message', data),
  getConversations: (userId) => api.get(`/chat/conversations/${userId}`),
  getConversation: (conversationId) =>
    api.get(`/chat/conversation/${conversationId}`),
  sendAdminMessage: (conversationId, message) =>
    api.post('/chat/message/admin', { conversation_id: conversationId, message }),
  updateChatMode: (conversationId, chatMode) =>
    api.post(`/chat/conversation/${conversationId}/mode`, { chat_mode: chatMode }),
}

export const widgetAPI = {
  generateWidget: (userId) => api.post(`/widget/generate?user_id=${userId}`),
  getWidget: (widgetId) => api.get(`/widget/${widgetId}`),
  getUserWidget: (userId) => api.get(`/widget/user/${userId}`),
  updateWidget: (widgetId, data) => api.put(`/widget/${widgetId}`, data),
}

export const analyticsAPI = {
  getStats: (userId) => api.get(`/analytics/stats/${userId}`),
  getLeads: (userId) => api.get(`/analytics/leads/${userId}`),
}

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
}
