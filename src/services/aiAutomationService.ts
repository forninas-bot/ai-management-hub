// import { aiApi } from './aiService'; // 暫時註解，因為未使用
import { Task, Project, UserSettings } from '../types';

interface AutomationInsight {
  id: string;
  type: 'task_allocation' | 'schedule_optimization' | 'workflow_suggestion' | 'resource_optimization';
  title: string;
  description: string;
  suggestions: AutomationSuggestion[];
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
  createdAt: string;
}

interface AutomationSuggestion {
  id: string;
  action: 'reassign_task' | 'reschedule_task' | 'merge_tasks' | 'split_task' | 'adjust_priority' | 'create_dependency';
  description: string;
  targetTaskIds: string[];
  parameters: Record<string, any>;
  confidence: number;
}

interface TaskAllocationResult {
  taskId: string;
  suggestedTimeSlot: {
    startTime: string;
    endTime: string;
    date: string;
  };
  reasoning: string;
  conflictWarnings: string[];
  confidence: number;
}

interface ScheduleOptimization {
  optimizedSchedule: TaskAllocationResult[];
  totalTimeReduction: number;
  efficiencyGain: number;
  recommendations: string[];
  potentialIssues: string[];
}

interface WorkflowSuggestion {
  id: string;
  type: 'process_improvement' | 'automation_opportunity' | 'dependency_optimization' | 'batching_suggestion';
  title: string;
  description: string;
  affectedTasks: string[];
  implementationSteps: string[];
  expectedBenefit: string;
}

export class AIAutomationService {
  private static readonly AI_API_ENDPOINT = process.env.REACT_APP_AI_API_ENDPOINT || 'https://api.openai.com/v1';
  private static readonly AI_API_KEY = process.env.REACT_APP_AI_API_KEY;

  /**
   * 智能任務分配 - 根據用戶習慣、任務特性和時間安排自動分配任務
   */
  static async analyzeTaskAllocation(
    tasks: Task[],
    userSettings: UserSettings,
    pomodoroHistory: any[],
    currentSchedule: any[]
  ): Promise<TaskAllocationResult[]> {
    try {
      const pendingTasks = tasks.filter(task => task.status === 'to-do');
      const completedTasks = tasks.filter(task => task.status === 'completed');
      
      // 分析用戶工作模式
      const workPatterns = this.analyzeWorkPatterns(pomodoroHistory, completedTasks);
      
      const prompt = `請分析以下任務並提供智能分配建議：

待分配任務：
${pendingTasks.map(task => `- ${task.title} (優先級: ${task.priority}, 預估時間: ${task.estimatedTime || '未設定'}分鐘, 象限: ${task.quadrant})`).join('\n')}

用戶工作模式分析：
- 最佳工作時段: ${workPatterns.bestWorkingHours}
- 平均專注時長: ${workPatterns.averageFocusTime}分鐘
- 任務完成率: ${workPatterns.completionRate}%
- 偏好任務類型: ${workPatterns.preferredTaskTypes}

當前日程安排：
${currentSchedule.map(item => `- ${item.time}: ${item.activity}`).join('\n')}

請為每個待分配任務提供：
1. 建議的時間段
2. 分配理由
3. 潛在衝突警告
4. 信心度評分(0-1)

請以JSON格式回應，包含taskId, suggestedTimeSlot, reasoning, conflictWarnings, confidence字段。`;

      if (this.AI_API_KEY) {
        const response = await fetch(`${this.AI_API_ENDPOINT}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.AI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500,
            temperature: 0.3
          })
        });

        if (response.ok) {
          const result = await response.json();
          const content = result.choices[0]?.message?.content;
          
          try {
            return JSON.parse(content);
          } catch {
            return this.generateFallbackAllocation(pendingTasks);
          }
        }
      }
      
      return this.generateFallbackAllocation(pendingTasks);
    } catch (error) {
      console.error('任務分配分析失敗:', error);
      return this.generateFallbackAllocation(tasks.filter(task => task.status === 'to-do'));
    }
  }

  /**
   * 自動排程優化 - 分析當前排程並提供優化建議
   */
  static async optimizeSchedule(
    tasks: Task[],
    projects: Project[],
    userSettings: UserSettings
  ): Promise<ScheduleOptimization> {
    try {
      const activeTasks = tasks.filter(task => ['to-do', 'in-progress'].includes(task.status));
      const activeProjects = projects.filter(project => ['planning', 'in-progress'].includes(project.status));
      
      const prompt = `請分析並優化以下排程安排：

當前任務：
${activeTasks.map(task => {
        const project = activeProjects.find(p => p.taskIds.includes(task.id));
        return `- ${task.title} (優先級: ${task.priority}, 預估: ${task.estimatedTime || 30}分鐘, 截止: ${task.dueDate || '無'}, 專案: ${project?.title || '無'})`;
      }).join('\n')}

活躍專案：
${activeProjects.map(project => `- ${project.title} (狀態: ${project.status}, 完成度: ${project.completionPercentage}%, 截止: ${project.targetEndDate})`).join('\n')}

用戶偏好：
- 番茄鐘工作時長: ${userSettings.pomodoroSettings.workDuration}分鐘
- 休息時長: ${userSettings.pomodoroSettings.shortBreakDuration}分鐘

請提供排程優化建議：
1. 重新排列任務順序以提高效率
2. 識別可以批量處理的任務
3. 建議任務依賴關係
4. 預估時間節省和效率提升
5. 潛在問題和風險

請以JSON格式回應。`;

      if (this.AI_API_KEY) {
        const response = await fetch(`${this.AI_API_ENDPOINT}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.AI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000,
            temperature: 0.2
          })
        });

        if (response.ok) {
          const result = await response.json();
          const content = result.choices[0]?.message?.content;
          
          try {
            return JSON.parse(content);
          } catch {
            return this.generateFallbackOptimization(activeTasks);
          }
        }
      }
      
      return this.generateFallbackOptimization(activeTasks);
    } catch (error) {
      console.error('排程優化分析失敗:', error);
      return this.generateFallbackOptimization(tasks.filter(task => ['to-do', 'in-progress'].includes(task.status)));
    }
  }

  /**
   * 工作流程建議 - 分析工作模式並提供流程改進建議
   */
  static async generateWorkflowSuggestions(
    tasks: Task[],
    projects: Project[],
    pomodoroHistory: any[]
  ): Promise<WorkflowSuggestion[]> {
    try {
      const recentTasks = tasks.filter(task => {
        const taskDate = new Date(task.updatedAt);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return taskDate > thirtyDaysAgo;
      });
      
      const taskPatterns = this.analyzeTaskPatterns(recentTasks);
      const productivityPatterns = this.analyzeProductivityPatterns(pomodoroHistory);
      
      const prompt = `基於以下數據分析，請提供工作流程改進建議：

任務模式分析：
- 常見任務類型: ${taskPatterns.commonTypes.join(', ')}
- 平均完成時間: ${taskPatterns.averageCompletionTime}小時
- 延遲任務比例: ${taskPatterns.delayedTasksRatio}%
- 重複性任務: ${taskPatterns.repetitiveTasks.join(', ')}

生產力模式：
- 最高效時段: ${productivityPatterns.peakHours}
- 平均專注時長: ${productivityPatterns.averageFocusTime}分鐘
- 中斷頻率: ${productivityPatterns.interruptionRate}次/小時

請提供以下類型的建議：
1. 流程改進機會
2. 自動化建議
3. 任務批量處理建議
4. 依賴關係優化

每個建議包含：
- 建議類型和標題
- 詳細描述
- 受影響的任務
- 實施步驟
- 預期效益

請以JSON格式回應。`;

      if (this.AI_API_KEY) {
        const response = await fetch(`${this.AI_API_ENDPOINT}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.AI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1800,
            temperature: 0.4
          })
        });

        if (response.ok) {
          const result = await response.json();
          const content = result.choices[0]?.message?.content;
          
          try {
            return JSON.parse(content);
          } catch {
            return this.generateFallbackWorkflowSuggestions(recentTasks);
          }
        }
      }
      
      return this.generateFallbackWorkflowSuggestions(recentTasks);
    } catch (error) {
      console.error('工作流程建議生成失敗:', error);
      return this.generateFallbackWorkflowSuggestions(tasks);
    }
  }

  /**
   * 智能依賴關係建議 - 分析任務間的潛在依賴關係
   */
  static async suggestTaskDependencies(tasks: Task[], projects: Project[]): Promise<AutomationSuggestion[]> {
    try {
      const activeTasks = tasks.filter(task => task.status !== 'completed');
      
      const prompt = `分析以下任務，建議合理的依賴關係：

任務列表：
${activeTasks.map(task => {
        const project = projects.find(p => p.taskIds.includes(task.id));
        return `- ID: ${task.id}, 標題: ${task.title}, 描述: ${task.description}, 專案: ${project?.title || '無'}`;
      }).join('\n')}

請識別：
1. 邏輯上必須先後執行的任務
2. 可以並行執行的任務組
3. 有資源衝突的任務
4. 建議的執行順序

為每個建議的依賴關係提供：
- 依賴類型（必須依賴/建議依賴）
- 理由說明
- 信心度評分

請以JSON格式回應。`;

      if (this.AI_API_KEY) {
        const response = await fetch(`${this.AI_API_ENDPOINT}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.AI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500,
            temperature: 0.2
          })
        });

        if (response.ok) {
          const result = await response.json();
          const content = result.choices[0]?.message?.content;
          
          try {
            return JSON.parse(content);
          } catch {
            return this.generateFallbackDependencies(activeTasks);
          }
        }
      }
      
      return this.generateFallbackDependencies(activeTasks);
    } catch (error) {
      console.error('依賴關係建議生成失敗:', error);
      return this.generateFallbackDependencies(tasks.filter(task => task.status !== 'completed'));
    }
  }

  // 輔助方法：分析工作模式
  private static analyzeWorkPatterns(pomodoroHistory: any[], completedTasks: Task[]) {
    const now = new Date();
    const recentSessions = pomodoroHistory.filter(session => {
      const sessionDate = new Date(session.startTime);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return sessionDate > sevenDaysAgo;
    });

    const hourCounts = new Array(24).fill(0);
    recentSessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      hourCounts[hour]++;
    });

    const bestHour = hourCounts.indexOf(Math.max(...hourCounts));
    const averageFocusTime = recentSessions.length > 0 
      ? recentSessions.reduce((sum, session) => sum + (session.totalWorkTime || 25), 0) / recentSessions.length
      : 25;

    const recentCompletedTasks = completedTasks.filter(task => {
      const taskDate = new Date(task.updatedAt);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return taskDate > sevenDaysAgo;
    });

    const completionRate = recentCompletedTasks.length > 0 
      ? (recentCompletedTasks.filter(task => task.status === 'completed').length / recentCompletedTasks.length) * 100
      : 0;

    return {
      bestWorkingHours: `${bestHour}:00-${bestHour + 1}:00`,
      averageFocusTime: Math.round(averageFocusTime),
      completionRate: Math.round(completionRate),
      preferredTaskTypes: this.getPreferredTaskTypes(recentCompletedTasks)
    };
  }

  private static getPreferredTaskTypes(tasks: Task[]): string[] {
    const tagCounts: Record<string, number> = {};
    tasks.forEach(task => {
      task.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([tag]) => tag);
  }

  private static analyzeTaskPatterns(tasks: Task[]) {
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const totalTasks = tasks.length;
    
    const avgCompletionTime = completedTasks.length > 0
      ? completedTasks.reduce((sum, task) => {
          const created = new Date(task.createdAt);
          const updated = new Date(task.updatedAt);
          return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
        }, 0) / completedTasks.length
      : 0;

    const delayedTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const updatedDate = new Date(task.updatedAt);
      return updatedDate > dueDate;
    });

    const tagCounts: Record<string, number> = {};
    tasks.forEach(task => {
      task.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const commonTypes = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);

    const titleWords: Record<string, number> = {};
    tasks.forEach(task => {
      const words = task.title.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 2) {
          titleWords[word] = (titleWords[word] || 0) + 1;
        }
      });
    });

    const repetitiveTasks = Object.entries(titleWords)
      .filter(([, count]) => count > 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word);

    return {
      commonTypes,
      averageCompletionTime: Math.round(avgCompletionTime * 10) / 10,
      delayedTasksRatio: totalTasks > 0 ? Math.round((delayedTasks.length / totalTasks) * 100) : 0,
      repetitiveTasks
    };
  }

  private static analyzeProductivityPatterns(pomodoroHistory: any[]) {
    const recentSessions = pomodoroHistory.slice(-50); // 最近50個session
    
    if (recentSessions.length === 0) {
      return {
        peakHours: '9:00-10:00',
        averageFocusTime: 25,
        interruptionRate: 0
      };
    }

    const hourCounts = new Array(24).fill(0);
    let totalFocusTime = 0;
    let totalInterruptions = 0;

    recentSessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      hourCounts[hour]++;
      totalFocusTime += session.totalWorkTime || 25;
      totalInterruptions += session.interruptions?.length || 0;
    });

    const bestHour = hourCounts.indexOf(Math.max(...hourCounts));
    const avgFocusTime = totalFocusTime / recentSessions.length;
    const interruptionRate = totalInterruptions / recentSessions.length;

    return {
      peakHours: `${bestHour}:00-${bestHour + 1}:00`,
      averageFocusTime: Math.round(avgFocusTime),
      interruptionRate: Math.round(interruptionRate * 10) / 10
    };
  }

  // 備用方法：當AI服務不可用時的基本建議
  private static generateFallbackAllocation(tasks: Task[]): TaskAllocationResult[] {
    return tasks.map(task => ({
      taskId: task.id,
      suggestedTimeSlot: {
        startTime: '09:00',
        endTime: '10:00',
        date: new Date().toISOString().split('T')[0]
      },
      reasoning: '基於任務優先級的基本分配',
      conflictWarnings: [],
      confidence: 0.5
    }));
  }

  private static generateFallbackOptimization(tasks: Task[]): ScheduleOptimization {
    const optimizedSchedule = this.generateFallbackAllocation(tasks);
    
    return {
      optimizedSchedule,
      totalTimeReduction: 0,
      efficiencyGain: 0,
      recommendations: ['建議按優先級順序執行任務'],
      potentialIssues: ['需要更多數據來提供精確的優化建議']
    };
  }

  private static generateFallbackWorkflowSuggestions(tasks: Task[]): WorkflowSuggestion[] {
    return [
      {
        id: 'fallback-1',
        type: 'process_improvement',
        title: '任務優先級管理',
        description: '建議定期檢視和調整任務優先級',
        affectedTasks: tasks.slice(0, 3).map(task => task.id),
        implementationSteps: [
          '每週檢視任務列表',
          '根據截止日期調整優先級',
          '專注於高優先級任務'
        ],
        expectedBenefit: '提高任務完成效率'
      }
    ];
  }

  private static generateFallbackDependencies(tasks: Task[]): AutomationSuggestion[] {
    return [
      {
        id: 'fallback-dep-1',
        action: 'create_dependency',
        description: '建議檢視任務間的邏輯關係',
        targetTaskIds: tasks.slice(0, 2).map(task => task.id),
        parameters: { type: 'suggested' },
        confidence: 0.3
      }
    ];
  }
}

export type {
  AutomationInsight,
  AutomationSuggestion,
  TaskAllocationResult,
  ScheduleOptimization,
  WorkflowSuggestion
};