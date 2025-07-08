import React from 'react';
import { X, MapPin, DollarSign, Users, Calendar, Briefcase, Clock, CheckCircle } from 'lucide-react';
import type { Job } from '../../recruitment/data/types';

interface JobPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any; // Use any to handle different Job type schemas
}

const JobPreviewModal: React.FC<JobPreviewModalProps> = ({ isOpen, onClose, job }) => {
  if (!isOpen) return null;

  // Helper function to safely parse string or array fields
  const parseStringOrArray = (field: string | string[] | undefined | null): string[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field.filter(Boolean);
    if (typeof field === 'string') {
      // Handle empty strings
      if (field.trim() === '') return [];
      // Split by comma and clean up each item
      return field.split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
  };

  // Parse requirements, responsibilities, benefits, and skills
  const requirements = parseStringOrArray(job.requirements);
  const responsibilities = parseStringOrArray(job.responsibilities);
  const benefits = parseStringOrArray(job.benefits);
  const skills = parseStringOrArray(job.skills);

  const formatSalary = (job: any) => {
    // Handle the newer schema with salaryMin/salaryMax
    if (job.salaryMin && job.salaryMax) {
      return `${job.currency || '$'}${job.salaryMin.toLocaleString()} - ${job.currency || '$'}${job.salaryMax.toLocaleString()}`;
    } else if (job.salaryMin) {
      return `${job.currency || '$'}${job.salaryMin.toLocaleString()}+`;
    } else if (job.salaryMax) {
      return `Up to ${job.currency || '$'}${job.salaryMax.toLocaleString()}`;
    }
    // Handle the older schema with just salary string
    else if (job.salary && typeof job.salary === 'string') {
      return job.salary;
    }
    // Handle salary object
    else if (job.salary && typeof job.salary === 'object') {
      const sal = job.salary;
      if (sal.min && sal.max) {
        return `${sal.currency || '$'}${sal.min.toLocaleString()} - ${sal.currency || '$'}${sal.max.toLocaleString()}`;
      } else if (sal.min) {
        return `${sal.currency || '$'}${sal.min.toLocaleString()}+`;
      } else if (sal.max) {
        return `Up to ${sal.currency || '$'}${sal.max.toLocaleString()}`;
      }
    }
    return 'Salary not specified';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'archived': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Not specified';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  };

  const getPostedDate = (job: any) => {
    return job.postedDate || job.createdAt;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
              <p className="text-gray-600">{job.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Job Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{job.location}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Salary</p>
                  <p className="font-medium text-gray-900">{formatSalary(job)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Briefcase className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{(job.type || job.employmentType || 'Not specified').replace('-', ' ')}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Applicants</p>
                  <p className="font-medium text-gray-900">{job.applicantsCount || job.applicantCount || 0}</p>
                </div>
              </div>
            </div>

            {/* Status and Dates */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-500">Status:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-500">Posted:</span>
                <span className="font-medium text-gray-900">{formatDate(getPostedDate(job))}</span>
              </div>
              
              {job.applicationDeadline && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-500">Deadline:</span>
                  <span className="font-medium text-gray-900">{formatDate(job.applicationDeadline)}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Experience:</span>
                <span className="font-medium text-gray-900 capitalize">{job.experienceLevel || job.experience || 'Not specified'} Level</span>
              </div>
              
              {job.remote && (
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Remote
                  </span>
                </div>
              )}
            </div>

            {/* Job Description */}
            {job.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                </div>
              </div>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {responsibilities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Responsibilities</h3>
                <ul className="space-y-2">
                  {responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {benefits.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobPreviewModal;
