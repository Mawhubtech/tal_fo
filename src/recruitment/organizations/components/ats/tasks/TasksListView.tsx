import React from 'react';
import type { Task } from '../../../data/mock';
import { TaskCard } from './TaskCard';

interface TasksListViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export const TasksListView: React.FC<TasksListViewProps> = ({
  tasks,
  onTaskClick
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Tasks & Action Items</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            <p>No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
};
