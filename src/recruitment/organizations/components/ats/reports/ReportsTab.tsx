import React from 'react';
import { Download, TrendingUp } from 'lucide-react';
import type { ReportData } from '../../../data/mock';
import { ReportsOverview } from './ReportsOverview';
import { SourceBreakdownChart } from './SourceBreakdownChart';

interface ReportsTabProps {
  reportData: ReportData | null;
  onExportReport?: () => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ 
  reportData,
  onExportReport 
}) => {
  if (!reportData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Data Available</h3>
        <p className="text-gray-500">Report data will be available once there are candidates in the pipeline.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Actions */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recruitment Analytics</h3>
          <p className="text-sm text-gray-500">Performance metrics and insights for this position</p>
        </div>
        <button 
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
          onClick={onExportReport}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Overview Metrics */}
      <ReportsOverview metrics={reportData.metrics} />

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SourceBreakdownChart sourceBreakdown={reportData.metrics.sourceBreakdown} />
        
        {/* Placeholder for additional charts */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Pipeline Conversion</h3>
          <div className="flex items-center justify-center h-48 text-gray-400">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Conversion chart coming soon</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>Your offer acceptance rate of {reportData.metrics.offerAcceptanceRate}% is above industry average.</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>LinkedIn continues to be your top candidate source, contributing {reportData.metrics.sourceBreakdown[0]?.percentage.toFixed(1)}% of applications.</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>Average time to hire is {reportData.metrics.averageTimeToHire} days. Consider streamlining the interview process to reduce time-to-fill.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
