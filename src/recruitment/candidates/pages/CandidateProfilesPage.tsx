import React, { useState } from 'react';
import { Search, Plus, Download, Upload, Edit3, Eye, Trash2, MapPin, Calendar, DollarSign, Star } from 'lucide-react';

interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  position: string;
  experience: string;
  salary: string;
  status: 'active' | 'inactive' | 'hired' | 'interviewing' | 'rejected';
  rating: number;
  skills: string[];
  appliedDate: string;
  lastActivity: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
}

// Mock candidate data
const mockCandidates: CandidateProfile[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    position: 'Senior Frontend Developer',
    experience: '5+ years',
    salary: '$120k - $140k',
    status: 'interviewing',
    rating: 4.5,
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    appliedDate: '2024-01-15',
    lastActivity: '2024-01-20',
    resumeUrl: '#',
    portfolioUrl: '#',
    linkedinUrl: '#'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 234-5678',
    location: 'New York, NY',
    position: 'Full Stack Engineer',
    experience: '3+ years',
    salary: '$100k - $120k',
    status: 'active',
    rating: 4.2,
    skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
    appliedDate: '2024-01-18',
    lastActivity: '2024-01-19',
    resumeUrl: '#'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1 (555) 345-6789',
    location: 'Austin, TX',
    position: 'UX Designer',
    experience: '4+ years',
    salary: '$90k - $110k',
    status: 'hired',
    rating: 4.8,
    skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
    appliedDate: '2024-01-10',
    lastActivity: '2024-01-22',
    portfolioUrl: '#',
    linkedinUrl: '#'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@email.com',
    phone: '+1 (555) 456-7890',
    location: 'Seattle, WA',
    position: 'DevOps Engineer',
    experience: '6+ years',
    salary: '$130k - $150k',
    status: 'rejected',
    rating: 3.8,
    skills: ['Kubernetes', 'Docker', 'Terraform', 'Jenkins'],
    appliedDate: '2024-01-12',
    lastActivity: '2024-01-17',
    resumeUrl: '#'
  },
  {
    id: '5',
    name: 'Jessica Wang',
    email: 'jessica.wang@email.com',
    phone: '+1 (555) 567-8901',
    location: 'Boston, MA',
    position: 'Product Manager',
    experience: '7+ years',
    salary: '$140k - $160k',
    status: 'active',
    rating: 4.6,
    skills: ['Product Strategy', 'Agile', 'Analytics', 'Leadership'],
    appliedDate: '2024-01-20',
    lastActivity: '2024-01-21',
    linkedinUrl: '#'
  }
];

const CandidateProfilesPage: React.FC = () => {
  const [candidates] = useState<CandidateProfile[]>(mockCandidates);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'hired':
        return 'bg-primary-100 text-primary-800';
      case 'interviewing':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-200 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return <div className="flex items-center space-x-1">{stars}</div>;
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    const matchesPosition = positionFilter === 'all' || candidate.position.includes(positionFilter);
    
    return matchesSearch && matchesStatus && matchesPosition;
  });

  const stats = {
    total: candidates.length,
    active: candidates.filter(c => c.status === 'active').length,
    interviewing: candidates.filter(c => c.status === 'interviewing').length,
    hired: candidates.filter(c => c.status === 'hired').length,
    rejected: candidates.filter(c => c.status === 'rejected').length
  };
  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, position, or skills..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="interviewing">Interviewing</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <option value="all">All Positions</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="Manager">Manager</option>
              <option value="Engineer">Engineer</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800">
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Candidates</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{stats.interviewing}</div>
          <div className="text-sm text-gray-600">Interviewing</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-primary-600">{stats.hired}</div>
          <div className="text-sm text-gray-600">Hired</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>      {/* Candidates Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position & Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location & Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                      <div className="text-sm text-gray-500">{candidate.email}</div>
                      <div className="text-sm text-gray-500">{candidate.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{candidate.position}</div>
                      <div className="text-sm text-gray-500">{candidate.experience}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 mr-1" />
                        {candidate.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {candidate.salary}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(candidate.status)}`}>
                        {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                      </span>
                      <div className="flex items-center">
                        {renderStarRating(candidate.rating)}
                        <span className="ml-2 text-sm text-gray-600">({candidate.rating})</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {candidate.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded">
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{candidate.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(candidate.appliedDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Last: {new Date(candidate.lastActivity).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit3 className="h-4 w-4" />
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {filteredCandidates.length} of {candidates.length} candidates
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 bg-primary-700 text-white rounded">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfilesPage;
