import { aiApi } from './aiService';

interface PomodoroAnalysisData {
  completedPomodoros: number;
  interruptions: Array<{
    time: string;
    reason: string;
    duration: number;
  }>;
  workDuration: number;
  breakDuration: number;
  sessionStartTime?: string;
  sessionEndTime?: string;
}

interface AIInsight {
  id: string;
  type: 'productivity' | 'focus' | 'break' | 'improvement';
  title: string;
  content: string;
  suggestions: string[];
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
}

export class PomodoroAIService {
  static async analyzeProductivity(data: PomodoroAnalysisData): Promise<AIInsight> {
    const prompt = this.buildAnalysisPrompt(data);
    
    try {
      const response = await aiApi.endpoints.createChatCompletion.initiate({
        messages: [
          {
            role: 'system',
            content: `你是一位專業的生產力分析師。請分析用戶的番茄鐘數據，提供個性化的專注力改善建議。
            
回應格式必須是JSON：
{
  "type": "productivity|focus|break|improvement",
  "title": "洞察標題",
  "content": "詳細分析內容",
  "suggestions": ["建議1", "建議2", "建議3"],
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
        max_tokens: 500
      });

      const aiResponse = (response as any).data?.choices?.[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('AI 回應為空');
      }

      // 解析AI回應
      const parsedResponse = JSON.parse(aiResponse);
      
      return {
        id: `insight-${Date.now()}`,
        type: parsedResponse.type || 'productivity',
        title: parsedResponse.title || '生產力分析',
        content: parsedResponse.content || '無法生成分析內容',
        suggestions: parsedResponse.suggestions || [],
        createdAt: new Date().toISOString(),
        priority: parsedResponse.priority || 'medium'
      };
    } catch (error) {
      console.error('AI分析失敗:', error);
      return this.getFallbackInsight(data);
    }
  }

  private static buildAnalysisPrompt(data: PomodoroAnalysisData): string {
    const interruptionRate = data.interruptions.length / Math.max(data.completedPomodoros, 1);
    const totalInterruptionTime = data.interruptions.reduce((sum, int) => sum + int.duration, 0);
    const avgInterruptionDuration = data.interruptions.length > 0 ? totalInterruptionTime / data.interruptions.length : 0;
    
    const commonReasons = this.getCommonInterruptionReasons(data.interruptions);
    
    return `請分析以下番茄鐘數據：

完成的番茄鐘數量: ${data.completedPomodoros}
工作時長設定: ${Math.floor(data.workDuration / 60)} 分鐘
休息時長設定: ${Math.floor(data.breakDuration / 60)} 分鐘
中斷次數: ${data.interruptions.length}
中斷率: ${(interruptionRate * 100).toFixed(1)}%
平均中斷時長: ${Math.floor(avgInterruptionDuration / 60)} 分鐘
主要中斷原因: ${commonReasons.join(', ')}

請提供：
1. 對當前專注表現的評估
2. 識別的主要問題
3. 3-5個具體的改善建議
4. 建議的優先級（high/medium/low）

請用繁體中文回應，語調要專業但友善。`;
  }

  private static getCommonInterruptionReasons(interruptions: PomodoroAnalysisData['interruptions']): string[] {
    const reasonCounts = interruptions.reduce((acc, int) => {
      acc[int.reason] = (acc[int.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(reasonCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([reason]) => reason);
  }

  private static getFallbackInsight(data: PomodoroAnalysisData): AIInsight {
    const interruptionRate = data.interruptions.length / Math.max(data.completedPomodoros, 1);
    
    let type: AIInsight['type'] = 'productivity';
    let title = '生產力分析';
    let content = '';
    let suggestions: string[] = [];
    let priority: AIInsight['priority'] = 'medium';

    if (data.completedPomodoros === 0) {
      type = 'focus';
      title = '專注力提升建議';
      content = '今天還沒有完成任何番茄鐘。建議從短時間開始，逐步建立專注習慣。';
      suggestions = [
        '嘗試從15分鐘的專注時間開始',
        '選擇一個安靜、無干擾的環境',
        '在開始前明確定義要完成的任務'
      ];
      priority = 'high';
    } else if (interruptionRate > 0.5) {
      type = 'focus';
      title = '中斷過多警示';
      content = `你的中斷率為 ${(interruptionRate * 100).toFixed(1)}%，這可能影響工作效率。`;
      suggestions = [
        '關閉手機通知或將手機放在另一個房間',
        '使用網站阻擋工具避免分心',
        '在開始前處理緊急事務'
      ];
      priority = 'high';
    } else if (data.completedPomodoros >= 6) {
      type = 'productivity';
      title = '優秀的專注表現';
      content = `恭喜！你今天完成了 ${data.completedPomodoros} 個番茄鐘，表現優異。`;
      suggestions = [
        '保持這個良好的節奏',
        '記錄今天的成功因素',
        '適當獎勵自己的努力'
      ];
      priority = 'low';
    } else {
      content = `你今天完成了 ${data.completedPomodoros} 個番茄鐘，中斷率為 ${(interruptionRate * 100).toFixed(1)}%。`;
      suggestions = [
        '嘗試延長專注時間',
        '分析並減少主要干擾源',
        '設定明確的每日目標'
      ];
    }

    return {
      id: `fallback-${Date.now()}`,
      type,
      title,
      content,
      suggestions,
      createdAt: new Date().toISOString(),
      priority
    };
  }

  static async generateDailyReport(data: PomodoroAnalysisData): Promise<AIInsight> {
    const prompt = `請為以下番茄鐘數據生成每日報告：

完成番茄鐘: ${data.completedPomodoros}
總中斷次數: ${data.interruptions.length}
工作效率評分: ${this.calculateEfficiencyScore(data)}/10

請提供今日總結和明日改善建議。`;

    try {
      const response = await aiApi.endpoints.createChatCompletion.initiate({
        messages: [
          {
            role: 'system',
            content: '你是一位生產力教練，請生成簡潔的每日番茄鐘報告。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'openai/gpt-4o-mini',
        temperature: 0.5
      });

      const content = (response as any).data?.choices?.[0]?.message?.content || '無法生成報告';
      
      return {
        id: `daily-report-${Date.now()}`,
        type: 'productivity',
        title: '每日生產力報告',
        content,
        suggestions: [],
        createdAt: new Date().toISOString(),
        priority: 'medium'
      };
    } catch (error) {
      console.error('生成每日報告失敗:', error);
      return this.getFallbackDailyReport(data);
    }
  }

  private static calculateEfficiencyScore(data: PomodoroAnalysisData): number {
    const baseScore = Math.min(data.completedPomodoros * 1.5, 8);
    const interruptionPenalty = data.interruptions.length * 0.5;
    return Math.max(Math.round(baseScore - interruptionPenalty), 1);
  }

  private static getFallbackDailyReport(data: PomodoroAnalysisData): AIInsight {
    const score = this.calculateEfficiencyScore(data);
    let content = `今日完成 ${data.completedPomodoros} 個番茄鐘，效率評分 ${score}/10。`;
    
    if (score >= 8) {
      content += ' 表現優異！保持這個節奏。';
    } else if (score >= 6) {
      content += ' 表現良好，還有提升空間。';
    } else {
      content += ' 建議明天調整策略，提高專注度。';
    }

    return {
      id: `fallback-daily-${Date.now()}`,
      type: 'productivity',
      title: '每日生產力報告',
      content,
      suggestions: [
        '設定明確的每日目標',
        '減少環境干擾',
        '保持規律的休息'
      ],
      createdAt: new Date().toISOString(),
      priority: 'medium'
    };
  }
}

export default PomodoroAIService;