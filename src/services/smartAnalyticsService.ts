// import { aiApi } from './aiService'; // 暫時註解，因為未使用
import { Note, Task, Project, PomodoroSession } from '../types';

// 智能分析數據接口
export interface AnalyticsData {
  notes: Note[];
  tasks: Task[];
  projects: Project[];
  pomodoroSessions: PomodoroSession[];
  timeRange: {
    start: string;
    end: string;
  };
}

// 生產力洞察接口
export interface ProductivityInsight {
  id: string;
  type: 'productivity' | 'efficiency' | 'focus' | 'workload' | 'trend';
  title: string;
  description: string;
  score: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  recommendations: string[];
  metrics: {
    current: number;
    previous: number;
    change: number;
    unit: string;
  };
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
}

// 預測分析接口
export interface PredictiveAnalysis {
  id: string;
  type: 'task_completion' | 'project_timeline' | 'productivity_forecast' | 'workload_prediction';
  title: string;
  prediction: {
    value: number;
    confidence: number; // 0-1
    timeframe: string;
    unit: string;
  };
  factors: Array<{
    name: string;
    impact: number; // -1 to 1
    description: string;
  }>;
  recommendations: string[];
  createdAt: string;
}

// 知識圖譜節點接口
export interface KnowledgeNode {
  id: string;
  type: 'note' | 'task' | 'project' | 'concept';
  title: string;
  content?: string;
  connections: Array<{
    targetId: string;
    strength: number; // 0-1
    type: 'related' | 'dependency' | 'reference' | 'similarity';
  }>;
  metadata: {
    createdAt: string;
    updatedAt: string;
    tags: string[];
    importance: number; // 0-1
  };
}

// 趨勢分析接口
export interface TrendAnalysis {
  id: string;
  metric: string;
  timeframe: 'daily' | 'weekly' | 'monthly';
  dataPoints: Array<{
    date: string;
    value: number;
    label?: string;
  }>;
  trend: {
    direction: 'up' | 'down' | 'stable';
    strength: number; // 0-1
    significance: 'high' | 'medium' | 'low';
  };
  insights: string[];
  predictions: Array<{
    date: string;
    predictedValue: number;
    confidence: number;
  }>;
}

// 智能分析服務類
export class SmartAnalyticsService {
  // 生成生產力洞察
  static async generateProductivityInsights(data: AnalyticsData): Promise<ProductivityInsight[]> {
    try {
      const insights: ProductivityInsight[] = [];
      
      // 任務完成率分析
      const completedTasks = data.tasks.filter(task => task.status === 'completed');
      const completionRate = data.tasks.length > 0 ? (completedTasks.length / data.tasks.length) * 100 : 0;
      
      insights.push({
        id: `productivity-${Date.now()}-1`,
        type: 'productivity',
        title: '任務完成效率',
        description: `在選定時間範圍內，您完成了 ${completedTasks.length} 個任務，完成率為 ${completionRate.toFixed(1)}%`,
        score: completionRate,
        trend: completionRate > 75 ? 'up' : completionRate > 50 ? 'stable' : 'down',
        recommendations: this.getCompletionRateRecommendations(completionRate),
        metrics: {
          current: completedTasks.length,
          previous: Math.floor(completedTasks.length * 0.8), // 模擬上期數據
          change: Math.floor(completedTasks.length * 0.2),
          unit: '個任務'
        },
        createdAt: new Date().toISOString(),
        priority: completionRate < 50 ? 'high' : completionRate < 75 ? 'medium' : 'low'
      });
      
      // 專注時間分析
      const totalFocusTime = data.pomodoroSessions.reduce((total, session) => {
        return total + session.totalWorkTime;
      }, 0);
      
      const avgFocusTime = data.pomodoroSessions.length > 0 ? totalFocusTime / data.pomodoroSessions.length : 0;
      
      insights.push({
        id: `focus-${Date.now()}-2`,
        type: 'focus',
        title: '專注時間分析',
        description: `平均每次專注時間為 ${Math.round(avgFocusTime)} 分鐘，總專注時間 ${Math.round(totalFocusTime / 60)} 小時`,
        score: Math.min((avgFocusTime / 25) * 100, 100), // 以25分鐘為基準
        trend: avgFocusTime > 20 ? 'up' : avgFocusTime > 15 ? 'stable' : 'down',
        recommendations: this.getFocusTimeRecommendations(avgFocusTime),
        metrics: {
          current: Math.round(totalFocusTime / 60),
          previous: Math.round(totalFocusTime / 60 * 0.9),
          change: Math.round(totalFocusTime / 60 * 0.1),
          unit: '小時'
        },
        createdAt: new Date().toISOString(),
        priority: avgFocusTime < 15 ? 'high' : 'medium'
      });
      
      // 筆記活躍度分析
      const recentNotes = data.notes.filter(note => {
        const noteDate = new Date(note.updatedAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return noteDate > weekAgo;
      });
      
      insights.push({
        id: `notes-${Date.now()}-3`,
        type: 'efficiency',
        title: '知識管理活躍度',
        description: `本週更新了 ${recentNotes.length} 篇筆記，知識庫持續成長中`,
        score: Math.min(recentNotes.length * 20, 100),
        trend: recentNotes.length > 3 ? 'up' : recentNotes.length > 1 ? 'stable' : 'down',
        recommendations: this.getNotesActivityRecommendations(recentNotes.length),
        metrics: {
          current: recentNotes.length,
          previous: Math.max(recentNotes.length - 2, 0),
          change: Math.min(recentNotes.length, 2),
          unit: '篇筆記'
        },
        createdAt: new Date().toISOString(),
        priority: recentNotes.length < 2 ? 'medium' : 'low'
      });
      
      return insights;
    } catch (error) {
      console.error('生成生產力洞察失敗:', error);
      return [];
    }
  }
  
  // 生成預測分析
  static async generatePredictiveAnalysis(data: AnalyticsData): Promise<PredictiveAnalysis[]> {
    try {
      const predictions: PredictiveAnalysis[] = [];
      
      // 任務完成預測
      const pendingTasks = data.tasks.filter(task => task.status === 'to-do' || task.status === 'in-progress');
      const avgCompletionTime = this.calculateAverageCompletionTime(data.tasks);
      
      predictions.push({
        id: `prediction-${Date.now()}-1`,
        type: 'task_completion',
        title: '任務完成時間預測',
        prediction: {
          value: Math.round(avgCompletionTime * pendingTasks.length),
          confidence: 0.75,
          timeframe: '未來7天',
          unit: '小時'
        },
        factors: [
          {
            name: '歷史完成速度',
            impact: 0.6,
            description: '基於過去任務的平均完成時間'
          },
          {
            name: '任務複雜度',
            impact: 0.3,
            description: '考慮任務優先級和預估工作量'
          },
          {
            name: '工作負荷',
            impact: 0.1,
            description: '當前待辦任務數量'
          }
        ],
        recommendations: [
          '建議優先處理高優先級任務',
          '考慮將大型任務分解為小任務',
          '合理安排工作時間，避免過度負荷'
        ],
        createdAt: new Date().toISOString()
      });
      
      // 生產力趨勢預測
      const productivityScore = this.calculateProductivityScore(data);
      
      predictions.push({
        id: `prediction-${Date.now()}-2`,
        type: 'productivity_forecast',
        title: '生產力趨勢預測',
        prediction: {
          value: Math.round(productivityScore * 1.1), // 假設有10%的改善空間
          confidence: 0.68,
          timeframe: '下週',
          unit: '分數'
        },
        factors: [
          {
            name: '專注時間趨勢',
            impact: 0.4,
            description: '番茄鐘使用頻率和效果'
          },
          {
            name: '任務完成率',
            impact: 0.35,
            description: '任務按時完成的比例'
          },
          {
            name: '知識積累',
            impact: 0.25,
            description: '筆記更新頻率和質量'
          }
        ],
        recommendations: [
          '保持規律的番茄鐘使用習慣',
          '定期回顧和調整任務優先級',
          '持續記錄和整理學習筆記'
        ],
        createdAt: new Date().toISOString()
      });
      
      return predictions;
    } catch (error) {
      console.error('生成預測分析失敗:', error);
      return [];
    }
  }
  
  // 構建知識圖譜
  static async buildKnowledgeGraph(data: AnalyticsData): Promise<KnowledgeNode[]> {
    try {
      const nodes: KnowledgeNode[] = [];
      
      // 為筆記創建節點
      data.notes.forEach(note => {
        const connections = this.findNoteConnections(note, data.notes, data.tasks, data.projects);
        
        nodes.push({
          id: note.id,
          type: 'note',
          title: note.title,
          content: note.content.substring(0, 200) + '...',
          connections,
          metadata: {
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
            tags: note.tags,
            importance: this.calculateNoteImportance(note, connections)
          }
        });
      });
      
      // 為任務創建節點
      data.tasks.forEach(task => {
        const connections = this.findTaskConnections(task, data.tasks, data.projects, data.notes);
        
        nodes.push({
          id: task.id,
          type: 'task',
          title: task.title,
          content: task.description,
          connections,
          metadata: {
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            tags: task.tags || [],
            importance: this.calculateTaskImportance(task, connections)
          }
        });
      });
      
      // 為專案創建節點
      data.projects.forEach(project => {
        const connections = this.findProjectConnections(project, data.projects, data.tasks, data.notes);
        
        nodes.push({
          id: project.id,
          type: 'project',
          title: project.title,
          content: project.description,
          connections,
          metadata: {
            createdAt: project.startDate,
            updatedAt: project.actualEndDate || project.targetEndDate,
            tags: project.tags || [],
            importance: this.calculateProjectImportance(project, connections)
          }
        });
      });
      
      return nodes;
    } catch (error) {
      console.error('構建知識圖譜失敗:', error);
      return [];
    }
  }
  
  // 生成趨勢分析
  static async generateTrendAnalysis(data: AnalyticsData): Promise<TrendAnalysis[]> {
    try {
      const trends: TrendAnalysis[] = [];
      
      // 任務完成趨勢
      const taskTrend = this.analyzeTaskCompletionTrend(data.tasks);
      trends.push(taskTrend);
      
      // 專注時間趨勢
      const focusTrend = this.analyzeFocusTimeTrend(data.pomodoroSessions);
      trends.push(focusTrend);
      
      // 筆記活躍度趨勢
      const notesTrend = this.analyzeNotesActivityTrend(data.notes);
      trends.push(notesTrend);
      
      return trends;
    } catch (error) {
      console.error('生成趨勢分析失敗:', error);
      return [];
    }
  }
  
  // 輔助方法
  private static getCompletionRateRecommendations(rate: number): string[] {
    if (rate < 50) {
      return [
        '建議重新評估任務優先級，專注於最重要的任務',
        '考慮將大型任務分解為更小的可管理單元',
        '設定更實際的截止日期和工作量預估'
      ];
    } else if (rate < 75) {
      return [
        '保持當前的工作節奏，可以適度增加任務量',
        '定期回顧和調整任務計劃',
        '考慮使用番茄鐘技術提高專注度'
      ];
    } else {
      return [
        '優秀的完成率！可以考慮承擔更具挑戰性的任務',
        '分享您的時間管理經驗給團隊',
        '保持這種高效的工作狀態'
      ];
    }
  }
  
  private static getFocusTimeRecommendations(avgTime: number): string[] {
    if (avgTime < 15) {
      return [
        '建議從短時間專注開始，逐步增加專注時長',
        '創造無干擾的工作環境',
        '使用番茄鐘技術培養專注習慣'
      ];
    } else if (avgTime < 25) {
      return [
        '專注時間不錯，可以嘗試延長到25分鐘',
        '在專注期間關閉通知和干擾源',
        '適當的休息有助於保持專注力'
      ];
    } else {
      return [
        '優秀的專注能力！保持這種狀態',
        '可以嘗試處理更複雜的任務',
        '分享您的專注技巧給其他人'
      ];
    }
  }
  
  private static getNotesActivityRecommendations(count: number): string[] {
    if (count < 2) {
      return [
        '建議增加筆記記錄的頻率',
        '嘗試記錄每日學習和工作心得',
        '使用筆記來整理和鞏固知識'
      ];
    } else if (count < 5) {
      return [
        '良好的筆記習慣，繼續保持',
        '可以嘗試建立筆記之間的關聯',
        '定期回顧和整理筆記內容'
      ];
    } else {
      return [
        '非常活躍的知識管理！',
        '考慮建立知識體系和分類',
        '可以將筆記轉化為可行動的任務'
      ];
    }
  }
  
  private static calculateAverageCompletionTime(tasks: Task[]): number {
    const completedTasks = tasks.filter(task => 
      task.status === 'completed' && task.createdAt && task.updatedAt
    );
    
    if (completedTasks.length === 0) return 2; // 默認2小時
    
    const totalTime = completedTasks.reduce((total, task) => {
      const created = new Date(task.createdAt).getTime();
      const completed = new Date(task.updatedAt).getTime();
      return total + (completed - created);
    }, 0);
    
    return totalTime / completedTasks.length / (1000 * 60 * 60); // 轉換為小時
  }
  
  private static calculateProductivityScore(data: AnalyticsData): number {
    const taskScore = data.tasks.length > 0 ? 
      (data.tasks.filter(t => t.status === 'completed').length / data.tasks.length) * 40 : 0;
    
    const focusScore = data.pomodoroSessions.length > 0 ? 
      Math.min(data.pomodoroSessions.length * 5, 30) : 0;
    
    const notesScore = Math.min(data.notes.length * 2, 30);
    
    return Math.round(taskScore + focusScore + notesScore);
  }
  
  private static findNoteConnections(note: Note, notes: Note[], tasks: Task[], projects: Project[]) {
    const connections: KnowledgeNode['connections'] = [];
    
    // 查找相似標籤的筆記
    notes.forEach(otherNote => {
      if (otherNote.id !== note.id) {
        const commonTags = note.tags.filter(tag => otherNote.tags.includes(tag));
        if (commonTags.length > 0) {
          connections.push({
            targetId: otherNote.id,
            strength: commonTags.length / Math.max(note.tags.length, otherNote.tags.length),
            type: 'similarity'
          });
        }
      }
    });
    
    return connections;
  }
  
  private static findTaskConnections(task: Task, tasks: Task[], projects: Project[], notes: Note[]) {
    const connections: KnowledgeNode['connections'] = [];
    
    // 查找同專案的任務
    if (task.relatedProjectId) {
      tasks.forEach(otherTask => {
        if (otherTask.id !== task.id && otherTask.relatedProjectId === task.relatedProjectId) {
          connections.push({
            targetId: otherTask.id,
            strength: 0.8,
            type: 'related'
          });
        }
      });
    }
    
    return connections;
  }
  
  private static findProjectConnections(project: Project, projects: Project[], tasks: Task[], notes: Note[]) {
    const connections: KnowledgeNode['connections'] = [];
    
    // 查找專案相關的任務
    tasks.forEach(task => {
      if (task.relatedProjectId === project.id) {
        connections.push({
          targetId: task.id,
          strength: 0.9,
          type: 'dependency'
        });
      }
    });
    
    return connections;
  }
  
  private static calculateNoteImportance(note: Note, connections: KnowledgeNode['connections']): number {
    const baseScore = 0.3;
    const connectionScore = connections.length * 0.1;
    const contentScore = Math.min(note.content.length / 1000, 0.3);
    const tagScore = Math.min(note.tags.length * 0.05, 0.2);
    
    return Math.min(baseScore + connectionScore + contentScore + tagScore, 1);
  }
  
  private static calculateTaskImportance(task: Task, connections: KnowledgeNode['connections']): number {
    const priorityScore = task.priority === 'high' ? 0.4 : task.priority === 'medium' ? 0.3 : 0.2;
    const connectionScore = connections.length * 0.1;
    const statusScore = task.status === 'completed' ? 0.2 : task.status === 'in-progress' ? 0.3 : 0.1;
    
    return Math.min(priorityScore + connectionScore + statusScore, 1);
  }
  
  private static calculateProjectImportance(project: Project, connections: KnowledgeNode['connections']): number {
    const statusScore = project.status === 'in-progress' ? 0.4 : project.status === 'completed' ? 0.3 : 0.2;
    const connectionScore = connections.length * 0.05;
    const progressScore = (project.completionPercentage || 0) / 100 * 0.3;
    
    return Math.min(statusScore + connectionScore + progressScore, 1);
  }
  
  private static analyzeTaskCompletionTrend(tasks: Task[]): TrendAnalysis {
    // 簡化的趨勢分析實現
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
    
    const dataPoints = last7Days.map(date => {
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.updatedAt).toISOString().split('T')[0];
        return taskDate === date && task.status === 'completed';
      });
      
      return {
        date,
        value: dayTasks.length,
        label: `${dayTasks.length} 個任務`
      };
    });
    
    const avgValue = dataPoints.reduce((sum, point) => sum + point.value, 0) / dataPoints.length;
    const trend = dataPoints[dataPoints.length - 1].value > avgValue ? 'up' : 
                 dataPoints[dataPoints.length - 1].value < avgValue ? 'down' : 'stable';
    
    return {
      id: `trend-tasks-${Date.now()}`,
      metric: '任務完成數量',
      timeframe: 'daily',
      dataPoints,
      trend: {
        direction: trend,
        strength: 0.7,
        significance: 'medium'
      },
      insights: [
        `過去7天平均每天完成 ${avgValue.toFixed(1)} 個任務`,
        trend === 'up' ? '任務完成效率呈上升趨勢' : 
        trend === 'down' ? '任務完成效率有所下降' : '任務完成效率保持穩定'
      ],
      predictions: [
        {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          predictedValue: Math.round(avgValue * 1.1),
          confidence: 0.6
        }
      ]
    };
  }
  
  private static analyzeFocusTimeTrend(sessions: PomodoroSession[]): TrendAnalysis {
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
    
    const dataPoints = last7Days.map(date => {
      const daySessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
        return sessionDate === date;
      });
      
      const totalMinutes = daySessions.reduce((total, session) => {
        return total + session.totalWorkTime;
      }, 0);
      
      return {
        date,
        value: Math.round(totalMinutes),
        label: `${Math.round(totalMinutes)} 分鐘`
      };
    });
    
    const avgValue = dataPoints.reduce((sum, point) => sum + point.value, 0) / dataPoints.length;
    const trend = dataPoints[dataPoints.length - 1].value > avgValue ? 'up' : 
                 dataPoints[dataPoints.length - 1].value < avgValue ? 'down' : 'stable';
    
    return {
      id: `trend-focus-${Date.now()}`,
      metric: '專注時間',
      timeframe: 'daily',
      dataPoints,
      trend: {
        direction: trend,
        strength: 0.8,
        significance: 'high'
      },
      insights: [
        `過去7天平均每天專注 ${avgValue.toFixed(0)} 分鐘`,
        trend === 'up' ? '專注時間呈增長趨勢，保持良好習慣' : 
        trend === 'down' ? '專注時間有所減少，建議調整作息' : '專注時間保持穩定'
      ],
      predictions: [
        {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          predictedValue: Math.round(avgValue * (trend === 'up' ? 1.1 : trend === 'down' ? 0.9 : 1)),
          confidence: 0.75
        }
      ]
    };
  }
  
  private static analyzeNotesActivityTrend(notes: Note[]): TrendAnalysis {
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
    
    const dataPoints = last7Days.map(date => {
      const dayNotes = notes.filter(note => {
        const noteDate = new Date(note.updatedAt).toISOString().split('T')[0];
        return noteDate === date;
      });
      
      return {
        date,
        value: dayNotes.length,
        label: `${dayNotes.length} 篇筆記`
      };
    });
    
    const avgValue = dataPoints.reduce((sum, point) => sum + point.value, 0) / dataPoints.length;
    const trend = dataPoints[dataPoints.length - 1].value > avgValue ? 'up' : 
                 dataPoints[dataPoints.length - 1].value < avgValue ? 'down' : 'stable';
    
    return {
      id: `trend-notes-${Date.now()}`,
      metric: '筆記活躍度',
      timeframe: 'daily',
      dataPoints,
      trend: {
        direction: trend,
        strength: 0.6,
        significance: 'medium'
      },
      insights: [
        `過去7天平均每天更新 ${avgValue.toFixed(1)} 篇筆記`,
        trend === 'up' ? '知識記錄活躍度提升' : 
        trend === 'down' ? '建議增加知識記錄頻率' : '知識記錄保持穩定'
      ],
      predictions: [
        {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          predictedValue: Math.round(avgValue),
          confidence: 0.5
        }
      ]
    };
  }
}

// 導出智能分析相關的hooks
export const useSmartAnalytics = () => {
  const generateInsights = async (data: AnalyticsData) => {
    return await SmartAnalyticsService.generateProductivityInsights(data);
  };
  
  const generatePredictions = async (data: AnalyticsData) => {
    return await SmartAnalyticsService.generatePredictiveAnalysis(data);
  };
  
  const buildKnowledgeGraph = async (data: AnalyticsData) => {
    return await SmartAnalyticsService.buildKnowledgeGraph(data);
  };
  
  const generateTrends = async (data: AnalyticsData) => {
    return await SmartAnalyticsService.generateTrendAnalysis(data);
  };
  
  return {
    generateInsights,
    generatePredictions,
    buildKnowledgeGraph,
    generateTrends
  };
};

export default SmartAnalyticsService;