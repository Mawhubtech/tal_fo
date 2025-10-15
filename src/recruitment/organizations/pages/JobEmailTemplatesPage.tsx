import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Mail, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { useJob, useJobBySlug } from '../../../hooks/useJobs';
import { useExternalJobDetail } from '../../../hooks/useExternalJobs';
import { useAuthContext } from '../../../contexts/AuthContext';
import { isExternalUser } from '../../../utils/userUtils';
import { createJobUrl } from '../../../lib/urlUtils';
import { CreateEmailTemplateModal } from '../../../pages/sourcing/components/CreateEmailTemplateModal';
import { useEmailTemplates, useDeleteEmailTemplate } from '../../../hooks/useEmailManagement';
import ConfirmationModal from '../../../components/ConfirmationModal';

const JobEmailTemplatesPage: React.FC = () => {
  const { slug, jobId } = useParams<{ 
    slug?: string;
    jobId?: string; 
  }>();
  const { user } = useAuthContext();
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<any>(null);
  const [templateToDelete, setTemplateToDelete] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Determine if current user is external and use appropriate hook
  const isExternal = isExternalUser(user);
  
  // Extract the actual slug from the URL parameter if it's in the combined format
  const extractSlug = (slugParam: string | undefined): string => {
    if (!slugParam) return '';
    const parts = slugParam.split('-');
    return parts[parts.length - 1];
  };
  
  const actualSlug = slug ? extractSlug(slug) : '';
  
  // Get job data to derive organizationId and departmentId
  // Use slug-based lookup for protected routes, jobId for external routes
  const { data: job, isLoading, error } = isExternal 
    ? useJob(jobId || '') 
    : useJobBySlug(actualSlug);
    
  const organizationId = job?.organizationId;
  const departmentId = job?.departmentId;
  
  // Fetch email templates
  const { data: templatesData, isLoading: templatesLoading, refetch: refetchTemplates } = useEmailTemplates();
  const deleteTemplateMutation = useDeleteEmailTemplate();
  
  const templates = Array.isArray(templatesData) ? templatesData : (templatesData?.templates || []);
  
  const { 
    data: externalJob, 
    isLoading: externalJobLoading, 
    error: externalJobError 
  } = useExternalJobDetail(isExternal ? (jobId || '') : '');

  // Use the appropriate data based on user type
  const effectiveJob = isExternal ? externalJob : job;
  const effectiveLoading = isExternal ? externalJobLoading : isLoading;
  const effectiveError = isExternal ? externalJobError : error;

  // Handlers
  const handleEditTemplate = (template: any) => {
    setTemplateToEdit(template);
    setShowCreateTemplate(true);
  };

  const handleDeleteTemplate = (template: any) => {
    setTemplateToDelete(template);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    try {
      await deleteTemplateMutation.mutateAsync(templateToDelete.id);
      setShowDeleteConfirm(false);
      setTemplateToDelete(null);
      refetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleCloseModal = () => {
    setShowCreateTemplate(false);
    setTemplateToEdit(null);
  };

  const handleTemplateSuccess = () => {
    setShowCreateTemplate(false);
    setTemplateToEdit(null);
    refetchTemplates();
  };

  if (effectiveLoading || templatesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (effectiveError || !effectiveJob) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist.</p>
          <Link
            to={isExternal 
              ? "/external/jobs"
              : "/my-jobs"
            }
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  // Construct the back URL based on user type
  const backUrl = isExternal 
    ? `/external/jobs/${jobId}`
    : `/jobs/${slug}/email-sequences`;

  return (
    <div className="p-6">
      {/* Breadcrumbs - Only show for internal users */}
      {!isExternal && (
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link to="/my-jobs" className="hover:text-gray-700">Jobs</Link>
          <span className="mx-2">/</span>
          <Link to={slug && effectiveJob ? createJobUrl(effectiveJob.slug || '', effectiveJob.title) : '/my-jobs'} className="hover:text-gray-700">
            {effectiveJob.title}
          </Link>
          <span className="mx-2">/</span>
          <Link to={backUrl} className="hover:text-gray-700">
            Email Sequences
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Email Templates</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to={backUrl}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Email Sequences
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{effectiveJob.title} - Email Templates</h1>
            <p className="text-gray-600 mt-1">Manage email templates for this job position</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateTemplate(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </button>
          </div>
        </div>
      </div>

      {/* Email Templates Content */}
      <div className="bg-white rounded-lg shadow">
        {templates.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first email template to use in your outreach sequences.
            </p>
            <button
              onClick={() => setShowCreateTemplate(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {templates.map((template) => (
              <div key={template.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {template.name}
                      </h3>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">
                        {template.type?.replace(/_/g, ' ')}
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                        {template.category}
                      </span>
                      {template.scope && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                          {template.scope}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Subject:</span> {template.subject}
                    </p>
                    
                    {template.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {template.usageCount > 0 && (
                        <span>Used {template.usageCount} times</span>
                      )}
                      <span>
                        Created {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit Template"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Template"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Template Modal */}
      {showCreateTemplate && (
        <CreateEmailTemplateModal
          projectId="" // Not used by the modal, but required by the interface
          template={templateToEdit}
          onClose={handleCloseModal}
          onSuccess={handleTemplateSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setTemplateToDelete(null);
        }}
        onConfirm={confirmDeleteTemplate}
        title="Delete Template"
        message={`Are you sure you want to delete "${templateToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default JobEmailTemplatesPage;
