import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    timestamp?: string;
    emotion?: string;
    context?: any;
    attachments?: FileAttachment[];
  };
}

interface FileAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'audio' | 'video';
  url: string;
  size: number;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  context_memory?: boolean;
  smart_suggestions?: boolean;
  multimodal?: boolean;
}

interface ChatCompletionResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
      suggestions?: string[];
      emotion?: string;
      confidence?: number;
    };
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  context_length: number;
  multimodal: boolean;
}

interface AIInsight {
  id: string;
  type: 'trend' | 'pattern' | 'suggestion' | 'warning';
  title: string;
  description: string;
  confidence: number;
  data: any;
  timestamp: string;
}

interface SmartAnalytics {
  conversation_summary: string;
  key_topics: string[];
  sentiment_analysis: {
    overall: 'positive' | 'neutral' | 'negative';
    confidence: number;
  };
  suggested_actions: string[];
  insights: AIInsight[];
}

export const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://openrouter.ai/api/v1/',
    prepareHeaders: (headers) => {
      const apiKey = localStorage.getItem('openRouterApiKey');
      if (apiKey) {
        headers.set('authorization', `Bearer ${apiKey}`);
      }
      headers.set('Content-Type', 'application/json');
      headers.set('X-Title', 'AI Management Hub');
      return headers;
    }
  }),
  tagTypes: ['Conversation', 'Analytics', 'Insights'],
  endpoints: (builder) => ({
    getModels: builder.query<{ data: AIModel[] }, void>({
      query: () => 'models',
      transformResponse: (response: any) => {
        // 增強模型信息
        const enhancedModels = response.data?.map((model: any) => ({
          ...model,
          capabilities: model.capabilities || ['text'],
          context_length: model.context_length || 4096,
          multimodal: model.capabilities?.includes('vision') || false
        }));
        return { data: enhancedModels };
      }
    }),
    createChatCompletion: builder.mutation<ChatCompletionResponse, ChatCompletionRequest>({
      query: (body) => ({
        url: 'chat/completions',
        method: 'POST',
        body: {
          ...body,
          // 增強請求參數
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
          top_p: 0.9
        },
      }),
      invalidatesTags: ['Conversation']
    }),
    analyzeConversation: builder.mutation<SmartAnalytics, { messages: ChatMessage[]; conversationId: string }>({
      query: ({ messages, conversationId }) => ({
        url: 'chat/completions',
        method: 'POST',
        body: {
          model: 'anthropic/claude-3-haiku',
          messages: [
            {
              role: 'system',
              content: `你是一個智能分析助手。請分析以下對話並提供結構化的洞察。返回JSON格式：
              {
                "conversation_summary": "對話摘要",
                "key_topics": ["主要話題1", "主要話題2"],
                "sentiment_analysis": {
                  "overall": "positive/neutral/negative",
                  "confidence": 0.8
                },
                "suggested_actions": ["建議行動1", "建議行動2"],
                "insights": [
                  {
                    "id": "insight1",
                    "type": "trend",
                    "title": "洞察標題",
                    "description": "洞察描述",
                    "confidence": 0.9,
                    "data": {},
                    "timestamp": "${new Date().toISOString()}"
                  }
                ]
              }`
            },
            {
              role: 'user',
              content: `請分析這個對話：\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        }
      }),
      transformResponse: (response: ChatCompletionResponse) => {
        try {
          const content = response.choices[0]?.message?.content || '{}';
          return JSON.parse(content);
        } catch {
          return {
            conversation_summary: '分析失敗',
            key_topics: [],
            sentiment_analysis: { overall: 'neutral' as const, confidence: 0 },
            suggested_actions: [],
            insights: []
          };
        }
      },
      invalidatesTags: ['Analytics']
    }),
    generateSmartSuggestions: builder.mutation<string[], { context: string; userInput: string }>({
      query: ({ context, userInput }) => ({
        url: 'chat/completions',
        method: 'POST',
        body: {
          model: 'anthropic/claude-3-haiku',
          messages: [
            {
              role: 'system',
              content: '你是一個智能建議助手。基於上下文和用戶輸入，提供3-5個有用的後續問題或建議。每個建議一行，不要編號。'
            },
            {
              role: 'user',
              content: `上下文：${context}\n\n用戶輸入：${userInput}\n\n請提供智能建議：`
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        }
      }),
      transformResponse: (response: ChatCompletionResponse) => {
        const content = response.choices[0]?.message?.content || '';
        return content.split('\n').filter(line => line.trim()).slice(0, 5);
      }
    })
  }),
});

export const { 
  useGetModelsQuery, 
  useCreateChatCompletionMutation,
  useAnalyzeConversationMutation,
  useGenerateSmartSuggestionsMutation
} = aiApi;

// 上下文記憶管理
class ContextMemoryManager {
  private conversations: Map<string, ChatMessage[]> = new Map();
  private userPreferences: Map<string, any> = new Map();
  private maxContextLength = 8000;

  addMessage(conversationId: string, message: ChatMessage) {
    const messages = this.conversations.get(conversationId) || [];
    messages.push(message);
    
    // 保持上下文長度在限制內
    if (this.getTokenCount(messages) > this.maxContextLength) {
      this.trimContext(conversationId);
    }
    
    this.conversations.set(conversationId, messages);
  }

  getContext(conversationId: string): ChatMessage[] {
    return this.conversations.get(conversationId) || [];
  }

  private getTokenCount(messages: ChatMessage[]): number {
    // 簡單的token計算，實際應該使用更精確的方法
    return messages.reduce((count, msg) => count + msg.content.length / 4, 0);
  }

  private trimContext(conversationId: string) {
    const messages = this.conversations.get(conversationId) || [];
    // 保留系統消息和最近的消息
    const systemMessages = messages.filter(m => m.role === 'system');
    const recentMessages = messages.filter(m => m.role !== 'system').slice(-10);
    this.conversations.set(conversationId, [...systemMessages, ...recentMessages]);
  }

  updateUserPreference(key: string, value: any) {
    this.userPreferences.set(key, value);
  }

  getUserPreferences(): Record<string, any> {
    return Object.fromEntries(this.userPreferences);
  }
}

export const contextMemory = new ContextMemoryManager();

// 增強的流式回應函數
export const createStreamingChatCompletion = async (
  request: ChatCompletionRequest,
  onChunk: (chunk: string) => void,
  onComplete: (suggestions?: string[], emotion?: string) => void,
  onError: (error: Error) => void,
  conversationId?: string
) => {
  try {
    const apiKey = localStorage.getItem('openRouterApiKey');
    if (!apiKey) {
      throw new Error('API Key 未設置');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('無法獲取回應流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // 忽略解析錯誤
          }
        }
      }
    }

    onComplete();
  } catch (error) {
    onError(error as Error);
  }
};