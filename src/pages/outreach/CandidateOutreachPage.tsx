import React, { useState } from 'react';
import { 
  Users, Search, Filter, Plus, Mail, Phone, 
  Linkedin, Globe, MapPin, Briefcase,
  Eye, Edit, MoreHorizontal, UserCircle,
  Grid3X3, List, Target, GraduationCap, DollarSign
} from 'lucide-react';

// Candidate prospect interface
interface CandidateProspect {
  id: string;
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
  currentRole?: string;
  education?: string;
  portfolio?: string;
}

const CandidateOutreachPage: React.FC = () => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');

  // Mock candidate data
  const candidateProspects: CandidateProspect[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Inc.',
      position: 'Senior Frontend Developer',
      location: 'San Francisco, CA',
      status: 'new',
      source: 'linkedin',
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
      experience: 5,
      salaryExpectation: '$120k - $140k',
      availability: 'Immediately',
      currentRole: 'Senior Frontend Developer',
      education: 'BS Computer Science',
      portfolio: 'https://johndoe.dev'
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      company: 'DataSoft',
      position: 'Full Stack Developer',
      location: 'Seattle, WA',
      status: 'responded',
      source: 'referral',
      skills: ['Python', 'Django', 'React', 'PostgreSQL'],
      experience: 3,
      salaryExpectation: '$90k - $110k',
      availability: '2 weeks notice',
      currentRole: 'Full Stack Developer',
      education: 'MS Software Engineering'
    },
    {
      id: '3',
      name: 'Sarah Williams',
      email: 'sarah.williams@email.com',
      phone: '+1 (555) 987-6543',
      company: 'StartupX',
      position: 'Senior Backend Developer',
      location: 'Austin, TX',
      status: 'interested',
      source: 'google',
      skills: ['Java', 'Spring Boot', 'Microservices', 'AWS'],
      experience: 6,
      salaryExpectation: '$130k - $150k',
      availability: '1 month',
      currentRole: 'Backend Team Lead',
      lastContact: '2024-01-15'
    },
    {
      id: '4',
      name: 'Alex Rodriguez',
      email: 'alex.rodriguez@email.com',
      company: 'DesignCo',
      position: 'UX Designer',
      location: 'New York, NY',
      status: 'contacted',
      source: 'linkedin',
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
      experience: 4,
      salaryExpectation: '$95k - $115k',
      availability: 'Immediately',
      currentRole: 'Senior UX Designer',
      nextFollowUp: '2024-01-22'
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

  const filteredCandidates = candidateProspects.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSkill = skillFilter === 'all' || candidate.skills?.some(skill => 
      skill.toLowerCase().includes(skillFilter.toLowerCase()));
    
    const matchesExperience = experienceFilter === 'all' || 
                             (experienceFilter === 'junior' && (candidate.experience || 0) <= 2) ||
                             (experienceFilter === 'mid' && (candidate.experience || 0) >= 3 && (candidate.experience || 0) <= 5) ||
                             (experienceFilter === 'senior' && (candidate.experience || 0) > 5);
    
    return matchesSearch && matchesSkill && matchesExperience;
  });

  const getCandidatesByStatus = (status: string) => {
    return filteredCandidates.filter(candidate => candidate.status === status);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'linkedin': return <Linkedin className="w-4 h-4 text-blue-600" />;
      case 'google': return <Globe className="w-4 h-4 text-green-600" />;
      case 'website': return <Globe className="w-4 h-4 text-purple-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const CandidateCard: React.FC<{ candidate: CandidateProspect }> = ({ candidate }) => (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <UserCircle className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-900">{candidate.name}</span>
        </div>
        <div className="flex items-center gap-1">
          {getSourceIcon(candidate.source)}
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 text-sm">
        {candidate.company && (
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase className="w-3 h-3" />
            <span>{candidate.currentRole} at {candidate.company}</span>
          </div>
        )}

        {candidate.location && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-3 h-3" />
            <span>{candidate.location}</span>
          </div>
        )}

        {candidate.experience && (
          <div className="flex items-center gap-2 text-gray-600">
            <GraduationCap className="w-3 h-3" />
            <span>{candidate.experience} years experience</span>
          </div>
        )}

        {candidate.salaryExpectation && (
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="w-3 h-3" />
            <span>{candidate.salaryExpectation}</span>
          </div>
        )}

        {/* Skills */}
        {candidate.skills && (
          <div className="flex flex-wrap gap-1 mt-2">
            {candidate.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                {skill}
              </span>
            ))}
            {candidate.skills.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{candidate.skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-100 rounded text-gray-600" title="Send Email">
            <Mail className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-600" title="Call">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-600" title="View Profile">
            <Eye className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {candidate.availability && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
              {candidate.availability}
            </span>
          )}
        </div>
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
              {getCandidatesByStatus(column.id).length}
            </span>
          </div>
          <div className="space-y-3">
            {getCandidatesByStatus(column.id).map(candidate => (
              <CandidateCard key={candidate.id} candidate={candidate} />
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
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skills
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Experience
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCandidates.map(candidate => (
              <tr key={candidate.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <UserCircle className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                      <div className="text-sm text-gray-500">{candidate.email}</div>
                      {candidate.location && (
                        <div className="text-sm text-gray-500">{candidate.location}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{candidate.currentRole}</div>
                    <div className="text-sm text-gray-500">{candidate.company}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {candidate.skills?.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {(candidate.skills?.length || 0) > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{(candidate.skills?.length || 0) - 3} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">{candidate.experience} years</div>
                    <div className="text-sm text-gray-500">{candidate.salaryExpectation}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                    candidate.status === 'new' ? 'bg-gray-100 text-gray-700' :
                    candidate.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                    candidate.status === 'responded' ? 'bg-yellow-100 text-yellow-700' :
                    candidate.status === 'interested' ? 'bg-green-100 text-green-700' :
                    candidate.status === 'not_interested' ? 'bg-red-100 text-red-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {candidate.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {getSourceIcon(candidate.source)}
                    <span className="text-sm text-gray-900 capitalize">{candidate.source}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button className="text-blue-600 hover:text-blue-900" title="Send Email">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900" title="Call">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900" title="View Profile">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900" title="Edit">
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
          <h1 className="text-2xl font-bold text-gray-900">Candidate Outreach</h1>
          <p className="text-gray-600 mt-1">Manage outreach to potential talent candidates</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Target className="w-4 h-4 mr-2" />
            Import Candidates
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Candidate
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
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Skill Filter */}
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Skills</option>
            <option value="react">React</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="typescript">TypeScript</option>
          </select>

          {/* Experience Filter */}
          <select
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Experience</option>
            <option value="junior">Junior (0-2 years)</option>
            <option value="mid">Mid (3-5 years)</option>
            <option value="senior">Senior (5+ years)</option>
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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{candidateProspects.length}</div>
          <div className="text-sm text-gray-600">Total Candidates</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {candidateProspects.filter(c => c.status === 'interested').length}
          </div>
          <div className="text-sm text-gray-600">Interested</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">
            {candidateProspects.filter(c => c.status === 'contacted').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {candidateProspects.filter(c => c.status === 'closed').length}
          </div>
          <div className="text-sm text-gray-600">Closed</div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {view === 'kanban' ? <KanbanView /> : <ListView />}
      </div>
    </div>
  );
};

export default CandidateOutreachPage;
