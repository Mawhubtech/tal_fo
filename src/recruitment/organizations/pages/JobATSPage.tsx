import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Briefcase, Users, CheckCircle, BarChart3, Calendar, Plus
} from 'lucide-react';
import { jobApiService } from '../../jobs/services/jobApiService';
import { jobApplicationApiService } from '../../jobs/services/jobApplicationApiService';
import type { Job as JobType } from '../../data/types';
import type { JobApplication } from '../../jobs/services/jobApplicationApiService';
import { PipelineTab, TasksTab, InterviewsTab, ReportsTab } from '../components/ats';
import { mockTasksByJob, mockInterviewsByJob, mockReportsByJob, getMockJobKey } from '../data/mock';
import AddCandidateModal from '../components/AddCandidateModal';

const JobATSPage: React.FC = () => {
  const { organizationId, departmentId, jobId } = useParams<{ 
	organizationId: string; 
	departmentId: string; 
	jobId: string; 
  }>();  const [activeTab, setActiveTab] = useState<'pipeline' | 'tasks' | 'interviews' | 'reports'>('pipeline');
  const [job, setJob] = useState<JobType | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);

  // Pipeline states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  // Calendar view states
  const [tasksView, setTasksView] = useState<'list' | 'calendar'>('list');
  const [interviewsView, setInterviewsView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  useEffect(() => {
    const loadJobAndApplications = async () => {
      if (!jobId || !organizationId || !departmentId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Load job data
        const jobData = await jobApiService.getJobById(jobId);
        
        // Verify it belongs to the correct organization and department
        if (jobData.organizationId === organizationId && jobData.departmentId === departmentId) {
          setJob(jobData);
          
          // Load job applications for this job
          const { applications } = await jobApplicationApiService.getJobApplicationsByJobId(jobId);
          setJobApplications(applications);
        } else {
          setJob(null);
          setJobApplications([]);
        }
      } catch (error) {
        console.error('Error loading job and applications:', error);
        setJob(null);
        setJobApplications([]);
      } finally {
        setLoading(false);
      }
    };
    loadJobAndApplications();
  }, [jobId, organizationId, departmentId]);  // Helper function to map backend stage to frontend stage
  const mapStageToFrontend = (backendStage: string) => {
    const stageMap: Record<string, string> = {
      'Application': 'Applied',
      'Screening': 'Phone Screen',
      'Interview': 'Technical Interview',
      'Decision': 'Final Interview',
      'Offer': 'Offer',
      'Hired': 'Hired',
    };
    return stageMap[backendStage] || 'Applied';
  };
  // Helper function to generate initials from name
  const getInitials = (fullName: string) => {
    if (!fullName || fullName.trim() === '') return '?';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Convert job applications to candidates format for the ATS components
  const candidates = jobApplications.map(application => {
    console.log('Processing application:', application); // Debug log
    
    const candidateName = application.candidate?.fullName || 'Unknown Candidate';
    
    return {
      id: application.candidate?.id || application.candidateId,
      name: candidateName,
      avatar: application.candidate?.avatar || '', // Keep empty string if no avatar
      initials: getInitials(candidateName), // Add initials for fallback
      email: application.candidate?.email || '',
      phone: application.candidate?.phone || '',
      location: application.candidate?.location || '',
      stage: mapStageToFrontend(application.stage || 'Application'),
      score: application.score || 0,
      lastUpdated: application.lastActivityDate || application.updatedAt,
      tags: [], // Empty array for now since skills aren't being loaded
      source: application.candidate?.source || 'unknown',
      appliedDate: application.appliedDate,
      // Additional properties for compatibility
      position: application.candidate?.currentPosition || '',
      status: application.status,
      notes: application.notes || '',
      resumeUrl: application.resumeUrl || '',
      portfolioUrl: application.portfolioUrl || '',
      applicationId: application.id,
    };
  });

  console.log('Transformed candidates:', candidates); // Debug log
  // Get mock data using imported function (for tasks, interviews, reports)
  const mockJobKey = jobId ? getMockJobKey(jobId) : '';
  const allTasks = mockJobKey && mockTasksByJob[mockJobKey] ? mockTasksByJob[mockJobKey] : [];
  const allInterviews = mockJobKey && mockInterviewsByJob[mockJobKey] ? mockInterviewsByJob[mockJobKey] : [];
  const reportData = mockJobKey && mockReportsByJob[mockJobKey] ? mockReportsByJob[mockJobKey] : null;  // Helper function to map frontend stage back to backend stage
  const mapStageToBackend = (frontendStage: string) => {
    const stageMap: Record<string, string> = {
      'Applied': 'Application',
      'Phone Screen': 'Screening',
      'Technical Interview': 'Interview',
      'Final Interview': 'Decision',
      'Offer': 'Offer',
      'Hired': 'Hired',
    };
    return stageMap[frontendStage] || 'Application';
  };  const handleCandidateUpdate = async (updatedCandidate: any) => {
    // Find the current candidate in our local state
    const currentApplication = jobApplications.find(app => 
      app.candidate?.id === updatedCandidate.id || app.candidateId === updatedCandidate.id
    );
    
    if (!currentApplication) {
      console.error('Could not find application for candidate:', updatedCandidate.id);
      return;
    }    // Optimistically update the local state immediately
    const backendStage = mapStageToBackend(updatedCandidate.stage) as 'Application' | 'Screening' | 'Interview' | 'Decision' | 'Offer' | 'Hired';
    const optimisticApplications = jobApplications.map(app => {
      if (app.id === currentApplication.id) {
        return {
          ...app,
          status: updatedCandidate.status || app.status,
          stage: backendStage,
          score: updatedCandidate.score !== undefined ? updatedCandidate.score : app.score,
          notes: updatedCandidate.notes !== undefined ? updatedCandidate.notes : app.notes,
          lastActivityDate: new Date().toISOString(),
        } as JobApplication;
      }
      return app;
    });

    // Update local state immediately for better UX
    setJobApplications(optimisticApplications);

    try {      // Update the backend
      await jobApplicationApiService.updateJobApplication(currentApplication.id, {
        status: updatedCandidate.status,
        stage: backendStage,
        score: updatedCandidate.score,
        notes: updatedCandidate.notes,
      });
      
      // Optionally reload from backend to ensure consistency (but do this silently)
      setTimeout(async () => {
        try {
          const { applications } = await jobApplicationApiService.getJobApplicationsByJobId(jobId!);
          setJobApplications(applications);
        } catch (error) {
          console.error('Error syncing with backend:', error);
        }
      }, 1000); // Wait 1 second before syncing
      
    } catch (error) {
      console.error('Error updating candidate:', error);
      
      // Revert the optimistic update on error
      setJobApplications(jobApplications);
      
      // Show error message to user
      alert('Failed to update candidate. Please try again.');
    }
  };

  const handleCandidateAdded = async () => {
    // Reload job applications when a new candidate is added
    try {
      const { applications } = await jobApplicationApiService.getJobApplicationsByJobId(jobId!);
      setJobApplications(applications);
    } catch (error) {
      console.error('Error reloading applications:', error);
    }
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
				<button 
		  onClick={() => setShowAddCandidateModal(true)}
		  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
		>
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
	  )}	  {activeTab === 'reports' && reportData && (
		<ReportsTab 
		  reportData={reportData}
		/>
	  )}

	  {/* Add Candidate Modal */}
	  <AddCandidateModal
		isOpen={showAddCandidateModal}
		onClose={() => setShowAddCandidateModal(false)}
		jobId={jobId!}
		onCandidateAdded={handleCandidateAdded}
	  />
	</div>
  );
};

export default JobATSPage;
