import React from 'react';
import { Plus, Filter, Users, Calendar } from 'lucide-react';
import type { Interview } from '../../../data/mock';
import { InterviewsListView } from './InterviewsListView';
import { InterviewsCalendarView } from './InterviewsCalendarView';

interface InterviewsTabProps {
  interviews: Interview[];
  interviewsView: 'list' | 'calendar';
  onInterviewsViewChange: (view: 'list' | 'calendar') => void;
  currentDate: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onToday: () => void;
  onInterviewClick?: (interview: Interview) => void;
  onNewInterview?: () => void;
}

export const InterviewsTab: React.FC<InterviewsTabProps> = ({
  interviews,
  interviewsView,
  onInterviewsViewChange,
  currentDate,
  onNavigateMonth,
  onToday,
  onInterviewClick,
  onNewInterview
}) => {
  const scheduledInterviews = interviews.filter(i => i.status === 'Scheduled').length;
  const completedInterviews = interviews.filter(i => i.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Interview Actions */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
        <div className="flex space-x-3">
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            onClick={onNewInterview}
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Interview
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => onInterviewsViewChange('list')}
              className={`px-3 py-2 text-sm flex items-center ${
                interviewsView === 'list' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4 mr-1" />
              List
            </button>
            <button
              onClick={() => onInterviewsViewChange('calendar')}
              className={`px-3 py-2 text-sm flex items-center ${
                interviewsView === 'calendar' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Calendar
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {scheduledInterviews} scheduled • {completedInterviews} completed
        </div>
      </div>

      {/* Interviews Content */}
      {interviewsView === 'list' ? (
        <InterviewsListView
          interviews={interviews}
          onInterviewClick={onInterviewClick}
        />
      ) : (
        <InterviewsCalendarView
          interviews={interviews}
          currentDate={currentDate}
          onNavigateMonth={onNavigateMonth}
          onToday={onToday}
        />
      )}
    </div>
  );
};
