import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../../app/hooks';
import { AIAutomationService, TaskAllocationResult, ScheduleOptimization, WorkflowSuggestion } from '../../services/aiAutomationService';
// import { Task, Project } from '../../types'; // 暫時註解，因為未使用
import Card from '../ui/Card';
import Button from '../ui/Button';

interface AIAutomationPanelProps {
  className?: string;
}

const AIAutomationPanel: React.FC<AIAutomationPanelProps> = ({ className }) => {
  // const dispatch = useAppDispatch(); // 暫時註解，因為未使用
  const { tasks } = useAppSelector(state => state.tasks);
  const { projects } = useAppSelector(state => state.projects);
  const settings = useAppSelector(state => state.settings || {});
  const sessions = useAppSelector(state => state.pomodoro?.currentSession ? [state.pomodoro.currentSession] : []);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [taskAllocations, setTaskAllocations] = useState<TaskAllocationResult[]>([]);
  const [scheduleOptimization, setScheduleOptimization] = useState<ScheduleOptimization | null>(null);
  const [workflowSuggestions, setWorkflowSuggestions] = useState<WorkflowSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState('allocation');
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);

  // 自動分析觸發
  useEffect(() => {
    const shouldAutoAnalyze = () => {
      if (!lastAnalysisTime) return true;
      const timeSinceLastAnalysis = Date.now() - lastAnalysisTime.getTime();
      return timeSinceLastAnalysis > 30 * 60 * 1000; // 30分鐘
    };

    if (tasks.length > 0 && shouldAutoAnalyze()) {
      handleAnalyzeAll();
    }
  }, [tasks.length, lastAnalysisTime]);

  const handleAnalyzeAll = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const [allocations, optimization, suggestions] = await Promise.all([
        AIAutomationService.analyzeTaskAllocation(tasks, settings, sessions, []),
        AIAutomationService.optimizeSchedule(tasks, projects, settings),
        AIAutomationService.generateWorkflowSuggestions(tasks, projects, sessions)
      ]);

      setTaskAllocations(allocations);
      setScheduleOptimization(optimization);
      setWorkflowSuggestions(suggestions);
      setLastAnalysisTime(new Date());
    } catch (error) {
      console.error('AI自動化分析失敗:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [tasks, projects, settings, sessions]);

  const handleApplyAllocation = (allocation: TaskAllocationResult) => {
    // 這裡可以整合到任務更新邏輯
    console.log('應用任務分配:', allocation);
  };

  const handleApplyOptimization = () => {
    if (scheduleOptimization) {
      console.log('應用排程優化:', scheduleOptimization);
    }
  };

  const handleImplementSuggestion = (suggestion: WorkflowSuggestion) => {
    console.log('實施工作流程建議:', suggestion);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 標題和控制區 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI 自動化助手</h2>
          <p className="text-gray-600 mt-1">
            智能任務分配、排程優化和工作流程建議
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {lastAnalysisTime && (
            <span className="text-sm text-gray-500">
              上次分析: {lastAnalysisTime.toLocaleTimeString()}
            </span>
          )}
          <Button 
            onClick={handleAnalyzeAll}
            disabled={isAnalyzing}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isAnalyzing ? (
              <>
                <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                分析中...
              </>
            ) : (
              <>
                <span className="mr-2">⚡</span>
                開始AI分析
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 分析結果標籤頁 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('allocation')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'allocation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            智能分配 {taskAllocations.length > 0 && `(${taskAllocations.length})`}
          </button>
          <button
            onClick={() => setActiveTab('optimization')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'optimization'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            排程優化 {scheduleOptimization && `(${scheduleOptimization.recommendations.length})`}
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'workflow'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            流程建議 {workflowSuggestions.length > 0 && `(${workflowSuggestions.length})`}
          </button>
        </nav>
      </div>

        {/* 智能任務分配 */}
        {activeTab === 'allocation' && (
          <div className="space-y-4 mt-6">
            <Card className="shadow-sm border border-gray-200 rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">智能任務分配建議</h3>
                {taskAllocations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-400">⏰</span>
                    </div>
                    <p>點擊「開始AI分析」來獲取智能任務分配建議</p>
                  </div>
                ) : (
                <div className="space-y-4">
                  {taskAllocations.map((allocation) => {
                    const task = tasks.find(t => t.id === allocation.taskId);
                    if (!task) return null;
                    
                    return (
                      <div key={allocation.taskId} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">{task.title}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              <span className={`text-sm font-medium ${getConfidenceColor(allocation.confidence)}`}>
                                信心度: {Math.round(allocation.confidence * 100)}%
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">建議時間段</p>
                                <p className="font-medium">
                                  {allocation.suggestedTimeSlot.date} {allocation.suggestedTimeSlot.startTime} - {allocation.suggestedTimeSlot.endTime}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-1">分配理由</p>
                                <p className="text-sm">{allocation.reasoning}</p>
                              </div>
                            </div>
                            
                            {allocation.conflictWarnings.length > 0 && (
                              <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <div className="flex items-start">
                                  <span className="text-yellow-600 mr-2">⚠️</span>
                                  <div>
                                    <strong className="text-yellow-800">潛在衝突:</strong>
                                    <span className="text-yellow-700 ml-1">{allocation.conflictWarnings.join(', ')}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => handleApplyAllocation(allocation)}
                            className="ml-4"
                          >
                            應用分配
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              </div>
            </Card>
          </div>
        )}

        {/* 排程優化 */}
        {activeTab === 'optimization' && (
          <div className="space-y-4 mt-6">
            <Card className="shadow-sm border border-gray-200 rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">排程優化分析</h3>
                {!scheduleOptimization ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-400">📈</span>
                    </div>
                    <p>點擊「開始AI分析」來獲取排程優化建議</p>
                  </div>
                ) : (
                <div className="space-y-6">
                  {/* 優化概覽 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-blue-600">⏰</span>
                        <span className="font-medium text-blue-900">時間節省</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {scheduleOptimization.totalTimeReduction}小時
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-green-600">📈</span>
                        <span className="font-medium text-green-900">效率提升</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {scheduleOptimization.efficiencyGain}%
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-purple-600">✅</span>
                        <span className="font-medium text-purple-900">優化任務</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {scheduleOptimization.optimizedSchedule.length}
                      </p>
                    </div>
                  </div>
                  
                  {/* 建議列表 */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">優化建議</h4>
                    <div className="space-y-2">
                      {scheduleOptimization.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-green-600 mt-0.5">✅</span>
                          <span className="text-green-800">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 潛在問題 */}
                  {scheduleOptimization.potentialIssues.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">需要注意的問題</h4>
                      <div className="space-y-2">
                        {scheduleOptimization.potentialIssues.map((issue, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                            <span className="text-yellow-600 mt-0.5">⚠️</span>
                            <span className="text-yellow-800">{issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button onClick={handleApplyOptimization} className="bg-green-600 hover:bg-green-700">
                      應用優化方案
                    </Button>
                  </div>
                </div>
              )}
              </div>
            </Card>
          </div>
        )}

        {/* 工作流程建議 */}
        {activeTab === 'workflow' && (
          <div className="space-y-4 mt-6">
            <Card className="shadow-sm border border-gray-200 rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">工作流程改進建議</h3>
                {workflowSuggestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-400">💡</span>
                    </div>
                    <p>點擊「開始AI分析」來獲取工作流程改進建議</p>
                  </div>
                ) : (
                <div className="space-y-4">
                  {workflowSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded border">
                              {suggestion.type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{suggestion.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">實施步驟</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {suggestion.implementationSteps.map((step, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-blue-600 font-medium">{index + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">預期效益</p>
                          <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
                            {suggestion.expectedBenefit}
                          </p>
                          
                          {suggestion.affectedTasks.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">影響任務</p>
                              <p className="text-sm text-gray-600">
                                {suggestion.affectedTasks.length} 個任務將受到影響
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleImplementSuggestion(suggestion)}
                          className="border border-gray-300 bg-white hover:bg-gray-50"
                        >
                          實施建議
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </Card>
          </div>
        )}
    </div>
  );
};

export default AIAutomationPanel;