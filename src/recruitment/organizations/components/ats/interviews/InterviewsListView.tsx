import React from 'react';
import type { Interview } from '../../../data/mock';
import { InterviewCard } from './InterviewCard';

interface InterviewsListViewProps {
  interviews: Interview[];
  onInterviewClick?: (interview: Interview) => void;
}

export const InterviewsListView: React.FC<InterviewsListViewProps> = ({
  interviews,
  onInterviewClick
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {interviews.length > 0 ? (
          interviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              onClick={() => onInterviewClick?.(interview)}
            />
          ))
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            <p>No interviews scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
};
