import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { Task } from '../types';
import { TaskAIService } from '../services/taskAIService';
import { StatCard, ListItemTransition } from '../components/ui';
import { ParticleEffect, DataFlow } from '../components/effects';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AIAutomationPanel from '../components/AIAutomation/AIAutomationPanel';
import {
  requestAIAnalysis,
  receiveAIInsight,
  clearAIInsights,
  receiveTaskClassification,
  applyAIClassification,
  createTask,
  updateTask,
  deleteTask
} from '../features/tasks/tasksSlice';
import { updateProjectProgress } from '../features/projects/projectsSlice';

const TaskCenter: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, aiInsights, isAnalyzing, classificationResults } = useAppSelector(state => state.tasks);
  const { projects } = useAppSelector(state => state.projects);
  const [currentView, setCurrentView] = useState<'list' | 'calendar' | 'quadrant' | 'automation'>('list');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    quadrant: 'not-important-not-urgent' as Task['quadrant'],
    dueDate: '',
    estimatedTime: 0
  });
  const [editTaskData, setEditTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    quadrant: 'not-important-not-urgent' as Task['quadrant'],
    dueDate: '',
    estimatedTime: 0
  });

  const todoTasks = tasks.filter(task => task.status === 'to-do');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const handleAIAnalysis = async () => {
    dispatch(requestAIAnalysis());
    
    try {
      const completedTasks = tasks.filter(t => t.status === 'completed');
      const overdueTasks = tasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
      );
      
      const analysisData = {
         tasks: tasks.filter(t => t.status !== 'completed'),
         completedTasks,
         overdueTasks,
         totalTasks: tasks.length,
         completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0
       };
      
      const insight = await TaskAIService.analyzeTaskProductivity(analysisData);
      dispatch(receiveAIInsight(insight));
      setShowAIPanel(true);
    } catch (error) {
      console.error('AI分析失敗:', error);
    }
  };

  const handleTaskClassification = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    try {
      const classification = await TaskAIService.classifyTask({
         title: task.title,
         description: task.description || '',
         dueDate: task.dueDate,
         tags: task.tags,
         estimatedTime: task.estimatedTime
       });
      
      dispatch(receiveTaskClassification({ ...classification, taskId }));
    } catch (error) {
      console.error('任務分類失敗:', error);
    }
  };

  const handleApplyClassification = (taskId: string, accept: boolean) => {
    dispatch(applyAIClassification({ taskId, acceptClassification: accept }));
  };

  const handleClearInsights = () => {
    dispatch(clearAIInsights());
    setShowAIPanel(false);
  };

  const handleCreateTask = () => {
    setShowCreateForm(true);
  };

  const handleSubmitTask = () => {
    if (!newTaskData.title.trim()) return;
    
    dispatch(createTask({
      title: newTaskData.title,
      description: newTaskData.description,
      priority: newTaskData.priority,
      quadrant: newTaskData.quadrant,
      dueDate: newTaskData.dueDate || undefined,
      estimatedTime: newTaskData.estimatedTime || undefined
    }));
    
    setNewTaskData({
      title: '',
      description: '',
      priority: 'medium',
      quadrant: 'not-important-not-urgent',
      dueDate: '',
      estimatedTime: 0
    });
    setShowCreateForm(false);
  };

  const handleCancelCreate = () => {
    setNewTaskData({
      title: '',
      description: '',
      priority: 'medium',
      quadrant: 'not-important-not-urgent',
      dueDate: '',
      estimatedTime: 0
    });
    setShowCreateForm(false);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('確定要刪除這個任務嗎？')) {
      dispatch(deleteTask(taskId));
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditTaskData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      quadrant: task.quadrant || 'not-urgent-not-important',
      dueDate: task.dueDate || '',
      estimatedTime: task.estimatedTime || 0
    });
  };

  const handleUpdateTask = () => {
    if (!editingTask || !editTaskData.title.trim()) return;
    
    dispatch(updateTask({
      ...editingTask,
      title: editTaskData.title,
      description: editTaskData.description,
      priority: editTaskData.priority,
      quadrant: editTaskData.quadrant,
      dueDate: editTaskData.dueDate || undefined,
      estimatedTime: editTaskData.estimatedTime || undefined
    }));
    
    // 如果任務有關聯專案，更新專案進度
    if (editingTask.relatedProjectId) {
      dispatch(updateProjectProgress({
        projectId: editingTask.relatedProjectId,
        tasks: tasks
      }));
    }
    
    setEditingTask(null);
    setEditTaskData({
      title: '',
      description: '',
      priority: 'medium',
      quadrant: 'not-important-not-urgent',
      dueDate: '',
      estimatedTime: 0
    });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditTaskData({
      title: '',
      description: '',
      priority: 'medium',
      quadrant: 'not-important-not-urgent',
      dueDate: '',
      estimatedTime: 0
    });
  };

  const handleToggleTaskStatus = (taskId: string, currentStatus: Task['status']) => {
     const task = tasks.find(t => t.id === taskId);
     if (!task) return;
     
     const statusOrder: Task['status'][] = ['to-do', 'in-progress', 'completed'];
     const currentIndex = statusOrder.indexOf(currentStatus);
     const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
     
     dispatch(updateTask({
       ...task,
       status: nextStatus
     }));
     
     // 如果任務有關聯專案，更新專案進度
     if (task.relatedProjectId) {
       dispatch(updateProjectProgress({
         projectId: task.relatedProjectId,
         tasks: tasks
       }));
     }
    };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-white/95 to-blue-50/80 p-6 relative overflow-hidden"
    >
      {/* 梵高風格背景裝飾 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/8 to-purple-500/8 rounded-full blur-xl animate-van-gogh-pulse" />
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-br from-yellow-400/8 to-orange-500/8 rounded-full blur-lg animate-van-gogh-bounce" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-green-400/6 to-teal-500/6 rounded-full blur-2xl animate-van-gogh-pulse" />
      </div>
      
      {/* 頁面標題 - 梵高風格 */}
      <motion.div 
        className="text-center mb-8 relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-600 bg-clip-text text-transparent mb-4 animate-van-gogh-fade">
          📋 任務管理中心
        </h1>
        <p className="text-neutral-600 text-lg max-w-2xl mx-auto leading-relaxed">
          運用AI智能分析，讓任務管理變得更加高效和直觀
        </p>
      </motion.div>
      
      {/* 統計卡片 - 梵高風格 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 relative z-10">
        {[
          { label: '總任務數', value: tasks.length, icon: '📊', color: 'from-blue-500 to-purple-600' },
          { label: '待辦事項', value: todoTasks.length, icon: '📝', color: 'from-orange-500 to-yellow-500' },
          { label: '進行中', value: inProgressTasks.length, icon: '🔄', color: 'from-green-500 to-blue-500' },
          { label: '已完成', value: completedTasks.length, icon: '✅', color: 'from-purple-500 to-pink-500' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
          >
            <Card 
              variant="van-gogh" 
              size="md" 
              className="text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <h3 className="text-3xl font-bold text-neutral-800 mb-2">{stat.value}</h3>
              <p className="text-neutral-600 text-sm font-medium">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* 操作按鈕區 - 梵高風格 */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center relative z-10">
        <Button 
          variant="van-gogh" 
          size="lg" 
          onClick={handleCreateTask}
          className="shadow-xl hover:shadow-2xl"
          glow
        >
          ➕ 新增任務
        </Button>
        <Button 
          variant="neural" 
          size="lg" 
          onClick={handleAIAnalysis}
          className="shadow-lg hover:shadow-xl"
          disabled={isAnalyzing}
        >
          {isAnalyzing ? '🔄 分析中...' : '🤖 AI分析'}
        </Button>
        <Button 
          variant="glass" 
          size="lg" 
          onClick={() => setCurrentView(currentView === 'list' ? 'quadrant' : 'list')}
          className="shadow-lg hover:shadow-xl"
        >
          {currentView === 'list' ? '🎯 四象限檢視' : '📋 列表檢視'}
        </Button>
      </div>

      {/* 編輯任務表單 */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-dark mb-4">編輯任務</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neural-700 mb-1">任務標題 *</label>
                <input
                  type="text"
                  value={editTaskData.title}
                  onChange={(e) => setEditTaskData({ ...editTaskData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="輸入任務標題"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neural-700 mb-1">任務描述</label>
                <textarea
                  value={editTaskData.description}
                  onChange={(e) => setEditTaskData({ ...editTaskData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="輸入任務描述"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neural-700 mb-1">優先級</label>
                <select
                  value={editTaskData.priority}
                  onChange={(e) => setEditTaskData({ ...editTaskData, priority: e.target.value as Task['priority'] })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neural-700 mb-1">四象限分類</label>
                <select
                  value={editTaskData.quadrant || 'not-important-not-urgent'}
                  onChange={(e) => setEditTaskData({ ...editTaskData, quadrant: e.target.value as Task['quadrant'] })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="important-urgent">🔴 緊急且重要</option>
                  <option value="important-not-urgent">🔵 重要但不緊急</option>
                  <option value="not-important-urgent">🟡 緊急但不重要</option>
                  <option value="not-important-not-urgent">⚪ 不緊急不重要</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neural-700 mb-1">截止日期</label>
                <input
                  type="date"
                  value={editTaskData.dueDate}
                  onChange={(e) => setEditTaskData({ ...editTaskData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neural-700 mb-1">預估時間 (分鐘)</label>
                <input
                  type="number"
                  value={editTaskData.estimatedTime}
                  onChange={(e) => setEditTaskData({ ...editTaskData, estimatedTime: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="預估完成時間"
                  min="0"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUpdateTask}
                disabled={!editTaskData.title.trim()}
                className="flex-1 bg-primary hover:bg-primary/80 disabled:bg-gray disabled:cursor-not-allowed text-white rounded-lg px-4 py-2"
              >
                更新任務
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-gray hover:bg-gray/80 text-white rounded-lg px-4 py-2"
              >
                取消
              </button>
            </div>
         </div>
       </div>
      )}

      {/* 創建任務表單 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-dark mb-4">創建新任務</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neural-700 mb-1">任務標題 *</label>
                <input
                  type="text"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="輸入任務標題"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neural-700 mb-1">任務描述</label>
                <textarea
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="輸入任務描述"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neural-700 mb-1">優先級</label>
                <select
                  value={newTaskData.priority}
                  onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value as Task['priority'] })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neural-700 mb-1">四象限分類</label>
                <select
                  value={newTaskData.quadrant}
                  onChange={(e) => setNewTaskData({ ...newTaskData, quadrant: e.target.value as Task['quadrant'] })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="urgent-important">🔴 緊急且重要</option>
                  <option value="not-urgent-important">🔵 重要但不緊急</option>
                  <option value="urgent-not-important">🟡 緊急但不重要</option>
                  <option value="not-urgent-not-important">⚪ 不緊急不重要</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neural-700 mb-1">截止日期</label>
                <input
                  type="date"
                  value={newTaskData.dueDate}
                  onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neural-700 mb-1">預估時間 (分鐘)</label>
                <input
                  type="number"
                  value={newTaskData.estimatedTime}
                  onChange={(e) => setNewTaskData({ ...newTaskData, estimatedTime: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="預估完成時間"
                  min="0"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSubmitTask}
                disabled={!newTaskData.title.trim()}
                className="flex-1 bg-primary hover:bg-primary/80 disabled:bg-gray disabled:cursor-not-allowed text-white rounded-lg px-4 py-2"
              >
                創建任務
              </button>
              <button
                onClick={handleCancelCreate}
                className="flex-1 bg-gray hover:bg-gray/80 text-white rounded-lg px-4 py-2"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 根據視圖類型渲染不同內容 */}
      {currentView === 'list' && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-dark mb-4">📋 任務列表</h3>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-neural-600">
                <div className="mb-4">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-neural-800 mb-2">還沒有任務</h3>
                  <p className="text-neural-600">點擊「+ 新增任務」開始管理你的任務</p>
                </div>
                <button
                  onClick={handleCreateTask}
                  className="bg-primary hover:bg-primary/80 text-white rounded-lg px-6 py-3"
                >
                  + 創建第一個任務
                </button>
              </div>
            ) : (
              tasks.map((task, index) => {
              const classification = classificationResults && classificationResults.find(r => r.taskId === task.id);
              return (
                <ListItemTransition key={task.id} index={index}>
                  <div className="border border-border rounded-lg p-4 hover-lift">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-3 h-3 rounded-full ${
                        task.priority === 'high' ? 'bg-error' :
                        task.priority === 'medium' ? 'bg-warning' :
                        'bg-success'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-dark">{task.title}</h4>
                          {classification && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              🤖 AI建議
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-neural-600 mt-1">{task.description}</p>
                        )}
                        
                        {/* AI分類結果 */}
                        {classification && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                            <div className="font-medium text-blue-800 mb-1">AI建議分類:</div>
                            <div className="text-blue-700 mb-1">
                              優先級: {classification.suggestedPriority} | 
                              象限: {classification.suggestedQuadrant} | 
                              信心度: {Math.round(classification.confidence * 100)}%
                            </div>
                            <div className="text-blue-600 mb-2">{classification.reasoning}</div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleApplyClassification(task.id, true)}
                                className="text-xs px-2 py-1 bg-green-100 text-green-800 hover:bg-green-200 rounded"
                              >
                                採用
                              </button>
                              <button 
                                onClick={() => handleApplyClassification(task.id, false)}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded"
                              >
                                忽略
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleTaskClassification(task.id)}
                        className="text-xs px-2 py-1 bg-white text-dark hover:bg-secondaryBg rounded border"
                      >
                        🤖 AI分類
                      </button>
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-xs px-2 py-1 bg-accent hover:bg-accent/80 text-white rounded"
                      >
                        ✏️ 編輯
                      </button>
                      <button
                        onClick={() => handleToggleTaskStatus(task.id, task.status)}
                        className="text-xs px-2 py-1 bg-primary hover:bg-primary/80 text-white rounded"
                      >
                        🔄 狀態
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-xs px-2 py-1 bg-error hover:bg-error/80 text-white rounded"
                      >
                        🗑️ 刪除
                      </button>
                      {task.dueDate && (
                        <span className="text-sm text-neural-600">
                          {new Date(task.dueDate).toLocaleDateString('zh-TW')}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.status === 'completed' ? 'bg-success text-white' :
                        task.status === 'in-progress' ? 'bg-accent text-white' :
                        'bg-gray text-white'
                      }`}>
                        {task.status === 'to-do' && '待辦'}
                        {task.status === 'in-progress' && '進行中'}
                        {task.status === 'completed' && '已完成'}
                      </span>
                    </div>
                  </div>
                  </div>
                </ListItemTransition>
              );
              })
            )}
          </div>
        </div>
      )}

      {/* 日曆視圖 */}
      {currentView === 'calendar' && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-dark mb-4">📅 日曆視圖</h3>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <div key={day} className="text-center font-medium text-neural-700 p-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - date.getDay() + i);
              const dateStr = date.toISOString().split('T')[0];
              const dayTasks = tasks.filter(task => 
                task.dueDate && task.dueDate.startsWith(dateStr)
              );
              
              return (
                <div key={i} className="border border-border rounded p-2 min-h-[80px]">
                  <div className="text-sm text-neural-600 mb-1">{date.getDate()}</div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 2).map(task => (
                      <div key={task.id} className="text-xs p-1 bg-primary/10 text-primary rounded truncate">
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-neural-600">+{dayTasks.length - 2} 更多</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 四象限視圖 */}
      {currentView === 'quadrant' && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-dark mb-4">🎯 艾森豪威爾四象限</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'urgent-important', title: '緊急且重要', color: 'bg-red-50 border-red-200', textColor: 'text-red-800' },
              { key: 'not-urgent-important', title: '重要但不緊急', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-800' },
              { key: 'urgent-not-important', title: '緊急但不重要', color: 'bg-yellow-50 border-yellow-200', textColor: 'text-yellow-800' },
              { key: 'not-urgent-not-important', title: '不緊急不重要', color: 'bg-gray-50 border-gray-200', textColor: 'text-gray-800' }
            ].map(quadrant => {
              const quadrantTasks = tasks.filter(task => {
                if (task.quadrant) return task.quadrant === quadrant.key;
                
                // 根據優先級和截止日期自動分類
                const isUrgent = task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                const isImportant = task.priority === 'high';
                
                if (isUrgent && isImportant) return quadrant.key === 'urgent-important';
                if (!isUrgent && isImportant) return quadrant.key === 'not-urgent-important';
                if (isUrgent && !isImportant) return quadrant.key === 'urgent-not-important';
                return quadrant.key === 'not-urgent-not-important';
              });
              
              return (
                <div key={quadrant.key} className={`border-2 rounded-lg p-4 min-h-[300px] ${quadrant.color}`}>
                  <h4 className={`font-semibold mb-3 ${quadrant.textColor}`}>{quadrant.title}</h4>
                  <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                    {quadrantTasks.map(task => (
                      <div key={task.id} className="bg-white p-2 rounded border">
                        <div className="font-medium text-sm">{task.title}</div>
                        {task.dueDate && (
                          <div className="text-xs text-neural-600 mt-1">
                            {new Date(task.dueDate).toLocaleDateString('zh-TW')}
                          </div>
                        )}
                        <div className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                          task.status === 'completed' ? 'bg-success text-white' :
                          task.status === 'in-progress' ? 'bg-accent text-white' :
                          'bg-gray text-white'
                        }`}>
                          {task.status === 'to-do' && '待辦'}
                          {task.status === 'in-progress' && '進行中'}
                          {task.status === 'completed' && '已完成'}
                        </div>
                      </div>
                    ))}
                    {quadrantTasks.length === 0 && (
                      <div className="text-neural-600 text-sm text-center py-8">暫無任務</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* AI自動化視圖 */}
      {currentView === 'automation' && (
        <AIAutomationPanel className="mt-4" />
      )}
      
      {/* AI洞察面板 */}
      {showAIPanel && aiInsights && aiInsights.length > 0 && (
        <div className="mt-4 bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-dark">🤖 AI洞察</h3>
            <button 
              onClick={handleClearInsights}
              className="text-sm text-neural-600 hover:text-neural-800"
            >
              清除
            </button>
          </div>
          <div className="space-y-3">
            {aiInsights.map((insight, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-800 mb-1">{insight.title}</div>
                 <div className="text-blue-700 text-sm">{insight.content}</div>
                {insight.suggestions && insight.suggestions.length > 0 && (
                  <div className="mt-2">
                    <div className="text-blue-800 text-sm font-medium mb-1">建議:</div>
                    <ul className="text-blue-600 text-sm space-y-1">
                      {insight.suggestions.map((suggestion: string, idx: number) => (
                        <li key={idx} className="flex items-start space-x-1">
                          <span>•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TaskCenter;