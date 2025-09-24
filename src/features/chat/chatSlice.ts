import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Conversation, ChatMessage } from '../../types';

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  isLoading: false,
  error: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    fetchConversations: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchConversationsSuccess: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    fetchConversationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    selectActiveConversation: (state, action: PayloadAction<string>) => {
      const conversation = state.conversations.find(c => c.id === action.payload);
      if (conversation) {
        state.activeConversation = conversation;
      }
    },
    createConversation: (state, action: PayloadAction<{ title: string; modelId: string; styleId: string }>) => {
      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        title: action.payload.title,
        modelId: action.payload.modelId,
        styleId: action.payload.styleId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };
      state.conversations.unshift(newConversation);
      state.activeConversation = newConversation;
    },
    addMessage: (state, action: PayloadAction<{ conversationId: string; message: ChatMessage }>) => {
      const conversation = state.conversations.find(c => c.id === action.payload.conversationId);
      if (conversation) {
        conversation.messages.push(action.payload.message);
        conversation.updatedAt = new Date().toISOString();
        
        if (state.activeConversation?.id === action.payload.conversationId) {
          state.activeConversation = { ...conversation };
        }
      }
    },
    updateConversationTitle: (state, action: PayloadAction<{ conversationId: string; title: string }>) => {
      const conversation = state.conversations.find(c => c.id === action.payload.conversationId);
      if (conversation) {
        conversation.title = action.payload.title;
        conversation.updatedAt = new Date().toISOString();
        
        if (state.activeConversation?.id === action.payload.conversationId) {
          state.activeConversation = { ...conversation };
        }
      }
    },
    deleteConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(c => c.id !== action.payload);
      if (state.activeConversation?.id === action.payload) {
        state.activeConversation = null;
      }
    },
    clearConversations: (state) => {
      state.conversations = [];
      state.activeConversation = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateStreamingMessage: (state, action: PayloadAction<{ conversationId: string; messageId: string; content: string }>) => {
      const conversation = state.conversations.find(c => c.id === action.payload.conversationId);
      if (conversation) {
        const message = conversation.messages.find(m => m.id === action.payload.messageId);
        if (message) {
          message.content = action.payload.content;
          conversation.updatedAt = new Date().toISOString();
          
          if (state.activeConversation?.id === action.payload.conversationId) {
            state.activeConversation = { ...conversation };
          }
        }
      }
    }
  }
});

export const {
  fetchConversations,
  fetchConversationsSuccess,
  fetchConversationsFailure,
  selectActiveConversation,
  createConversation,
  addMessage,
  updateConversationTitle,
  deleteConversation,
  clearConversations,
  setLoading,
  setError,
  updateStreamingMessage
} = chatSlice.actions;

export default chatSlice.reducer;