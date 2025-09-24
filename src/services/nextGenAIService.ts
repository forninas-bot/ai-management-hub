import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AdvancedAIService, AdvancedAIModel } from './advancedAIService';

// 下一代AI功能接口
export interface NextGenAICapabilities {
  // 多模態處理
  multimodal: {
    vision: boolean;
    audio: boolean;
    video: boolean;
    documents: boolean;
  };
  // 代碼生成與分析
  codeGeneration: {
    languages: string[];
    frameworks: string[];
    debugging: boolean;
    optimization: boolean;
    testing: boolean;
  };
  // 智能推理
  reasoning: {
    logicalReasoning: boolean;
    mathematicalProofs: boolean;
    causalInference: boolean;
    strategicPlanning: boolean;
  };
  // 創意生成
  creativity: {
    writing: boolean;
    ideation: boolean;
    problemSolving: boolean;
    designThinking: boolean;
  };
}

// AI模型選擇器配置
export interface ModelSelector {
  taskType: 'chat' | 'analysis' | 'coding' | 'creative' | 'reasoning' | 'multimodal';
  requirements: {
    speed: 'fast' | 'balanced' | 'thorough';
    quality: 'good' | 'high' | 'premium';
    cost: 'low' | 'medium' | 'high';
    privacy: 'standard' | 'enhanced' | 'maximum';
  };
  context: {
    length: number;
    complexity: 'simple' | 'medium' | 'complex';
    domain: string;
  };
}

// 智能會話管理
export interface ConversationContext {
  id: string;
  userId: string;
  title: string;
  model: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    metadata?: {
      tokens?: number;
      cost?: number;
      latency?: number;
      confidence?: number;
      attachments?: any[];
    };
  }>;
  settings: {
    temperature: number;
    maxTokens: number;
    systemPrompt?: string;
    customInstructions?: string;
  };
  analytics: {
    totalMessages: number;
    totalTokens: number;
    totalCost: number;
    averageLatency: number;
    satisfactionScore?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 下一代AI服務類
export class NextGenAIService {
  private static conversations: Map<string, ConversationContext> = new Map();
  private static modelCapabilities: Map<string, NextGenAICapabilities> = new Map();
  private static userPreferences: Map<string, any> = new Map();

  // 初始化服務
  static initialize() {
    this.setupModelCapabilities();
    this.loadUserPreferences();
    this.startAnalytics();
  }

  // 設置模型能力
  private static setupModelCapabilities() {
    // GPT-4o 能力
    this.modelCapabilities.set('gpt-4o', {
      multimodal: {
        vision: true,
        audio: true,
        video: false,
        documents: true
      },
      codeGeneration: {
        languages: ['javascript', 'typescript', 'python', 'java', 'c++', 'rust', 'go', 'swift'],
        frameworks: ['react', 'vue', 'angular', 'node.js', 'django', 'spring', 'flutter'],
        debugging: true,
        optimization: true,
        testing: true
      },
      reasoning: {
        logicalReasoning: true,
        mathematicalProofs: true,
        causalInference: true,
        strategicPlanning: true
      },
      creativity: {
        writing: true,
        ideation: true,
        problemSolving: true,
        designThinking: true
      }
    });

    // Claude 3.5 Sonnet 能力
    this.modelCapabilities.set('claude-3-5-sonnet-20241022', {
      multimodal: {
        vision: true,
        audio: false,
        video: false,
        documents: true
      },
      codeGeneration: {
        languages: ['javascript', 'typescript', 'python', 'java', 'c++', 'rust', 'go', 'swift', 'kotlin'],
        frameworks: ['react', 'vue', 'angular', 'node.js', 'django', 'spring', 'flutter', 'nextjs'],
        debugging: true,
        optimization: true,
        testing: true
      },
      reasoning: {
        logicalReasoning: true,
        mathematicalProofs: true,
        causalInference: true,
        strategicPlanning: true
      },
      creativity: {
        writing: true,
        ideation: true,
        problemSolving: true,
        designThinking: true
      }
    });
  }

  // 智能模型選擇
  static selectBestModel(selector: ModelSelector): string {
    const availableModels = Array.from(this.modelCapabilities.keys());
    
    // 根據任務類型和需求評分
    const modelScores = availableModels.map(modelId => {
      const capabilities = this.modelCapabilities.get(modelId);
      const model = AdvancedAIService.getModel(modelId);
      
      if (!capabilities || !model) return { modelId, score: 0 };

      let score = 0;

      // 任務類型匹配度
      switch (selector.taskType) {
        case 'coding':
          score += capabilities.codeGeneration.debugging ? 20 : 0;
          score += capabilities.codeGeneration.optimization ? 15 : 0;
          break;
        case 'reasoning':
          score += capabilities.reasoning.logicalReasoning ? 25 : 0;
          score += capabilities.reasoning.mathematicalProofs ? 20 : 0;
          break;
        case 'creative':
          score += capabilities.creativity.writing ? 20 : 0;
          score += capabilities.creativity.ideation ? 15 : 0;
          break;
        case 'multimodal':
          score += capabilities.multimodal.vision ? 25 : 0;
          score += capabilities.multimodal.audio ? 15 : 0;
          break;
        default:
          score += 10; // 基礎聊天能力
      }

      // 性能需求匹配
      if (selector.requirements.speed === 'fast') {
        score += model.capabilities.speed * 2;
      }
      if (selector.requirements.quality === 'premium') {
        score += model.capabilities.accuracy * 3;
      }
      if (selector.requirements.cost === 'low') {
        score += (1 / model.costPerToken.input) * 5;
      }

      return { modelId, score };
    });

    // 返回得分最高的模型
    const bestModel = modelScores.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return bestModel.modelId || 'gpt-4o';
  }

  // 創建智能會話
  static createConversation(
    userId: string, 
    title: string, 
    selector: ModelSelector,
    systemPrompt?: string
  ): ConversationContext {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const selectedModel = this.selectBestModel(selector);

    const conversation: ConversationContext = {
      id: conversationId,
      userId,
      title,
      model: selectedModel,
      messages: [],
      settings: {
        temperature: 0.7,
        maxTokens: 4000,
        systemPrompt,
        customInstructions: this.userPreferences.get(userId)?.customInstructions
      },
      analytics: {
        totalMessages: 0,
        totalTokens: 0,
        totalCost: 0,
        averageLatency: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.conversations.set(conversationId, conversation);
    return conversation;
  }

  // 發送消息
  static async sendMessage(
    conversationId: string,
    content: string,
    attachments?: any[]
  ): Promise<{
    response: string;
    metadata: {
      tokens: number;
      cost: number;
      latency: number;
      confidence: number;
    };
  }> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('會話不存在');
    }

    const startTime = Date.now();
    
    // 添加用戶消息
    const userMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user' as const,
      content,
      timestamp: new Date().toISOString(),
      metadata: { attachments }
    };

    conversation.messages.push(userMessage);

    try {
      // 準備消息歷史
      const messages = conversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // 如果有系統提示，添加到開頭
      if (conversation.settings.systemPrompt) {
        messages.unshift({
          role: 'system',
          content: conversation.settings.systemPrompt
        });
      }

      // 調用AI服務
      const response = await AdvancedAIService.createChatCompletion({
        model: conversation.model,
        messages,
        temperature: conversation.settings.temperature,
        max_tokens: conversation.settings.maxTokens,
        taskType: 'chat',
        complexity: 'medium',
        priority: 'medium'
      });

      const endTime = Date.now();
      const latency = endTime - startTime;

      // 計算成本和token數
      const model = AdvancedAIService.getModel(conversation.model);
      if (!model) {
        throw new Error(`未知的模型: ${conversation.model}`);
      }
      
      const inputTokens = this.estimateTokens(messages.map(m => m.content).join(' '));
      const outputTokens = this.estimateTokens(response.choices[0].message.content);
      const cost = (inputTokens * model.costPerToken.input) + (outputTokens * model.costPerToken.output);

      // 添加AI回應
      const assistantMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant' as const,
        content: response.choices[0].message.content,
        timestamp: new Date().toISOString(),
        metadata: {
          tokens: inputTokens + outputTokens,
          cost,
          latency,
          confidence: response.choices[0].message.confidence || 0.8
        }
      };

      conversation.messages.push(assistantMessage);

      // 更新會話統計
      conversation.analytics.totalMessages += 2;
      conversation.analytics.totalTokens += inputTokens + outputTokens;
      conversation.analytics.totalCost += cost;
      conversation.analytics.averageLatency = 
        (conversation.analytics.averageLatency + latency) / 2;
      conversation.updatedAt = new Date().toISOString();

      return {
        response: response.choices[0].message.content,
        metadata: {
          tokens: inputTokens + outputTokens,
          cost,
          latency,
          confidence: response.choices[0].message.confidence || 0.8
        }
      };

    } catch (error) {
      console.error('發送消息失敗:', error);
      throw new Error('AI服務暫時不可用，請稍後再試');
    }
  }

  // 獲取會話
  static getConversation(conversationId: string): ConversationContext | null {
    return this.conversations.get(conversationId) || null;
  }

  // 獲取用戶的所有會話
  static getUserConversations(userId: string): ConversationContext[] {
    return Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  // 刪除會話
  static deleteConversation(conversationId: string): boolean {
    return this.conversations.delete(conversationId);
  }

  // 估算token數量
  private static estimateTokens(text: string): number {
    // 簡單的token估算，實際應該使用更精確的方法
    return Math.ceil(text.length / 4);
  }

  // 加載用戶偏好
  private static loadUserPreferences() {
    // 從localStorage或API加載用戶偏好
    const stored = localStorage.getItem('aiUserPreferences');
    if (stored) {
      try {
        const preferences = JSON.parse(stored);
        Object.entries(preferences).forEach(([userId, prefs]) => {
          this.userPreferences.set(userId, prefs);
        });
      } catch (error) {
        console.error('加載用戶偏好失敗:', error);
      }
    }
  }

  // 保存用戶偏好
  static saveUserPreferences(userId: string, preferences: any) {
    this.userPreferences.set(userId, preferences);
    
    // 保存到localStorage
    const allPreferences = Object.fromEntries(this.userPreferences);
    localStorage.setItem('aiUserPreferences', JSON.stringify(allPreferences));
  }

  // 開始分析
  private static startAnalytics() {
    // 定期分析用戶使用模式和模型性能
    setInterval(() => {
      this.analyzeUsagePatterns();
      this.optimizeModelSelection();
    }, 300000); // 每5分鐘分析一次
  }

  // 分析使用模式
  private static analyzeUsagePatterns() {
    const conversations = Array.from(this.conversations.values());
    
    // 分析最受歡迎的模型
    const modelUsage = new Map<string, number>();
    conversations.forEach(conv => {
      const count = modelUsage.get(conv.model) || 0;
      modelUsage.set(conv.model, count + 1);
    });

    // 分析平均響應時間
    const avgLatencies = new Map<string, number>();
    conversations.forEach(conv => {
      if (conv.analytics.averageLatency > 0) {
        avgLatencies.set(conv.model, conv.analytics.averageLatency);
      }
    });

    console.log('AI使用分析:', {
      modelUsage: Object.fromEntries(modelUsage),
      avgLatencies: Object.fromEntries(avgLatencies)
    });
  }

  // 優化模型選擇
  private static optimizeModelSelection() {
    // 基於性能數據調整模型選擇邏輯
    // 這裡可以實現更複雜的優化算法
  }
}

// 下一代AI API
export const nextGenAiApi = createApi({
  reducerPath: 'nextGenAiApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/ai/',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    }
  }),
  tagTypes: ['Conversation', 'Model', 'Analytics'],
  endpoints: (builder) => ({
    // 創建會話
    createConversation: builder.mutation<ConversationContext, {
      userId: string;
      title: string;
      selector: ModelSelector;
      systemPrompt?: string;
    }>({
      queryFn: ({ userId, title, selector, systemPrompt }) => {
        const conversation = NextGenAIService.createConversation(userId, title, selector, systemPrompt);
        return { data: conversation };
      },
      invalidatesTags: ['Conversation']
    }),

    // 發送消息
    sendMessage: builder.mutation<any, {
      conversationId: string;
      content: string;
      attachments?: any[];
    }>({
      queryFn: async ({ conversationId, content, attachments }) => {
        try {
          const result = await NextGenAIService.sendMessage(conversationId, content, attachments);
          return { data: result };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: error instanceof Error ? error.message : String(error) } };
        }
      },
      invalidatesTags: ['Conversation']
    }),

    // 獲取會話列表
    getUserConversations: builder.query<ConversationContext[], string>({
      queryFn: (userId) => {
        const conversations = NextGenAIService.getUserConversations(userId);
        return { data: conversations };
      },
      providesTags: ['Conversation']
    }),

    // 獲取單個會話
    getConversation: builder.query<ConversationContext | null, string>({
      queryFn: (conversationId) => {
        const conversation = NextGenAIService.getConversation(conversationId);
        return { data: conversation };
      },
      providesTags: ['Conversation']
    }),

    // 刪除會話
    deleteConversation: builder.mutation<boolean, string>({
      queryFn: (conversationId) => {
        const success = NextGenAIService.deleteConversation(conversationId);
        return { data: success };
      },
      invalidatesTags: ['Conversation']
    }),

    // 獲取可用模型
    getAvailableModels: builder.query<AdvancedAIModel[], void>({
      queryFn: () => {
        const models = AdvancedAIService.getAllModels();
        return { data: models };
      },
      providesTags: ['Model']
    })
  })
});

export const {
  useCreateConversationMutation,
  useSendMessageMutation,
  useGetUserConversationsQuery,
  useGetConversationQuery,
  useDeleteConversationMutation,
  useGetAvailableModelsQuery
} = nextGenAiApi;

// 初始化服務
NextGenAIService.initialize();

export default NextGenAIService;