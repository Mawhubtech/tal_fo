import React, { useState } from 'react';
import { RefreshCw, Filter, Search, Calendar, Clock, Users } from 'lucide-react';
import type { Interview } from '../../../../../types/interview.types';
import { InterviewCard } from './InterviewCard';

interface InterviewsListViewProps {
  interviews: Interview[];
  isLoading?: boolean;
  onInterviewClick?: (interview: Interview) => void;
  onRefresh?: () => void;
  totalCount?: number;
  showJobInfo?: boolean;
  onUpdateInterviewStatus?: (interview: Interview, status: string) => void;
}

export const InterviewsListView: React.FC<InterviewsListViewProps> = ({
  interviews,
  isLoading = false,
  onInterviewClick,
  onRefresh,
  totalCount,
  showJobInfo = false,
  onUpdateInterviewStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter interviews based on search term and status
  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = searchTerm === '' || 
      interview.jobApplication?.candidate?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.jobApplication?.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.stage.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get upcoming and overdue interviews
  const now = new Date();
  const upcomingInterviews = filteredInterviews.filter(interview => 
    new Date(interview.scheduledAt) > now && interview.status === 'Scheduled'
  ).length;
  
  const overdueInterviews = filteredInterviews.filter(interview => 
    new Date(interview.scheduledAt) < now && interview.status === 'Scheduled'
  ).length;

  const completedInterviews = filteredInterviews.filter(interview => 
    interview.status === 'Completed'
  ).length;

  const handleInterviewClick = (interview: Interview) => {
    onInterviewClick?.(interview);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header with Stats and Actions */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Interviews ({totalCount || interviews.length})
            </h3>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-blue-500" />
                <span>{upcomingInterviews} upcoming</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-green-500" />
                <span>{completedInterviews} completed</span>
              </div>
              {overdueInterviews > 0 && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-red-500" />
                  <span className="text-red-600 font-medium">{overdueInterviews} overdue</span>
                </div>
              )}
            </div>
          </div>
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isLoading}
              title="Refresh interviews"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by candidate, job, type, or stage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="No Show">No Show</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Interview List */}
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="px-6 py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-3">Loading interviews...</p>
          </div>
        ) : filteredInterviews.length > 0 ? (
          filteredInterviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              onClick={() => handleInterviewClick(interview)}
              showJobInfo={showJobInfo}
              onStatusUpdate={onUpdateInterviewStatus}
            />
          ))
        ) : searchTerm || statusFilter !== 'all' ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium">No interviews match your search</p>
            <p className="text-sm mt-1">Try adjusting your search terms or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium">No interviews scheduled</p>
            <p className="text-sm mt-1">Interviews will appear here once they are scheduled</p>
          </div>
        )}
      </div>

      {/* Footer with result count */}
      {filteredInterviews.length > 0 && !isLoading && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          {searchTerm || statusFilter !== 'all' ? (
            <span>
              Showing {filteredInterviews.length} of {interviews.length} interviews
            </span>
          ) : (
            <span>
              {interviews.length} interview{interviews.length !== 1 ? 's' : ''} total
            </span>
          )}
        </div>
      )}
    </div>
  );
};
