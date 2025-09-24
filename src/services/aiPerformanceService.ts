// import { AdvancedAIService } from './advancedAIService'; // 暫時註解，因為未使用

// 快取項目接口
interface CacheItem<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number; // 存活時間（毫秒）
  accessCount: number;
  lastAccessed: number;
  size: number; // 數據大小（字節）
  tags: string[];
}

// 快取統計
interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalItems: number;
  totalSize: number;
  evictions: number;
}

// 並行任務配置
interface ParallelTaskConfig {
  maxConcurrency: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  priority: 'low' | 'medium' | 'high';
}

// 預載入配置
interface PreloadConfig {
  enabled: boolean;
  triggers: Array<{
    event: string;
    queries: string[];
    delay: number;
  }>;
  maxPreloadItems: number;
  preloadOnIdle: boolean;
}

// 性能監控數據
interface PerformanceData {
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  cacheHit: boolean;
  dataSize: number;
  error?: string;
}

// AI性能優化服務
export class AIPerformanceService {
  private static cache = new Map<string, CacheItem>();
  private static cacheStats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalItems: 0,
    totalSize: 0,
    evictions: 0
  };
  
  private static performanceData: PerformanceData[] = [];
  private static taskQueue: Array<{
    id: string;
    task: () => Promise<any>;
    priority: number;
    config: ParallelTaskConfig;
  }> = [];
  
  private static preloadConfig: PreloadConfig = {
    enabled: true,
    triggers: [
      {
        event: 'user_login',
        queries: ['daily_summary', 'task_overview', 'productivity_insights'],
        delay: 2000
      },
      {
        event: 'page_visit_tasks',
        queries: ['task_analysis', 'completion_predictions'],
        delay: 1000
      }
    ],
    maxPreloadItems: 50,
    preloadOnIdle: true
  };
  
  private static isProcessing = false;
  private static maxCacheSize = 100 * 1024 * 1024; // 100MB
  private static cleanupInterval: NodeJS.Timeout | null = null;

  // 初始化性能服務
  static initialize() {
    this.startCacheCleanup();
    this.startPerformanceMonitoring();
    this.initializePreloading();
    this.loadCacheFromStorage();
  }

  // ==================== 快取系統 ====================
  
  // 獲取快取數據
  static getFromCache<T>(key: string, tags?: string[]): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.cacheStats.misses++;
      this.updateCacheStats();
      return null;
    }
    
    // 檢查是否過期
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.cacheStats.misses++;
      this.cacheStats.evictions++;
      this.updateCacheStats();
      return null;
    }
    
    // 檢查標籤匹配
    if (tags && tags.length > 0) {
      const hasMatchingTag = tags.some(tag => item.tags.includes(tag));
      if (!hasMatchingTag) {
        this.cacheStats.misses++;
        this.updateCacheStats();
        return null;
      }
    }
    
    // 更新訪問統計
    item.accessCount++;
    item.lastAccessed = now;
    this.cacheStats.hits++;
    this.updateCacheStats();
    
    return item.data;
  }
  
  // 設置快取數據
  static setCache<T>(
    key: string, 
    data: T, 
    ttl: number = 3600000, // 默認1小時
    tags: string[] = []
  ): boolean {
    const now = Date.now();
    const dataSize = this.calculateDataSize(data);
    
    // 檢查快取大小限制
    if (this.cacheStats.totalSize + dataSize > this.maxCacheSize) {
      this.evictLeastUsed(dataSize);
    }
    
    const item: CacheItem<T> = {
      key,
      data,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now,
      size: dataSize,
      tags
    };
    
    this.cache.set(key, item);
    this.cacheStats.totalItems = this.cache.size;
    this.cacheStats.totalSize += dataSize;
    
    return true;
  }
  
  // 智能快取鍵生成
  static generateCacheKey(operation: string, params: any): string {
    const paramString = JSON.stringify(params, Object.keys(params).sort());
    const hash = this.simpleHash(paramString);
    return `${operation}:${hash}`;
  }
  
  // 批量清除快取（按標籤）
  static clearCacheByTags(tags: string[]): number {
    let cleared = 0;
    
    this.cache.forEach((item, key) => {
      const hasMatchingTag = tags.some(tag => item.tags.includes(tag));
      if (hasMatchingTag) {
        this.cache.delete(key);
        this.cacheStats.totalSize -= item.size;
        cleared++;
      }
    });
    
    this.cacheStats.totalItems = this.cache.size;
    this.cacheStats.evictions += cleared;
    return cleared;
  }
  
  // LRU快取淘汰
  private static evictLeastUsed(requiredSpace: number) {
    const items: Array<CacheItem & { key: string }> = [];
    this.cache.forEach((item, key) => {
      items.push({ ...item, key });
    });
    items.sort((a, b) => {
      // 優先淘汰：訪問次數少 + 最後訪問時間早
      const scoreA = a.accessCount * 0.7 + (Date.now() - a.lastAccessed) * 0.3;
      const scoreB = b.accessCount * 0.7 + (Date.now() - b.lastAccessed) * 0.3;
      return scoreA - scoreB;
    });
    
    let freedSpace = 0;
    let evicted = 0;
    
    for (const item of items) {
      if (freedSpace >= requiredSpace) break;
      
      this.cache.delete(item.key);
      freedSpace += item.size;
      evicted++;
    }
    
    this.cacheStats.totalSize -= freedSpace;
    this.cacheStats.totalItems = this.cache.size;
    this.cacheStats.evictions += evicted;
  }

  // ==================== 並行處理 ====================
  
  // 添加並行任務
  static addParallelTask<T>(
    taskFn: () => Promise<T>,
    config: Partial<ParallelTaskConfig> = {}
  ): Promise<T> {
    const taskConfig: ParallelTaskConfig = {
      maxConcurrency: 3,
      timeout: 30000,
      retryAttempts: 2,
      retryDelay: 1000,
      priority: 'medium',
      ...config
    };
    
    const taskId = `task_${Date.now()}_${Math.random()}`;
    const priority = this.getPriorityScore(taskConfig.priority);
    
    return new Promise((resolve, reject) => {
      const wrappedTask = async () => {
        try {
          const result = await this.executeWithRetry(taskFn, taskConfig);
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      };
      
      this.taskQueue.push({
        id: taskId,
        task: wrappedTask,
        priority,
        config: taskConfig
      });
      
      this.processTaskQueue();
    });
  }
  
  // 批量並行處理
  static async processBatch<T>(
    tasks: Array<() => Promise<T>>,
    config: Partial<ParallelTaskConfig> = {}
  ): Promise<T[]> {
    const batchConfig: ParallelTaskConfig = {
      maxConcurrency: 5,
      timeout: 60000,
      retryAttempts: 1,
      retryDelay: 500,
      priority: 'medium',
      ...config
    };
    
    const results: T[] = new Array(tasks.length);
    const executing: Promise<void>[] = [];
    
    for (let i = 0; i < tasks.length; i++) {
      const taskIndex = i;
      const task = tasks[i];
      
      const promise = this.executeWithTimeout(
        () => this.executeWithRetry(task, batchConfig),
        batchConfig.timeout
      ).then(result => {
        results[taskIndex] = result;
      });
      
      executing.push(promise);
      
      // 控制並發數量
      if (executing.length >= batchConfig.maxConcurrency) {
        await Promise.race(executing);
        // 移除已完成的任務
        for (let j = executing.length - 1; j >= 0; j--) {
          if (await this.isPromiseSettled(executing[j])) {
            executing.splice(j, 1);
          }
        }
      }
    }
    
    await Promise.all(executing);
    return results;
  }
  
  // 智能任務調度
  private static async processTaskQueue() {
    if (this.isProcessing || this.taskQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    // 按優先級排序
    this.taskQueue.sort((a, b) => b.priority - a.priority);
    
    const activeTasks: Promise<any>[] = [];
    
    while (this.taskQueue.length > 0 || activeTasks.length > 0) {
      // 啟動新任務（在並發限制內）
      while (this.taskQueue.length > 0 && activeTasks.length < 3) {
        const taskItem = this.taskQueue.shift()!;
        const taskPromise = taskItem.task();
        activeTasks.push(taskPromise);
      }
      
      // 等待至少一個任務完成
      if (activeTasks.length > 0) {
        await Promise.race(activeTasks);
        
        // 移除已完成的任務
        for (let i = activeTasks.length - 1; i >= 0; i--) {
          if (await this.isPromiseSettled(activeTasks[i])) {
            activeTasks.splice(i, 1);
          }
        }
      }
    }
    
    this.isProcessing = false;
  }

  // ==================== 智能預載入 ====================
  
  // 觸發預載入
  static triggerPreload(event: string, context?: any) {
    if (!this.preloadConfig.enabled) return;
    
    const trigger = this.preloadConfig.triggers.find(t => t.event === event);
    if (!trigger) return;
    
    setTimeout(() => {
      this.executePreload(trigger.queries, context);
    }, trigger.delay);
  }
  
  // 執行預載入
  private static async executePreload(queries: string[], context?: any) {
    const preloadTasks = queries.map(query => () => this.preloadQuery(query, context));
    
    try {
      await this.processBatch(preloadTasks, {
        maxConcurrency: 2,
        timeout: 15000,
        retryAttempts: 1,
        retryDelay: 500,
        priority: 'low'
      });
    } catch (error) {
      console.warn('預載入執行錯誤:', error);
    }
  }
  
  // 預載入單個查詢
  private static async preloadQuery(query: string, context?: any): Promise<void> {
    const cacheKey = this.generateCacheKey('preload', { query, context });
    
    // 檢查是否已快取
    if (this.getFromCache(cacheKey)) {
      return;
    }
    
    try {
      // 這裡應該調用實際的AI服務
      const result = await this.simulateAIQuery(query, context);
      this.setCache(cacheKey, result, 1800000, ['preload', query]); // 30分鐘TTL
    } catch (error) {
      console.warn(`預載入查詢失敗: ${query}`, error);
    }
  }
  
  // 空閒時預載入
  static startIdlePreloading() {
    if (!this.preloadConfig.preloadOnIdle) return;
    
    // 檢測用戶空閒狀態
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        this.executeIdlePreload();
      }, 30000); // 30秒空閒後開始預載入
    };
    
    // 監聽用戶活動
    if (typeof window !== 'undefined') {
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetIdleTimer, true);
      });
    }
    
    resetIdleTimer();
  }
  
  private static async executeIdlePreload() {
    const commonQueries = [
      'productivity_summary',
      'upcoming_tasks',
      'focus_recommendations',
      'daily_insights'
    ];
    
    await this.executePreload(commonQueries);
  }

  // ==================== 性能監控 ====================
  
  // 記錄性能數據
  static recordPerformance(data: Omit<PerformanceData, 'duration'>) {
    const performanceRecord: PerformanceData = {
      ...data,
      duration: data.endTime - data.startTime
    };
    
    this.performanceData.push(performanceRecord);
    
    // 保持最近1000條記錄
    if (this.performanceData.length > 1000) {
      this.performanceData.shift();
    }
  }
  
  // 性能分析
  static analyzePerformance() {
    const recentData = this.performanceData.slice(-100);
    
    const analysis = {
      averageDuration: 0,
      cacheHitRate: 0,
      successRate: 0,
      slowestOperations: [] as string[],
      recommendations: [] as string[]
    };
    
    if (recentData.length === 0) return analysis;
    
    // 計算平均響應時間
    analysis.averageDuration = recentData.reduce((sum, d) => sum + d.duration, 0) / recentData.length;
    
    // 計算快取命中率
    const cacheHits = recentData.filter(d => d.cacheHit).length;
    analysis.cacheHitRate = cacheHits / recentData.length;
    
    // 計算成功率
    const successes = recentData.filter(d => d.success).length;
    analysis.successRate = successes / recentData.length;
    
    // 找出最慢的操作
    const operationTimes = new Map<string, number[]>();
    recentData.forEach(d => {
      if (!operationTimes.has(d.operation)) {
        operationTimes.set(d.operation, []);
      }
      operationTimes.get(d.operation)!.push(d.duration);
    });
    
    const avgTimes = Array.from(operationTimes.entries())
      .map(([op, times]) => ({
        operation: op,
        avgTime: times.reduce((sum, t) => sum + t, 0) / times.length
      }))
      .sort((a, b) => b.avgTime - a.avgTime);
    
    analysis.slowestOperations = avgTimes.slice(0, 3).map(item => item.operation);
    
    // 生成建議
    if (analysis.cacheHitRate < 0.6) {
      analysis.recommendations.push('考慮增加快取TTL或預載入更多數據');
    }
    if (analysis.averageDuration > 5000) {
      analysis.recommendations.push('優化AI模型選擇或增加並行處理');
    }
    if (analysis.successRate < 0.9) {
      analysis.recommendations.push('檢查網絡連接或增加重試機制');
    }
    
    return analysis;
  }

  // ==================== 工具方法 ====================
  
  private static async executeWithRetry<T>(
    taskFn: () => Promise<T>,
    config: ParallelTaskConfig
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= config.retryAttempts; attempt++) {
      try {
        return await taskFn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < config.retryAttempts) {
          await this.delay(config.retryDelay * Math.pow(2, attempt)); // 指數退避
        }
      }
    }
    
    if (lastError) {
      throw lastError;
    } else {
      throw new Error('未知錯誤：所有重試都失敗了');
    }
  }
  
  private static async executeWithTimeout<T>(
    taskFn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      taskFn(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('任務超時')), timeout);
      })
    ]);
  }
  
  private static async isPromiseSettled(promise: Promise<any>): Promise<boolean> {
    try {
      await Promise.race([
        promise,
        new Promise(resolve => setTimeout(resolve, 0))
      ]);
      return true;
    } catch {
      return true;
    }
  }
  
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private static getPriorityScore(priority: string): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 2;
    }
  }
  
  private static calculateDataSize(data: any): number {
    return JSON.stringify(data).length * 2; // 粗略估算（UTF-16）
  }
  
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 轉換為32位整數
    }
    return Math.abs(hash).toString(36);
  }
  
  private static updateCacheStats() {
    this.cacheStats.hitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0;
  }
  
  private static startCacheCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      
      this.cache.forEach((item, key) => {
        if (now - item.timestamp > item.ttl) {
          this.cache.delete(key);
          this.cacheStats.totalSize -= item.size;
          cleaned++;
        }
      });
      
      if (cleaned > 0) {
        this.cacheStats.totalItems = this.cache.size;
        this.cacheStats.evictions += cleaned;
      }
    }, 60000); // 每分鐘清理一次
  }
  
  private static startPerformanceMonitoring() {
    setInterval(() => {
      const analysis = this.analyzePerformance();
      console.log('性能分析:', analysis);
    }, 300000); // 每5分鐘分析一次
  }
  
  private static initializePreloading() {
    this.startIdlePreloading();
  }
  
  private static loadCacheFromStorage() {
    try {
      const saved = localStorage.getItem('aiPerformanceCache');
      if (saved) {
        const data = JSON.parse(saved);
        // 恢復快取數據（需要檢查過期時間）
        console.log('快取數據恢復完成:', data ? '成功' : '無數據');
      }
    } catch (error) {
      console.warn('載入快取失敗:', error);
    }
  }
  
  private static async simulateAIQuery(query: string, context?: any): Promise<any> {
    // 模擬AI查詢（實際應用中應該調用真實的AI服務）
    await this.delay(Math.random() * 2000 + 500);
    return {
      query,
      result: `模擬結果: ${query}`,
      timestamp: new Date().toISOString(),
      context
    };
  }

  // ==================== 公共API ====================
  
  // 獲取快取統計
  static getCacheStats(): CacheStats {
    return { ...this.cacheStats };
  }
  
  // 獲取性能統計
  static getPerformanceStats() {
    return {
      recentOperations: this.performanceData.slice(-10),
      analysis: this.analyzePerformance(),
      cacheStats: this.getCacheStats()
    };
  }
  
  // 清理所有快取
  static clearAllCache(): number {
    const count = this.cache.size;
    this.cache.clear();
    this.cacheStats.totalItems = 0;
    this.cacheStats.totalSize = 0;
    return count;
  }
  
  // 更新預載入配置
  static updatePreloadConfig(config: Partial<PreloadConfig>) {
    this.preloadConfig = { ...this.preloadConfig, ...config };
  }
  
  // 手動觸發性能優化
  static optimize() {
    // 清理過期快取
    const now = Date.now();
    let cleaned = 0;
    
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        this.cacheStats.totalSize -= item.size;
        cleaned++;
      }
    });
    
    // 如果快取使用率過高，執行LRU淘汰
    if (this.cacheStats.totalSize > this.maxCacheSize * 0.8) {
      this.evictLeastUsed(this.maxCacheSize * 0.2);
    }
    
    this.cacheStats.totalItems = this.cache.size;
    
    return {
      cleanedItems: cleaned,
      currentCacheSize: this.cacheStats.totalSize,
      cacheItems: this.cacheStats.totalItems
    };
  }
  
  // 銷毀服務
  static destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.clearAllCache();
    this.performanceData.length = 0;
    this.taskQueue.length = 0;
  }
}

// 初始化服務
if (typeof window !== 'undefined') {
  AIPerformanceService.initialize();
}

export default AIPerformanceService;