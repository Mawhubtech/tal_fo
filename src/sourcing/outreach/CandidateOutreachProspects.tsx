import React, { useState } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, Calendar, Mail, Phone, MapPin, Star, UserCircle } from 'lucide-react';

interface CandidateProspect {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  position: string;
  company: string;
  skills: string[];
  experience: string;
  status: 'new' | 'contacted' | 'responded' | 'interested' | 'not_interested' | 'closed';
  lastContact?: Date;
  source: string;
  rating: number;
  salaryExpectation?: string;
  availability: string;
  linkedinUrl?: string;
  notes?: string;
}

const CandidateOutreachProspects: React.FC = () => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Mock data for candidate prospects
  const prospects: CandidateProspect[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      position: 'Senior React Developer',
      company: 'TechCorp Inc.',
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
      experience: '5+ years',
      status: 'new',
      source: 'LinkedIn',
      rating: 5,
      salaryExpectation: '$120k - $140k',
      availability: 'Available in 2 weeks',
      linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      location: 'Seattle, WA',
      position: 'Full Stack Engineer',
      company: 'StartupXYZ',
      skills: ['Vue.js', 'Python', 'PostgreSQL', 'AWS'],
      experience: '3+ years',
      status: 'contacted',
      lastContact: new Date('2024-01-15'),
      source: 'GitHub',
      rating: 4,
      salaryExpectation: '$100k - $120k',
      availability: 'Available immediately',
    },
    {
      id: '3',
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      location: 'Austin, TX',
      position: 'DevOps Engineer',
      company: 'CloudSolutions',
      skills: ['Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
      experience: '4+ years',
      status: 'responded',
      lastContact: new Date('2024-01-18'),
      source: 'Indeed',
      rating: 4,
      availability: 'Available in 1 month',
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      location: 'New York, NY',
      position: 'Product Manager',
      company: 'InnovateLab',
      skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research'],
      experience: '6+ years',
      status: 'interested',
      lastContact: new Date('2024-01-20'),
      source: 'Referral',
      rating: 5,
      salaryExpectation: '$130k - $150k',
      availability: 'Available in 3 weeks',
    },
  ];

  const statusColumns = [
    { key: 'new', label: 'New Prospects', color: 'bg-gray-100', count: prospects.filter(p => p.status === 'new').length },
    { key: 'contacted', label: 'Contacted', color: 'bg-blue-100', count: prospects.filter(p => p.status === 'contacted').length },
    { key: 'responded', label: 'Responded', color: 'bg-yellow-100', count: prospects.filter(p => p.status === 'responded').length },
    { key: 'interested', label: 'Interested', color: 'bg-green-100', count: prospects.filter(p => p.status === 'interested').length },
    { key: 'not_interested', label: 'Not Interested', color: 'bg-red-100', count: prospects.filter(p => p.status === 'not_interested').length },
    { key: 'closed', label: 'Closed', color: 'bg-purple-100', count: prospects.filter(p => p.status === 'closed').length },
  ];

  const allSkills = Array.from(new Set(prospects.flatMap(p => p.skills)));

  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = prospect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = !selectedSkill || prospect.skills.includes(selectedSkill);
    const matchesStatus = !selectedStatus || prospect.status === selectedStatus;
    
    return matchesSearch && matchesSkill && matchesStatus;
  });

  const ProspectCard: React.FC<{ prospect: CandidateProspect }> = ({ prospect }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{prospect.name}</h3>
            <p className="text-sm text-gray-600">{prospect.position}</p>
          </div>
        </div>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < prospect.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          {prospect.email}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          {prospect.location}
        </div>
        {prospect.salaryExpectation && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Salary:</span> {prospect.salaryExpectation}
          </div>
        )}
        <div className="text-sm text-gray-600">
          <span className="font-medium">Availability:</span> {prospect.availability}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {prospect.skills.slice(0, 3).map((skill, index) => (
          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            {skill}
          </span>
        ))}
        {prospect.skills.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            +{prospect.skills.length - 3} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Source: {prospect.source}</span>
        <div className="flex space-x-2">
          <button className="p-1 text-gray-400 hover:text-blue-600">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-green-600">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidate Prospects</h1>
          <p className="text-gray-600 mt-1">Manage your candidate pipeline and outreach efforts</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Candidate</span>
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Skills</option>
              {allSkills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {statusColumns.map(status => (
                <option key={status.key} value={status.key}>{status.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                view === 'kanban' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                view === 'list' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statusColumns.map(column => (
            <div key={column.key} className={`${column.color} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">{column.label}</h2>
                <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
                  {column.count}
                </span>
              </div>
              <div className="space-y-3">
                {filteredProspects
                  .filter(prospect => prospect.status === column.key)
                  .map(prospect => (
                    <ProspectCard key={prospect.id} prospect={prospect} />
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
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
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <UserCircle className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{prospect.name}</div>
                          <div className="text-sm text-gray-500">{prospect.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prospect.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prospect.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {prospect.skills.slice(0, 2).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                        {prospect.skills.length > 2 && (
                          <span className="text-xs text-gray-500">+{prospect.skills.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < prospect.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-purple-600 hover:text-purple-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateOutreachProspects;
