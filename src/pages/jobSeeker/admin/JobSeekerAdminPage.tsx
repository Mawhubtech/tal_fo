import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Bell, 
  LogOut
} from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogout } from '../../../hooks/useAuth';
import { useJobSeekerProfile, useCompleteOnboarding } from '../../../hooks/useJobSeekerProfile';
import { 
  OnboardingFlow, 
  Sidebar, 
  OverviewTab, 
  ApplicationsTab, 
  SavedJobsTab, 
  ProfileTab, 
  SettingsTab 
} from './components';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  appliedDate: Date;
  status: 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
  salary?: string;
  type: string;
}

interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedDate: Date;
}

const JobSeekerAdminPage: React.FC = () => {
  const { user } = useAuthContext();
  const logout = useLogout();
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'saved' | 'profile' | 'settings'>('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcut to toggle sidebar
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setIsCollapsed(!isCollapsed);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isCollapsed]);
  
  // Fetch job seeker profile
  const { data: profile, isLoading: profileLoading, error: profileError } = useJobSeekerProfile();
  const completeOnboardingMutation = useCompleteOnboarding();

  // Mock data - in real app, this would come from API
  const [applications] = useState<Application[]>([
    {
      id: '1',
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      appliedDate: new Date('2025-06-15'),
      status: 'reviewing',
      salary: '$120,000 - $160,000',
      type: 'Full-time'
    },
    {
      id: '2',
      jobTitle: 'Product Manager',
      company: 'StartupXYZ',
      location: 'Remote',
      appliedDate: new Date('2025-06-12'),
      status: 'interview',
      salary: '$100,000 - $140,000',
      type: 'Full-time'
    },
    {
      id: '3',
      jobTitle: 'UX Designer',
      company: 'Design Studios',
      location: 'New York, NY',
      appliedDate: new Date('2025-06-10'),
      status: 'rejected',
      salary: '$85,000 - $115,000',
      type: 'Full-time'
    }
  ]);

  const [savedJobs] = useState<SavedJob[]>([
    {
      id: '1',
      title: 'Backend Developer',
      company: 'CloudTech',
      location: 'Austin, TX',
      salary: '$90,000 - $120,000',
      type: 'Full-time',
      postedDate: new Date('2025-06-16')
    },
    {
      id: '2',
      title: 'Data Scientist',
      company: 'AI Innovations',
      location: 'Boston, MA',
      salary: '$110,000 - $150,000',
      type: 'Full-time',
      postedDate: new Date('2025-06-14')
    }
  ]);

  const handleLogout = () => {
    logout.mutate();
  };

  const handleOnboardingComplete = async (onboardingData: any) => {
    try {
      await completeOnboardingMutation.mutateAsync(onboardingData);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const getStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending' || app.status === 'reviewing').length;
    const interviews = applications.filter(app => app.status === 'interview').length;
    const responses = applications.filter(app => app.status === 'accepted' || app.status === 'rejected').length;
    
    return { total, pending, interviews, responses };
  };

  const stats = getStats();

  // Show loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-6">
                <Link to="/jobs" className="text-3xl font-bold text-purple-600 hover:text-purple-700 transition-colors">
                  TAL Jobs
                </Link>
              </div>
              <div className="flex items-center space-x-6">
                <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Bell className="h-6 w-6" />
                </button>
                {/* User Profile Avatar */}
                <div className="relative">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="hidden sm:block font-medium">{user?.firstName || 'Job Seeker'}</span>
                  </div>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:block font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Loading Content */}
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show onboarding flow if profile is not completed
  if (!profile || profile.onboardingStatus !== 'completed') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-6">
                <Link to="/jobs" className="text-3xl font-bold text-purple-600 hover:text-purple-700 transition-colors">
                  TAL Jobs
                </Link>
              </div>
              <div className="flex items-center space-x-6">
                <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Bell className="h-6 w-6" />
                </button>
                {/* User Profile Avatar */}
                <div className="relative">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="hidden sm:block font-medium">{user?.firstName || 'Job Seeker'}</span>
                  </div>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:block font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Onboarding Content */}
        <div className="overflow-y-auto">
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <Link to="/jobs" className="text-3xl font-bold text-purple-600 hover:text-purple-700 transition-colors">
                TAL Jobs
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Bell className="h-6 w-6" />
              </button>
              {/* User Profile Avatar */}
              <div className="relative">
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="hidden sm:block font-medium">{user?.firstName || 'Job Seeker'}</span>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:block font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full">
        <div className={`flex flex-col lg:flex-row ${isCollapsed ? 'gap-4' : 'gap-6'} px-4 sm:px-6 lg:px-8 py-4 transition-all duration-300`}>
          {/* Sidebar */}
          <div className={`${isCollapsed ? 'w-16' : 'lg:w-64'} flex-shrink-0 transition-all duration-300`}>
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              applicationsCount={stats.total}
              savedJobsCount={savedJobs.length}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 max-w-none transition-all duration-300">
            {activeTab === 'overview' && (
              <OverviewTab 
                user={user} 
                applications={applications} 
                stats={stats} 
              />
            )}

            {activeTab === 'applications' && (
              <ApplicationsTab applications={applications} />
            )}

            {activeTab === 'saved' && (
              <SavedJobsTab savedJobs={savedJobs} />
            )}

            {activeTab === 'profile' && (
              <ProfileTab user={user} />
            )}

            {activeTab === 'settings' && (
              <SettingsTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerAdminPage;
