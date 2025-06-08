import React, { useState } from 'react';
import { Save, Globe, Eye, Settings, Plus, Edit3, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface JobBoardConfig {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  jobsCount: number;
  lastSync: string;
  syncFrequency: string;
  credentials: {
    apiKey?: string;
    username?: string;
    isConfigured: boolean;
  };
}

interface JobPostingTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  isDefault: boolean;
  usage: number;
}

const mockJobBoards: JobBoardConfig[] = [
  {
    id: '1',
    name: 'Indeed',
    url: 'https://indeed.com',
    isActive: true,
    jobsCount: 45,
    lastSync: '2024-01-22T10:30:00Z',
    syncFrequency: 'Daily',
    credentials: {
      isConfigured: true
    }
  },
  {
    id: '2',
    name: 'LinkedIn Jobs',
    url: 'https://linkedin.com/jobs',
    isActive: true,
    jobsCount: 32,
    lastSync: '2024-01-22T09:15:00Z',
    syncFrequency: 'Real-time',
    credentials: {
      isConfigured: true
    }
  },
  {
    id: '3',
    name: 'Glassdoor',
    url: 'https://glassdoor.com',
    isActive: false,
    jobsCount: 0,
    lastSync: '2024-01-20T14:20:00Z',
    syncFrequency: 'Weekly',
    credentials: {
      isConfigured: false
    }
  },
  {
    id: '4',
    name: 'Monster',
    url: 'https://monster.com',
    isActive: true,
    jobsCount: 18,
    lastSync: '2024-01-22T08:45:00Z',
    syncFrequency: 'Daily',
    credentials: {
      isConfigured: true
    }
  }
];

const mockTemplates: JobPostingTemplate[] = [
  {
    id: '1',
    name: 'Software Engineer Template',
    title: 'Senior Software Engineer',
    description: 'We are looking for a talented Senior Software Engineer to join our growing team...',
    requirements: ['5+ years experience', 'React/Node.js', 'Bachelor\'s degree'],
    benefits: ['Health insurance', 'Remote work', '401k matching'],
    isDefault: true,
    usage: 25
  },
  {
    id: '2',
    name: 'Product Manager Template',
    title: 'Product Manager',
    description: 'Join our product team to drive innovation and user experience...',
    requirements: ['3+ years PM experience', 'Agile methodology', 'Analytics skills'],
    benefits: ['Equity package', 'Flexible PTO', 'Learning budget'],
    isDefault: false,
    usage: 12
  },
  {
    id: '3',
    name: 'UX Designer Template',
    title: 'UX/UI Designer',
    description: 'Create exceptional user experiences and beautiful interfaces...',
    requirements: ['Portfolio required', 'Figma/Sketch', 'User research experience'],
    benefits: ['Creative freedom', 'Remote work', 'Conference budget'],
    isDefault: false,
    usage: 8
  }
];

const JobBoardConfigPage: React.FC = () => {
  const [jobBoards, setJobBoards] = useState<JobBoardConfig[]>(mockJobBoards);
  const [templates] = useState<JobPostingTemplate[]>(mockTemplates);
  const [activeTab, setActiveTab] = useState<'boards' | 'templates' | 'settings'>('boards');

  const toggleJobBoard = (id: string) => {
    setJobBoards(boards => 
      boards.map(board => 
        board.id === id ? { ...board, isActive: !board.isActive } : board
      )
    );
  };

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const stats = {
    totalBoards: jobBoards.length,
    activeBoards: jobBoards.filter(b => b.isActive).length,
    totalJobs: jobBoards.reduce((sum, b) => sum + b.jobsCount, 0),
    templates: templates.length
  };
  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Settings className="h-4 w-4 mr-2" />
            Global Settings
          </button>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </button>
          <button className="flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">{stats.totalBoards}</div>
          <div className="text-sm text-gray-600">Job Boards</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{stats.activeBoards}</div>
          <div className="text-sm text-gray-600">Active Boards</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-primary-600">{stats.totalJobs}</div>
          <div className="text-sm text-gray-600">Posted Jobs</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{stats.templates}</div>
          <div className="text-sm text-gray-600">Templates</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'boards'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('boards')}
          >
            Job Boards
          </button>
          <button            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
          <button            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            Global Settings
          </button>
        </nav>
      </div>

      {/* Job Boards Tab */}
      {activeTab === 'boards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Job Board Integrations</h2>            <button className="flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800">
              <Plus className="h-4 w-4 mr-2" />
              Add Job Board
            </button>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Board
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jobs Posted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sync Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Sync
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobBoards.map((board) => (
                    <tr key={board.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">                          <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Globe className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{board.name}</div>
                            <div className="text-sm text-gray-500">{board.url}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => toggleJobBoard(board.id)}
                            className="flex items-center"
                          >
                            {board.isActive ? (
                              <ToggleRight className="h-6 w-6 text-green-500" />
                            ) : (
                              <ToggleLeft className="h-6 w-6 text-gray-400" />
                            )}
                          </button>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            board.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {board.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {!board.credentials.isConfigured && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Needs Setup
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{board.jobsCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{board.syncFrequency}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatLastSync(board.lastSync)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-primary-600 hover:text-primary-900">
                            <Settings className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Job Posting Templates</h2>            <button className="flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                    {template.isDefault && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800 mt-1">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-green-600 hover:text-green-900">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Job Title</h4>
                    <p className="text-sm text-gray-600">{template.title}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Description</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Requirements</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.requirements.slice(0, 2).map((req, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          {req}
                        </span>
                      ))}
                      {template.requirements.length > 2 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{template.requirements.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Used {template.usage} times</span>
                      <button className="text-primary-600 hover:text-primary-800 font-medium">
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Global Job Board Settings</h2>

          <div className="bg-white rounded-lg border p-6 space-y-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">Auto-Posting Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Enable Auto-posting</h4>
                    <p className="text-sm text-gray-500">Automatically post approved jobs to active job boards</p>
                  </div>
                  <ToggleRight className="h-6 w-6 text-green-500" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Require Manual Approval</h4>
                    <p className="text-sm text-gray-500">Jobs must be manually approved before posting</p>
                  </div>
                  <ToggleRight className="h-6 w-6 text-green-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Posting Duration (days)
                  </label>
                  <input
                    type="number"
                    defaultValue={30}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">Sync Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Sync Frequency
                  </label>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Real-time</option>
                    <option>Every 15 minutes</option>
                    <option>Hourly</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Enable Error Notifications</h4>
                    <p className="text-sm text-gray-500">Send notifications when job board sync fails</p>
                  </div>
                  <ToggleRight className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">Template Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Template
                  </label>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Auto-fill from Job Description</h4>
                    <p className="text-sm text-gray-500">Automatically populate templates with job details</p>
                  </div>
                  <ToggleLeft className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBoardConfigPage;
