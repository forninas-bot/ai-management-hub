import { aiApi } from './aiService';
import { Task } from '../types';

interface TaskAnalysisData {
  tasks: Task[];
  completedTasks: Task[];
  overdueTasks: Task[];
  totalTasks: number;
  completionRate: number;
}

interface AITaskInsight {
  id: string;
  type: 'productivity' | 'priority' | 'time_management' | 'optimization';
  title: string;
  content: string;
  suggestions: string[];
  affectedTasks?: string[];
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
}

interface TaskClassificationResult {
  taskId: string;
  suggestedPriority: 'low' | 'medium' | 'high';
  suggestedQuadrant: 1 | 2 | 3 | 4;
  reasoning: string;
  confidence: number;
}

export class TaskAIService {
  static async analyzeTaskProductivity(data: TaskAnalysisData): Promise<AITaskInsight> {
    const prompt = this.buildProductivityPrompt(data);
    
    try {
      const response = await aiApi.endpoints.createChatCompletion.initiate({
        messages: [
          {
            role: 'system',
            content: `你是一位專業的任務管理顧問。請分析用戶的任務數據，提供生產力改善建議。
            
回應格式必須是JSON：
{
  "type": "productivity|priority|time_management|optimization",
  "title": "洞察標題",
  "content": "詳細分析內容",
  "suggestions": ["建議1", "建議2", "建議3"],
  "affectedTasks": ["任務ID1", "任務ID2"],
  "priority": "high|medium|low"
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'openai/gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 600
      });

      const aiResponse = (response as any).data?.choices?.[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('AI 回應為空');
      }

      const parsedResponse = JSON.parse(aiResponse);
      
      return {
        id: `task-insight-${Date.now()}`,
        type: parsedResponse.type || 'productivity',
        title: parsedResponse.title || '任務生產力分析',
        content: parsedResponse.content || '無法生成分析內容',
        suggestions: parsedResponse.suggestions || [],
        affectedTasks: parsedResponse.affectedTasks || [],
        createdAt: new Date().toISOString(),
        priority: parsedResponse.priority || 'medium'
      };
    } catch (error) {
      console.error('任務AI分析失敗:', error);
      return this.getFallbackProductivityInsight(data);
    }
  }

  static async classifyTask(task: Pick<Task, 'title' | 'description' | 'dueDate' | 'tags' | 'estimatedTime'>): Promise<TaskClassificationResult> {
    const prompt = `請分析以下任務並建議優先級和四象限分類：

任務標題: ${task.title}
任務描述: ${task.description}
截止日期: ${task.dueDate || '無'}
預估時間: ${task.estimatedTime ? `${task.estimatedTime}分鐘` : '未設定'}
標籤: ${task.tags?.join(', ') || '無'}

請根據重要性和緊急性進行分析。`;

    try {
      const response = await aiApi.endpoints.createChatCompletion.initiate({
        messages: [
          {
            role: 'system',
            content: `你是任務分類專家。請根據艾森豪威爾矩陣（四象限法）分析任務：
第一象限：重要且緊急
第二象限：重要但不緊急
第三象限：不重要但緊急
第四象限：不重要且不緊急

回應格式必須是JSON：
{
  "suggestedPriority": "low|medium|high",
  "suggestedQuadrant": 1|2|3|4,
  "reasoning": "分類理由",
  "confidence": 0.0-1.0
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'openai/gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 300
      });

      const aiResponse = (response as any).data?.choices?.[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('AI 回應為空');
      }

      const parsedResponse = JSON.parse(aiResponse);
      
      return {
        taskId: `temp-${Date.now()}`,
        suggestedPriority: parsedResponse.suggestedPriority || 'medium',
        suggestedQuadrant: parsedResponse.suggestedQuadrant || 2,
        reasoning: parsedResponse.reasoning || '無法生成分類理由',
        confidence: parsedResponse.confidence || 0.5
      };
    } catch (error) {
      console.error('任務分類失敗:', error);
      return this.getFallbackClassification(task);
    }
  }

  static async optimizeTaskSchedule(tasks: Task[]): Promise<AITaskInsight> {
    const prompt = this.buildScheduleOptimizationPrompt(tasks);
    
    try {
      const response = await aiApi.endpoints.createChatCompletion.initiate({
        messages: [
          {
            role: 'system',
            content: '你是時間管理專家。請分析任務列表並提供排程優化建議。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'openai/gpt-4o-mini',
        temperature: 0.6,
        max_tokens: 500
      });

      const content = (response as any).data?.choices?.[0]?.message?.content || '無法生成排程建議';
      
      return {
        id: `schedule-${Date.now()}`,
        type: 'time_management',
        title: '任務排程優化建議',
        content,
        suggestions: this.extractSuggestions(content),
        affectedTasks: tasks.slice(0, 5).map(t => t.id),
        createdAt: new Date().toISOString(),
        priority: 'medium'
      };
    } catch (error) {
      console.error('排程優化失敗:', error);
      return this.getFallbackScheduleInsight(tasks);
    }
  }

  private static buildProductivityPrompt(data: TaskAnalysisData): string {
    const overdueRate = (data.overdueTasks.length / data.totalTasks) * 100;
    const highPriorityTasks = data.tasks.filter(t => t.priority === 'high').length;
    const inProgressTasks = data.tasks.filter(t => t.status === 'in-progress').length;
    
    return `請分析以下任務管理數據：

總任務數: ${data.totalTasks}
已完成任務: ${data.completedTasks.length}
完成率: ${data.completionRate.toFixed(1)}%
逾期任務: ${data.overdueTasks.length} (${overdueRate.toFixed(1)}%)
高優先級任務: ${highPriorityTasks}
進行中任務: ${inProgressTasks}

主要問題識別：
${overdueRate > 20 ? '- 逾期率過高，需要改善時間管理' : ''}
${data.completionRate < 70 ? '- 完成率偏低，可能任務過多或時間估算不準' : ''}
${highPriorityTasks > 5 ? '- 高優先級任務過多，需要重新評估優先級' : ''}
${inProgressTasks > 3 ? '- 同時進行的任務過多，建議專注於少數任務' : ''}

請提供具體的改善建議和行動計劃。`;
  }

  private static buildScheduleOptimizationPrompt(tasks: Task[]): string {
    const tasksByPriority = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };

    const upcomingTasks = tasks
      .filter(t => t.dueDate && new Date(t.dueDate) > new Date())
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);

    return `請為以下任務提供排程優化建議：

任務優先級分布：
- 高優先級: ${tasksByPriority.high}
- 中優先級: ${tasksByPriority.medium}
- 低優先級: ${tasksByPriority.low}

即將到期的任務：
${upcomingTasks.map(t => `- ${t.title} (${t.dueDate})`).join('\n')}

請建議：
1. 最佳的任務執行順序
2. 時間分配策略
3. 風險管理建議
4. 效率提升方法`;
  }

  private static extractSuggestions(content: string): string[] {
    const lines = content.split('\n');
    const suggestions: string[] = [];
    
    for (const line of lines) {
      if (line.match(/^\d+\.|^-|^•/)) {
        suggestions.push(line.replace(/^\d+\.|^-|^•/, '').trim());
      }
    }
    
    return suggestions.slice(0, 5);
  }

  private static getFallbackProductivityInsight(data: TaskAnalysisData): AITaskInsight {
    const overdueRate = (data.overdueTasks.length / data.totalTasks) * 100;
    
    let type: AITaskInsight['type'] = 'productivity';
    let title = '任務生產力分析';
    let content = '';
    let suggestions: string[] = [];
    let priority: AITaskInsight['priority'] = 'medium';

    if (data.completionRate < 50) {
      type = 'productivity';
      title = '完成率偏低警示';
      content = `你的任務完成率為 ${data.completionRate.toFixed(1)}%，低於建議的70%標準。`;
      suggestions = [
        '重新評估任務的時間估算',
        '減少同時進行的任務數量',
        '設定更實際的每日目標'
      ];
      priority = 'high';
    } else if (overdueRate > 20) {
      type = 'time_management';
      title = '逾期任務過多';
      content = `有 ${overdueRate.toFixed(1)}% 的任務逾期，建議改善時間管理策略。`;
      suggestions = [
        '提前設定任務提醒',
        '為任務預留緩衝時間',
        '優先處理即將到期的任務'
      ];
      priority = 'high';
    } else {
      content = `你的任務管理表現良好，完成率為 ${data.completionRate.toFixed(1)}%。`;
      suggestions = [
        '保持當前的工作節奏',
        '考慮挑戰更多任務',
        '分享成功經驗給團隊'
      ];
      priority = 'low';
    }

    return {
      id: `fallback-task-${Date.now()}`,
      type,
      title,
      content,
      suggestions,
      affectedTasks: data.overdueTasks.slice(0, 3).map(t => t.id),
      createdAt: new Date().toISOString(),
      priority
    };
  }

  private static getFallbackClassification(task: Pick<Task, 'title' | 'description' | 'dueDate' | 'tags' | 'estimatedTime'>): TaskClassificationResult {
    let priority: 'low' | 'medium' | 'high' = 'medium';
    let quadrant: 1 | 2 | 3 | 4 = 2;
    let reasoning = '基於基本規則的分類';
    
    // 簡單的分類邏輯
    const hasDeadline = task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const isImportant = task.title.includes('重要') || task.description.includes('重要') || task.tags?.includes('重要');
    
    if (hasDeadline && isImportant) {
      priority = 'high';
      quadrant = 1;
      reasoning = '重要且緊急的任務';
    } else if (isImportant && !hasDeadline) {
      priority = 'high';
      quadrant = 2;
      reasoning = '重要但不緊急的任務';
    } else if (hasDeadline && !isImportant) {
      priority = 'medium';
      quadrant = 3;
      reasoning = '緊急但不重要的任務';
    } else {
      priority = 'low';
      quadrant = 4;
      reasoning = '不重要且不緊急的任務';
    }

    return {
      taskId: `temp-${Date.now()}`,
      suggestedPriority: priority,
      suggestedQuadrant: quadrant,
      reasoning,
      confidence: 0.6
    };
  }

  private static getFallbackScheduleInsight(tasks: Task[]): AITaskInsight {
    const highPriorityCount = tasks.filter(t => t.priority === 'high').length;
    
    return {
      id: `fallback-schedule-${Date.now()}`,
      type: 'time_management',
      title: '任務排程建議',
      content: `你有 ${tasks.length} 個待辦任務，其中 ${highPriorityCount} 個高優先級任務。建議優先處理高優先級和即將到期的任務。`,
      suggestions: [
        '先完成高優先級任務',
        '按截止日期排序任務',
        '每天專注於2-3個重要任務',
        '為意外情況預留時間'
      ],
      affectedTasks: tasks.slice(0, 5).map(t => t.id),
      createdAt: new Date().toISOString(),
      priority: 'medium'
    };
  }
}

export default TaskAIService;