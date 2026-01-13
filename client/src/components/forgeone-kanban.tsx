"use client";

import { useState } from 'react';
import { GripVertical, Plus, Clock, CheckCircle, AlertCircle, Calendar, Users, Tag, X } from 'lucide-react';
import { TextureButton } from '@/components/ui/texture-button';
import { cn } from '@/lib/utils';

interface ForgeOneTask {
  id: string;
  title: string;
  description?: string;
  status: 'backlog' | 'planned' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  dueDate?: Date;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ForgeOneKanbanProps {
  tasks: ForgeOneTask[];
  onTasksChange: (tasks: ForgeOneTask[]) => void;
  className?: string;
}

export function ForgeOneKanban({ tasks, onTasksChange, className }: ForgeOneKanbanProps) {
  const [draggedTask, setDraggedTask] = useState<ForgeOneTask | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<ForgeOneTask['status'] | null>(null);

  const columns = [
    { 
      id: 'backlog' as const, 
      title: 'Backlog', 
      color: 'border-gray-300',
      bgColor: 'bg-gray-50',
      icon: <AlertCircle className="h-4 w-4 text-gray-500" />
    },
    { 
      id: 'planned' as const, 
      title: 'Planned', 
      color: 'border-blue-300',
      bgColor: 'bg-blue-50',
      icon: <Calendar className="h-4 w-4 text-blue-500" />
    },
    { 
      id: 'in-progress' as const, 
      title: 'In Progress', 
      color: 'border-yellow-300',
      bgColor: 'bg-yellow-50',
      icon: <Clock className="h-4 w-4 text-yellow-500" />
    },
    { 
      id: 'review' as const, 
      title: 'Review', 
      color: 'border-purple-300',
      bgColor: 'bg-purple-50',
      icon: <Users className="h-4 w-4 text-purple-500" />
    },
    { 
      id: 'completed' as const, 
      title: 'Completed', 
      color: 'border-green-300',
      bgColor: 'bg-green-50',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    }
  ];

  const getPriorityColor = (priority: ForgeOneTask['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getPriorityIcon = (priority: ForgeOneTask['priority']) => {
    switch (priority) {
      case 'critical': return '🔥';
      case 'high': return '⚡';
      case 'medium': return '⚡';
      case 'low': return '📌';
    }
  };

  const handleDragStart = (task: ForgeOneTask) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ForgeOneTask['status']) => {
    e.preventDefault();
    if (draggedTask) {
      const updatedTasks = tasks.map(task =>
        task.id === draggedTask.id 
          ? { ...task, status: targetStatus, updatedAt: new Date() }
          : task
      );
      onTasksChange(updatedTasks);
      setDraggedTask(null);
    }
  };

  const addTask = (status: ForgeOneTask['status']) => {
    const newTask: ForgeOneTask = {
      id: Date.now().toString(),
      title: 'New Task',
      status,
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onTasksChange([...tasks, newTask]);
    setShowAddTask(false);
  };

  const updateTask = (taskId: string, updates: Partial<ForgeOneTask>) => {
    onTasksChange(tasks.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
  };

  const deleteTask = (taskId: string) => {
    onTasksChange(tasks.filter(task => task.id !== taskId));
  };

  return (
    <div className={cn("flex gap-4 h-full overflow-auto", className)}>
      {columns.map((column) => {
        const columnTasks = tasks.filter(task => task.status === column.id);
        
        return (
          <div
            key={column.id}
            className="flex-1 min-w-0 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            {/* Column Header */}
            <div className={cn("p-4 border-b flex items-center justify-between", column.color)}>
              <div className="flex items-center gap-2">
                {column.icon}
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="text-sm text-gray-500">({columnTasks.length})</span>
              </div>
              <TextureButton
                onClick={() => {
                  setSelectedColumn(column.id);
                  setShowAddTask(true);
                }}
                variant="minimal"
                className="p-1"
              >
                <Plus className="h-4 w-4" />
              </TextureButton>
            </div>

            {/* Tasks */}
            <div
              className={cn("p-4 min-h-[200px] space-y-3", column.bgColor)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  className="bg-white border border-gray-200 rounded-lg p-4 cursor-move hover:shadow-md transition-shadow"
                >
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <h4 className="font-medium text-gray-900 text-sm truncate">{task.title}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={cn("px-2 py-1 rounded text-xs font-medium border", getPriorityColor(task.priority))}>
                        {getPriorityIcon(task.priority)} {task.priority}
                      </span>
                    </div>
                  </div>

                  {/* Task Description */}
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                  )}

                  {/* Task Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      {task.assignee && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{task.assignee}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{task.dueDate.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {task.estimatedHours && (
                        <span>~{task.estimatedHours}h</span>
                      )}
                      {task.actualHours && (
                        <span>{task.actualHours}h</span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Task Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => updateTask(task.id, { 
                        status: task.status === 'completed' ? 'in-progress' : 'completed' 
                      })}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      {task.status === 'completed' ? 'Reopen' : 'Complete'}
                    </button>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-2xl mb-2">📋</div>
                  <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                  <button
                    onClick={() => {
                      setSelectedColumn(column.id);
                      setShowAddTask(true);
                    }}
                    className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Add task
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Add Task Modal */}
      {showAddTask && selectedColumn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Task to {columns.find(c => c.id === selectedColumn)?.title}</h3>
              <button
                onClick={() => setShowAddTask(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <textarea
                placeholder="Task description (optional)"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
              />
              <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical Priority</option>
              </select>
              <div className="flex gap-3">
                <TextureButton
                  onClick={() => addTask(selectedColumn)}
                  variant="accent"
                  className="flex-1"
                >
                  Add Task
                </TextureButton>
                <TextureButton
                  onClick={() => setShowAddTask(false)}
                  variant="minimal"
                  className="flex-1"
                >
                  Cancel
                </TextureButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
