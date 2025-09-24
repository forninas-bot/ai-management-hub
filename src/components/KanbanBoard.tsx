import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, KanbanColumn } from '../types';

interface KanbanBoardProps {
  columns: KanbanColumn[];
  tasks: Task[];
  onTaskMove: (taskId: string, fromColumnId: string, toColumnId: string, newIndex: number) => void;
  onCreateTask: (columnId: string) => void;
}

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg p-3 shadow-sm border cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <h5 className="font-medium text-sm text-dark mb-1">{task.title}</h5>
      {task.description && (
        <p className="text-xs text-gray mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded ${
          task.priority === 'high' ? 'bg-red-100 text-red-800' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
        </span>
        {task.dueDate && (
          <span className="text-xs text-gray">
            {new Date(task.dueDate).toLocaleDateString('zh-TW')}
          </span>
        )}
      </div>
      <div className="mt-2">
        <span className={`text-xs px-2 py-1 rounded ${
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
  );
};

interface KanbanColumnProps {
  column: KanbanColumn;
  tasks: Task[];
  onCreateTask: (columnId: string) => void;
}

const KanbanColumnComponent: React.FC<KanbanColumnProps> = ({ column, tasks, onCreateTask }) => {
  const columnTasks = tasks.filter(task => column.taskIds.includes(task.id));
  
  const {
    setNodeRef,
    isOver,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  return (
    <div 
      ref={setNodeRef}
      className={`bg-secondaryBg rounded-lg p-3 min-h-[400px] transition-colors ${
        isOver ? 'bg-primary/10 border-2 border-primary border-dashed' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-dark">{column.title}</h4>
        <span className="text-xs text-gray bg-white px-2 py-1 rounded">
          {columnTasks.length}
        </span>
      </div>
      
      <SortableContext items={column.taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[300px]">
          {columnTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
      
      <button
        onClick={() => onCreateTask(column.id)}
        className="w-full p-3 mt-3 border-2 border-dashed border-gray hover:border-primary hover:bg-primary/5 rounded-lg text-gray hover:text-primary transition-colors flex items-center justify-center space-x-2"
      >
        <span className="text-lg">+</span>
        <span className="text-sm">新增任務</span>
      </button>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns, tasks, onTaskMove, onCreateTask }) => {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  // 創建包含所有任務ID和列ID的項目列表
  const allItems = [
    ...tasks.map(task => task.id),
    ...columns.map(column => column.id)
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeTaskId = active.id as string;
    const overId = over.id as string;
    
    // 找到任務當前所在的列
    const activeColumn = columns.find(col => col.taskIds.includes(activeTaskId));
    
    // 判斷拖拽目標是任務還是列
    let targetColumn = columns.find(col => col.id === overId);
    if (!targetColumn) {
      // 如果拖拽到任務上，找到該任務所在的列
      targetColumn = columns.find(col => col.taskIds.includes(overId));
    }
    
    if (!activeColumn || !targetColumn) {
      setActiveTask(null);
      return;
    }

    // 如果是同一列內的重排序
    if (activeColumn.id === targetColumn.id) {
      const oldIndex = activeColumn.taskIds.indexOf(activeTaskId);
      let newIndex = activeColumn.taskIds.indexOf(overId);
      
      if (newIndex === -1) {
        // 拖拽到列上，放到最後
        newIndex = activeColumn.taskIds.length - 1;
      }
      
      if (oldIndex !== newIndex) {
        onTaskMove(activeTaskId, activeColumn.id, targetColumn.id, newIndex);
      }
    } else {
      // 跨列移動
      let newIndex = 0;
      if (targetColumn.taskIds.includes(overId)) {
        newIndex = targetColumn.taskIds.indexOf(overId);
      } else {
        newIndex = targetColumn.taskIds.length;
      }
      
      onTaskMove(activeTaskId, activeColumn.id, targetColumn.id, newIndex);
    }
    
    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={allItems} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-3 gap-4">
          {columns.map(column => (
            <div key={column.id}>
              <KanbanColumnComponent
                column={column}
                tasks={tasks}
                onCreateTask={onCreateTask}
              />
            </div>
          ))}
        </div>
      </SortableContext>
      
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;