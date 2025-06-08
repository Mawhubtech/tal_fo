import React from 'react';
import type { Candidate, Stage } from '../../../data/mock';

interface PipelineStatsProps {
  candidates: Candidate[];
  getCandidatesByStage: (stage: Stage) => Candidate[];
}

export const PipelineStats: React.FC<PipelineStatsProps> = ({
  candidates,
  getCandidatesByStage
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
        <p className="text-2xl font-bold text-blue-600">
          {getCandidatesByStage('Applied').length}
        </p>
        <p className="text-sm text-gray-500">New Applications</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
        <p className="text-2xl font-bold text-purple-600">
          {getCandidatesByStage('Technical Interview').length + 
           getCandidatesByStage('Final Interview').length}
        </p>
        <p className="text-sm text-gray-500">In Interview</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
        <p className="text-2xl font-bold text-orange-600">
          {getCandidatesByStage('Offer').length}
        </p>
        <p className="text-sm text-gray-500">Pending Offers</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
        <p className="text-2xl font-bold text-green-600">
          {getCandidatesByStage('Hired').length}
        </p>
        <p className="text-sm text-gray-500">Hired</p>
      </div>
    </div>
  );
};
