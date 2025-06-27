import React from 'react';
import { Download, TrendingUp } from 'lucide-react';
import type { JobReport } from '../../../services/reportsApiService';
import { ReportsOverview } from './ReportsOverview';
import { SourceBreakdownChart } from './SourceBreakdownChart';

interface ReportsTabProps {
  reportData: JobReport | null;
  loading?: boolean;
  error?: Error | null;
  onExportReport?: () => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ 
  reportData,
  loading = false,
  error = null,
  onExportReport 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Report Data</h3>
        <p className="text-gray-500">Generating analytics and insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <TrendingUp className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Report</h3>
        <p className="text-gray-500">Failed to load report data. Please try again later.</p>
        <p className="text-sm text-red-600 mt-2">{error.message}</p>
      </div>
    );
  }

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
        
        {/* Stage Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Stage Distribution</h3>
          <div className="space-y-3">
            {reportData.metrics.stageDistribution.map((stage, index) => (
              <div key={stage.stage} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{stage.count}</span>
                  <span className="text-xs text-gray-500 ml-1">({stage.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Additional Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>Your offer acceptance rate of {reportData.metrics.offerAcceptanceRate.toFixed(1)}% is {reportData.metrics.offerAcceptanceRate > 75 ? 'above' : 'below'} industry average.</p>
          </div>
          {reportData.metrics.sourceBreakdown.length > 0 && (
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>{reportData.metrics.sourceBreakdown[0].source} continues to be your top candidate source, contributing {reportData.metrics.sourceBreakdown[0].percentage.toFixed(1)}% of applications.</p>
            </div>
          )}
          <div className="flex items-start">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>Average time to hire is {reportData.metrics.averageTimeToHire} days. {reportData.metrics.averageTimeToHire > 30 ? 'Consider streamlining the interview process to reduce time-to-fill.' : 'Your hiring process is efficient compared to industry standards.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
