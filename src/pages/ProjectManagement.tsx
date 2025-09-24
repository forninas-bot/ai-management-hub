import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { Project, Task } from '../types';
import { ProjectAIService } from '../services/projectAIService';
import { requestAIAnalysis, receiveAIInsight, receiveRiskAssessment, receiveOptimization, setAnalyzing, createProject, updateProject, deleteProject, selectProject, addTaskToProject, updateProjectProgress, addMilestone, updateMilestone, deleteMilestone } from '../features/projects/projectsSlice';
import { createTask, updateTask } from '../features/tasks/tasksSlice';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import GanttChart from '../components/GanttChart';
import KanbanBoard from '../components/KanbanBoard';

const ProjectManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { projects, activeProject, aiInsights, riskAssessments, optimizations, isAnalyzing } = useAppSelector(state => state.projects);
  const { tasks } = useAppSelector(state => state.tasks);
  const [currentView, setCurrentView] = useState<'overview' | 'kanban' | 'gantt' | 'ai-insights'>('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [newProjectData, setNewProjectData] = useState({
    title: '',
    description: '',
    targetEndDate: ''
  });

  // AI建議生成
  useEffect(() => {
    const suggestions = [
      '創建一個新的敏捷開發項目',
      '分析當前項目的風險因素',
      '優化團隊工作流程',
      '設置智能提醒和里程碑',
      '生成項目進度報告'
    ];
    setAiSuggestions(suggestions);
  }, []);

  const handleAIChat = async (query: string) => {
    if (!query.trim()) return;
    
    setAiQuery('');
    // 這裡可以集成實際的AI對話功能
    console.log('AI查詢:', query);
  };

  const handleCreateProject = () => {
    if (!newProjectData.title.trim()) return;
    
    const project: Omit<Project, 'id'> = {
        title: newProjectData.title,
        description: newProjectData.description,
        status: 'planning',
        startDate: new Date().toISOString().split('T')[0],
        targetEndDate: newProjectData.targetEndDate,
        completionPercentage: 0,
        taskIds: [],
        milestones: [],
        kanbanColumns: [
          { id: 'todo', title: '待辦', taskIds: [] },
          { id: 'in-progress', title: '進行中', taskIds: [] },
          { id: 'done', title: '完成', taskIds: [] }
        ],
        tags: []
      };
    
    dispatch(createProject(project));
    setNewProjectData({ title: '', description: '', targetEndDate: '' });
    setShowCreateForm(false);
  };

  const ProjectCard = ({ project }: { project: Project }) => {
    const projectTasks = project.kanbanColumns.flatMap(column => 
      column.taskIds.map(taskId => tasks.find(task => task.id === taskId)).filter(Boolean)
    ) as Task[];
    
    const completedTasks = projectTasks.filter(task => task.status === 'completed');
    const progress = projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0;
    
    return (
      <Card
        variant="van-gogh"
        size="lg"
        className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
          activeProject?.id === project.id 
            ? 'ring-4 ring-blue-400/50 shadow-xl' 
            : 'hover:ring-2 hover:ring-blue-300/30'
        }`}
        onClick={() => dispatch(selectProject(project.id))}
        glow={activeProject?.id === project.id}
      >
        {/* AI狀態指示器 */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-van-gogh-pulse"></div>
          <span className="text-xs text-neutral-500 font-medium">AI監控中</span>
        </div>
        
        <div className="mb-4">
          <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors">
            {project.title}
          </h3>
          <p className="text-neutral-600 text-sm line-clamp-2">{project.description}</p>
        </div>
        
        {/* 進度條 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neutral-700">完成進度</span>
            <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {/* 統計信息 */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-neutral-900">{projectTasks.length}</div>
            <div className="text-xs text-neutral-500">總任務</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{completedTasks.length}</div>
            <div className="text-xs text-neutral-500">已完成</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{project.milestones.length}</div>
            <div className="text-xs text-neutral-500">里程碑</div>
          </div>
        </div>
        
        {/* AI洞察預覽 */}
        {aiInsights.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center mb-1">
              <span className="text-sm mr-1">🤖</span>
              <span className="text-xs font-medium text-blue-800">AI洞察</span>
            </div>
            <p className="text-xs text-blue-700 line-clamp-2">
              {aiInsights[aiInsights.length - 1]?.content || '暫無AI分析結果'}
            </p>
          </div>
        )}
      </Card>
    );
  };

  const AIAssistantPanel = () => (
    <div className="h-fit">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-lg">🤖</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">AI項目助手</h3>
          <p className="text-sm text-neutral-600">智能分析 • 實時建議 • 風險預警</p>
        </div>
      </div>
      
      {/* AI對話框 */}
      <div className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="問我任何關於項目管理的問題..."
            className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleAIChat(aiQuery)}
          />
          <Button
            variant="van-gogh"
            size="sm"
            onClick={() => handleAIChat(aiQuery)}
            className="px-4 py-3 text-sm whitespace-nowrap"
          >
            發送
          </Button>
        </div>
      </div>
      
      {/* AI建議 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-neutral-700 mb-2">💡 智能建議</h4>
        {aiSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleAIChat(suggestion)}
            className="w-full text-left px-3 py-2 text-sm bg-white rounded-lg border border-neutral-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 flex flex-col relative overflow-hidden"
    >
      {/* 梵谷風格背景紋理 */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" className="absolute inset-0">
          <defs>
            <pattern id="vanGoghBrush" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M10,10 Q30,5 50,15 T90,10" stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.3"/>
              <path d="M15,30 Q35,25 55,35 T95,30" stroke="#f97316" strokeWidth="1.5" fill="none" opacity="0.4"/>
              <path d="M5,50 Q25,45 45,55 T85,50" stroke="#ea580c" strokeWidth="1" fill="none" opacity="0.2"/>
              <path d="M20,70 Q40,65 60,75 T100,70" stroke="#dc2626" strokeWidth="1.5" fill="none" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#vanGoghBrush)"/>
        </svg>
      </div>
      
      {/* 動態裝飾元素 */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 right-20 w-32 h-32 opacity-20"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5"/>
          <circle cx="50" cy="50" r="25" fill="none" stroke="#f97316" strokeWidth="1" strokeDasharray="3,3"/>
          <circle cx="50" cy="50" r="10" fill="#ea580c" opacity="0.6"/>
        </svg>
      </motion.div>
      
      <motion.div 
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-20 w-24 h-24 opacity-15"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M20,80 Q50,20 80,80" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/>
          <path d="M30,70 Q50,30 70,70" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </motion.div>
      {/* 頂部導航 */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8 relative z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.h1 
              className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-3"
              style={{
                textShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            >
              🎨 AI項目管理中心
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-amber-800 text-lg font-medium"
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              ✨ 智能化項目管理，讓每個決策都有AI支持，如梵谷般創造藝術品質的工作流程
            </motion.p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center space-x-4"
          >
            <motion.button
              onClick={() => setShowCreateForm(true)}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 20px 40px rgba(245, 158, 11, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center space-x-3 relative overflow-hidden"
              style={{
                boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              {/* 按鈕內部光暈效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <motion.span 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl"
              >
                🎨
              </motion.span>
              <span>創建藝術級項目</span>
            </motion.button>
          </motion.div>
        </div>
        
        {/* 視圖切換 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex space-x-3 bg-white/80 backdrop-blur-lg rounded-3xl p-3 shadow-2xl border border-amber-200/50"
          style={{
            boxShadow: '0 20px 40px rgba(245, 158, 11, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)'
          }}
        >
          {[
            { key: 'overview', label: '🎨 藝術總覽', icon: '🎨', gradient: 'from-amber-500 to-orange-500' },
            { key: 'kanban', label: '🖼️ 創作看板', icon: '🖼️', gradient: 'from-orange-500 to-red-500' },
            { key: 'gantt', label: '📈 時光甘特', icon: '📈', gradient: 'from-red-500 to-pink-500' },
            { key: 'ai-insights', label: '🤖 AI靈感', icon: '🤖', gradient: 'from-pink-500 to-purple-500' }
          ].map((view, index) => (
            <motion.button
              key={view.key}
              onClick={() => setCurrentView(view.key as any)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all relative overflow-hidden ${
                currentView === view.key
                  ? `bg-gradient-to-r ${view.gradient} text-white shadow-xl`
                  : 'text-amber-800 hover:bg-amber-50/80 hover:shadow-lg'
              }`}
              style={{
                boxShadow: currentView === view.key 
                  ? '0 10px 25px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                  : '0 4px 12px rgba(0,0,0,0.05)'
              }}
            >
              {currentView === view.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{view.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* 主要內容區域 */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="grid grid-cols-12 gap-8 min-h-0 flex-1 relative z-10"
      >
        {/* 左側 AI 助手面板 */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="col-span-3"
        >
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-amber-200/50" style={{
            boxShadow: '0 25px 50px rgba(245, 158, 11, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)'
          }}>
            <AIAssistantPanel />
          </div>
        </motion.div>
        
        {/* 右側主要內容 */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="col-span-9 overflow-y-auto max-h-screen pb-6"
        >
          {currentView === 'overview' && (
            <div className="space-y-6">
              {projects.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  className="text-center py-20 relative"
                >
                  {/* 藝術背景裝飾 */}
                  <div className="absolute inset-0 opacity-5">
                    <svg width="100%" height="100%" viewBox="0 0 400 400">
                      <path d="M50,200 Q200,50 350,200 T650,200" stroke="#f59e0b" strokeWidth="3" fill="none"/>
                      <path d="M100,150 Q250,100 400,150 T700,150" stroke="#f97316" strokeWidth="2" fill="none"/>
                      <path d="M75,250 Q225,200 375,250 T675,250" stroke="#ea580c" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  
                  <motion.div 
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-40 h-40 bg-gradient-to-br from-amber-200 via-orange-200 to-red-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl relative overflow-hidden"
                    style={{
                      boxShadow: '0 25px 50px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255,255,255,0.5)'
                    }}
                  >
                    {/* 內部光暈效果 */}
                    <div className="absolute inset-2 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
                    <motion.span 
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="text-6xl relative z-10"
                    >
                      🎨
                    </motion.span>
                  </motion.div>
                  
                  <motion.h3 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className="text-4xl font-bold bg-gradient-to-r from-amber-700 via-orange-700 to-red-700 bg-clip-text text-transparent mb-4"
                    style={{
                      textShadow: '0 4px 20px rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    🌟 開始您的藝術級AI項目之旅
                  </motion.h3>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 }}
                    className="text-amber-800 text-xl mb-8 max-w-2xl mx-auto leading-relaxed"
                  >
                    如梵谷創作《星夜》般，讓AI為您的項目注入靈感與創意，
                    <br />體驗前所未有的智能化項目管理藝術
                  </motion.p>
                  
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 }}
                    onClick={() => setShowCreateForm(true)}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 25px 50px rgba(245, 158, 11, 0.4)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-12 py-6 rounded-3xl font-bold text-xl shadow-2xl transition-all relative overflow-hidden group"
                    style={{
                      boxShadow: '0 15px 35px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}
                  >
                    {/* 按鈕動畫光效 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    <span className="relative z-10 flex items-center space-x-3">
                      <motion.span
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🎨
                      </motion.span>
                      <span>創建藝術級智能項目</span>
                    </span>
                  </motion.button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {currentView === 'kanban' && activeProject && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{activeProject.title} - 看板視圖</h2>
                <div className="flex space-x-2">
                  <Button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    🤖 AI優化布局
                  </Button>
                </div>
              </div>
              <KanbanBoard
                columns={activeProject.kanbanColumns}
                tasks={tasks.filter(task => task.relatedProjectId === activeProject.id)}
                onTaskMove={() => {}}
                onCreateTask={() => {}}
              />
            </div>
          )}
          
          {currentView === 'gantt' && activeProject && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{activeProject.title} - 甘特圖</h2>
                <div className="flex space-x-2">
                  <Button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600">
                    🎯 AI時程優化
                  </Button>
                </div>
              </div>
              <GanttChart
                tasks={activeProject.kanbanColumns.flatMap(column => 
                  column.taskIds.map(taskId => tasks.find(t => t.id === taskId))
                ).filter(Boolean) as Task[]}
                milestones={activeProject.milestones}
                onTaskUpdate={() => {}}
                onTaskDependencyUpdate={() => {}}
              />
            </div>
          )}
          
          {currentView === 'ai-insights' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🧠</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">AI深度洞察</h2>
                  <p className="text-gray-600">基於機器學習的項目分析和預測</p>
                </div>
                
                {activeProject && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-green-600 text-lg">📊</span>
                        </div>
                        <h3 className="font-bold text-gray-900">項目健康度</h3>
                      </div>
                      <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                      <p className="text-sm text-gray-600">項目進展良好，按計劃執行</p>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-yellow-600 text-lg">⚠️</span>
                        </div>
                        <h3 className="font-bold text-gray-900">風險評估</h3>
                      </div>
                      <div className="text-3xl font-bold text-yellow-600 mb-2">中等</div>
                      <p className="text-sm text-gray-600">需要關注資源分配</p>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-blue-600 text-lg">🎯</span>
                        </div>
                        <h3 className="font-bold text-gray-900">完成預測</h3>
                      </div>
                      <div className="text-3xl font-bold text-blue-600 mb-2">12天</div>
                      <p className="text-sm text-gray-600">預計完成時間</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* 創建項目模態框 */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="bg-white/95 backdrop-blur-lg rounded-3xl p-10 w-full max-w-3xl shadow-2xl border border-amber-200/50 relative overflow-hidden"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={{
                boxShadow: '0 30px 60px rgba(245, 158, 11, 0.2), inset 0 1px 0 rgba(255,255,255,0.8)'
              }}
            >
              {/* 背景藝術裝飾 */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path d="M20,20 Q50,10 80,30 Q70,60 40,80 Q10,70 20,40 Z" fill="#f59e0b"/>
                  <path d="M30,30 Q60,20 90,40 Q80,70 50,90 Q20,80 30,50 Z" fill="#f97316" opacity="0.7"/>
                </svg>
              </div>
              
              <div className="text-center mb-8 relative z-10">
                <motion.div 
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-20 h-20 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl relative overflow-hidden"
                  style={{
                    boxShadow: '0 20px 40px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
                  }}
                >
                  <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
                  <motion.span 
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="text-white text-3xl relative z-10"
                  >
                    🎨
                  </motion.span>
                </motion.div>
                
                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold bg-gradient-to-r from-amber-700 via-orange-700 to-red-700 bg-clip-text text-transparent mb-3"
                  style={{
                    textShadow: '0 4px 20px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  🌟 創建藝術級智能項目
                </motion.h3>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-amber-800 text-lg"
                >
                  讓AI如梵谷般為您的項目注入創意靈感
                </motion.p>
              </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-8 relative z-10"
            >
              <div className="relative">
                <motion.label 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="block text-lg font-bold text-amber-800 mb-3 flex items-center"
                >
                  <span className="mr-2">🎨</span>
                  項目名稱 *
                </motion.label>
                <motion.input
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  type="text"
                  value={newProjectData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProjectData({ ...newProjectData, title: e.target.value })}
                  className="w-full px-6 py-4 border-2 border-amber-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-200 focus:border-amber-400 transition-all bg-white/80 backdrop-blur-sm text-lg"
                  placeholder="為您的藝術級項目命名..."
                  autoFocus
                  style={{
                    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                  }}
                />
              </div>
              
              <div className="relative">
                <motion.label 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="block text-lg font-bold text-amber-800 mb-3 flex items-center"
                >
                  <span className="mr-2">📝</span>
                  項目描述
                </motion.label>
                <motion.textarea
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  value={newProjectData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                  className="w-full px-6 py-4 border-2 border-amber-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-200 focus:border-amber-400 transition-all bg-white/80 backdrop-blur-sm h-32 resize-none text-lg"
                  placeholder="描述您的創意願景和項目目標..."
                  style={{
                    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                  }}
                />
              </div>
              
              <div className="relative">
                <motion.label 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="block text-lg font-bold text-amber-800 mb-3 flex items-center"
                >
                  <span className="mr-2">📅</span>
                  預計完成日期
                </motion.label>
                <motion.input
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0 }}
                  type="date"
                  value={newProjectData.targetEndDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProjectData({ ...newProjectData, targetEndDate: e.target.value })}
                  className="w-full px-6 py-4 border-2 border-amber-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-200 focus:border-amber-400 transition-all bg-white/80 backdrop-blur-sm text-lg"
                  style={{
                    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                  }}
                />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex space-x-6 mt-10 relative z-10"
            >
              <motion.button
                onClick={handleCreateProject}
                disabled={!newProjectData.title.trim()}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 25px 50px rgba(245, 158, 11, 0.4)'
                }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white py-5 rounded-2xl font-bold text-xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                style={{
                  boxShadow: '0 15px 35px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <span className="relative z-10 flex items-center justify-center space-x-3">
                  <motion.span
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🎨
                  </motion.span>
                  <span>創建藝術級項目</span>
                </span>
              </motion.button>
              
              <motion.button
                onClick={() => {
                  setNewProjectData({ title: '', description: '', targetEndDate: '' });
                  setShowCreateForm(false);
                }}
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: 'rgba(107, 114, 128, 0.9)'
                }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gray-600/80 backdrop-blur-sm text-white py-5 rounded-2xl font-bold text-xl hover:bg-gray-700/80 transition-all border border-gray-400/30"
                style={{
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>❌</span>
                  <span>取消</span>
                </span>
              </motion.button>
            </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProjectManagement;