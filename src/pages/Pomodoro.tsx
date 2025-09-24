import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import {
  startTimer,
  pauseTimer,
  resetTimer,
  skipTimer,
  tick,
  switchMode,
  requestAIAnalysis,
  receiveAIAnalysis,
  clearAIInsights,
  recordInterruption,
  associateTask,
  clearTaskAssociation,
  updateDailyStats
} from '../features/pomodoro/pomodoroSlice';
import { updateTask } from '../features/tasks/tasksSlice';
import { updateProjectProgress } from '../features/projects/projectsSlice';
import { Button, Card, StatCard, ProgressBar } from '../components/ui';
import { ParticleEffect, DataFlow, StatusIndicator } from '../components/effects';
import { PomodoroAIService } from '../services/pomodoroAIService';
import PomodoroStats from '../components/PomodoroStats';

const Pomodoro: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    isActive, 
    mode, 
    timeLeft, 
    workDuration, 
    shortBreakDuration, 
    longBreakDuration, 
    longBreakInterval, 
    completedPomodoros,
    interruptions,
    aiInsights,
    isAnalyzing,
    associatedTaskId,
    taskStartTime
  } = useAppSelector(state => state.pomodoro);
  const { tasks } = useAppSelector(state => state.tasks);
  const { projects } = useAppSelector(state => state.projects);
  
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showInterruptionModal, setShowInterruptionModal] = useState(false);
  const [interruptionReason, setInterruptionReason] = useState('');
  const [showInterruptionHistory, setShowInterruptionHistory] = useState(false);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [dailyWorkTime, setDailyWorkTime] = useState(0);
  const [dailyBreakTime, setDailyBreakTime] = useState(0);
  const [dailyInterruptions, setDailyInterruptions] = useState(0);

  // 計時器邏輯
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        dispatch(tick());
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, dispatch]);

  // 模式切換邏輯
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      dispatch(switchMode());
      
      // 播放提示音
      if ('Notification' in window && Notification.permission === 'granted') {
        const nextMode = mode === 'work' ? 'break' : 'work';
        new Notification(
          nextMode === 'work' ? '休息時間結束' : '工作時間結束',
          { body: `該開始${nextMode === 'work' ? '工作' : '休息'}了` }
        );
      }
    }
  }, [timeLeft, isActive, mode, dispatch]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = (): number => {
    const total = mode === 'work' ? workDuration : 
                 mode === 'shortBreak' ? shortBreakDuration : 
                 longBreakDuration;
    return (1 - timeLeft / total) * 100;
  };

  const getModeText = (): string => {
    switch (mode) {
      case 'work':
        return '專注工作';
      case 'shortBreak':
        return '短休息';
      case 'longBreak':
        return '長休息';
      default:
        return '專注工作';
    }
  };

  const getProgressColor = (): string => {
    switch (mode) {
      case 'work':
        return '#FF5A5F';
      case 'shortBreak':
        return '#3A86FF';
      case 'longBreak':
        return '#28A745';
      default:
        return '#FF5A5F';
    }
  };

  const handleStart = () => {
    dispatch(startTimer());
  };

  const handlePause = () => {
    dispatch(pauseTimer());
  };

  const handleReset = () => {
    dispatch(resetTimer());
  };

  const handleSkip = () => {
    if (mode === 'work') {
      handleCompletePomodoro();
    }
    dispatch(skipTimer());
  };

  const handleAIAnalysis = async () => {
    dispatch(requestAIAnalysis());
    
    try {
      const analysisData = {
        completedPomodoros,
        interruptions,
        workDuration,
        breakDuration: shortBreakDuration,
        sessionStartTime: new Date().toISOString(),
        sessionEndTime: new Date().toISOString()
      };
      
      const insight = await PomodoroAIService.analyzeProductivity(analysisData);
      dispatch(receiveAIAnalysis(insight));
      setShowAIPanel(true);
    } catch (error) {
      console.error('AI分析失敗:', error);
      // 這裡可以添加錯誤處理UI
    }
  };

  const handleClearInsights = () => {
    dispatch(clearAIInsights());
    setShowAIPanel(false);
  };

  const handleInterruption = () => {
    setShowInterruptionModal(true);
  };

  const handleRecordInterruption = () => {
    handleRecordInterruptionWithStats();
  };

  const handleCancelInterruption = () => {
    setInterruptionReason('');
    setShowInterruptionModal(false);
  };

  const handleTaskAssociation = () => {
    setShowTaskSelector(true);
  };

  const handleSelectTask = (taskId: string) => {
    dispatch(associateTask(taskId));
    setShowTaskSelector(false);
  };

  const handleClearTaskAssociation = () => {
    dispatch(clearTaskAssociation());
  };

  const handleCompletePomodoro = () => {
    if (associatedTaskId && taskStartTime) {
      const task = tasks.find(t => t.id === associatedTaskId);
      if (task) {
        const sessionDuration = Math.floor((Date.now() - taskStartTime) / 1000 / 60); // 分鐘
        const newActualTime = (task.actualTime || 0) + sessionDuration;
        
        dispatch(updateTask({
          ...task,
          actualTime: newActualTime
        }));
        
        // 如果任務有關聯專案，更新專案進度
        if (task.relatedProjectId) {
          dispatch(updateProjectProgress({
            projectId: task.relatedProjectId,
            tasks: tasks
          }));
        }
      }
    }
    
    // 更新統計數據
    updateDailyStatistics();
  };
  
  // 更新每日統計數據
  const updateDailyStatistics = () => {
    const today = new Date().toISOString().split('T')[0];
    const workTime = mode === 'work' ? Math.floor(workDuration / 60) : 0;
    const breakTime = mode !== 'work' ? Math.floor((mode === 'shortBreak' ? shortBreakDuration : longBreakDuration) / 60) : 0;
    
    setDailyWorkTime(prev => prev + workTime);
    setDailyBreakTime(prev => prev + breakTime);
    
    dispatch(updateDailyStats({
      date: today,
      completedPomodoros: completedPomodoros + (mode === 'work' ? 1 : 0),
      workTime: dailyWorkTime + workTime,
      breakTime: dailyBreakTime + breakTime,
      interruptions: dailyInterruptions
    }));
  };
  
  // 記錄中斷時更新統計
  const handleRecordInterruptionWithStats = () => {
    if (interruptionReason.trim()) {
      const duration = mode === 'work' ? workDuration - timeLeft : 
                      mode === 'shortBreak' ? shortBreakDuration - timeLeft :
                      longBreakDuration - timeLeft;
      
      dispatch(recordInterruption({
        reason: interruptionReason,
        duration: duration
      }));
      
      setInterruptionReason('');
      setShowInterruptionModal(false);
      setDailyInterruptions(prev => prev + 1);
      
      // 暫停計時器
      dispatch(pauseTimer());
    }
  };

  return (
    <motion.div 
      className="max-w-2xl mx-auto p-6 max-h-screen overflow-y-auto relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 25%, #45B7D1 50%, #96CEB4 75%, #FFEAA7 100%)',
        backgroundSize: '400% 400%',
        animation: 'vanGoghGradient 15s ease infinite'
      }}
    >
      {/* 梵谷風格背景裝飾 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute top-0 left-0 w-full h-full opacity-10" viewBox="0 0 1000 1000">
          <defs>
            <pattern id="vanGoghBrushStrokes" patternUnits="userSpaceOnUse" width="100" height="100">
              <path d="M10,10 Q30,5 50,15 T90,10" stroke="#2C3E50" strokeWidth="2" fill="none" opacity="0.3"/>
              <path d="M15,30 Q35,25 55,35 T95,30" stroke="#E74C3C" strokeWidth="1.5" fill="none" opacity="0.2"/>
              <path d="M5,50 Q25,45 45,55 T85,50" stroke="#F39C12" strokeWidth="2" fill="none" opacity="0.25"/>
              <path d="M20,70 Q40,65 60,75 T100,70" stroke="#27AE60" strokeWidth="1.5" fill="none" opacity="0.2"/>
              <path d="M8,90 Q28,85 48,95 T88,90" stroke="#3498DB" strokeWidth="2" fill="none" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#vanGoghBrushStrokes)"/>
        </svg>
        
        {/* 動態藝術元素 */}
        <motion.div
          className="absolute top-10 right-10 w-20 h-20 rounded-full"
          style={{
            background: 'radial-gradient(circle, #FFD93D 0%, #FF6B6B 100%)',
            filter: 'blur(20px)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-20 left-10 w-16 h-16 rounded-full"
          style={{
            background: 'radial-gradient(circle, #4ECDC4 0%, #45B7D1 100%)',
            filter: 'blur(15px)'
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
      
      <motion.div 
        className="text-center mb-6 relative overflow-hidden backdrop-blur-sm bg-white/10 rounded-3xl border border-white/20 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}
      >
        {/* 背景粒子效果 */}
        <ParticleEffect
          width={600}
          height={400}
          particleCount={30}
          colors={['#FF5A5F', '#3B82F6', '#8B5CF6', '#10B981']}
          speed={0.5}
          size={{ min: 1, max: 3 }}
          opacity={{ min: 0.2, max: 0.6 }}
          className="absolute inset-0 pointer-events-none"
        />
        
        {/* 數據流效果 */}
        <DataFlow
          width={600}
          height={400}
          flowCount={8}
          direction="diagonal"
          speed={1}
          colors={[getProgressColor() + '80']}
          trailLength={6}
          className="absolute inset-0 pointer-events-none"
        />
        
        <div className="relative w-64 h-64 mx-auto mb-6 z-10">
          {/* 進度環 */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#F0F0F0"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={getProgressColor()}
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * calculateProgress()) / 100}
              strokeLinecap="round"
              style={{
                filter: 'drop-shadow(0 0 8px ' + getProgressColor() + '60)',
                transition: 'all 0.3s ease'
              }}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-dark mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm font-medium text-neural-700 mb-2">
              {getModeText()}
            </div>
            <StatusIndicator
              status={isActive ? 'processing' : 'idle'}
              variant="neural"
              size="sm"
              label={isActive ? '進行中' : '已暫停'}
              animated={isActive}
            />
          </div>
        </div>

        <div className="flex justify-center space-x-3 mb-4">
          {!isActive ? (
            <Button variant="primary" onClick={handleStart}>
              開始
            </Button>
          ) : (
            <Button variant="secondary" onClick={handlePause}>
              暫停
            </Button>
          )}
          
          <Button variant="text" onClick={handleReset}>
            重設
          </Button>
          
          <Button variant="text" onClick={handleSkip}>
            跳過
          </Button>
          
          {isActive && (
            <Button variant="secondary" onClick={handleInterruption}>
              ⚠️ 中斷
            </Button>
          )}
        </div>

        <div className="text-sm text-neural-600 mb-4">
          已完成: {completedPomodoros} 個蕃茄鐘 | 
          下次長休息: {completedPomodoros % longBreakInterval === 0 ? '即將到來' : `${longBreakInterval - (completedPomodoros % longBreakInterval)} 個後`} |
          今日中斷: {interruptions.length} 次
        </div>
        
        {/* 任務關聯區域 */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {associatedTaskId ? (
                <div>
                  <div className="text-sm font-medium text-neural-700">🎯 關聯任務:</div>
                  <div className="text-neural-800">
                    {tasks.find(t => t.id === associatedTaskId)?.title || '未知任務'}
                  </div>
                  {taskStartTime && (
                    <div className="text-xs text-neural-500 mt-1">
                      開始時間: {new Date(taskStartTime).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-neural-600">💡 選擇一個任務來追蹤工作時間</div>
              )}
            </div>
            <div className="flex space-x-2">
              {!associatedTaskId ? (
                 <Button variant="secondary" onClick={handleTaskAssociation}>
                   選擇任務
                 </Button>
               ) : (
                 <Button variant="text" onClick={handleClearTaskAssociation}>
                   取消關聯
                 </Button>
               )}
            </div>
          </div>
        </div>
        
        {/* AI分析按鈕 */}
        <div className="flex justify-center space-x-2">
          <Button 
             variant="secondary" 
             onClick={handleAIAnalysis}
             disabled={isAnalyzing || completedPomodoros === 0}
           >
            {isAnalyzing ? '分析中...' : '🤖 AI分析建議'}
          </Button>
          
          {aiInsights.length > 0 && (
            <Button 
              variant="text" 
              onClick={() => setShowAIPanel(!showAIPanel)}
            >
              {showAIPanel ? '隱藏洞察' : '顯示洞察'}
            </Button>
          )}
          
          {interruptions.length > 0 && (
            <Button 
              variant="text" 
              onClick={() => setShowInterruptionHistory(!showInterruptionHistory)}
            >
              📊 中斷記錄
            </Button>
          )}
          
          <Button 
            variant="text" 
            onClick={() => setShowStatsPanel(!showStatsPanel)}
          >
            📈 統計報告
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="完成數"
          value={completedPomodoros}
          subtitle="今日番茄鐘"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="ai"
          animated={true}
          glow={true}
        />
        
        <StatCard
          title="工作時間"
          value={`${Math.floor(completedPomodoros * workDuration / 60)}分`}
          subtitle="專注投入"
          trend={{
            direction: completedPomodoros > 0 ? 'up' : 'neutral',
            value: completedPomodoros > 0 ? Math.floor(calculateProgress()) : 0,
            label: '效率'
          }}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="neural"
          animated={true}
        />
        
        <StatCard
          title="當前進度"
          value={`${Math.floor(calculateProgress())}%`}
          subtitle="今日目標"
          trend={{
            direction: calculateProgress() > 50 ? 'up' : calculateProgress() > 25 ? 'neutral' : 'down',
            value: Math.floor(calculateProgress()),
            label: '完成度'
          }}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          variant="gradient"
          animated={true}
          glow={calculateProgress() > 75}
        />
      </div>
      
      {/* AI洞察面板 */}
      {showAIPanel && aiInsights.length > 0 && (
        <Card className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-dark">🤖 AI 生產力洞察</h3>
            <Button variant="text" onClick={handleClearInsights}>
              清除
            </Button>
          </div>
          
          <div className="space-y-4">
            {aiInsights.map((insight) => (
              <div key={insight.id} className="border-l-4 border-primary pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-dark">{insight.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                    insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {insight.priority === 'high' ? '高優先級' :
                     insight.priority === 'medium' ? '中優先級' : '低優先級'}
                  </span>
                </div>
                
                <p className="text-neural-600 mb-3">{insight.content}</p>
                
                {insight.suggestions.length > 0 && (
                  <div>
                    <h5 className="font-medium text-dark mb-2">建議行動:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {insight.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-neural-600">{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="text-xs text-neural-500 mt-2">
                  {new Date(insight.createdAt).toLocaleString('zh-TW')}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* 中斷記錄歷史面板 */}
      {showInterruptionHistory && interruptions.length > 0 && (
        <Card className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-dark">📊 中斷記錄歷史</h3>
            <Button variant="text" onClick={() => setShowInterruptionHistory(false)}>
              關閉
            </Button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {interruptions.map((interruption, index) => (
              <div key={index} className="p-3 bg-red-50 rounded-lg border-l-4 border-red-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-red-800">{interruption.reason}</div>
                    <div className="text-sm text-red-600 mt-1">
                      持續時間: {Math.floor(interruption.duration / 60)}分{interruption.duration % 60}秒
                    </div>
                  </div>
                  <div className="text-xs text-red-500">
                       {new Date(interruption.time).toLocaleTimeString()}
                     </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* 中斷記錄模態框 */}
      {showInterruptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4">⚠️ 記錄中斷原因</h3>
            <textarea
              value={interruptionReason}
              onChange={(e) => setInterruptionReason(e.target.value)}
              placeholder="請描述中斷的原因..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <Button variant="text" onClick={handleCancelInterruption}>
                取消
              </Button>
              <Button 
                variant="primary" 
                onClick={handleRecordInterruption}
                disabled={!interruptionReason.trim()}
              >
                記錄中斷
              </Button>
            </div>
          </div>
         </div>
       )}
       
       {/* 任務選擇模態框 */}
       {showTaskSelector && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-96 max-w-90vw max-h-80vh overflow-y-auto">
             <h3 className="text-lg font-semibold mb-4">🎯 選擇關聯任務</h3>
             <div className="space-y-2 mb-4">
               {tasks.filter(t => t.status !== 'completed').map(task => (
                 <div 
                   key={task.id}
                   className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                   onClick={() => handleSelectTask(task.id)}
                 >
                   <div className="font-medium">{task.title}</div>
                   <div className="text-sm text-neural-600">
                     優先級: {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'} | 
                     狀態: {task.status === 'to-do' ? '待辦' : task.status === 'in-progress' ? '進行中' : '已完成'}
                   </div>
                   {task.estimatedTime && (
                     <div className="text-xs text-neural-500">
                       預估時間: {task.estimatedTime} 分鐘
                       {task.actualTime && ` | 實際時間: ${task.actualTime} 分鐘`}
                     </div>
                   )}
                 </div>
               ))}
               {tasks.filter(t => t.status !== 'completed').length === 0 && (
                 <div className="text-center text-neural-500 py-4">
                   沒有可用的任務
                 </div>
               )}
             </div>
             <div className="flex justify-end">
               <Button variant="text" onClick={() => setShowTaskSelector(false)}>
                 取消
               </Button>
             </div>
           </div>
         </div>
       )}
       
       {/* 統計面板 */}
       {showStatsPanel && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">📈 番茄鐘統計報告</h2>
               <Button variant="text" onClick={() => setShowStatsPanel(false)}>
                 ✕
               </Button>
             </div>
             <PomodoroStats onClose={() => setShowStatsPanel(false)} />
           </div>
         </div>
       )}
     </motion.div>
   );
 };
 
 export default Pomodoro;