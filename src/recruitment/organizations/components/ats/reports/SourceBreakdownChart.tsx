import React from 'react';
import type { ReportMetrics } from '../../../data/mock';

interface SourceBreakdownChartProps {
  sourceBreakdown: ReportMetrics['sourceBreakdown'];
}

export const SourceBreakdownChart: React.FC<SourceBreakdownChartProps> = ({ 
  sourceBreakdown 
}) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500'
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Candidate Sources</h3>
      
      <div className="space-y-4">
        {sourceBreakdown.map((source, index) => (
          <div key={source.source} className="flex items-center">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{source.source}</span>
                <span className="text-sm text-gray-500">{source.count} candidates</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${colors[index % colors.length]}`}
                  style={{ width: `${source.percentage}%` }}
                ></div>
              </div>
            </div>
            <span className="ml-4 text-sm font-medium text-gray-600 min-w-[3rem] text-right">
              {source.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Track which sources bring in the most qualified candidates to optimize your recruiting efforts.
        </p>
      </div>
    </div>
  );
};
