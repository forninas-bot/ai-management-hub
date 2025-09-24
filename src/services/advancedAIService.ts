import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { contextMemory } from './aiService';

// 升級版AI模型配置
export interface AdvancedAIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'meta' | 'cohere';
  version: string;
  capabilities: {
    reasoning: number; // 0-10
    creativity: number;
    speed: number;
    accuracy: number;
    multimodal: boolean;
    codeGeneration: boolean;
    mathSolving: boolean;
    languageSupport: string[];
  };
  contextLength: number;
  costPerToken: {
    input: number;
    output: number;
  };
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

// 智能路由配置
export interface AIRoutingConfig {
  taskType: 'chat' | 'analysis' | 'generation' | 'reasoning' | 'coding';
  complexity: 'simple' | 'medium' | 'complex';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  preferredModels: string[];
  fallbackModels: string[];
  maxRetries: number;
  timeoutMs: number;
}

// 快取配置
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // 存活時間（秒）
  maxSize: number; // 最大快取項目數
  strategy: 'lru' | 'lfu' | 'fifo';
}

// 性能監控數據
export interface PerformanceMetrics {
  modelId: string;
  requestId: string;
  startTime: number;
  endTime: number;
  tokenCount: {
    input: number;
    output: number;
  };
  latency: number;
  success: boolean;
  errorType?: string;
  cost: number;
}

// 升級版AI服務類
export class AdvancedAIService {
  private static models: Map<string, AdvancedAIModel> = new Map();
  private static routingConfigs: Map<string, AIRoutingConfig> = new Map();
  private static cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private static performanceMetrics: PerformanceMetrics[] = [];
  private static loadBalancer: Map<string, number> = new Map();

  // 初始化先進AI模型
  static initialize() {
    this.registerModels();
    this.setupRoutingConfigs();
    this.startPerformanceMonitoring();
  }

  private static registerModels() {
    const models: AdvancedAIModel[] = [
      // ChatGPT 4.0 系列
      {
        id: 'gpt-4o',
        name: 'GPT-4o (ChatGPT 4.0)',
        provider: 'openai',
        version: '2024-11-20',
        capabilities: {
          reasoning: 10,
          creativity: 9,
          speed: 9,
          accuracy: 10,
          multimodal: true,
          codeGeneration: true,
          mathSolving: true,
          languageSupport: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru', 'ar']
        },
        contextLength: 128000,
        costPerToken: { input: 0.0025, output: 0.01 },
        rateLimit: { requestsPerMinute: 10000, tokensPerMinute: 800000 }
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'openai',
        version: '2024-07-18',
        capabilities: {
          reasoning: 8,
          creativity: 8,
          speed: 10,
          accuracy: 9,
          multimodal: true,
          codeGeneration: true,
          mathSolving: true,
          languageSupport: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru', 'ar']
        },
        contextLength: 128000,
        costPerToken: { input: 0.00015, output: 0.0006 },
        rateLimit: { requestsPerMinute: 30000, tokensPerMinute: 2000000 }
      },
      // Claude 4.0 系列 (Claude 3.5 Sonnet 作為最新版本)
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet (Claude 4.0)',
        provider: 'anthropic',
        version: '20241022',
        capabilities: {
          reasoning: 10,
          creativity: 10,
          speed: 8,
          accuracy: 10,
          multimodal: true,
          codeGeneration: true,
          mathSolving: true,
          languageSupport: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru', 'ar']
        },
        contextLength: 200000,
        costPerToken: { input: 0.003, output: 0.015 },
        rateLimit: { requestsPerMinute: 4000, tokensPerMinute: 400000 }
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        provider: 'anthropic',
        version: '20241022',
        capabilities: {
          reasoning: 8,
          creativity: 7,
          speed: 10,
          accuracy: 9,
          multimodal: true,
          codeGeneration: true,
          mathSolving: true,
          languageSupport: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru', 'ar']
        },
        contextLength: 200000,
        costPerToken: { input: 0.0008, output: 0.004 },
        rateLimit: { requestsPerMinute: 5000, tokensPerMinute: 500000 }
      },
      // 保留原有模型作為備選
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        version: '2024-04-09',
        capabilities: {
          reasoning: 9,
          creativity: 8,
          speed: 7,
          accuracy: 9,
          multimodal: true,
          codeGeneration: true,
          mathSolving: true,
          languageSupport: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es']
        },
        contextLength: 128000,
        costPerToken: { input: 0.01, output: 0.03 },
        rateLimit: { requestsPerMinute: 500, tokensPerMinute: 150000 }
      },
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        version: '20240229',
        capabilities: {
          reasoning: 10,
          creativity: 9,
          speed: 6,
          accuracy: 10,
          multimodal: true,
          codeGeneration: true,
          mathSolving: true,
          languageSupport: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es']
        },
        contextLength: 200000,
        costPerToken: { input: 0.015, output: 0.075 },
        rateLimit: { requestsPerMinute: 200, tokensPerMinute: 100000 }
      },
      {
        id: 'gemini-pro-1.5',
        name: 'Gemini Pro 1.5',
        provider: 'google',
        version: '1.5',
        capabilities: {
          reasoning: 8,
          creativity: 7,
          speed: 9,
          accuracy: 8,
          multimodal: true,
          codeGeneration: true,
          mathSolving: true,
          languageSupport: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es']
        },
        contextLength: 1000000,
        costPerToken: { input: 0.0035, output: 0.0105 },
        rateLimit: { requestsPerMinute: 300, tokensPerMinute: 120000 }
      }
    ];

    models.forEach(model => this.models.set(model.id, model));
  }

  private static setupRoutingConfigs() {
    const configs: Array<{ key: string; config: AIRoutingConfig }> = [
      {
        key: 'chat-simple',
        config: {
          taskType: 'chat',
          complexity: 'simple',
          priority: 'medium',
          preferredModels: ['gpt-4o-mini', 'claude-3-5-haiku-20241022'],
          fallbackModels: ['gpt-4-turbo'],
          maxRetries: 2,
          timeoutMs: 30000
        }
      },
      {
        key: 'chat-complex',
        config: {
          taskType: 'chat',
          complexity: 'complex',
          priority: 'high',
          preferredModels: ['gpt-4o', 'claude-3-5-sonnet-20241022'],
          fallbackModels: ['claude-3-opus', 'gpt-4-turbo'],
          maxRetries: 3,
          timeoutMs: 60000
        }
      },
      {
        key: 'analysis-medium',
        config: {
          taskType: 'analysis',
          complexity: 'medium',
          priority: 'medium',
          preferredModels: ['claude-3-5-sonnet-20241022', 'gpt-4o'],
          fallbackModels: ['claude-3-opus', 'gpt-4-turbo'],
          maxRetries: 2,
          timeoutMs: 45000
        }
      },
      {
        key: 'coding-complex',
        config: {
          taskType: 'coding',
          complexity: 'complex',
          priority: 'high',
          preferredModels: ['gpt-4o', 'claude-3-5-sonnet-20241022'],
          fallbackModels: ['gpt-4-turbo', 'claude-3-opus'],
          maxRetries: 3,
          timeoutMs: 90000
        }
      },
      {
        key: 'reasoning-complex',
        config: {
          taskType: 'reasoning',
          complexity: 'complex',
          priority: 'high',
          preferredModels: ['claude-3-5-sonnet-20241022', 'gpt-4o'],
          fallbackModels: ['claude-3-opus', 'gpt-4-turbo'],
          maxRetries: 3,
          timeoutMs: 120000
        }
      },
      {
        key: 'generation-simple',
        config: {
          taskType: 'generation',
          complexity: 'simple',
          priority: 'low',
          preferredModels: ['gpt-4o-mini', 'claude-3-5-haiku-20241022'],
          fallbackModels: ['gpt-4o'],
          maxRetries: 2,
          timeoutMs: 30000
        }
      }
    ];

    configs.forEach(({ key, config }) => {
      this.routingConfigs.set(key, config);
    });
  }

  // 智能模型選擇
  static selectOptimalModel(taskType: string, complexity: string, priority: string): string {
    const key = `${taskType}-${complexity}-${priority}`;
    const config = this.routingConfigs.get(key);
    
    if (!config) {
      return 'gpt-4-turbo'; // 默認模型
    }

    // 基於負載均衡選擇模型
    const availableModels = config.preferredModels.filter(modelId => {
      const model = this.models.get(modelId);
      const currentLoad = this.loadBalancer.get(modelId) || 0;
      return model && currentLoad < model.rateLimit.requestsPerMinute * 0.8;
    });

    if (availableModels.length === 0) {
      return config.fallbackModels[0] || 'gpt-4-turbo';
    }

    // 選擇負載最低的模型
    return availableModels.reduce((best, current) => {
      const bestLoad = this.loadBalancer.get(best) || 0;
      const currentLoad = this.loadBalancer.get(current) || 0;
      return currentLoad < bestLoad ? current : best;
    });
  }

  // 獲取單個模型
  static getModel(modelId: string): AdvancedAIModel | undefined {
    return this.models.get(modelId);
  }

  // 獲取所有模型
  static getAllModels(): AdvancedAIModel[] {
    return Array.from(this.models.values());
  }

  // 創建聊天完成（供外部服務調用）
  static async createChatCompletion(request: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    max_tokens?: number;
    taskType?: string;
    complexity?: string;
    priority?: string;
  }): Promise<any> {
    // 這裡應該實現實際的API調用邏輯
    // 暫時返回模擬響應
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: '這是來自' + request.model + '的回應',
          confidence: 0.9
        }
      }]
    };
  }
  static getCachedResponse(cacheKey: string): any | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl * 1000) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  static setCachedResponse(cacheKey: string, data: any, ttl: number = 3600) {
    // 實現LRU快取策略
    if (this.cache.size >= 1000) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // 並行處理
  static async processParallelRequests<T>(
    requests: Array<() => Promise<T>>,
    maxConcurrency: number = 3
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      
      const promise = request().then(result => {
        results[i] = result;
      });

      executing.push(promise);

      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }

    await Promise.all(executing);
    return results;
  }

  // 性能監控
  private static startPerformanceMonitoring() {
    setInterval(() => {
      this.analyzePerformanceMetrics();
      this.optimizeLoadBalancing();
    }, 60000); // 每分鐘分析一次
  }

  static recordMetrics(metrics: PerformanceMetrics) {
    this.performanceMetrics.push(metrics);
    
    // 保持最近1000條記錄
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics.shift();
    }

    // 更新負載計數
    const currentLoad = this.loadBalancer.get(metrics.modelId) || 0;
    this.loadBalancer.set(metrics.modelId, currentLoad + 1);
  }

  private static analyzePerformanceMetrics() {
    const recentMetrics = this.performanceMetrics.slice(-100);
    
    // 分析各模型性能
    const modelPerformance = new Map<string, {
      avgLatency: number;
      successRate: number;
      avgCost: number;
    }>();

    recentMetrics.forEach(metric => {
      if (!modelPerformance.has(metric.modelId)) {
        modelPerformance.set(metric.modelId, {
          avgLatency: 0,
          successRate: 0,
          avgCost: 0
        });
      }
    });

    // 根據性能調整路由配置
    this.adjustRoutingBasedOnPerformance(modelPerformance);
  }

  private static optimizeLoadBalancing() {
    // 重置負載計數器
    this.loadBalancer.clear();
  }

  private static adjustRoutingBasedOnPerformance(
    performance: Map<string, { avgLatency: number; successRate: number; avgCost: number }>
  ) {
    // 基於性能數據動態調整模型優先級
    // 這裡可以實現更複雜的優化邏輯
  }

  // 智能預載入
  static async preloadFrequentQueries() {
    const frequentQueries = [
      '今天的任務總結',
      '生產力分析',
      '下週計劃建議'
    ];

    const preloadPromises = frequentQueries.map(async query => {
      const cacheKey = `preload:${query}`;
      if (!this.getCachedResponse(cacheKey)) {
        // 預載入常用查詢的結果
        // 這裡可以調用相應的AI服務
      }
    });

    await Promise.all(preloadPromises);
  }

  // 獲取系統狀態
  static getSystemStatus() {
    return {
      registeredModels: Array.from(this.models.keys()),
      cacheSize: this.cache.size,
      recentMetrics: this.performanceMetrics.slice(-10),
      loadBalancer: Object.fromEntries(this.loadBalancer)
    };
  }
}

// 升級版API
export const advancedAiApi = createApi({
  reducerPath: 'advancedAiApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://openrouter.ai/api/v1/',
    prepareHeaders: (headers) => {
      const apiKey = process.env.REACT_APP_OPENROUTER_API_KEY;
      if (apiKey) {
        headers.set('Authorization', `Bearer ${apiKey}`);
        headers.set('HTTP-Referer', window.location.origin);
        headers.set('X-Title', 'AI Management Hub');
      }
      return headers;
    }
  }),
  tagTypes: ['AdvancedChat', 'Performance', 'Cache'],
  endpoints: (builder) => ({
    // 智能聊天完成
    createAdvancedChatCompletion: builder.mutation({
      query: ({ messages, taskType = 'chat', complexity = 'medium', priority = 'medium', ...options }) => {
        const selectedModel = AdvancedAIService.selectOptimalModel(taskType, complexity, priority);
        const startTime = Date.now();
        
        return {
          url: 'chat/completions',
          method: 'POST',
          body: {
            model: selectedModel,
            messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.max_tokens || 2000,
            top_p: 0.9,
            presence_penalty: 0.1,
            frequency_penalty: 0.1,
            ...options
          }
        };
      },
      transformResponse: (response: any, meta, arg) => {
        // 記錄性能指標
        const endTime = Date.now();
        const startTime = (meta as any)?.request?.timestamp || Date.now();
        AdvancedAIService.recordMetrics({
          modelId: (arg as any).model || 'unknown',
          requestId: response?.id || 'unknown',
          startTime,
          endTime,
          tokenCount: {
            input: response?.usage?.prompt_tokens || 0,
            output: response?.usage?.completion_tokens || 0
          },
          latency: endTime - startTime,
          success: true,
          cost: 0 // 需要根據模型計算
        });
        
        return response;
      },
      invalidatesTags: ['AdvancedChat']
    }),

    // 批量處理
    processBatchRequests: builder.mutation({
      queryFn: async ({ requests, maxConcurrency = 3 }) => {
        try {
          const results = await AdvancedAIService.processParallelRequests(
            requests.map((req: any) => () => 
              fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(req)
              }).then(res => res.json())
            ),
            maxConcurrency
          );
          
          return { data: results };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return { error: { status: 'CUSTOM_ERROR', error: errorMessage } };
        }
      },
      invalidatesTags: ['AdvancedChat']
    }),

    // 獲取系統狀態
    getSystemStatus: builder.query({
      queryFn: () => ({ data: AdvancedAIService.getSystemStatus() }),
      providesTags: ['Performance']
    })
  })
});

export const {
  useCreateAdvancedChatCompletionMutation,
  useProcessBatchRequestsMutation,
  useGetSystemStatusQuery
} = advancedAiApi;

// 初始化服務
AdvancedAIService.initialize();

export default AdvancedAIService;