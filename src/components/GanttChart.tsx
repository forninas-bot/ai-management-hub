import React, { useState, useRef } from 'react';
import { Task, Milestone } from '../types';

interface GanttChartProps {
  tasks: Task[];
  milestones?: Milestone[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDependencyUpdate: (taskId: string, dependencies: string[]) => void;
}

interface GanttTask extends Task {
  x: number;
  y: number;
  width: number;
  height: number;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, milestones = [], onTaskUpdate, onTaskDependencyUpdate }) => {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1); // 縮放級別：0.5, 1, 1.5, 2
  const svgRef = useRef<SVGSVGElement>(null);

  // 計算時間範圍
  const getTimeRange = () => {
    const now = new Date();
    const taskDates = tasks
      .map(task => {
        const start = task.startDate ? new Date(task.startDate) : now;
        const end = task.dueDate ? new Date(task.dueDate) : new Date(now.getTime() + (task.estimatedTime || 60) * 60 * 1000);
        return [start, end];
      })
      .flat();
    
    const milestoneDates = milestones.map(milestone => new Date(milestone.dueDate));
    const allDates = [...taskDates, ...milestoneDates];
    
    if (allDates.length === 0) {
      return { start: now, end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) };
    }
    
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // 添加一些邊距
    const padding = (maxDate.getTime() - minDate.getTime()) * 0.1;
    return {
      start: new Date(minDate.getTime() - padding),
      end: new Date(maxDate.getTime() + padding)
    };
  };

  const timeRange = getTimeRange();
  const totalDays = Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (24 * 60 * 60 * 1000));
  const baseDayWidth = 40;
  const dayWidth = baseDayWidth * zoomLevel; // 根據縮放級別調整日寬度
  const taskHeight = 30;
  const taskSpacing = 10;
  const headerHeight = 60;
  const leftPanelWidth = 200;

  // 將任務轉換為甘特圖任務
  const ganttTasks: GanttTask[] = tasks.map((task, index) => {
    const startDate = task.startDate ? new Date(task.startDate) : new Date();
    const endDate = task.dueDate ? new Date(task.dueDate) : new Date(startDate.getTime() + (task.estimatedTime || 60) * 60 * 1000);
    
    const startDays = Math.floor((startDate.getTime() - timeRange.start.getTime()) / (24 * 60 * 60 * 1000));
    const duration = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)));
    
    return {
      ...task,
      x: leftPanelWidth + startDays * dayWidth,
      y: headerHeight + index * (taskHeight + taskSpacing),
      width: duration * dayWidth,
      height: taskHeight
    };
  });

  // 獲取任務顏色
  const getTaskColor = (task: Task) => {
    switch (task.status) {
      case 'completed': return '#10B981';
      case 'in-progress': return '#3B82F6';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // 獲取優先級顏色
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  // 處理任務拖拽開始
  const handleMouseDown = (e: React.MouseEvent, taskId: string) => {
    if (isConnecting) return;
    
    const task = ganttTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDraggedTask(taskId);
    setDragOffset({
      x: e.clientX - rect.left - task.x,
      y: e.clientY - rect.top - task.y
    });
  };

  // 處理滑鼠移動
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedTask || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    // const newY = e.clientY - rect.top - dragOffset.y; // 暫時註解，因為未使用
    
    // 計算新的開始日期（網格對齊）
    const newStartDays = Math.round((newX - leftPanelWidth) / dayWidth);
    const alignedX = leftPanelWidth + newStartDays * dayWidth;
    // const newStartDate = new Date(timeRange.start.getTime() + newStartDays * 24 * 60 * 60 * 1000); // 暫時註解，因為未使用
    
    // 更新任務位置（視覺反饋）
    const taskElement = document.getElementById(`task-${draggedTask}`);
    const originalTask = ganttTasks.find(t => t.id === draggedTask);
    if (taskElement && originalTask) {
      // 使用網格對齊的位置
      const deltaX = alignedX - originalTask.x;
      taskElement.setAttribute('transform', `translate(${deltaX}, 0)`);
      taskElement.setAttribute('opacity', '0.8');
      
      // 添加拖拽指示線
      const indicatorLine = document.getElementById(`drag-indicator-${draggedTask}`);
      if (indicatorLine) {
        indicatorLine.setAttribute('x1', alignedX.toString());
        indicatorLine.setAttribute('x2', alignedX.toString());
        indicatorLine.setAttribute('visibility', 'visible');
      }
    }
  };

  // 處理拖拽結束
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!draggedTask || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    
    // 計算新的開始日期（網格對齊）
    const newStartDays = Math.max(0, Math.round((newX - leftPanelWidth) / dayWidth));
    const newStartDate = new Date(timeRange.start.getTime() + newStartDays * 24 * 60 * 60 * 1000);
    
    // 更新任務
    onTaskUpdate(draggedTask, {
      startDate: newStartDate.toISOString()
    });
    
    // 重置視覺反饋
    const taskElement = document.getElementById(`task-${draggedTask}`);
    if (taskElement) {
      taskElement.removeAttribute('transform');
      taskElement.removeAttribute('opacity');
    }
    
    // 隱藏拖拽指示線
    const indicatorLine = document.getElementById(`drag-indicator-${draggedTask}`);
    if (indicatorLine) {
      indicatorLine.setAttribute('visibility', 'hidden');
    }
    
    // 重置拖拽狀態
    setDraggedTask(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // 處理依賴連接
  const handleTaskClick = (taskId: string) => {
    if (isConnecting) {
      if (connectionStart && connectionStart !== taskId) {
        // 創建依賴關係
        const targetTask = tasks.find(t => t.id === taskId);
        if (targetTask) {
          const newDependencies = [...(targetTask.dependencies || []), connectionStart];
          onTaskDependencyUpdate(taskId, newDependencies);
        }
        setIsConnecting(false);
        setConnectionStart(null);
      } else {
        setConnectionStart(taskId);
      }
    } else {
      setSelectedTask(selectedTask === taskId ? null : taskId);
    }
  };

  // 縮放控制函數
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
  };

  // 繪製依賴關係箭頭（改進版）
  const renderDependencies = () => {
    const dependencies: React.ReactElement[] = [];
    
    ganttTasks.forEach(task => {
      if (task.dependencies) {
        task.dependencies.forEach(depId => {
          const depTask = ganttTasks.find(t => t.id === depId);
          if (depTask) {
            const startX = depTask.x + depTask.width;
            const startY = depTask.y + depTask.height / 2;
            const endX = task.x;
            const endY = task.y + task.height / 2;
            
            // 計算控制點以創建彎曲路徑
            const midX = startX + (endX - startX) / 2;
            const controlX1 = startX + 20;
            const controlX2 = endX - 20;
            
            const pathData = `M ${startX} ${startY} 
                             C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX - 10} ${endY}`;
            
            dependencies.push(
              <g key={`dep-${depId}-${task.id}`}>
                {/* 依賴線陰影效果 */}
                <path
                  d={pathData}
                  stroke="rgba(107, 114, 128, 0.3)"
                  strokeWidth="3"
                  fill="none"
                  transform="translate(1, 1)"
                />
                {/* 主依賴線 */}
                <path
                  d={pathData}
                  stroke="#3B82F6"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead-blue)"
                  className="hover:stroke-blue-600"
                />
                {/* 依賴標籤 */}
                <circle
                  cx={midX}
                  cy={(startY + endY) / 2}
                  r="8"
                  fill="white"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
                <text
                  x={midX}
                  y={(startY + endY) / 2 + 3}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#3B82F6"
                  fontWeight="bold"
                >
                  D
                </text>
              </g>
            );
          }
        });
      }
    });
    
    return dependencies;
  };

  // 生成時間軸
  const renderTimeAxis = () => {
    const days = [];
    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(timeRange.start.getTime() + i * 24 * 60 * 60 * 1000);
      const x = leftPanelWidth + i * dayWidth;
      
      days.push(
        <g key={i}>
          <line
            x1={x}
            y1={0}
            x2={x}
            y2={headerHeight + ganttTasks.length * (taskHeight + taskSpacing)}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
          <text
            x={x + dayWidth / 2}
            y={20}
            textAnchor="middle"
            fontSize="12"
            fill="#6B7280"
          >
            {date.getMonth() + 1}/{date.getDate()}
          </text>
          <text
            x={x + dayWidth / 2}
            y={35}
            textAnchor="middle"
            fontSize="10"
            fill="#9CA3AF"
          >
            {['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}
          </text>
        </g>
      );
    }
    return days;
  };

  return (
    <div className="gantt-chart bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-dark">📊 甘特圖</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsConnecting(!isConnecting)}
            className={`px-3 py-1 rounded text-sm ${
              isConnecting 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isConnecting ? '取消連接' : '添加依賴'}
          </button>
          
          {/* 縮放控制 */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded px-2 py-1">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="縮小"
            >
              🔍-
            </button>
            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2}
              className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="放大"
            >
              🔍+
            </button>
            <button
              onClick={handleZoomReset}
              className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
              title="重置縮放"
            >
              ↻
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-auto" style={{ maxHeight: '600px' }}>
        <svg
          ref={svgRef}
          width={leftPanelWidth + totalDays * dayWidth + 50}
          height={headerHeight + ganttTasks.length * (taskHeight + taskSpacing) + 50}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="select-none"
        >
          {/* 定義箭頭標記 */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6B7280"
              />
            </marker>
            <marker
              id="arrowhead-blue"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#3B82F6"
              />
            </marker>
          </defs>
          
          {/* 背景網格 */}
          <rect
            x={0}
            y={0}
            width="100%"
            height="100%"
            fill="#FAFAFA"
          />
          
          {/* 時間軸 */}
          {renderTimeAxis()}
          
          {/* 任務名稱面板 */}
          <rect
            x={0}
            y={0}
            width={leftPanelWidth}
            height="100%"
            fill="white"
            stroke="#E5E7EB"
          />
          
          {/* 任務列表 */}
          {ganttTasks.map((task, index) => (
            <g key={task.id}>
              {/* 任務名稱 */}
              <text
                x={10}
                y={task.y + taskHeight / 2 + 4}
                fontSize="12"
                fill="#374151"
                className="font-medium"
              >
                {task.title.length > 20 ? task.title.substring(0, 20) + '...' : task.title}
              </text>
              
              {/* 優先級指示器 */}
              <circle
                cx={leftPanelWidth - 20}
                cy={task.y + taskHeight / 2}
                r={4}
                fill={getPriorityColor(task.priority)}
              />
            </g>
          ))}
          
          {/* 拖拽指示線 */}
          {ganttTasks.map(task => (
            <line
              key={`indicator-${task.id}`}
              id={`drag-indicator-${task.id}`}
              x1={task.x}
              y1={headerHeight}
              x2={task.x}
              y2={headerHeight + ganttTasks.length * (taskHeight + taskSpacing)}
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="5,5"
              visibility="hidden"
              opacity="0.7"
            />
          ))}
          
          {/* 任務條 */}
          {ganttTasks.map(task => (
            <g
              key={task.id}
              id={`task-${task.id}`}
              className="cursor-pointer"
              onMouseDown={(e) => handleMouseDown(e, task.id)}
              onClick={() => handleTaskClick(task.id)}
            >
              <rect
                x={task.x}
                y={task.y}
                width={task.width}
                height={task.height}
                fill={getTaskColor(task)}
                stroke={selectedTask === task.id ? '#3B82F6' : 'transparent'}
                strokeWidth={selectedTask === task.id ? 2 : 0}
                rx={4}
                className="hover:opacity-80 transition-all duration-200"
              />
              
              {/* 完成進度 */}
              <rect
                x={task.x}
                y={task.y}
                width={task.width * (task.completionPercentage / 100)}
                height={task.height}
                fill={getTaskColor(task)}
                fillOpacity={0.8}
                rx={4}
              />
              
              {/* 任務文字 */}
              <text
                x={task.x + 8}
                y={task.y + taskHeight / 2 + 4}
                fontSize="11"
                fill="white"
                className="font-medium pointer-events-none"
              >
                {task.completionPercentage}%
              </text>
              
              {/* 連接點 */}
              {isConnecting && (
                <>
                  <circle
                    cx={task.x}
                    cy={task.y + task.height / 2}
                    r={6}
                    fill="#3B82F6"
                    stroke="white"
                    strokeWidth={2}
                    className="cursor-pointer"
                  />
                  <circle
                    cx={task.x + task.width}
                    cy={task.y + task.height / 2}
                    r={6}
                    fill="#3B82F6"
                    stroke="white"
                    strokeWidth={2}
                    className="cursor-pointer"
                  />
                </>
              )}
            </g>
          ))}
          
          {/* 里程碑標記 */}
          {milestones.map((milestone) => {
            const milestoneX = ((new Date(milestone.dueDate).getTime() - timeRange.start.getTime()) / 
              (timeRange.end.getTime() - timeRange.start.getTime())) * (totalDays * dayWidth) + leftPanelWidth;
            
            return (
              <g key={milestone.id}>
                {/* 里程碑垂直線 */}
                <line
                  x1={milestoneX}
                  y1={50}
                  x2={milestoneX}
                  y2={50 + ganttTasks.length * 60}
                  stroke={milestone.completed ? '#10B981' : '#F59E0B'}
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
                {/* 里程碑菱形標記 */}
                <polygon
                  points={`${milestoneX-8},${40} ${milestoneX},${30} ${milestoneX+8},${40} ${milestoneX},${50}`}
                  fill={milestone.completed ? '#10B981' : '#F59E0B'}
                  stroke="white"
                  strokeWidth={2}
                />
                {/* 里程碑標題 */}
                <text
                  x={milestoneX}
                  y={25}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-700"
                >
                  {milestone.title}
                </text>
              </g>
            );
          })}
          
          {/* 依賴關係箭頭 */}
          {renderDependencies()}
        </svg>
      </div>
      
      {/* 圖例 */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-500 rounded"></div>
          <span>待辦</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>進行中</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>已完成</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>已取消</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-amber-500 rotate-45"></div>
          <span>里程碑（進行中）</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-green-500 rotate-45"></div>
          <span>里程碑（已完成）</span>
        </div>
      </div>
      
      {isConnecting && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 依賴連接模式：點擊第一個任務作為前置任務，再點擊第二個任務建立依賴關係
          </p>
        </div>
      )}
    </div>
  );
};

export default GanttChart;