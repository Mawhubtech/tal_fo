import React, { useState } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, Calendar, Mail, Phone, MapPin, Star, Building } from 'lucide-react';

interface ClientProspect {
  id: string;
  companyName: string;
  contactName: string;
  contactTitle: string;
  email: string;
  phone?: string;
  location: string;
  industry: string;
  companySize: string;
  website?: string;
  status: 'new' | 'contacted' | 'responded' | 'interested' | 'not_interested' | 'closed';
  lastContact?: Date;
  source: string;
  priority: 'low' | 'medium' | 'high';
  budget?: string;
  hiringNeeds: string;
  decisionMaker: boolean;
  urgency: 'low' | 'medium' | 'high';
  notes?: string;
}

const ClientOutreachProspects: React.FC = () => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Mock data for client prospects
  const prospects: ClientProspect[] = [
    {
      id: '1',
      companyName: 'TechCorp Inc.',
      contactName: 'John Smith',
      contactTitle: 'VP of Engineering',
      email: 'john.smith@techcorp.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      industry: 'Technology',
      companySize: '201-500',
      website: 'www.techcorp.com',
      status: 'new',
      source: 'LinkedIn',
      priority: 'high',
      budget: '$50k - $100k',
      hiringNeeds: 'Senior Engineers, Product Managers',
      decisionMaker: true,
      urgency: 'high',
    },
    {
      id: '2',
      companyName: 'HealthTech Solutions',
      contactName: 'Sarah Johnson',
      contactTitle: 'CTO',
      email: 'sarah.j@healthtech.com',
      location: 'Boston, MA',
      industry: 'Healthcare',
      companySize: '51-200',
      status: 'contacted',
      lastContact: new Date('2024-01-15'),
      source: 'Referral',
      priority: 'medium',
      budget: '$75k - $150k',
      hiringNeeds: 'Data Scientists, Healthcare Analysts',
      decisionMaker: true,
      urgency: 'medium',
    },
    {
      id: '3',
      companyName: 'FinanceFlow',
      contactName: 'Michael Chen',
      contactTitle: 'Head of Talent',
      email: 'mchen@financeflow.com',
      location: 'New York, NY',
      industry: 'Financial Services',
      companySize: '501-1000',
      status: 'responded',
      lastContact: new Date('2024-01-18'),
      source: 'Website',
      priority: 'high',
      budget: '$100k - $200k',
      hiringNeeds: 'Quantitative Analysts, Risk Managers',
      decisionMaker: false,
      urgency: 'low',
    },
    {
      id: '4',
      companyName: 'E-commerce Giants',
      contactName: 'Emily Davis',
      contactTitle: 'HR Director',
      email: 'emily.davis@ecomgiants.com',
      location: 'Seattle, WA',
      industry: 'E-commerce',
      companySize: '1001+',
      status: 'interested',
      lastContact: new Date('2024-01-20'),
      source: 'Cold Email',
      priority: 'high',
      budget: '$200k+',
      hiringNeeds: 'Software Engineers, DevOps, Product Managers',
      decisionMaker: true,
      urgency: 'high',
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

  const industries = Array.from(new Set(prospects.map(p => p.industry)));

  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = prospect.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = !selectedIndustry || prospect.industry === selectedIndustry;
    const matchesStatus = !selectedStatus || prospect.status === selectedStatus;
    
    return matchesSearch && matchesIndustry && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const ProspectCard: React.FC<{ prospect: ClientProspect }> = ({ prospect }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Building className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{prospect.companyName}</h3>
            <p className="text-sm text-gray-600">{prospect.contactName} • {prospect.contactTitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Star className={`w-4 h-4 ${getPriorityColor(prospect.priority)}`} />
          {prospect.decisionMaker && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              Decision Maker
            </span>
          )}
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
        <div className="text-sm text-gray-600">
          <span className="font-medium">Industry:</span> {prospect.industry}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Size:</span> {prospect.companySize} employees
        </div>
        {prospect.budget && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Budget:</span> {prospect.budget}
          </div>
        )}
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Hiring Needs:</span> {prospect.hiringNeeds}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Source: {prospect.source}</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            prospect.urgency === 'high' ? 'bg-red-100 text-red-700' :
            prospect.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {prospect.urgency} urgency
          </span>
        </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Client Prospects</h1>
          <p className="text-gray-600 mt-1">Manage your client pipeline and business development efforts</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
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
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
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
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
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
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{prospect.companyName}</div>
                          <div className="text-sm text-gray-500">{prospect.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{prospect.contactName}</div>
                      <div className="text-sm text-gray-500">{prospect.contactTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prospect.industry}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prospect.companySize}
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
                      <div className="flex items-center">
                        <Star className={`w-4 h-4 mr-2 ${getPriorityColor(prospect.priority)}`} />
                        <span className="text-sm capitalize">{prospect.priority}</span>
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

export default ClientOutreachProspects;
