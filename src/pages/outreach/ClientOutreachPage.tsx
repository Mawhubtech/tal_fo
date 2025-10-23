import React, { useState } from 'react';
import { 
  Building2, Search, Filter, Plus, Mail, Phone, 
  Linkedin, Globe, MapPin, Briefcase,
  Eye, Edit, MoreHorizontal, UserCheck,
  Grid3X3, List, Target, Users, DollarSign
} from 'lucide-react';

// Client prospect interface
interface ClientProspect {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  position: string;
  location?: string;
  status: 'new' | 'contacted' | 'responded' | 'interested' | 'not_interested' | 'closed';
  source: 'google' | 'linkedin' | 'referral' | 'website' | 'other';
  lastContact?: string;
  nextFollowUp?: string;
  notes?: string;
  
  // Client specific fields
  companySize?: string;
  industry?: string;
  budget?: string;
  hiringNeeds?: string[];
  decisionMaker?: boolean;
  companyWebsite?: string;
  urgency?: 'low' | 'medium' | 'high';
}

const ClientOutreachPage: React.FC = () => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [companySizeFilter, setCompanySizeFilter] = useState<string>('all');

  // Mock client data
  const clientProspects: ClientProspect[] = [
    {
      id: '1',
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
      hiringNeeds: ['Frontend Developer', 'Backend Developer', 'Product Manager'],
      decisionMaker: true,
      lastContact: '2024-01-15',
      nextFollowUp: '2024-01-22',
      urgency: 'high',
      companyWebsite: 'https://growthstartup.com'
    },
    {
      id: '2',
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
      hiringNeeds: ['Senior Developer', 'Tech Lead', 'DevOps Engineer'],
      decisionMaker: true,
      urgency: 'medium'
    },
    {
      id: '3',
      name: 'Maria Garcia',
      email: 'maria.garcia@techcorp.com',
      phone: '+1 (555) 456-7890',
      company: 'TechCorp Industries',
      position: 'VP of Engineering',
      location: 'San Francisco, CA',
      status: 'new',
      source: 'linkedin',
      companySize: '200-500',
      industry: 'SaaS',
      budget: '$120k - $180k',
      hiringNeeds: ['Full Stack Developer', 'Data Engineer', 'Security Engineer'],
      decisionMaker: true,
      urgency: 'high'
    },
    {
      id: '4',
      name: 'Robert Kim',
      email: 'robert.kim@consulting.com',
      company: 'Strategic Consulting Group',
      position: 'Managing Director',
      location: 'Chicago, IL',
      status: 'responded',
      source: 'referral',
      companySize: '100-200',
      industry: 'Consulting',
      budget: '$90k - $140k',
      hiringNeeds: ['Data Analyst', 'Business Analyst', 'Project Manager'],
      decisionMaker: false,
      lastContact: '2024-01-18',
      urgency: 'low'
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

  const filteredClients = clientProspects.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.hiringNeeds?.some(need => need.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesIndustry = industryFilter === 'all' || client.industry?.toLowerCase() === industryFilter.toLowerCase();
    
    const matchesCompanySize = companySizeFilter === 'all' || client.companySize === companySizeFilter;
    
    return matchesSearch && matchesIndustry && matchesCompanySize;
  });

  const getClientsByStatus = (status: string) => {
    return filteredClients.filter(client => client.status === status);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'linkedin': return <Linkedin className="w-4 h-4 text-blue-600" />;
      case 'google': return <Globe className="w-4 h-4 text-green-600" />;
      case 'website': return <Globe className="w-4 h-4 text-purple-600" />;
      default: return <Building2 className="w-4 h-4 text-gray-600" />;
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const ClientCard: React.FC<{ client: ClientProspect }> = ({ client }) => (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-green-600" />
          <span className="font-medium text-gray-900">{client.name}</span>
          {client.decisionMaker && (
            <UserCheck className="w-3 h-3 text-purple-600" title="Decision Maker" />
          )}
        </div>
        <div className="flex items-center gap-1">
          {getSourceIcon(client.source)}
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Building2 className="w-3 h-3" />
          <span className="font-medium">{client.company}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <Briefcase className="w-3 h-3" />
          <span>{client.position}</span>
        </div>

        {client.location && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-3 h-3" />
            <span>{client.location}</span>
          </div>
        )}

        {client.industry && (
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{client.industry}</span>
            {client.companySize && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{client.companySize}</span>
            )}
          </div>
        )}

        {client.budget && (
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="w-3 h-3" />
            <span>{client.budget}</span>
          </div>
        )}

        {/* Hiring Needs */}
        {client.hiringNeeds && (
          <div className="flex flex-wrap gap-1 mt-2">
            {client.hiringNeeds.slice(0, 2).map((need, index) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                {need}
              </span>
            ))}
            {client.hiringNeeds.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{client.hiringNeeds.length - 2} more
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
        <div className="flex items-center gap-2">
          {client.urgency && (
            <span className={`px-2 py-1 text-xs font-medium rounded ${getUrgencyColor(client.urgency)}`}>
              {client.urgency}
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
              {getClientsByStatus(column.id).length}
            </span>
          </div>
          <div className="space-y-3">
            {getClientsByStatus(column.id).map(client => (
              <ClientCard key={client.id} client={client} />
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
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hiring Needs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
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
            {filteredClients.map(client => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building2 className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{client.name}</span>
                        {client.decisionMaker && (
                          <UserCheck className="w-3 h-3 text-purple-600" title="Decision Maker" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                      <div className="text-sm text-gray-500">{client.position}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{client.company}</div>
                    <div className="text-sm text-gray-500">{client.industry}</div>
                    <div className="text-sm text-gray-500">{client.companySize}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {client.hiringNeeds?.slice(0, 2).map((need, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        {need}
                      </span>
                    ))}
                    {(client.hiringNeeds?.length || 0) > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{(client.hiringNeeds?.length || 0) - 2} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{client.budget}</div>
                  {client.urgency && (
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getUrgencyColor(client.urgency)}`}>
                      {client.urgency} priority
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                    client.status === 'new' ? 'bg-gray-100 text-gray-700' :
                    client.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                    client.status === 'responded' ? 'bg-yellow-100 text-yellow-700' :
                    client.status === 'interested' ? 'bg-green-100 text-green-700' :
                    client.status === 'not_interested' ? 'bg-red-100 text-red-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {client.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {getSourceIcon(client.source)}
                    <span className="text-sm text-gray-900 capitalize">{client.source}</span>
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
          <h1 className="text-2xl font-bold text-gray-900">Client Outreach</h1>
          <p className="text-gray-600 mt-1">Manage outreach to potential client companies</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Target className="w-4 h-4 mr-2" />
            Import Clients
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Client
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
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Industry Filter */}
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Industries</option>
            <option value="fintech">FinTech</option>
            <option value="healthcare">Healthcare</option>
            <option value="saas">SaaS</option>
            <option value="consulting">Consulting</option>
          </select>

          {/* Company Size Filter */}
          <select
            value={companySizeFilter}
            onChange={(e) => setCompanySizeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Sizes</option>
            <option value="1-10">Startup (1-10)</option>
            <option value="50-100">Small (50-100)</option>
            <option value="100-200">Medium (100-200)</option>
            <option value="200-500">Large (200-500)</option>
            <option value="500+">Enterprise (500+)</option>
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
          <div className="text-2xl font-bold text-green-600">{clientProspects.length}</div>
          <div className="text-sm text-gray-600">Total Clients</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">
            {clientProspects.filter(c => c.status === 'interested').length}
          </div>
          <div className="text-sm text-gray-600">Interested</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">
            {clientProspects.filter(c => c.status === 'contacted').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {clientProspects.filter(c => c.status === 'closed').length}
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

export default ClientOutreachPage;
