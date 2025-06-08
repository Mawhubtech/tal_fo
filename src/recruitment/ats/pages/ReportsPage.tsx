import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, Calendar, ChevronDown, FileText, BarChart2, PieChart, TrendingUp, Users, Clock, CheckCircle, X, ArrowRight, Briefcase, User, Mail, Share2, Bookmark } from 'lucide-react';

// Mock data for reports
const mockMetrics = {
  // Recruitment funnel
  funnel: {
    totalCandidates: 342,
    sourced: 85,
    applied: 120,
    phoneScreened: 67,
    interviewed: 45,
    offered: 18,
    hired: 12,
    rejected: 90,
    timeToHire: 27, // in days
    costPerHire: 4250, // in dollars
    offerAcceptanceRate: 78, // in percentage
  },
  
  // Source tracking
  sources: [
    { name: 'LinkedIn', count: 98, percentage: 28.7 },
    { name: 'Referrals', count: 76, percentage: 22.2 },
    { name: 'Indeed', count: 54, percentage: 15.8 },
    { name: 'Career Page', count: 47, percentage: 13.7 },
    { name: 'Job Fairs', count: 32, percentage: 9.4 },
    { name: 'Other', count: 35, percentage: 10.2 }
  ],
  
  // Job performance
  jobs: [
    { 
      id: '101', 
      title: 'Senior Software Engineer - Frontend', 
      applicants: 48, 
      interviews: 12, 
      offers: 3, 
      hires: 2,
      openDays: 45,
      averageTimeToHire: 32
    },
    { 
      id: '102', 
      title: 'Product Manager - Mobile Apps', 
      applicants: 35, 
      interviews: 8, 
      offers: 2, 
      hires: 1,
      openDays: 60,
      averageTimeToHire: 40
    },
    { 
      id: '103', 
      title: 'Senior UX Designer', 
      applicants: 42, 
      interviews: 10, 
      offers: 2, 
      hires: 2,
      openDays: 35,
      averageTimeToHire: 28
    },
    { 
      id: '104', 
      title: 'DevOps Engineer - Cloud Infrastructure', 
      applicants: 30, 
      interviews: 6, 
      offers: 1, 
      hires: 1,
      openDays: 50,
      averageTimeToHire: 35
    },
    { 
      id: '105', 
      title: 'Marketing Manager - Growth', 
      applicants: 38, 
      interviews: 7, 
      offers: 2, 
      hires: 1,
      openDays: 42,
      averageTimeToHire: 30
    }
  ],
  
  // Recruiter performance
  recruiters: [
    {
      id: '201',
      name: 'Alex Johnson',
      candidates: 85,
      interviews: 32,
      hires: 5,
      timeToHire: 25,
      offerAcceptanceRate: 80
    },
    {
      id: '202',
      name: 'Maria Garcia',
      candidates: 78,
      interviews: 28,
      hires: 4,
      timeToHire: 30,
      offerAcceptanceRate: 75
    },
    {
      id: '203',
      name: 'Ryan Miller',
      candidates: 92,
      interviews: 34,
      hires: 6,
      timeToHire: 22,
      offerAcceptanceRate: 83
    },
    {
      id: '204',
      name: 'Priya Patel',
      candidates: 87,
      interviews: 30,
      hires: 5,
      timeToHire: 28,
      offerAcceptanceRate: 78
    }
  ],
  
  // Time-based metrics
  timeSeries: {
    applicants: [32, 45, 37, 50, 42, 58, 65],
    interviews: [12, 18, 15, 22, 20, 25, 30],
    hires: [2, 3, 2, 4, 3, 5, 6],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
  },
  
  // Diversity data
  diversity: {
    gender: [
      { name: 'Male', percentage: 58 },
      { name: 'Female', percentage: 39 },
      { name: 'Non-binary', percentage: 3 }
    ],
    ethnicity: [
      { name: 'White', percentage: 45 },
      { name: 'Asian', percentage: 22 },
      { name: 'Hispanic', percentage: 15 },
      { name: 'Black', percentage: 12 },
      { name: 'Other', percentage: 6 }
    ],
    veterans: 8, // percentage
    disabilities: 5 // percentage
  }
};

// Date range options
const dateRanges = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'Year to date', 'Last year', 'Custom range'];

// Report types
const reportTypes = ['All Reports', 'Recruitment Funnel', 'Source Analytics', 'Job Performance', 'Recruiter Performance', 'Time to Hire', 'Diversity'];

const ReportsPage: React.FC = () => {
  const [selectedDateRange, setSelectedDateRange] = useState<string>('Last 30 days');
  const [selectedReportType, setSelectedReportType] = useState<string>('All Reports');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showCustomRange, setShowCustomRange] = useState<boolean>(false);
  
  // Calculate conversion rates
  const calculateConversionRate = (numerator: number, denominator: number): number => {
    return denominator ? Math.round((numerator / denominator) * 100) : 0;
  };
  
  // Get CSS for percentage bars
  const getPercentageBarWidth = (percentage: number): string => {
    return `${percentage}%`;
  };
  
  // Get color for percentage change
  const getPercentageChangeColor = (change: number): string => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };
  
  // Get arrow for percentage change
  const getPercentageChangeArrow = (change: number) => {
    return change >= 0 ? 
      <TrendingUp size={14} className="inline-block mr-1" /> : 
      <TrendingUp size={14} className="inline-block mr-1 transform rotate-180" />;
  };
  
  // Handle date range change
  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range);
    setShowCustomRange(range === 'Custom range');
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/dashboard/ats" className="hover:text-gray-700">ATS</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Reports</span>
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recruitment Analytics</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center transition-colors">
          <Download size={18} className="mr-1" />
          Export Report
        </button>
      </div>
      
      {/* Filters and Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={selectedDateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
            >
              {dateRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
          
          {/* Report Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
            >
              {reportTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              defaultValue="pdf"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>
        
        {/* Custom Date Range */}
        {showCustomRange && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Candidates */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total Candidates</h3>
            <div className="p-2 bg-purple-100 rounded-md">
              <Users size={18} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold">{mockMetrics.funnel.totalCandidates}</p>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp size={14} className="inline-block mr-1" />
              +12.5% from previous period
            </p>
          </div>
        </div>
        
        {/* Time to Hire */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Avg. Time to Hire</h3>
            <div className="p-2 bg-blue-100 rounded-md">
              <Clock size={18} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold">{mockMetrics.funnel.timeToHire} days</p>
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <TrendingUp size={14} className="inline-block mr-1 transform rotate-180" />
              +3.5 days from previous period
            </p>
          </div>
        </div>
        
        {/* Offer Acceptance */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Offer Acceptance</h3>
            <div className="p-2 bg-green-100 rounded-md">
              <CheckCircle size={18} className="text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold">{mockMetrics.funnel.offerAcceptanceRate}%</p>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp size={14} className="inline-block mr-1" />
              +2.3% from previous period
            </p>
          </div>
        </div>
        
        {/* Cost Per Hire */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Cost Per Hire</h3>
            <div className="p-2 bg-yellow-100 rounded-md">
              <Briefcase size={18} className="text-yellow-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold">${mockMetrics.funnel.costPerHire}</p>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp size={14} className="inline-block mr-1" />
              -5.2% from previous period
            </p>
          </div>
        </div>
      </div>
      
      {/* Recruitment Funnel */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <BarChart2 size={20} className="mr-2 text-purple-600" />
            Recruitment Funnel
          </h2>
          <button className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
            <FileText size={16} className="mr-1" />
            Full Report
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-2 mb-6">
          {/* Sourced */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium">Sourced</h3>
              <span className="text-xs text-gray-500">{mockMetrics.funnel.sourced}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">100%</p>
          </div>
          
          {/* Applied */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium">Applied</h3>
              <span className="text-xs text-gray-500">{mockMetrics.funnel.applied}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: getPercentageBarWidth(calculateConversionRate(mockMetrics.funnel.applied, mockMetrics.funnel.sourced + mockMetrics.funnel.applied)) }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {calculateConversionRate(mockMetrics.funnel.applied, mockMetrics.funnel.sourced + mockMetrics.funnel.applied)}%
            </p>
          </div>
          
          {/* Phone Screened */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium">Phone Screen</h3>
              <span className="text-xs text-gray-500">{mockMetrics.funnel.phoneScreened}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: getPercentageBarWidth(calculateConversionRate(mockMetrics.funnel.phoneScreened, mockMetrics.funnel.applied)) }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {calculateConversionRate(mockMetrics.funnel.phoneScreened, mockMetrics.funnel.applied)}%
            </p>
          </div>
          
          {/* Interviewed */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium">Interviewed</h3>
              <span className="text-xs text-gray-500">{mockMetrics.funnel.interviewed}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: getPercentageBarWidth(calculateConversionRate(mockMetrics.funnel.interviewed, mockMetrics.funnel.phoneScreened)) }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {calculateConversionRate(mockMetrics.funnel.interviewed, mockMetrics.funnel.phoneScreened)}%
            </p>
          </div>
          
          {/* Offered */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium">Offered</h3>
              <span className="text-xs text-gray-500">{mockMetrics.funnel.offered}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: getPercentageBarWidth(calculateConversionRate(mockMetrics.funnel.offered, mockMetrics.funnel.interviewed)) }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {calculateConversionRate(mockMetrics.funnel.offered, mockMetrics.funnel.interviewed)}%
            </p>
          </div>
          
          {/* Hired */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium">Hired</h3>
              <span className="text-xs text-gray-500">{mockMetrics.funnel.hired}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: getPercentageBarWidth(calculateConversionRate(mockMetrics.funnel.hired, mockMetrics.funnel.offered)) }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {calculateConversionRate(mockMetrics.funnel.hired, mockMetrics.funnel.offered)}%
            </p>
          </div>
          
          {/* Rejected */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium">Rejected</h3>
              <span className="text-xs text-gray-500">{mockMetrics.funnel.rejected}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: getPercentageBarWidth(calculateConversionRate(mockMetrics.funnel.rejected, mockMetrics.funnel.totalCandidates)) }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {calculateConversionRate(mockMetrics.funnel.rejected, mockMetrics.funnel.totalCandidates)}%
            </p>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <p>Overall Conversion Rate (Sourced to Hired): {calculateConversionRate(mockMetrics.funnel.hired, mockMetrics.funnel.sourced)}%</p>
          <p>Average Time to Hire: {mockMetrics.funnel.timeToHire} days</p>
        </div>
      </div>
      
      {/* Two-column layout for additional reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Source Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <PieChart size={20} className="mr-2 text-purple-600" />
              Source Analytics
            </h2>
            <button className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
              <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="space-y-4">
            {mockMetrics.sources.map(source => (
              <div key={source.name}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium">{source.name}</span>
                    <span className="ml-2 text-xs text-gray-500">{source.count} candidates</span>
                  </div>
                  <span className="text-xs font-medium">{source.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${source.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium mb-2">Top Performing Sources</h3>
            <div className="flex justify-between text-xs">
              <div>
                <p className="text-gray-500">Highest Volume</p>
                <p className="font-medium mt-1">LinkedIn</p>
              </div>
              <div>
                <p className="text-gray-500">Highest Conversion</p>
                <p className="font-medium mt-1">Referrals</p>
              </div>
              <div>
                <p className="text-gray-500">Lowest Cost per Hire</p>
                <p className="font-medium mt-1">Career Page</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recruiter Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <User size={20} className="mr-2 text-purple-600" />
              Recruiter Performance
            </h2>
            <button className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
              <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recruiter</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Candidates</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Interviews</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hires</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Time to Hire</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockMetrics.recruiters.map(recruiter => (
                  <tr key={recruiter.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{recruiter.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500">{recruiter.candidates}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500">{recruiter.interviews}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500">{recruiter.hires}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500">{recruiter.timeToHire} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium mb-2">Top Performer Metrics</h3>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-gray-500">Most Hires</p>
                <p className="font-medium mt-1">Ryan Miller (6)</p>
              </div>
              <div>
                <p className="text-gray-500">Fastest Time to Hire</p>
                <p className="font-medium mt-1">Ryan Miller (22 days)</p>
              </div>
              <div>
                <p className="text-gray-500">Best Acceptance Rate</p>
                <p className="font-medium mt-1">Ryan Miller (83%)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Job Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Briefcase size={20} className="mr-2 text-purple-600" />
            Job Performance
          </h2>
          <button className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
            <FileText size={16} className="mr-1" />
            Full Report
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Applicants</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Interviews</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Offers</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hires</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Days Open</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockMetrics.jobs.map(job => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{job.title}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{job.applicants}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{job.interviews}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{job.offers}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{job.hires}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{job.openDays}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">
                    {calculateConversionRate(job.hires, job.applicants)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Trending Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Time-Based Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 flex items-center mb-4">
            <TrendingUp size={20} className="mr-2 text-purple-600" />
            Hiring Trends
          </h2>
          
          {/* Mock Bar Chart */}
          <div className="h-48 flex items-end space-x-2 mb-2">
            {mockMetrics.timeSeries.months.map((month, index) => (
              <div key={month} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-purple-500 rounded-t"
                  style={{ height: `${(mockMetrics.timeSeries.applicants[index] / 70) * 100}%` }}
                ></div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            {mockMetrics.timeSeries.months.map(month => (
              <div key={month}>{month}</div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-1"></span>
                <span>Applicants</span>
              </div>
              <div>
                <span className={`${getPercentageChangeColor(8)} flex items-center`}>
                  {getPercentageChangeArrow(8)}
                  +12% vs previous period
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Diversity Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 flex items-center mb-4">
            <Users size={20} className="mr-2 text-purple-600" />
            Diversity Metrics
          </h2>
          
          <h3 className="text-sm font-medium text-gray-700 mb-2">Gender Distribution</h3>
          <div className="flex h-6 rounded-full overflow-hidden mb-2">
            {mockMetrics.diversity.gender.map((item, index) => (
              <div 
                key={index}
                className={`h-full ${
                  index === 0 ? 'bg-blue-500' : 
                  index === 1 ? 'bg-pink-500' : 
                  'bg-purple-500'
                }`}
                style={{ width: `${item.percentage}%` }}
              ></div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-4">
            {mockMetrics.diversity.gender.map((item) => (
              <div key={item.name} className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-1 ${
                  item.name === 'Male' ? 'bg-blue-500' : 
                  item.name === 'Female' ? 'bg-pink-500' : 
                  'bg-purple-500'
                }`}></span>
                <span>{item.name} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
          
          <h3 className="text-sm font-medium text-gray-700 mb-2 mt-4">Ethnicity Distribution</h3>
          <div className="space-y-2 mb-4">
            {mockMetrics.diversity.ethnicity.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-4">
            <div>Veterans: {mockMetrics.diversity.veterans}%</div>
            <div>People with Disabilities: {mockMetrics.diversity.disabilities}%</div>
          </div>
        </div>
        
        {/* Hiring Efficiency */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 flex items-center mb-4">
            <CheckCircle size={20} className="mr-2 text-purple-600" />
            Hiring Efficiency
          </h2>
          
          <div className="space-y-4">
            {/* Time to Hire */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Time to Hire</span>
                <span className="text-xs font-medium">{mockMetrics.funnel.timeToHire} days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(mockMetrics.funnel.timeToHire / 40) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Target: 25 days</span>
                <span className="text-red-500">+2 days vs target</span>
              </div>
            </div>
            
            {/* Cost Per Hire */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Cost Per Hire</span>
                <span className="text-xs font-medium">${mockMetrics.funnel.costPerHire}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(mockMetrics.funnel.costPerHire / 5000) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Target: $4,500</span>
                <span className="text-green-500">-$250 vs target</span>
              </div>
            </div>
            
            {/* Offer Acceptance Rate */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Offer Acceptance</span>
                <span className="text-xs font-medium">{mockMetrics.funnel.offerAcceptanceRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${mockMetrics.funnel.offerAcceptanceRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Target: 75%</span>
                <span className="text-green-500">+3% vs target</span>
              </div>
            </div>
            
            {/* Interview to Offer */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Interview to Offer</span>
                <span className="text-xs font-medium">{calculateConversionRate(mockMetrics.funnel.offered, mockMetrics.funnel.interviewed)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${calculateConversionRate(mockMetrics.funnel.offered, mockMetrics.funnel.interviewed)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Target: 50%</span>
                <span className="text-yellow-500">-10% vs target</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Saved Reports */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Bookmark size={20} className="mr-2 text-purple-600" />
            Saved Reports
          </h2>
          <button className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
            <Share2 size={16} className="mr-1" />
            Share Reports
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center text-purple-600 mb-2">
              <BarChart2 size={16} className="mr-2" />
              <h3 className="text-sm font-medium">Quarterly Hiring Overview</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">Complete overview of Q2 2025 hiring metrics and KPIs</p>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Last updated: May 31, 2025</span>
              <button className="text-purple-600 hover:text-purple-800">View</button>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center text-purple-600 mb-2">
              <PieChart size={16} className="mr-2" />
              <h3 className="text-sm font-medium">Source Effectiveness</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">Analysis of candidate sources and conversion rates</p>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Last updated: May 28, 2025</span>
              <button className="text-purple-600 hover:text-purple-800">View</button>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center text-purple-600 mb-2">
              <Users size={16} className="mr-2" />
              <h3 className="text-sm font-medium">Diversity Report</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">Detailed analysis of workforce diversity metrics</p>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Last updated: May 25, 2025</span>
              <button className="text-purple-600 hover:text-purple-800">View</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
