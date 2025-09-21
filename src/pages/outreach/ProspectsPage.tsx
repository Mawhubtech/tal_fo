import React, { useState } from 'react';
import { 
  Users, Building2, Search, Filter, Plus, Mail, Phone, 
  Linkedin, Globe, MapPin, Briefcase,
  Eye, Edit, MoreHorizontal,
  Grid3X3, List, UserCircle, Target
} from 'lucide-react';

// Enhanced prospect interface supporting both candidates and clients
interface Prospect {
  id: string;
  type: 'candidate' | 'client';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  location?: string;
  status: 'new' | 'contacted' | 'responded' | 'interested' | 'not_interested' | 'closed';
  source: 'google' | 'linkedin' | 'referral' | 'website' | 'other';
  lastContact?: string;
  nextFollowUp?: string;
  notes?: string;
  
  // Candidate specific fields
  skills?: string[];
  experience?: number;
  salaryExpectation?: string;
  availability?: string;
  
  // Client specific fields
  companySize?: string;
  industry?: string;
  budget?: string;
  hiringNeeds?: string[];
  decisionMaker?: boolean;
}

const ProspectsPage: React.FC = () => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [filterType, setFilterType] = useState<'all' | 'candidate' | 'client'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with real data from your API
  const prospects: Prospect[] = [
    {
      id: '1',
      type: 'candidate',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Inc.',
      position: 'Senior Frontend Developer',
      location: 'San Francisco, CA',
      status: 'new',
      source: 'linkedin',
      skills: ['React', 'TypeScript', 'Node.js'],
      experience: 5,
      salaryExpectation: '$120k - $140k',
      availability: 'Immediately'
    },
    {
      id: '2',
      type: 'client',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@startup.com',
      phone: '+1 (555) 987-6543',
      company: 'GrowthStartup',
      position: 'HR Director',
      location: 'Austin, TX',
      status: 'contacted',
      source: 'google',
      companySize: '50-100',
      industry: 'FinTech',
      budget: '$80k - $120k',
      hiringNeeds: ['Frontend Developer', 'Backend Developer'],
      decisionMaker: true,
      lastContact: '2024-01-15',
      nextFollowUp: '2024-01-22'
    },
    {
      id: '3',
      type: 'candidate',
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      company: 'DataSoft',
      position: 'Full Stack Developer',
      location: 'Seattle, WA',
      status: 'responded',
      source: 'referral',
      skills: ['Python', 'Django', 'React'],
      experience: 3,
      salaryExpectation: '$90k - $110k'
    },
    {
      id: '4',
      type: 'client',
      name: 'David Wilson',
      email: 'david.wilson@enterprise.com',
      company: 'Enterprise Solutions',
      position: 'CTO',
      location: 'New York, NY',
      status: 'interested',
      source: 'website',
      companySize: '500+',
      industry: 'Healthcare',
      budget: '$150k+',
      hiringNeeds: ['Senior Developer', 'Tech Lead'],
      decisionMaker: true
    }
  ];

  const statusColumns = [
    { id: 'new', title: 'New Prospects', color: 'bg-gray-100 border-gray-300' },
    { id: 'contacted', title: 'Contacted', color: 'bg-blue-100 border-blue-300' },
    { id: 'responded', title: 'Responded', color: 'bg-yellow-100 border-yellow-300' },
    { id: 'interested', title: 'Interested', color: 'bg-green-100 border-green-300' },
    { id: 'not_interested', title: 'Not Interested', color: 'bg-red-100 border-red-300' },
    { id: 'closed', title: 'Closed', color: 'bg-purple-100 border-purple-300' }
  ];

  const filteredProspects = prospects.filter(prospect => {
    const matchesType = filterType === 'all' || prospect.type === filterType;
    const matchesSearch = prospect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getProspectsByStatus = (status: string) => {
    return filteredProspects.filter(prospect => prospect.status === status);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'linkedin': return <Linkedin className="w-4 h-4 text-blue-600" />;
      case 'google': return <Globe className="w-4 h-4 text-green-600" />;
      case 'website': return <Globe className="w-4 h-4 text-purple-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'candidate' ? 
      <UserCircle className="w-4 h-4 text-blue-600" /> : 
      <Building2 className="w-4 h-4 text-green-600" />;
  };

  const ProspectCard: React.FC<{ prospect: Prospect }> = ({ prospect }) => (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getTypeIcon(prospect.type)}
          <span className="font-medium text-gray-900">{prospect.name}</span>
        </div>
        <div className="flex items-center gap-1">
          {getSourceIcon(prospect.source)}
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 text-sm">
        {prospect.company && (
          <div className="flex items-center gap-2 text-gray-600">
            <Building2 className="w-3 h-3" />
            <span>{prospect.company}</span>
          </div>
        )}
        
        {prospect.position && (
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase className="w-3 h-3" />
            <span>{prospect.position}</span>
          </div>
        )}

        {prospect.location && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-3 h-3" />
            <span>{prospect.location}</span>
          </div>
        )}

        {/* Type-specific content */}
        {prospect.type === 'candidate' && prospect.skills && (
          <div className="flex flex-wrap gap-1 mt-2">
            {prospect.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                {skill}
              </span>
            ))}
            {prospect.skills.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{prospect.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        {prospect.type === 'client' && prospect.hiringNeeds && (
          <div className="flex flex-wrap gap-1 mt-2">
            {prospect.hiringNeeds.slice(0, 2).map((need, index) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                {need}
              </span>
            ))}
            {prospect.hiringNeeds.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{prospect.hiringNeeds.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
            <Mail className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
            <Eye className="w-4 h-4" />
          </button>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${
          prospect.type === 'candidate' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
        }`}>
          {prospect.type}
        </span>
      </div>
    </div>
  );

  const KanbanView = () => (
    <div className="grid grid-cols-6 gap-4 h-full">
      {statusColumns.map(column => (
        <div key={column.id} className={`${column.color} border-2 border-dashed rounded-lg p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">{column.title}</h3>
            <span className="bg-white px-2 py-1 rounded text-sm font-medium">
              {getProspectsByStatus(column.id).length}
            </span>
          </div>
          <div className="space-y-3">
            {getProspectsByStatus(column.id).map(prospect => (
              <ProspectCard key={prospect.id} prospect={prospect} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prospect
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProspects.map(prospect => (
              <tr key={prospect.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getTypeIcon(prospect.type)}
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">{prospect.name}</div>
                      <div className="text-sm text-gray-500">{prospect.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                    prospect.type === 'candidate' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {prospect.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {prospect.company || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                    prospect.status === 'new' ? 'bg-gray-100 text-gray-700' :
                    prospect.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                    prospect.status === 'responded' ? 'bg-yellow-100 text-yellow-700' :
                    prospect.status === 'interested' ? 'bg-green-100 text-green-700' :
                    prospect.status === 'not_interested' ? 'bg-red-100 text-red-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {prospect.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {getSourceIcon(prospect.source)}
                    <span className="text-sm text-gray-900 capitalize">{prospect.source}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {prospect.lastContact || 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
          <p className="text-gray-600 mt-1">Manage your candidate and client prospects</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Target className="w-4 h-4 mr-2" />
            Import Prospects
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Prospect
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between bg-white rounded-lg border p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search prospects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="candidate">Candidates</option>
            <option value="client">Clients</option>
          </select>

          <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView('kanban')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              view === 'kanban' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Grid3X3 className="w-4 h-4 mr-1 inline" />
            Kanban
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              view === 'list' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4 mr-1 inline" />
            List
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {view === 'kanban' ? <KanbanView /> : <ListView />}
      </div>
    </div>
  );
};

export default ProspectsPage;
