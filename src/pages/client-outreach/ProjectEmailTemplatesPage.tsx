import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Mail,
  Search,
  Edit,
  Trash2,
  Copy,
  Eye
} from 'lucide-react';
import { useProjects } from '../../hooks/useClientOutreach';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProjectEmailTemplatesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: projects = [], isLoading } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const project = projects.find(p => p.id.toString() === id);

  // Mock data for email templates - replace with actual API call
  const emailTemplates = [
    {
      id: '1',
      name: 'Client Introduction Email',
      type: 'client_outreach',
      category: 'initial_outreach',
      subject: 'Partnership Opportunity with {{company_name}}',
      content: 'Hello {{client_name}}, I hope this email finds you well. We at {{our_company}} specialize in providing top-tier talent solutions...',
      variables: ['client_name', 'company_name', 'our_company', 'service_type'],
      usage: 45,
      lastUsed: new Date('2025-01-20'),
      createdAt: new Date('2025-01-01'),
      isActive: true
    },
    {
      id: '2',
      name: 'Follow-up Email',
      type: 'follow_up',
      category: 'follow_up',
      subject: 'Following up on our conversation - {{service_type}} opportunities',
      content: 'Hi {{client_name}}, I wanted to follow up on our previous conversation about {{topic_discussed}}...',
      variables: ['client_name', 'service_type', 'topic_discussed'],
      usage: 32,
      lastUsed: new Date('2025-01-18'),
      createdAt: new Date('2025-01-05'),
      isActive: true
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <Link
            to="/dashboard/client-outreach/projects"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const categories = [
    { key: '', label: 'All Categories' },
    { key: 'initial_outreach', label: 'Initial Outreach' },
    { key: 'follow_up', label: 'Follow Up' },
    { key: 'nurture', label: 'Nurture' },
    { key: 'promotional', label: 'Promotional' },
  ];

  const filteredTemplates = emailTemplates.filter(template => {
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to={`/dashboard/client-outreach/projects/${project.id}/campaigns`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Campaigns
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name} - Email Templates</h1>
            <p className="text-gray-600 mt-1">Manage email templates for this project</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.key} value={category.key}>{category.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                    {template.category.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 uppercase">
                    {template.type}
                  </span>
                </div>
                {template.subject && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Subject:</span> {template.subject}
                  </p>
                )}
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {template.content.substring(0, 150)}...
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-4">
                <span>Used {template.usage} times</span>
                {template.lastUsed && (
                  <span>Last used {template.lastUsed.toLocaleDateString()}</span>
                )}
              </div>
              <span>{template.variables.length} variables</span>
            </div>

            <div className="flex justify-end space-x-2">
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Preview">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Copy">
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg" title="Edit">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory 
              ? "Try adjusting your filters to see more templates."
              : "Create your first email template to get started."
            }
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectEmailTemplatesPage;
