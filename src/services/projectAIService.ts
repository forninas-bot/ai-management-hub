import { Project, Task, Milestone } from '../types';

interface ProjectAnalysisData {
  project: Project;
  tasks: Task[];
  completedTasks: Task[];
  overdueTasks: Task[];
  upcomingMilestones: Milestone[];
  teamProductivity?: number;
}

interface AIProjectInsight {
  id: string;
  type: 'risk' | 'optimization' | 'progress' | 'recommendation';
  title: string;
  content: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestions: string[];
  estimatedImpact: string;
  createdAt: string;
}

interface ProjectRiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: Array<{
    factor: string;
    impact: 'low' | 'medium' | 'high';
    probability: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
  overallAssessment: string;
  recommendations: string[];
}

interface ProjectOptimization {
  currentEfficiency: number;
  potentialImprovement: number;
  bottlenecks: Array<{
    area: string;
    description: string;
    solution: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  resourceOptimization: string[];
  timelineAdjustments: string[];
}

export class ProjectAIService {
  private static readonly AI_API_ENDPOINT = process.env.REACT_APP_AI_API_ENDPOINT || 'https://api.openai.com/v1';
  private static readonly AI_API_KEY = process.env.REACT_APP_AI_API_KEY;

  static async analyzeProjectHealth(data: ProjectAnalysisData): Promise<AIProjectInsight> {
    try {
      const completionRate = data.project.completionPercentage;
      const overdueTasks = data.overdueTasks.length;
      const totalTasks = data.tasks.length;
      const upcomingDeadlines = data.upcomingMilestones.filter(
        m => new Date(m.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ).length;

      const prompt = `請分析以下專案健康狀況並提供洞察：

專案資訊：
- 標題：${data.project.title}
- 完成率：${completionRate}%
- 總任務數：${totalTasks}
- 逾期任務：${overdueTasks}
- 即將到期的里程碑：${upcomingDeadlines}
- 專案狀態：${data.project.status}

請提供：
1. 專案健康狀況評估
2. 主要風險點
3. 改進建議
4. 預期影響

請以JSON格式回應，包含type, title, content, severity, suggestions, estimatedImpact字段。`;

      if (this.AI_API_KEY) {
        const response = await fetch(`${this.AI_API_ENDPOINT}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.AI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 500,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const result = await response.json();
          const aiResponse = JSON.parse(result.choices[0].message.content);
          
          return {
            id: `insight-${Date.now()}`,
            type: aiResponse.type || 'progress',
            title: aiResponse.title,
            content: aiResponse.content,
            severity: aiResponse.severity || 'medium',
            suggestions: aiResponse.suggestions || [],
            estimatedImpact: aiResponse.estimatedImpact,
            createdAt: new Date().toISOString()
          };
        }
      }

      // Fallback analysis
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      let title = '專案進展良好';
      let content = '專案按計劃進行中。';
      
      if (overdueTasks > totalTasks * 0.3) {
        severity = 'critical';
        title = '專案風險警告';
        content = `發現${overdueTasks}個逾期任務，佔總任務的${Math.round(overdueTasks/totalTasks*100)}%，需要立即關注。`;
      } else if (completionRate < 50 && upcomingDeadlines > 2) {
        severity = 'high';
        title = '進度落後警示';
        content = `專案完成率僅${completionRate}%，且有${upcomingDeadlines}個即將到期的里程碑。`;
      } else if (overdueTasks > 0) {
        severity = 'medium';
        title = '注意逾期任務';
        content = `有${overdueTasks}個任務逾期，建議優先處理。`;
      }

      return {
        id: `insight-${Date.now()}`,
        type: 'progress',
        title,
        content,
        severity,
        suggestions: [
          '定期檢查任務進度',
          '優先處理高優先級任務',
          '調整資源分配'
        ],
        estimatedImpact: '中等影響',
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('專案分析失敗:', error);
      throw new Error('無法完成專案分析');
    }
  }

  static async assessProjectRisks(data: ProjectAnalysisData): Promise<ProjectRiskAssessment> {
    try {
      const prompt = `請評估以下專案的風險：

專案：${data.project.title}
完成率：${data.project.completionPercentage}%
逾期任務：${data.overdueTasks.length}
總任務：${data.tasks.length}

請分析潛在風險並提供緩解建議。`;

      // 簡化的風險評估邏輯
      const overdueTasks = data.overdueTasks.length;
      const totalTasks = data.tasks.length;
      const completionRate = data.project.completionPercentage;
      
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      const riskFactors = [];
      
      if (overdueTasks > totalTasks * 0.2) {
        riskLevel = 'high';
        riskFactors.push({
          factor: '任務逾期率過高',
          impact: 'high' as const,
          probability: 'high' as const,
          mitigation: '重新評估任務優先級，增加資源投入'
        });
      }
      
      if (completionRate < 30) {
        riskLevel = riskLevel === 'high' ? 'critical' : 'medium';
        riskFactors.push({
          factor: '專案進度嚴重落後',
          impact: 'high' as const,
          probability: 'medium' as const,
          mitigation: '調整專案範圍或延長時程'
        });
      }

      return {
        riskLevel,
        riskFactors,
        overallAssessment: `專案風險等級：${riskLevel}。${riskFactors.length > 0 ? '需要關注主要風險因素。' : '專案風險在可控範圍內。'}`,
        recommendations: [
          '建立定期風險檢查機制',
          '制定應急計劃',
          '加強團隊溝通'
        ]
      };
    } catch (error) {
      console.error('風險評估失敗:', error);
      throw new Error('無法完成風險評估');
    }
  }

  static async optimizeProject(data: ProjectAnalysisData): Promise<ProjectOptimization> {
    try {
      const completedTasks = data.completedTasks.length;
      const totalTasks = data.tasks.length;
      const currentEfficiency = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      const bottlenecks = [];
      
      // 識別瓶頸
      if (data.overdueTasks.length > 0) {
        bottlenecks.push({
          area: '任務管理',
          description: `${data.overdueTasks.length}個任務逾期`,
          solution: '重新安排任務優先級，分配更多資源',
          priority: 'high' as const
        });
      }
      
      const highPriorityTasks = data.tasks.filter(t => t.priority === 'high' && t.status !== 'completed');
      if (highPriorityTasks.length > totalTasks * 0.3) {
        bottlenecks.push({
          area: '優先級管理',
          description: '高優先級任務過多',
          solution: '重新評估任務優先級，聚焦核心目標',
          priority: 'medium' as const
        });
      }

      return {
        currentEfficiency,
        potentialImprovement: Math.min(currentEfficiency + 20, 100),
        bottlenecks,
        resourceOptimization: [
          '合理分配團隊成員工作量',
          '使用自動化工具提高效率',
          '定期檢視和調整工作流程'
        ],
        timelineAdjustments: [
          '根據實際進度調整里程碑',
          '預留緩衝時間應對風險',
          '分階段交付降低風險'
        ]
      };
    } catch (error) {
      console.error('專案優化失敗:', error);
      throw new Error('無法完成專案優化');
    }
  }

  static async generateProgressReport(data: ProjectAnalysisData): Promise<AIProjectInsight> {
    try {
      const completionRate = data.project.completionPercentage;
      const completedMilestones = data.project.milestones.filter(m => m.completed).length;
      const totalMilestones = data.project.milestones.length;
      
      const content = `專案進度報告：

✅ 整體完成率：${completionRate}%
📋 任務狀況：${data.completedTasks.length}/${data.tasks.length} 已完成
🎯 里程碑：${completedMilestones}/${totalMilestones} 已達成
⚠️ 逾期任務：${data.overdueTasks.length}個

${completionRate >= 80 ? '專案進展順利，接近完成！' : 
  completionRate >= 60 ? '專案進展良好，需持續關注。' : 
  '專案需要加強管理和資源投入。'}`;

      return {
        id: `report-${Date.now()}`,
        type: 'progress',
        title: '專案進度報告',
        content,
        severity: completionRate >= 70 ? 'low' : completionRate >= 40 ? 'medium' : 'high',
        suggestions: [
          '定期更新任務狀態',
          '關注關鍵路徑任務',
          '及時調整資源分配'
        ],
        estimatedImpact: '提升專案可視性和控制力',
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('進度報告生成失敗:', error);
      throw new Error('無法生成進度報告');
    }
  }
}

export type { ProjectAnalysisData, AIProjectInsight, ProjectRiskAssessment, ProjectOptimization };