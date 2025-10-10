import React, { useState } from 'react';
import { X, UserPlus, Trash2, AlertCircle } from 'lucide-react';

export interface JobCollaboratorInvite {
  email: string;
  role: 'viewer' | 'recruiter' | 'hiring_manager' | 'admin';
  canViewApplications?: boolean;
  canMoveCandidates?: boolean;
  canEditJob?: boolean;
}

interface JobCollaboratorInviteFormProps {
  onInvite: (collaborators: JobCollaboratorInvite[]) => Promise<void>;
  onClose?: () => void;
  existingCollaborators?: string[]; // List of emails already invited
}

const JobCollaboratorInviteForm: React.FC<JobCollaboratorInviteFormProps> = ({
  onInvite,
  onClose,
  existingCollaborators = [],
}) => {
  const [collaborators, setCollaborators] = useState<JobCollaboratorInvite[]>([
    { email: '', role: 'viewer', canViewApplications: true, canMoveCandidates: false, canEditJob: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const roleOptions = [
    { value: 'viewer', label: 'Viewer', description: 'Can view applications only' },
    { value: 'recruiter', label: 'Recruiter', description: 'Can view and move candidates' },
    { value: 'hiring_manager', label: 'Hiring Manager', description: 'Full access except delete' },
    { value: 'admin', label: 'Admin', description: 'Full access including edit' },
  ];

  const addCollaborator = () => {
    setCollaborators([
      ...collaborators,
      { email: '', role: 'viewer', canViewApplications: true, canMoveCandidates: false, canEditJob: false },
    ]);
  };

  const removeCollaborator = (index: number) => {
    if (collaborators.length > 1) {
      setCollaborators(collaborators.filter((_, i) => i !== index));
    }
  };

  const updateCollaborator = (index: number, field: keyof JobCollaboratorInvite, value: any) => {
    const updated = [...collaborators];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-set permissions based on role
    if (field === 'role') {
      switch (value) {
        case 'viewer':
          updated[index] = {
            ...updated[index],
            canViewApplications: true,
            canMoveCandidates: false,
            canEditJob: false,
          };
          break;
        case 'recruiter':
          updated[index] = {
            ...updated[index],
            canViewApplications: true,
            canMoveCandidates: true,
            canEditJob: false,
          };
          break;
        case 'hiring_manager':
          updated[index] = {
            ...updated[index],
            canViewApplications: true,
            canMoveCandidates: true,
            canEditJob: true,
          };
          break;
        case 'admin':
          updated[index] = {
            ...updated[index],
            canViewApplications: true,
            canMoveCandidates: true,
            canEditJob: true,
          };
          break;
      }
    }
    
    setCollaborators(updated);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    // Validation
    const validCollaborators = collaborators.filter(c => c.email.trim());
    
    if (validCollaborators.length === 0) {
      setError('Please add at least one email address');
      return;
    }

    // Validate emails
    for (const collab of validCollaborators) {
      if (!validateEmail(collab.email)) {
        setError(`Invalid email format: ${collab.email}`);
        return;
      }
      
      if (existingCollaborators.includes(collab.email.toLowerCase())) {
        setError(`${collab.email} has already been invited to this job`);
        return;
      }
    }

    // Check for duplicates
    const emails = validCollaborators.map(c => c.email.toLowerCase());
    const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
    if (duplicates.length > 0) {
      setError(`Duplicate email found: ${duplicates[0]}`);
      return;
    }

    setLoading(true);
    try {
      await onInvite(validCollaborators);
      
      // Close form immediately without success message
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add team members');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <UserPlus className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Add Team Members</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Add team members via email to collaborate on this job. <strong className="text-gray-900">Email address is required.</strong> Team members will be invited after the job is created.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {collaborators.map((collaborator, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-gray-700">Collaborator {index + 1}</span>
              {collaborators.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCollaborator(index)}
                  className="p-1 hover:bg-red-50 rounded transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={collaborator.email}
                  onChange={(e) => updateCollaborator(index, 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  placeholder="colleague@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={collaborator.role}
                  onChange={(e) => updateCollaborator(index, 'role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  required
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Permissions Preview */}
            <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
              <div className="font-medium text-gray-700 mb-1">Permissions:</div>
              <div className="flex items-center space-x-4">
                <span className={collaborator.canViewApplications ? 'text-green-700' : 'text-gray-400'}>
                  {collaborator.canViewApplications ? '✓' : '✗'} View Applications
                </span>
                <span className={collaborator.canMoveCandidates ? 'text-green-700' : 'text-gray-400'}>
                  {collaborator.canMoveCandidates ? '✓' : '✗'} Move Candidates
                </span>
                <span className={collaborator.canEditJob ? 'text-green-700' : 'text-gray-400'}>
                  {collaborator.canEditJob ? '✓' : '✗'} Edit Job
                </span>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addCollaborator}
          className="w-full px-3 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-md hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center space-x-2"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Add Another Person</span>
        </button>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-xs font-medium"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || success}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Team Members</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCollaboratorInviteForm;
