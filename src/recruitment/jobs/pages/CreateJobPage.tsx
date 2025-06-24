import React, { useState, useEffect } from 'react';
import { Plus, X, Users, FileText, Settings, MapPin, Building, DollarSign, Clock, Calendar, Save, AlertCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { jobApiService, type CreateJobData } from '../services/jobApiService';
import { OrganizationApiService, type Organization, type Department } from '../../organizations/services/organizationApiService';

const CreateJobPage: React.FC = () => {
  const { organizationId, departmentId } = useParams<{ 
    organizationId: string; 
    departmentId: string; 
  }>();
  const navigate = useNavigate();
  
  // API services
  const organizationApiService = new OrganizationApiService();
  
  // Context data
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [jobTitle, setJobTitle] = useState('');
  const [departmentIdForm, setDepartmentIdForm] = useState('');
  const [location, setLocation] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [remote, setRemote] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [hiringTeam, setHiringTeam] = useState<string[]>([]);
  const [requirements, setRequirements] = useState(['']);
  const [responsibilities, setResponsibilities] = useState(['']);
  const [customQuestions, setCustomQuestions] = useState<{question: string, type: 'text' | 'multiple-choice', required: boolean}[]>([]);
  // Load context data when organizationId is present
  useEffect(() => {
    const loadContextData = async () => {
      if (!organizationId) return;

      try {
        setLoading(true);
        
        // Load organization
        const orgData = await organizationApiService.getOrganizationById(organizationId);
        setOrganization(orgData);

        if (!orgData) {
          setError('Organization not found');
          return;
        }

        // Load departments for this organization
        const deptData = await organizationApiService.getDepartmentsByOrganization(organizationId);
        setDepartments(deptData);
        
        // If we're in a department context, pre-select that department
        if (departmentId && deptData.length > 0) {
          const selectedDept = deptData.find(dept => dept.id === departmentId);
          if (selectedDept) {
            setSelectedDepartment(selectedDept);
            setDepartmentIdForm(selectedDept.id);
          }
        }
        
        setError(null);
      } catch (error) {
        console.error('Error loading context data:', error);
        setError('Failed to load organization data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadContextData();
  }, [organizationId, departmentId]);
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefitToRemove: string) => {
    setBenefits(benefits.filter(benefit => benefit !== benefitToRemove));
  };

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const addResponsibility = () => {
    setResponsibilities([...responsibilities, '']);
  };

  const updateResponsibility = (index: number, value: string) => {
    const updated = [...responsibilities];
    updated[index] = value;
    setResponsibilities(updated);
  };

  const removeResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };  const handleSubmit = async (publish: boolean) => {
    try {
      setSubmitLoading(true);
      setError(null);

      // Validate required fields
      if (!jobTitle.trim()) {
        setError('Job title is required');
        return;
      }

      if (!departmentIdForm.trim()) {
        setError('Department is required');
        return;
      }

      if (!location.trim()) {
        setError('Location is required');
        return;
      }

      // Validate salary range
      const minSalary = salaryMin ? parseFloat(salaryMin) : undefined;
      const maxSalary = salaryMax ? parseFloat(salaryMax) : undefined;
      
      if (minSalary && maxSalary && minSalary > maxSalary) {
        setError('Minimum salary cannot be greater than maximum salary');
        return;
      }

      // Find the selected department to get its name
      const selectedDept = departments.find(dept => dept.id === departmentIdForm);
      if (!selectedDept) {
        setError('Invalid department selected');
        return;
      }

      const jobData: CreateJobData = {
        title: jobTitle.trim(),
        description: jobDescription.trim() || undefined,
        department: selectedDept.name,
        departmentId: departmentIdForm,
        location: location.trim(),
        type: employmentType as any,
        status: publish ? 'Active' : 'Draft',
        experienceLevel: experienceLevel.trim() || undefined,
        salaryMin: minSalary,
        salaryMax: maxSalary,
        currency: currency,
        remote: remote,
        skills: skills.length > 0 ? skills : undefined,
        benefits: benefits.length > 0 ? benefits : undefined,
        requirements: requirements.filter(req => req.trim()).length > 0 
          ? requirements.filter(req => req.trim()) 
          : undefined,
        responsibilities: responsibilities.filter(resp => resp.trim()).length > 0 
          ? responsibilities.filter(resp => resp.trim()) 
          : undefined,
        hiringTeam: hiringTeam.length > 0 ? hiringTeam : undefined,
        applicationDeadline: applicationDeadline || undefined,
        organizationId: organizationId || undefined,
        customQuestions: customQuestions.length > 0 ? customQuestions : undefined,
      };

      const createdJob = await jobApiService.createJob(jobData);
      
      // Navigate to the job ATS page within the organization context
      if (organizationId && createdJob.departmentId) {
        navigate(`/dashboard/organizations/${organizationId}/departments/${createdJob.departmentId}/jobs/${createdJob.id}/ats`);
      } else {
        navigate('/dashboard/organizations');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create job. Please try again.');
      console.error('Error creating job:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Early return if no organizationId
  if (!organizationId) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid URL</h3>
          <p className="text-gray-500 mb-4">
            Organization ID is required to create a job.
          </p>
          <Link 
            to="/dashboard/organizations" 
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Organizations
          </Link>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading organization details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !organization) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Organization</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link 
            to="/dashboard/organizations" 
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Organizations
          </Link>
        </div>
      </div>
    );
  }

  return (    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">      {/* Breadcrumbs */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center text-sm text-gray-500">
              <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
              <span className="mx-2">/</span>
              {organizationId ? (
                <>
                  <Link to="/dashboard/organizations" className="hover:text-gray-700">Organizations</Link>
                  <span className="mx-2">/</span>
                  {organization ? (
                    <Link 
                      to={`/dashboard/organizations/${organizationId}`} 
                      className="hover:text-gray-700"
                    >
                      {organization.name}
                    </Link>
                  ) : (
                    <span>Loading...</span>
                  )}
                  <span className="mx-2">/</span>                  {departmentId && selectedDepartment ? (
                    <>
                      <Link 
                        to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs`}
                        className="hover:text-gray-700"
                      >
                        {selectedDepartment.name}
                      </Link>
                      <span className="mx-2">/</span>
                    </>
                  ) : null}
                  <span className="text-gray-900 font-medium">Create Job</span>
                </>
              ) : (
                <>
                  <Link to="/dashboard/jobs" className="hover:text-gray-700">Jobs</Link>
                  <span className="mx-2">/</span>
                  <span className="text-gray-900 font-medium">Create Job</span>
                  <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Legacy View</span>
                </>
              )}
            </div>
            {!organizationId && (
              <Link 
                to="/dashboard/organizations" 
                className="text-sm bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Switch to Hierarchical Flow
              </Link>
            )}
          </div>
        </div>
      </div>      {/* Header */}      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>            <div className="flex gap-4">
              {error && (
                <div className="flex items-center text-red-600 bg-red-50 px-3 py-2 rounded-lg mr-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={submitLoading}
                className="px-4 py-2 border-2 border-purple-600 text-purple-700 rounded-lg hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={submitLoading}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 font-medium text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Publishing...
                  </>
                ) : (
                  'Publish Job'
                )}
              </button>
            </div>
          </div>
        </div>
      </div><div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow flex flex-col">        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-148px)] overflow-hidden">
            {/* Main Content - Takes up 1/2 space on large screens, full width on smaller */}
          <div className="overflow-y-auto lg:pr-4 h-full pb-20">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {/* Job Overview */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
              <div className="flex items-center">
                <Building className="text-white mr-3" size={24} />
                <h2 className="text-xl font-semibold text-white">Job Overview</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>                <div>
                  <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    id="department"
                    value={departmentIdForm}
                    onChange={(e) => {
                      setDepartmentIdForm(e.target.value);
                      const selected = departments.find(dept => dept.id === e.target.value);
                      setSelectedDepartment(selected || null);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
                    required
                    disabled={loading || departments.length === 0}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {loading && (
                    <p className="text-xs text-gray-500 mt-1">Loading departments...</p>
                  )}
                  {!loading && departments.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No departments found for this organization.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="inline mr-1" size={16} />
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="e.g., New York, NY"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="employmentType" className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="inline mr-1" size={16} />
                    Employment Type *
                  </label>
                  <select
                    id="employmentType"
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="experienceLevel" className="block text-sm font-semibold text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    id="experienceLevel"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
                  >
                    <option value="">Select Experience Level</option>
                    <option value="Entry Level">Entry Level (0-2 years)</option>
                    <option value="Mid Level">Mid Level (3-5 years)</option>
                    <option value="Senior Level">Senior Level (6-10 years)</option>
                    <option value="Lead Level">Lead Level (10+ years)</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="applicationDeadline" className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline mr-1" size={16} />
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    id="applicationDeadline"
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remote"
                  checked={remote}
                  onChange={(e) => setRemote(e.target.checked)}
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remote" className="ml-3 text-sm font-semibold text-gray-700">
                  Remote work available
                </label>
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <div className="flex items-center">
                <DollarSign className="text-white mr-3" size={24} />
                <h2 className="text-xl font-semibold text-white">Compensation</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="salaryMin" className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Salary
                  </label>
                  <input
                    type="number"
                    id="salaryMin"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label htmlFor="salaryMax" className="block text-sm font-semibold text-gray-700 mb-2">
                    Maximum Salary
                  </label>
                  <input
                    type="number"
                    id="salaryMax"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="80000"
                  />
                </div>
                <div>
                  <label htmlFor="currency" className="block text-sm font-semibold text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>          {/* Job Description */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center">
                <FileText className="text-white mr-3" size={24} />
                <h2 className="text-xl font-semibold text-white">Job Description</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="jobDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Overview *
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Provide a compelling overview of the role, company culture, and what makes this position exciting..."
                  required
                />
              </div>

              {/* Responsibilities */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Key Responsibilities
                </label>
                {responsibilities.map((responsibility, index) => (
                  <div key={index} className="flex items-center space-x-3 mb-3">
                    <input
                      type="text"
                      value={responsibility}
                      onChange={(e) => updateResponsibility(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="e.g., Design and implement scalable backend systems"
                    />
                    {responsibilities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeResponsibility(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addResponsibility}
                  className="flex items-center text-purple-600 hover:text-purple-800 font-medium mt-2"
                >
                  <Plus size={16} className="mr-1" />
                  Add Responsibility
                </button>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Requirements & Qualifications
                </label>
                {requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-3 mb-3">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="e.g., 5+ years of experience with React and TypeScript"
                    />
                    {requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRequirement}
                  className="flex items-center text-purple-600 hover:text-purple-800 font-medium mt-2"
                >
                  <Plus size={16} className="mr-1" />
                  Add Requirement
                </button>
              </div>
            </div>
          </div>

          {/* Skills & Benefits */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
              <div className="flex items-center">
                <Settings className="text-white mr-3" size={24} />
                <h2 className="text-xl font-semibold text-white">Skills & Benefits</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Skills */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Required Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="e.g., React, TypeScript, Node.js"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Benefits & Perks
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {benefit}
                      <button
                        type="button"
                        onClick={() => removeBenefit(benefit)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="e.g., Health Insurance, Remote Work, Flexible Hours"
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>          {/* Hiring Process */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex items-center">
                <Users className="text-white mr-3" size={24} />
                <h2 className="text-xl font-semibold text-white">Hiring Process</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Hiring Team */}
              <div>
                <label htmlFor="hiringManager" className="block text-sm font-semibold text-gray-700 mb-2">
                  Hiring Team
                </label>
                <input
                  type="text"
                  id="hiringManager"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Add team members who will be involved in the hiring process"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Note: Full hiring team management will be implemented in a future update
                </p>
              </div>

              {/* Application Questions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Custom Application Questions
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Standard questions (name, email, resume, cover letter) are included by default.
                  </p>
                  <button
                    type="button"
                    className="flex items-center text-purple-600 hover:text-purple-800 font-medium"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Custom Question (Coming Soon)
                  </button>
                </div>
              </div>

              {/* Pipeline Stages */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hiring Pipeline
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {['Applied', 'Phone Screen', 'Technical Interview', 'Final Interview', 'Offer', 'Hired'].map((stage, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {stage}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Default pipeline stages. Custom pipeline configuration will be available in a future update.
                  </p>
                </div>
              </div>
            </div>
          </div>          </form>
      </div>        {/* Sidebar - Takes up 1/2 space on large screens, full width on smaller */}      
	  <div className="h-full">
        {/* Live Job Preview */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col relative">          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex-shrink-0 sticky top-0 z-10">
            <h3 className="text-lg font-semibold text-white">📋 Live Preview</h3>
          </div>
          <div className="p-6 overflow-y-auto overflow-x-hidden flex-grow max-h-[calc(100vh-200px)]">
            <div className="space-y-6">{/* Job Title */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {jobTitle || 'Job Title'}
                </h2>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">                  <span className="flex items-center">
                    <Building size={14} className="mr-1" />
                    {selectedDepartment?.name || 'Department'}
                  </span>
                  <span className="flex items-center">
                    <MapPin size={14} className="mr-1" />
                    {location || 'Location'}
                  </span>
                </div>

                {/* Employment Type & Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {employmentType}
                  </span>
                  {remote && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Remote Available
                    </span>
                  )}
                  {experienceLevel && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                      {experienceLevel}
                    </span>
                  )}
                </div>
              </div>{/* Salary Range */}
              {(salaryMin || salaryMax) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800 mb-1">Salary Range</p>
                  <p className="text-lg font-semibold text-green-900">
                    {salaryMin && salaryMax 
                      ? `${currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : 'C$'}${parseInt(salaryMin).toLocaleString()} - ${currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : 'C$'}${parseInt(salaryMax).toLocaleString()}`
                      : salaryMin 
                        ? `From ${currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : 'C$'}${parseInt(salaryMin).toLocaleString()}`
                        : salaryMax 
                          ? `Up to ${currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : 'C$'}${parseInt(salaryMax).toLocaleString()}`
                          : ''
                    }
                  </p>
                </div>
              )}              {/* Job Description */}
              {jobDescription && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">About the Role</p>
                  <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4 border border-gray-200 leading-relaxed break-words overflow-x-hidden">
                    {jobDescription.split('\n').map((line, index) => (
                      <p key={index} className="mb-2 last:mb-0">{line || ' '}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              {responsibilities.some(resp => resp.trim()) && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Key Responsibilities</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {responsibilities.filter(resp => resp.trim()).map((responsibility, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {responsibility}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {requirements.some(req => req.trim()) && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Requirements</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {requirements.filter(req => req.trim()).map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
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
                  <p className="text-sm font-medium text-gray-700 mb-2">Benefits & Perks</p>
                  <div className="flex flex-wrap gap-1">
                    {benefits.map((benefit, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Application Deadline */}
              {applicationDeadline && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-orange-800 mb-1">Application Deadline</p>
                  <p className="text-sm text-orange-900">
                    {new Date(applicationDeadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}              {/* Preview Footer */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  This is how your job posting will appear to candidates
                </p>
              </div>
            </div>      </div>
        </div>        {/* Progress Indicator - Hidden on larger screens since sidebar is already full height */}
        <div className="lg:hidden bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mt-6 mb-24">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">📊 Completion</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Job Details</span>
                <span className={`font-medium ${jobTitle && departmentIdForm && location ? 'text-green-600' : 'text-gray-400'}`}>
                  {jobTitle && departmentIdForm && location ? '✓' : '○'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Description</span>
                <span className={`font-medium ${jobDescription ? 'text-green-600' : 'text-gray-400'}`}>
                  {jobDescription ? '✓' : '○'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Requirements</span>
                <span className={`font-medium ${requirements.some(req => req.trim()) ? 'text-green-600' : 'text-gray-400'}`}>
                  {requirements.some(req => req.trim()) ? '✓' : '○'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Skills</span>
                <span className={`font-medium ${skills.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {skills.length > 0 ? '✓' : '○'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"                  style={{
                    width: `${Math.round(
                      ((jobTitle && departmentIdForm && location ? 25 : 0) +
                       (jobDescription ? 25 : 0) +
                       (requirements.some(req => req.trim()) ? 25 : 0) +
                       (skills.length > 0 ? 25 : 0))
                    )}%`
                  }}
                ></div>
              </div>
            </div>
          </div>        </div>      </div>        
        </div>
      </div>
    </div>
  );
};

export default CreateJobPage;
