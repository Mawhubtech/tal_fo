import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onToday: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onNavigateMonth,
  onToday
}) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-gray-900">
      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
    </h3>
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onNavigateMonth('prev')}
        className="p-2 hover:bg-gray-100 rounded-lg"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={onToday}
        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
      >
        Today
      </button>
      <button
        onClick={() => onNavigateMonth('next')}
        className="p-2 hover:bg-gray-100 rounded-lg"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);
