import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Briefcase, Users, CheckCircle, BarChart3, Calendar, Plus
} from 'lucide-react';
import { jobApiService } from '../../jobs/services/jobApiService';
import type { Job as JobType } from '../../data/types';
import { PipelineTab, TasksTab, InterviewsTab, ReportsTab } from '../components/ats';
import { mockCandidatesByJob, mockTasksByJob, mockInterviewsByJob, mockReportsByJob, getMockJobKey } from '../data/mock';

const JobATSPage: React.FC = () => {
  const { organizationId, departmentId, jobId } = useParams<{ 
	organizationId: string; 
	departmentId: string; 
	jobId: string; 
  }>();
    const [activeTab, setActiveTab] = useState<'pipeline' | 'tasks' | 'interviews' | 'reports'>('pipeline');
  const [job, setJob] = useState<JobType | null>(null);
  const [loading, setLoading] = useState(true);

  // Pipeline states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [candidates, setCandidates] = useState<any[]>([]);
  // Calendar view states
  const [tasksView, setTasksView] = useState<'list' | 'calendar'>('list');
  const [interviewsView, setInterviewsView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId || !organizationId || !departmentId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Get the specific job by ID
        const jobData = await jobApiService.getJobById(jobId);
        
        // Verify it belongs to the correct organization and department
        if (jobData.organizationId === organizationId && jobData.departmentId === departmentId) {
          setJob(jobData);
        } else {
          setJob(null);
        }
      } catch (error) {
        console.error('Error loading job:', error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [jobId, organizationId, departmentId]);

  // Initialize candidates state with mock data
  useEffect(() => {
	const mockJobKey = jobId ? getMockJobKey(jobId) : '';
	const initialCandidates = mockJobKey && mockCandidatesByJob[mockJobKey] ? mockCandidatesByJob[mockJobKey] : [];
	setCandidates(initialCandidates);
  }, [jobId]);

  // Get mock data using imported function
  const mockJobKey = jobId ? getMockJobKey(jobId) : '';
  const allTasks = mockJobKey && mockTasksByJob[mockJobKey] ? mockTasksByJob[mockJobKey] : [];
  const allInterviews = mockJobKey && mockInterviewsByJob[mockJobKey] ? mockInterviewsByJob[mockJobKey] : [];
  const reportData = mockJobKey && mockReportsByJob[mockJobKey] ? mockReportsByJob[mockJobKey] : null;

  const handleCandidateUpdate = (updatedCandidate: any) => {
	setCandidates(prevCandidates => 
	  prevCandidates.map(candidate => 
		candidate.id === updatedCandidate.id ? updatedCandidate : candidate
	  )
	);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
	setCurrentDate(prev => {
	  const newDate = new Date(prev);
	  if (direction === 'prev') {
		newDate.setMonth(prev.getMonth() - 1);
	  } else {
		newDate.setMonth(prev.getMonth() + 1);
	  }
	  return newDate;
	});
  };

  const handleToday = () => {
	setCurrentDate(new Date());
  };

  if (loading) {
	return (
	  <div className="p-6 bg-gray-50 min-h-screen">
		<div className="text-center py-12">
		  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
		  <p className="text-gray-500">Loading job details...</p>
		</div>
	  </div>
	);
  }

  if (!job) {
	return (
	  <div className="p-6 bg-gray-50 min-h-screen">
		<div className="text-center py-12">
		  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
		  <h3 className="text-lg font-medium text-gray-900 mb-2">Job not found</h3>
		  <p className="text-gray-500 mb-4">The job you're looking for doesn't exist.</p>
		  <Link 
			to="/dashboard/organizations" 
			className="text-purple-600 hover:text-purple-700 font-medium"
		  >
			← Back to Organizations
		  </Link>
		</div>
	  </div>
	);
  }

  return (
	<div className="p-6 bg-gray-50 min-h-screen">
	  {/* Breadcrumbs */}
	  <div className="flex items-center text-sm text-gray-500 mb-4">
		<Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
		<span className="mx-2">/</span>
		<Link to="/dashboard/organizations" className="hover:text-gray-700">Organizations</Link>
		<span className="mx-2">/</span>
		<Link to={`/dashboard/organizations/${organizationId}`} className="hover:text-gray-700">
		  Organization
		</Link>
		<span className="mx-2">/</span>
		<Link to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs`} className="hover:text-gray-700">
		  {job.department}
		</Link>
		<span className="mx-2">/</span>
		<span className="text-gray-900 font-medium">ATS - {job.title}</span>
	  </div>

	  {/* Header */}
	  <div className="flex items-center justify-between mb-6">
		<div className="flex items-center">
		  <Link 
			to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs`}
			className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
		  >
			<ArrowLeft className="w-5 h-5" />
		  </Link>
		  <div>
			<h1 className="text-2xl font-bold text-gray-900">ATS Pipeline</h1>
			<p className="text-gray-600 mt-1">Managing candidates for this specific job</p>
		  </div>
		</div>
		
		<button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center transition-colors">
		  <Plus className="w-4 h-4 mr-2" />
		  Add Candidate
		</button>
	  </div>

	  {/* Job Info Card */}
	  <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
		<div className="flex items-center justify-between">
		  <div className="flex items-center">
			<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
			  <Briefcase className="w-6 h-6 text-purple-600" />
			</div>
			<div className="ml-4">			  <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
			  <p className="text-gray-600">{job.department} • {job.location} • {job.type}</p>
			  <p className="text-gray-500 text-sm">Status: {job.status} • Experience Level: {job.experienceLevel || 'Not specified'}</p>
			</div>
		  </div>		  <div className="text-right">
			<p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
			<p className="text-sm text-gray-500">Total Candidates</p>
		  </div>
		</div>
	  </div>

	  {/* Tab Navigation */}
	  <div className="bg-white rounded-lg shadow-sm border mb-6">
		<div className="flex space-x-0 border-b border-gray-200">
		  <button
			onClick={() => setActiveTab('pipeline')}
			className={`px-6 py-3 text-sm font-medium flex items-center ${
			  activeTab === 'pipeline'
				? 'border-b-2 border-purple-500 text-purple-600'
				: 'text-gray-500 hover:text-gray-700'
			}`}		  >
			<Users className="w-4 h-4 mr-2" />
			Pipeline ({candidates.length})
		  </button>
		  <button
			onClick={() => setActiveTab('tasks')}
			className={`px-6 py-3 text-sm font-medium flex items-center ${
			  activeTab === 'tasks'
				? 'border-b-2 border-purple-500 text-purple-600'
				: 'text-gray-500 hover:text-gray-700'
			}`}
		  >
			<CheckCircle className="w-4 h-4 mr-2" />
			Tasks ({allTasks.length})
		  </button>
		  <button
			onClick={() => setActiveTab('interviews')}
			className={`px-6 py-3 text-sm font-medium flex items-center ${
			  activeTab === 'interviews'
				? 'border-b-2 border-purple-500 text-purple-600'
				: 'text-gray-500 hover:text-gray-700'
			}`}
		  >
			<Calendar className="w-4 h-4 mr-2" />
			Interviews ({allInterviews.length})
		  </button>
		  <button
			onClick={() => setActiveTab('reports')}
			className={`px-6 py-3 text-sm font-medium flex items-center ${
			  activeTab === 'reports'
				? 'border-b-2 border-purple-500 text-purple-600'
				: 'text-gray-500 hover:text-gray-700'
			}`}
		  >
			<BarChart3 className="w-4 h-4 mr-2" />
			Reports
		  </button>
		</div>
	  </div>	  {/* Tab Content */}
	  {activeTab === 'pipeline' && (
		<PipelineTab 
		  candidates={candidates}
		  searchQuery={searchQuery}
		  onSearchChange={setSearchQuery}
		  selectedStage={selectedStage}
		  onStageChange={setSelectedStage}
		  sortBy={sortBy}
		  onSortChange={setSortBy}
		  onCandidateUpdate={handleCandidateUpdate}
		/>
	  )}

	  {activeTab === 'tasks' && (
		<TasksTab 
		  tasks={allTasks}
		  tasksView={tasksView}
		  onTasksViewChange={setTasksView}
		  currentDate={currentDate}
		  onNavigateMonth={navigateMonth}
		  onToday={handleToday}
		/>
	  )}

	  {activeTab === 'interviews' && (
		<InterviewsTab 
		  interviews={allInterviews}
		  interviewsView={interviewsView}
		  onInterviewsViewChange={setInterviewsView}
		  currentDate={currentDate}
		  onNavigateMonth={navigateMonth}
		  onToday={handleToday}
		/>
	  )}

	  {activeTab === 'reports' && reportData && (
		<ReportsTab 
		  reportData={reportData}
		/>
	  )}
	</div>
  );
};

export default JobATSPage;
