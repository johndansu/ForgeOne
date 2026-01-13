"use client";

import { useState } from 'react';
import { TextureButton } from '@/components/ui/texture-button';
import { Plus, GripVertical, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
}

interface KanbanColumn {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

interface NotionKanbanProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

export function NotionKanban({ tasks, onTasksChange }: NotionKanbanProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const columns: KanbanColumn[] = [
    {
      id: 'todo',
      title: 'To Do',
      tasks: tasks.filter(task => task.status === 'todo'),
      color: 'border-gray-300'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: tasks.filter(task => task.status === 'in-progress'),
      color: 'border-blue-300'
    },
    {
      id: 'done',
      title: 'Done',
      tasks: tasks.filter(task => task.status === 'done'),
      color: 'border-green-300'
    }
  ];

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    if (draggedTask) {
      const updatedTasks = tasks.map(task =>
        task.id === draggedTask.id ? { ...task, status: targetStatus } : task
      );
      onTasksChange(updatedTasks);
      setDraggedTask(null);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
    }
  };

  const addTask = (status: Task['status']) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: 'New Task',
      status,
      priority: 'medium'
    };
    onTasksChange([...tasks, newTask]);
  };

  return (
    <div className="flex gap-6 p-6 bg-gray-50 min-h-[500px]">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-1 bg-white rounded-lg shadow-sm"
        >
          {/* Column Header */}
          <div className={`p-4 border-b ${column.color}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <span className="text-sm text-gray-500">{column.tasks.length}</span>
            </div>
          </div>

          {/* Tasks */}
          <div
            className={`p-4 min-h-[200px] ${column.color} border-dashed`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id as Task['status'])}
          >
            <div className="space-y-3">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  className="bg-white p-3 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{task.title}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>Just now</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Task Button */}
            <TextureButton
              onClick={() => addTask(column.id as Task['status'])}
              variant="minimal"
              className="w-full mt-3"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </TextureButton>
          </div>
        </div>
      ))}
    </div>
  );
}
