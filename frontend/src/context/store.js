import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: (() => {
    try {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  })(),
  token: localStorage.getItem('access_token'),
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setSession: ({ user, token }) => set({ user, token }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      // API call will be made in the component
      set({ isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },
}))

export const useChatStore = create((set) => ({
  conversations: [],
  currentConversation: null,
  messages: [],

  setConversations: (conversations) => set({ conversations }),
  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
}))

export const useKnowledgeBaseStore = create((set) => ({
  items: [],
  isLoading: false,

  setItems: (items) => set({ items }),
  setLoading: (isLoading) => set({ isLoading }),

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    })),
}))
