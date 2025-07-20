import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  DollarSign, 
  Users, 
  Building,
  Clock,
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle,
  AlertCircle,
  Share2,
  BookmarkPlus,
  ExternalLink
} from 'lucide-react';
import { usePublishedJob, useRelatedJobs, useApplyToJob } from '../../hooks/usePublicJobs';
import { useAuthContext } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  formatSalaryRange,
  formatPostedDate,
  getExperienceBadgeColor,
  formatExperienceLevel,
  getJobTypeBadgeColor,
  getDeadlineStatus,
  generateJobShareUrl
} from '../../utils/jobUtils';

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const {
    data: job,
    isLoading,
    error
  } = usePublishedJob(jobId!);

  const {
    data: relatedJobs = [],
    isLoading: relatedLoading
  } = useRelatedJobs(jobId!, 4);

  const applyMutation = useApplyToJob();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading job details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
            <p className="text-gray-600 mb-6">
              The job you're looking for doesn't exist or is no longer available.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Browse All Jobs
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const deadlineStatus = getDeadlineStatus(job.applicationDeadline);
  const isExpired = deadlineStatus.status === 'expired';

  const handleApplyClick = () => {
    if (isAuthenticated) {
      setShowApplicationForm(true);
    } else {
      navigate(`/job-seeker/login?returnTo=/jobs/${jobId}`);
    }
  };

  const handleShareJob = async () => {
    const url = generateJobShareUrl(job.id);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job.title} - Job Opening`,
          text: `Check out this job opportunity: ${job.title} at ${job.department}`,
          url: url,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
      }
    } else {
      navigator.clipboard.writeText(url);
      // You could show a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/jobs"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  <span className="font-medium">{job.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span>{formatSalaryRange(job)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{formatPostedDate(job.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{job.applicantsCount} applicant{job.applicantsCount !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getJobTypeBadgeColor(job.type)}`}>
                  {job.type}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getExperienceBadgeColor(job.experienceLevel)}`}>
                  {formatExperienceLevel(job.experienceLevel)}
                </span>
                {job.remote && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    Remote
                  </span>
                )}
                {job.applicationDeadline && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    deadlineStatus.status === 'expired' ? 'bg-red-100 text-red-800' :
                    deadlineStatus.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {deadlineStatus.text}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:min-w-0">
              <button
                onClick={handleShareJob}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <BookmarkPlus className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={handleApplyClick}
                disabled={isExpired}
                className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  isExpired
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isExpired ? (
                  <>
                    <AlertCircle className="h-5 w-5" />
                    Application Expired
                  </>
                ) : (
                  <>
                    Apply Now
                    <ExternalLink className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
              </div>
            </section>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Responsibilities</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits & Perks</h2>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Apply */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Apply</h3>
              <button
                onClick={handleApplyClick}
                disabled={isExpired}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  isExpired
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isExpired ? 'Application Expired' : 'Apply for this Job'}
              </button>
              {!isExpired && (
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Takes less than 2 minutes
                </p>
              )}
            </div>

            {/* Job Overview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Overview</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600">Job Type</span>
                  <p className="font-medium">{job.type}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Experience Level</span>
                  <p className="font-medium">{formatExperienceLevel(job.experienceLevel)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Department</span>
                  <p className="font-medium">{job.department}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Location</span>
                  <p className="font-medium">{job.location}</p>
                </div>
                {job.applicationDeadline && (
                  <div>
                    <span className="text-sm text-gray-600">Application Deadline</span>
                    <p className="font-medium">
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Jobs</h3>
                <div className="space-y-4">
                  {relatedJobs.map((relatedJob) => (
                    <Link
                      key={relatedJob.id}
                      to={`/jobs/${relatedJob.id}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 mb-1">{relatedJob.title}</h4>
                      <p className="text-sm text-gray-600">{relatedJob.department}</p>
                      <p className="text-sm text-gray-500">{relatedJob.location}</p>
                    </Link>
                  ))}
                </div>
                <Link
                  to="/jobs"
                  className="block mt-4 text-center text-purple-600 hover:text-purple-700 font-medium"
                >
                  View All Jobs →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JobDetailPage;
