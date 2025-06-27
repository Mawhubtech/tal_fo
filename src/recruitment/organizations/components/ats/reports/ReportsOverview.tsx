import React from 'react';
import { TrendingUp, Users, Clock, Target } from 'lucide-react';
import type { ReportMetrics } from '../../../services/reportsApiService';

interface ReportsOverviewProps {
  metrics: ReportMetrics;
}

export const ReportsOverview: React.FC<ReportsOverviewProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{metrics.totalCandidates}</span>
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">Total Candidates</h3>
        <p className="text-xs text-gray-500">{metrics.activeInPipeline} currently in pipeline</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{metrics.hired}</span>
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">Hired</h3>
        <p className="text-xs text-gray-500">Successfully placed candidates</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{metrics.averageTimeToHire}</span>
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">Avg. Time to Hire</h3>
        <p className="text-xs text-gray-500">Days from application to offer</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{metrics.offerAcceptanceRate.toFixed(1)}%</span>
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">Offer Acceptance Rate</h3>
        <p className="text-xs text-gray-500">Percentage of accepted offers</p>
      </div>
    </div>
  );
};
