import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, CheckSquare } from 'lucide-react';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface TodoListWidgetProps {
  className?: string;
}

const TodoListWidget: React.FC<TodoListWidgetProps> = ({ className = '' }) => {
  const todoItems: TodoItem[] = [
    { id: 1, text: 'Review candidate portfolio for Senior Developer role', completed: false, priority: 'high' },
    { id: 2, text: 'Schedule interview with marketing candidate', completed: false, priority: 'medium' },
    { id: 3, text: 'Follow up with client about job requirements', completed: true, priority: 'low' },
    { id: 4, text: 'Update sourcing project status', completed: false, priority: 'medium' },
    { id: 5, text: 'Send weekly recruitment report', completed: false, priority: 'high' }
  ];

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 h-full ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">To-Do List</h3>
        <button className="p-1 rounded-lg hover:bg-gray-100 flex-shrink-0">
          <Plus className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      <div className="space-y-3">
        {todoItems.slice(0, 5).map((todo) => (
          <div key={todo.id} className="flex items-start space-x-3">
            <button 
              className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                todo.completed 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {todo.completed && <CheckSquare className="w-3 h-3 text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${
                todo.completed 
                  ? 'text-gray-500 line-through' 
                  : 'text-gray-900'
              }`}>
                {todo.text}
              </p>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  todo.priority === 'high' ? 'bg-red-100 text-red-800' :
                  todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {todo.priority}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <Link 
        to="/dashboard/tasks" 
        className="mt-4 block text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
      >
        View All Tasks →
      </Link>
    </div>
  );
};

export default TodoListWidget;
