import { advancedAiApi } from './advancedAIService';
import { contextMemory } from './aiService';

// 語音交互接口
export interface VoiceConfig {
  language: 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR';
  voice: string;
  speed: number; // 0.5 - 2.0
  pitch: number; // 0.5 - 2.0
  volume: number; // 0.0 - 1.0
}

// 智能提醒接口
export interface SmartReminder {
  id: string;
  type: 'task' | 'meeting' | 'break' | 'habit' | 'custom';
  title: string;
  message: string;
  triggerTime: string;
  conditions?: {
    location?: string;
    weather?: string;
    workload?: 'low' | 'medium' | 'high';
    mood?: 'positive' | 'neutral' | 'negative';
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;
    endDate?: string;
  };
  actions?: Array<{
    type: 'open_app' | 'send_message' | 'play_sound' | 'show_notification';
    payload: any;
  }>;
  createdAt: string;
  isActive: boolean;
}

// 用戶習慣數據
export interface UserHabit {
  id: string;
  category: 'work' | 'break' | 'communication' | 'learning' | 'health';
  pattern: string;
  frequency: number;
  timeOfDay: string[];
  duration: number; // 分鐘
  confidence: number; // 0-1
  lastObserved: string;
  trend: 'increasing' | 'stable' | 'decreasing';
}

// 主動建議接口
export interface ProactiveSuggestion {
  id: string;
  type: 'productivity' | 'health' | 'learning' | 'optimization' | 'social';
  title: string;
  description: string;
  reasoning: string;
  actions: Array<{
    label: string;
    action: string;
    payload?: any;
  }>;
  priority: number; // 1-10
  relevanceScore: number; // 0-1
  expiresAt: string;
  createdAt: string;
}

// 上下文感知數據
export interface ContextData {
  currentTime: string;
  dayOfWeek: string;
  workingHours: boolean;
  currentActivity?: string;
  location?: string;
  weather?: {
    condition: string;
    temperature: number;
  };
  recentTasks: string[];
  mood?: 'energetic' | 'focused' | 'tired' | 'stressed' | 'relaxed';
  workload: 'low' | 'medium' | 'high';
}

// AI助手服務類
export class AIAssistantService {
  private static voiceConfig: VoiceConfig = {
    language: 'zh-CN',
    voice: 'zh-CN-XiaoxiaoNeural',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8
  };
  
  private static userHabits: Map<string, UserHabit> = new Map();
  private static reminders: Map<string, SmartReminder> = new Map();
  private static suggestions: ProactiveSuggestion[] = [];
  private static isListening = false;
  private static recognition: any = null;
  private static synthesis: any = null;

  // 初始化AI助手
  static initialize() {
    this.initializeVoiceRecognition();
    this.initializeVoiceSynthesis();
    this.startHabitLearning();
    this.startProactiveSuggestions();
    this.loadUserPreferences();
  }

  // 語音識別初始化
  private static initializeVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.voiceConfig.language;
      
      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          this.processVoiceCommand(finalTranscript.trim());
        }
      };
      
      this.recognition.onerror = (event: any) => {
        console.error('語音識別錯誤:', event.error);
      };
    }
  }

  // 語音合成初始化
  private static initializeVoiceSynthesis() {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  // 開始語音監聽
  static startListening(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.recognition) {
        resolve(false);
        return;
      }
      
      try {
        this.recognition.start();
        this.isListening = true;
        resolve(true);
      } catch (error) {
        console.error('無法啟動語音識別:', error);
        resolve(false);
      }
    });
  }

  // 停止語音監聽
  static stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // 語音回應
  static speak(text: string, options?: Partial<VoiceConfig>): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synthesis) {
        resolve();
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      const config = { ...this.voiceConfig, ...options };
      
      utterance.lang = config.language;
      utterance.rate = config.speed;
      utterance.pitch = config.pitch;
      utterance.volume = config.volume;
      
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      
      this.synthesis.speak(utterance);
    });
  }

  // 處理語音命令
  private static async processVoiceCommand(command: string) {
    const lowerCommand = command.toLowerCase();
    
    // 檢查是否為喚醒詞
    if (!lowerCommand.includes('小助手') && !lowerCommand.includes('助理')) {
      return;
    }
    
    try {
      // 使用AI理解語音命令
      const response = await advancedAiApi.endpoints.createAdvancedChatCompletion.initiate({
        messages: [
          {
            role: 'system',
            content: `你是一個智能語音助手。用戶說了："${command}"。請分析用戶的意圖並提供簡潔的回應。
            
可能的操作類型：
- 查詢任務狀態
- 創建新任務
- 設置提醒
- 查看日程
- 生產力分析
- 其他幫助
            
請用JSON格式回應：
{
  "intent": "操作類型",
  "response": "語音回應內容",
  "action": "具體操作",
  "parameters": {}
}`
          }
        ],
        taskType: 'chat',
        complexity: 'simple',
        priority: 'medium',
        temperature: 0.7,
        max_tokens: 300
      });
      
      const apiResponse = await response;
      const result = typeof apiResponse === 'string' ? JSON.parse(apiResponse) : apiResponse;
      
      // 執行相應操作
      await this.executeVoiceAction(result.action, result.parameters);
      
      // 語音回應
      await this.speak(result.response);
      
    } catch (error) {
      console.error('處理語音命令錯誤:', error);
      await this.speak('抱歉，我沒有理解您的指令，請再說一遍。');
    }
  }

  // 執行語音操作
  private static async executeVoiceAction(action: string, parameters: any) {
    switch (action) {
      case 'query_tasks':
        // 查詢任務邏輯
        break;
      case 'create_task':
        // 創建任務邏輯
        break;
      case 'set_reminder':
        // 設置提醒邏輯
        break;
      default:
        console.log('未知操作:', action);
    }
  }

  // 學習用戶習慣
  private static startHabitLearning() {
    // 每小時分析一次用戶行為
    setInterval(() => {
      this.analyzeUserBehavior();
    }, 3600000);
  }

  private static async analyzeUserBehavior() {
    const contextData = await this.getCurrentContext();
    
    try {
      const response = await advancedAiApi.endpoints.createAdvancedChatCompletion.initiate({
        messages: [
          {
            role: 'system',
            content: `分析用戶行為模式，識別習慣。基於以下數據：${JSON.stringify(contextData)}
            
請返回JSON格式的習慣分析：
{
  "habits": [
    {
      "category": "work|break|communication|learning|health",
      "pattern": "習慣描述",
      "frequency": 頻率數值,
      "timeOfDay": ["時間段"],
      "confidence": 0.8
    }
  ]
}`
          }
        ],
        taskType: 'analysis',
        complexity: 'medium',
        priority: 'low'
      });
      
      const result = await response;
      const analysis = typeof result === 'string' ? JSON.parse(result) : result;
      this.updateUserHabits(analysis.habits);
      
    } catch (error) {
      console.error('習慣學習錯誤:', error);
    }
  }

  private static updateUserHabits(habits: any[]) {
    habits.forEach(habit => {
      const id = `${habit.category}-${Date.now()}`;
      this.userHabits.set(id, {
        id,
        category: habit.category,
        pattern: habit.pattern,
        frequency: habit.frequency,
        timeOfDay: habit.timeOfDay,
        duration: habit.duration || 30,
        confidence: habit.confidence,
        lastObserved: new Date().toISOString(),
        trend: 'stable'
      });
    });
  }

  // 主動建議系統
  private static startProactiveSuggestions() {
    // 每30分鐘生成一次建議
    setInterval(() => {
      this.generateProactiveSuggestions();
    }, 1800000);
  }

  private static async generateProactiveSuggestions() {
    const contextData = await this.getCurrentContext();
    const habits = Array.from(this.userHabits.values());
    
    try {
      const response = await advancedAiApi.endpoints.createAdvancedChatCompletion.initiate({
        messages: [
          {
            role: 'system',
            content: `基於用戶當前狀態和習慣，生成主動建議。
            
當前狀態：${JSON.stringify(contextData)}
用戶習慣：${JSON.stringify(habits)}
            
請返回JSON格式的建議：
{
  "suggestions": [
    {
      "type": "productivity|health|learning|optimization|social",
      "title": "建議標題",
      "description": "詳細描述",
      "reasoning": "建議理由",
      "actions": [
        {
          "label": "操作標籤",
          "action": "操作類型"
        }
      ],
      "priority": 5,
      "relevanceScore": 0.8
    }
  ]
}`
          }
        ],
        taskType: 'analysis',
        complexity: 'medium',
        priority: 'low'
      });
      
      const apiResult = await response;
      const result = typeof apiResult === 'string' ? JSON.parse(apiResult) : apiResult;
      this.processSuggestions(result.suggestions);
      
    } catch (error) {
      console.error('生成建議錯誤:', error);
    }
  }

  private static processSuggestions(suggestions: any[]) {
    suggestions.forEach(suggestion => {
      const proactiveSuggestion: ProactiveSuggestion = {
        id: `suggestion-${Date.now()}-${Math.random()}`,
        type: suggestion.type,
        title: suggestion.title,
        description: suggestion.description,
        reasoning: suggestion.reasoning,
        actions: suggestion.actions,
        priority: suggestion.priority,
        relevanceScore: suggestion.relevanceScore,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
      
      this.suggestions.push(proactiveSuggestion);
    });
    
    // 保持最新的20個建議
    this.suggestions = this.suggestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 20);
  }

  // 智能提醒系統
  static createSmartReminder(reminder: Omit<SmartReminder, 'id' | 'createdAt'>): string {
    const id = `reminder-${Date.now()}`;
    const smartReminder: SmartReminder = {
      ...reminder,
      id,
      createdAt: new Date().toISOString()
    };
    
    this.reminders.set(id, smartReminder);
    this.scheduleReminder(smartReminder);
    
    return id;
  }

  private static scheduleReminder(reminder: SmartReminder) {
    const triggerTime = new Date(reminder.triggerTime).getTime();
    const now = Date.now();
    const delay = triggerTime - now;
    
    if (delay > 0) {
      setTimeout(() => {
        this.triggerReminder(reminder);
      }, delay);
    }
  }

  private static async triggerReminder(reminder: SmartReminder) {
    // 檢查觸發條件
    if (reminder.conditions) {
      const contextData = await this.getCurrentContext();
      if (!this.checkReminderConditions(reminder.conditions, contextData)) {
        return;
      }
    }
    
    // 執行提醒操作
    if (reminder.actions) {
      reminder.actions.forEach(action => {
        this.executeReminderAction(action);
      });
    }
    
    // 語音提醒
    await this.speak(`提醒：${reminder.message}`);
    
    // 處理重複提醒
    if (reminder.recurring) {
      this.scheduleRecurringReminder(reminder);
    }
  }

  private static checkReminderConditions(conditions: any, context: ContextData): boolean {
    // 實現條件檢查邏輯
    return true;
  }

  private static executeReminderAction(action: any) {
    // 實現提醒操作邏輯
    console.log('執行提醒操作:', action);
  }

  private static scheduleRecurringReminder(reminder: SmartReminder) {
    // 實現重複提醒邏輯
  }

  // 獲取當前上下文
  private static async getCurrentContext(): Promise<ContextData> {
    const now = new Date();
    
    return {
      currentTime: now.toISOString(),
      dayOfWeek: now.toLocaleDateString('zh-CN', { weekday: 'long' }),
      workingHours: now.getHours() >= 9 && now.getHours() <= 18,
      recentTasks: [], // 從任務系統獲取
      workload: 'medium' // 從分析系統獲取
    };
  }

  // 載入用戶偏好
  private static loadUserPreferences() {
    const saved = localStorage.getItem('aiAssistantPreferences');
    if (saved) {
      try {
        const preferences = JSON.parse(saved);
        this.voiceConfig = { ...this.voiceConfig, ...preferences.voice };
      } catch (error) {
        console.error('載入偏好設置錯誤:', error);
      }
    }
  }

  // 保存用戶偏好
  static saveUserPreferences() {
    const preferences = {
      voice: this.voiceConfig
    };
    
    localStorage.setItem('aiAssistantPreferences', JSON.stringify(preferences));
  }

  // 公共API方法
  static getActiveSuggestions(): ProactiveSuggestion[] {
    const now = new Date();
    return this.suggestions.filter(s => new Date(s.expiresAt) > now);
  }

  static getUserHabits(): UserHabit[] {
    return Array.from(this.userHabits.values());
  }

  static getActiveReminders(): SmartReminder[] {
    return Array.from(this.reminders.values()).filter(r => r.isActive);
  }

  static updateVoiceConfig(config: Partial<VoiceConfig>) {
    this.voiceConfig = { ...this.voiceConfig, ...config };
    this.saveUserPreferences();
  }

  static getVoiceConfig(): VoiceConfig {
    return { ...this.voiceConfig };
  }

  static isVoiceSupported(): boolean {
    return !!(this.recognition && this.synthesis);
  }
}

// 初始化服務
if (typeof window !== 'undefined') {
  AIAssistantService.initialize();
}

export default AIAssistantService;