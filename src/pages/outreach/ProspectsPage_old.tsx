import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Filter, MoreVertical, Mail, Phone, 
  Building, MapPin, Calendar, Edit, Trash2, Eye,
  CheckCircle, XCircle, Clock, User, Tag,
  LayoutGrid, List, ChevronDown, Home, ChevronRight
} from 'lucide-react';

// Types
interface Prospect {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  position: string;
  location: string;
  status: 'new' | 'contacted' | 'responded' | 'interested' | 'not_interested' | 'closed';
  source: string;
  addedDate: string;
  lastContact?: string;
  tags: string[];
  avatar?: string;
  notes?: string;
  type: 'candidate' | 'client'; // New field to distinguish between candidates and clients
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    google?: string;
  };
  // Client-specific fields
  companySize?: string;
  industry?: string;
  website?: string;
  // Candidate-specific fields
  skills?: string[];
  experience?: string;
  salary?: string;
}

const ProspectsPage: React.FC = () => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'candidate' | 'client'>('all');

  // Mock data - replace with real data from your API
  const prospects: Prospect[] = [
    // Candidate prospects
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@techcorp.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Inc.',
      position: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      status: 'new',
      source: 'LinkedIn',
      addedDate: '2024-01-15',
      tags: ['React', 'Node.js', 'Senior'],
      type: 'candidate',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      experience: '8+ years',
      salary: '$140,000 - $160,000',
      notes: 'Interested in remote opportunities. Has 8+ years experience.'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'mchen@innovate.com',
      phone: '+1 (555) 987-6543',
      company: 'Innovate Solutions',
      position: 'Product Manager',
      location: 'New York, NY',
      status: 'contacted',
      source: 'Referral',
      addedDate: '2024-01-14',
      lastContact: '2024-01-16',
      tags: ['Product', 'Agile', 'B2B'],
      type: 'candidate',
      skills: ['Product Strategy', 'Agile', 'Data Analysis'],
      experience: '6+ years',
      salary: '$120,000 - $140,000',
      notes: 'Sent initial outreach email. Follow up next week.'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.r@designstudio.com',
      company: 'Design Studio',
      position: 'UX Designer',
      location: 'Austin, TX',
      status: 'responded',
      source: 'Website',
      addedDate: '2024-01-13',
      lastContact: '2024-01-17',
      tags: ['UX', 'Design', 'Mid-level'],
      type: 'candidate',
      skills: ['Figma', 'User Research', 'Prototyping'],
      experience: '4+ years',
      salary: '$85,000 - $100,000',
      notes: 'Replied showing interest. Scheduling follow-up call.'
    },
    // Client prospects
    {
      id: '4',
      name: 'David Kim',
      email: 'david.kim@startup.io',
      company: 'Startup.io',
      position: 'CTO',
      location: 'Seattle, WA',
      status: 'interested',
      source: 'Google Search',
      addedDate: '2024-01-12',
      lastContact: '2024-01-18',
      tags: ['Startup', 'Tech', 'Hiring'],
      type: 'client',
      companySize: '50-100 employees',
      industry: 'SaaS',
      website: 'https://startup.io',
      notes: 'Looking to hire 5 developers. Budget: $500k+ annually.'
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      email: 'lisa.t@enterprise.com',
      company: 'Enterprise Corp',
      position: 'HR Director',
      location: 'Boston, MA',
      status: 'contacted',
      source: 'LinkedIn',
      addedDate: '2024-01-11',
      lastContact: '2024-01-19',
      tags: ['Enterprise', 'HR', 'Volume Hiring'],
      type: 'client',
      companySize: '1000+ employees',
      industry: 'Financial Services',
      website: 'https://enterprise.com',
      notes: 'Need to fill 20 positions across engineering and product.'
    },
    {
      id: '6',
      name: 'James Wilson',
      email: 'jwilson@fintech.com',
      company: 'FinTech Solutions',
      position: 'Frontend Developer',
      location: 'Chicago, IL',
      status: 'closed',
      source: 'Job Board',
      addedDate: '2024-01-10',
      lastContact: '2024-01-20',
      tags: ['React', 'Vue', 'Mid-level'],
      type: 'candidate',
      skills: ['React', 'Vue.js', 'CSS', 'JavaScript'],
      experience: '3+ years',
      salary: '$75,000 - $90,000',
      notes: 'Successfully placed at client company!'
    },
    {
      id: '7',
      name: 'Jennifer Garcia',
      email: 'j.garcia@techconsulting.com',
      company: 'Tech Consulting Group',
      position: 'VP of Engineering',
      location: 'Denver, CO',
      status: 'new',
      source: 'Google Search',
      addedDate: '2024-01-20',
      tags: ['Consulting', 'Leadership', 'Scaling'],
      type: 'client',
      companySize: '200-500 employees',
      industry: 'Consulting',
      website: 'https://techconsulting.com',
      notes: 'Expanding engineering team. Looking for senior talent.'
    },
    {
      id: '8',
      name: 'Alex Thompson',
      email: 'alex@designagency.com',
      company: 'Creative Design Agency',
      position: 'Creative Director',
      location: 'Los Angeles, CA',
      status: 'responded',
      source: 'LinkedIn',
      addedDate: '2024-01-18',
      lastContact: '2024-01-21',
      tags: ['Design', 'Creative', 'Agency'],
      type: 'client',
      companySize: '25-50 employees',
      industry: 'Design & Marketing',
      website: 'https://designagency.com',
      notes: 'Need UX/UI designers for upcoming projects. Flexible budget.'
    }
  ];
      company: 'Design Studio',
      position: 'UX Designer',
      location: 'Austin, TX',
      status: 'responded',
      source: 'Website',
      addedDate: '2024-01-13',
      lastContact: '2024-01-17',
      tags: ['UX', 'Design', 'Mid-level'],
      notes: 'Replied showing interest. Scheduling follow-up call.'
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david.kim@startup.io',
      company: 'Startup.io',
      position: 'CTO',
      location: 'Seattle, WA',
      status: 'interested',
      source: 'Event',
      addedDate: '2024-01-12',
      lastContact: '2024-01-18',
      tags: ['Leadership', 'Startup', 'Full-stack'],
      notes: 'Very interested. Wants to discuss package details.'
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      email: 'lisa.t@enterprise.com',
      company: 'Enterprise Corp',
      position: 'Data Scientist',
      location: 'Boston, MA',
      status: 'not_interested',
      source: 'LinkedIn',
      addedDate: '2024-01-11',
      lastContact: '2024-01-19',
      tags: ['Python', 'ML', 'Senior'],
      notes: 'Not looking for new opportunities at this time.'
    },
    {
      id: '6',
      name: 'James Wilson',
      email: 'jwilson@fintech.com',
      company: 'FinTech Solutions',
      position: 'Frontend Developer',
      location: 'Chicago, IL',
      status: 'closed',
      source: 'Job Board',
      addedDate: '2024-01-10',
      lastContact: '2024-01-20',
      tags: ['React', 'Vue', 'Mid-level'],
      notes: 'Successfully placed at client company!'
    }
  ];

  const statusConfig = {
    new: { label: 'New', color: 'bg-blue-100 text-blue-800', icon: Clock },
    contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800', icon: Mail },
    responded: { label: 'Responded', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
    interested: { label: 'Interested', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    not_interested: { label: 'Not Interested', color: 'bg-red-100 text-red-800', icon: XCircle },
    closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getProspectsByStatus = (status: string) => {
    return prospects.filter(prospect => prospect.status === status);
  };

  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = prospect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || prospect.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const ProspectCard: React.FC<{ prospect: Prospect; isKanban?: boolean }> = ({ prospect, isKanban = false }) => {
    const StatusIcon = statusConfig[prospect.status].icon;
    
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${isKanban ? '' : 'mb-3'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {prospect.avatar ? (
              <img src={prospect.avatar} alt={prospect.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-sm font-medium text-purple-600">{getInitials(prospect.name)}</span>
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900">{prospect.name}</h3>
              <p className="text-sm text-gray-500">{prospect.position}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!isKanban && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[prospect.status].color}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig[prospect.status].label}
              </span>
            )}
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building className="w-4 h-4" />
            <span>{prospect.company}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{prospect.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{prospect.email}</span>
          </div>
          {prospect.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{prospect.phone}</span>
            </div>
          )}
        </div>
        
        {prospect.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {prospect.tags.map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Added: {new Date(prospect.addedDate).toLocaleDateString()}</span>
          {prospect.lastContact && (
            <span>Last contact: {new Date(prospect.lastContact).toLocaleDateString()}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <button className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
            <Eye className="w-3 h-3" />
            View
          </button>
          <button className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100">
            <Mail className="w-3 h-3" />
            Contact
          </button>
          <button className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100">
            <Edit className="w-3 h-3" />
            Edit
          </button>
        </div>
      </div>
    );
  };

  const KanbanBoard: React.FC = () => {
    const statuses = ['new', 'contacted', 'responded', 'interested', 'not_interested', 'closed'];
    
    return (
      <div className="flex gap-6 overflow-x-auto pb-4">
        {statuses.map(status => {
          const statusProspects = getProspectsByStatus(status);
          const StatusIcon = statusConfig[status as keyof typeof statusConfig].icon;
          
          return (
            <div key={status} className="flex-shrink-0 w-80">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-4 h-4 text-gray-600" />
                    <h3 className="font-medium text-gray-900">{statusConfig[status as keyof typeof statusConfig].label}</h3>
                    <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                      {statusProspects.length}
                    </span>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {statusProspects
                    .filter(prospect => 
                      prospect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      prospect.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      prospect.position.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(prospect => (
                      <ProspectCard key={prospect.id} prospect={prospect} isKanban={true} />
                    ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const ListView: React.FC = () => {
    return (
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">All Prospects</h3>
            <span className="text-sm text-gray-500">{filteredProspects.length} prospects</span>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredProspects.map(prospect => (
            <div key={prospect.id} className="p-6">
              <ProspectCard prospect={prospect} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="flex items-center hover:text-gray-700">
          <Home className="w-4 h-4 mr-1" />
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to="/dashboard/outreach" className="hover:text-gray-700">
          Outreach
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">Prospects</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
          <p className="text-gray-600 mt-1">Manage your prospect database and track interactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Prospect
          </button>
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search prospects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-80"
            />
          </div>
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="responded">Responded</option>
            <option value="interested">Interested</option>
            <option value="not_interested">Not Interested</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              view === 'kanban' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Kanban
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              view === 'list' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'kanban' ? <KanbanBoard /> : <ListView />}
    </div>
  );
};

export default ProspectsPage;
