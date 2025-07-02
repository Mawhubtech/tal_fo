import React from 'react';
import type { Candidate } from '../../../data/mock';
import type { Pipeline } from '../../../../../services/pipelineService';

interface PipelineStatsProps {
  candidates: Candidate[];
  pipeline?: Pipeline | null;
  getCandidatesByStage: (stage: string) => Candidate[];
}

export const PipelineStats: React.FC<PipelineStatsProps> = ({
  candidates,
  pipeline,
  getCandidatesByStage
}) => {
  // Get key stages for stats (looking for specific stage types)
  const getStageByType = (type: string) => {
    return pipeline?.stages?.find(stage => 
      stage.type.toLowerCase() === type.toLowerCase() && stage.isActive
    )?.name;
  };

  const applicationStage = getStageByType('application') || 'Application';
  const interviewStages = pipeline?.stages?.filter(stage => 
    stage.type.toLowerCase() === 'interview' && stage.isActive
  ).map(stage => stage.name) || [];
  const offerStage = getStageByType('offer') || 'Offer';
  const hiredStage = getStageByType('hired') || 'Hired';

  // Calculate interview candidates count
  const interviewCandidatesCount = interviewStages.reduce((total, stage) => {
    return total + getCandidatesByStage(stage).length;
  }, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
        <p className="text-2xl font-bold text-blue-600">
          {getCandidatesByStage(applicationStage).length}
        </p>
        <p className="text-sm text-gray-500">New Applications</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
        <p className="text-2xl font-bold text-purple-600">
          {interviewCandidatesCount}
        </p>
        <p className="text-sm text-gray-500">In Interview</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
        <p className="text-2xl font-bold text-orange-600">
          {getCandidatesByStage(offerStage).length}
        </p>
        <p className="text-sm text-gray-500">Pending Offers</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
        <p className="text-2xl font-bold text-green-600">
          {getCandidatesByStage(hiredStage).length}
        </p>
        <p className="text-sm text-gray-500">Hired</p>
      </div>
    </div>
  );
};
