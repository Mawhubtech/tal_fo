import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Building, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  Plus,
  X,
  LogOut,
  User,
  Upload,
  FileText,
  ExternalLink,
  Linkedin,
  Github,
  Globe,
  CheckCircle,
  Share2,
  Edit
} from 'lucide-react';
import { jobSeekerProfileApiService } from '../../../../services/jobSeekerProfileApiService';
import { useCVProcessing } from '../../../../hooks/useCVProcessing';
import type { OnboardingData } from '../../../../services/jobSeekerProfileApiService';
import CVPreview from '../../../../components/CVPreview';

// Form validation schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  location: z.string().min(1, 'Location is required'),
});

const preferencesSchema = z.object({
  contractTypes: z.array(z.string()).min(1, 'Select at least one contract type'),
  startAvailability: z.string().min(1, 'Start availability is required'),
  salaryRange: z.string().min(1, 'Salary range is required'),
  salaryFlexible: z.boolean(),
  workplaceSettings: z.array(z.string()).min(1, 'Select at least one workplace setting'),
});

const companiesSchema = z.object({
  preferredCompanies: z.array(z.string()),
  hiddenCompanies: z.array(z.string()),
  companyStages: z.array(z.string()),
  industries: z.array(z.string()),
  companySizes: z.array(z.string()),
});

const profileSchema = z.object({
  cvFile: z.any().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  personalWebsite: z.string().url().optional().or(z.literal('')),
});

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [cvParsedData, setCvParsedData] = useState<any>(null);
  const [isParsingCv, setIsParsingCv] = useState(false);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const [showCVPreview, setShowCVPreview] = useState(false);
  const [originalCVText, setOriginalCVText] = useState('');
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);

  const navigate = useNavigate();
  const { processCV, loading: cvLoading, error: cvError } = useCVProcessing();

  const handleCVSave = (updatedData: any) => {
    setCvParsedData(updatedData);
  };

  const handleCVBack = () => {
    setShowCVPreview(false);
  };

  const handleCVComplete = () => {
    setShowCVPreview(false);
    // Continue with onboarding completion after CV review
    handleOnboardingComplete();
  };

  const handleOnboardingComplete = async () => {
    setIsCompletingProfile(true);
    
    // Structure the data according to backend DTOs
    const finalData: OnboardingData = {
      personalInfo: formData.personalInfo,
      preferences: formData.preferences,
      companies: formData.companies,
      profile: {
        linkedinUrl: formData.profile?.linkedinUrl || '',
        githubUrl: formData.profile?.githubUrl || '',
        portfolioUrl: formData.profile?.portfolioUrl || '',
        personalWebsite: formData.profile?.personalWebsite || ''
      },
      cvData: cvParsedData ? {
        cvFilePath: formData.profile?.cvFile?.name || '',
        cvFileName: formData.profile?.cvFile?.name || '',
        cvParsedData: cvParsedData,
        cvOriginalText: originalCVText
      } : undefined,
      skills: cvParsedData?.skills ? {
        skills: [
          ...(typeof cvParsedData.skills.technical === 'string' 
            ? cvParsedData.skills.technical.split(', ').filter(Boolean) 
            : cvParsedData.skills.technical || []),
          ...(typeof cvParsedData.skills.programming === 'string' 
            ? cvParsedData.skills.programming.split(', ').filter(Boolean) 
            : cvParsedData.skills.programming || []),
          ...(typeof cvParsedData.skills.frameworks === 'string' 
            ? cvParsedData.skills.frameworks.split(', ').filter(Boolean) 
            : cvParsedData.skills.frameworks || [])
        ].filter(Boolean)
      } : { skills: [] }
    };
    
    try {
      const result = await jobSeekerProfileApiService.completeOnboarding(finalData);
      
      // Generate referral link
      setReferralLink(`https://tal-platform.com/signup?ref=${result.id}`);
      setShowReferralDialog(true);
      
      onComplete(finalData);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsCompletingProfile(false);
    }
  };

  const steps = [
    'Personal Information',
    'Job Preferences', 
    'Companies & Industries',
    'Profile & CV'
  ];

  const contractTypeOptions = [
    'Full-time',
    'Part-time',
    'Contract',
    'Freelance',
    'Internship',
    'Temporary'
  ];

  const startAvailabilityOptions = [
    'Immediately',
    'Within 2 weeks',
    'Within 1 month',
    'Within 2 months',
    'Within 3 months',
    'More than 3 months'
  ];

  const workplaceOptions = [
    'Remote',
    'On-site',
    'Hybrid',
    'Flexible'
  ];

  const salaryRangeOptions = [
    '$0 - $30,000',
    '$30,000 - $50,000',
    '$50,000 - $70,000',
    '$70,000 - $90,000',
    '$90,000 - $120,000',
    '$120,000 - $150,000',
    '$150,000 - $200,000',
    '$200,000 - $250,000',
    '$250,000+'
  ];

  const companyStageOptions = [
    'Startup (Pre-Seed)',
    'Startup (Seed)',
    'Startup (Series A)',
    'Startup (Series B+)',
    'Scale-up',
    'Established Company',
    'Enterprise',
    'Government/Public Sector',
    'Non-profit'
  ];

  const industryOptions = [
    'Technology',
    'Finance & Banking',
    'Healthcare',
    'Education',
    'Retail & E-commerce',
    'Manufacturing',
    'Media & Entertainment',
    'Consulting',
    'Real Estate',
    'Transportation',
    'Energy',
    'Government',
    'Non-profit',
    'Automotive',
    'Aerospace',
    'Telecommunications',
    'Agriculture',
    'Construction',
    'Legal',
    'Marketing & Advertising'
  ];

  const companySizeOptions = [
    '1-10 employees',
    '11-50 employees', 
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1001-5000 employees',
    '5000+ employees'
  ];

  // Step 1: Personal Information
  const PersonalInfoStep = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
      resolver: zodResolver(personalInfoSchema),
      defaultValues: formData.personalInfo || {}
    });

    const onSubmit = (data: any) => {
      setFormData(prev => ({ ...prev, personalInfo: data }));
      setCurrentStep(1);
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's get to know you</h2>
          <p className="text-gray-600">Tell us about yourself to create your professional profile</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              {...register('firstName')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              placeholder="Enter your first name"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{String(errors.firstName.message)}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              {...register('lastName')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              placeholder="Enter your last name"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{String(errors.lastName.message)}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              {...register('location')}
              type="text"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              placeholder="City, State or Country"
            />
          </div>
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{String(errors.location.message)}</p>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    );
  };

  // Step 2: Job Preferences
  const PreferencesStep = () => {
    const [selectedContracts, setSelectedContracts] = useState<string[]>(
      formData.preferences?.contractTypes || []
    );
    const [selectedWorkplace, setSelectedWorkplace] = useState<string[]>(
      formData.preferences?.workplaceSettings || []
    );
    const [startAvailability, setStartAvailability] = useState(
      formData.preferences?.startAvailability || ''
    );
    const [salaryRange, setSalaryRange] = useState(
      formData.preferences?.salaryRange || ''
    );
    const [salaryFlexible, setSalaryFlexible] = useState(
      formData.preferences?.salaryFlexible || false
    );

    const handleSubmit = () => {
      if (selectedContracts.length === 0 || !startAvailability || selectedWorkplace.length === 0 || !salaryRange) {
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        preferences: {
          contractTypes: selectedContracts,
          startAvailability,
          salaryRange,
          salaryFlexible,
          workplaceSettings: selectedWorkplace
        }
      }));
      setCurrentStep(2);
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your job preferences</h2>
          <p className="text-gray-600">Help us understand what you're looking for</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What types of contract are you interested in?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {contractTypeOptions.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSelectedContracts(prev => 
                    prev.includes(type) 
                      ? prev.filter(t => t !== type)
                      : [...prev, type]
                  );
                }}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  selectedContracts.includes(type)
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            If you receive the opportunity of a lifetime, how quickly can you start?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {startAvailabilityOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStartAvailability(option)}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  startAvailability === option
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <Clock className="h-4 w-4" />
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's your salary range?
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Select your preferred gross annual salary range.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {salaryRangeOptions.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setSalaryRange(range)}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  salaryRange === range
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <DollarSign className="h-4 w-4" />
                {range}
              </button>
            ))}
          </div>
          
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={salaryFlexible}
                onChange={(e) => setSalaryFlexible(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                I'm willing to consider offers outside this range for exceptional opportunities
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What workplace settings are you open to?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {workplaceOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setSelectedWorkplace(prev => 
                    prev.includes(option) 
                      ? prev.filter(w => w !== option)
                      : [...prev, option]
                  );
                }}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  selectedWorkplace.includes(option)
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(0)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedContracts.length === 0 || !startAvailability || selectedWorkplace.length === 0 || !salaryRange}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  // Step 3: Companies & Industries
  const CompaniesStep = () => {
    const [preferredCompanies, setPreferredCompanies] = useState<string[]>(
      formData.companies?.preferredCompanies || []
    );
    const [hiddenCompanies, setHiddenCompanies] = useState<string[]>(
      formData.companies?.hiddenCompanies || []
    );
    const [companyStages, setCompanyStages] = useState<string[]>(
      formData.companies?.companyStages || []
    );
    const [industries, setIndustries] = useState<string[]>(
      formData.companies?.industries || []
    );
    const [companySizes, setCompanySizes] = useState<string[]>(
      formData.companies?.companySizes || []
    );
    const [newPreferredCompany, setNewPreferredCompany] = useState('');
    const [newHiddenCompany, setNewHiddenCompany] = useState('');

    const addPreferredCompany = () => {
      if (newPreferredCompany.trim()) {
        setPreferredCompanies(prev => [...prev, newPreferredCompany.trim()]);
        setNewPreferredCompany('');
      }
    };

    const addHiddenCompany = () => {
      if (newHiddenCompany.trim()) {
        setHiddenCompanies(prev => [...prev, newHiddenCompany.trim()]);
        setNewHiddenCompany('');
      }
    };

    const removePreferredCompany = (company: string) => {
      setPreferredCompanies(prev => prev.filter(c => c !== company));
    };

    const removeHiddenCompany = (company: string) => {
      setHiddenCompanies(prev => prev.filter(c => c !== company));
    };

    const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
      setList(prev => 
        prev.includes(item) 
          ? prev.filter(i => i !== item)
          : [...prev, item]
      );
    };

    const handleSubmit = () => {
      setFormData(prev => ({
        ...prev,
        companies: {
          preferredCompanies,
          hiddenCompanies,
          companyStages,
          industries,
          companySizes
        }
      }));
      setCurrentStep(3);
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Companies & Industries</h2>
          <p className="text-gray-600">Tell us about your company and industry preferences</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What stage companies interest you? <span className="text-gray-500">(Optional)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {companyStageOptions.map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => toggleSelection(stage, companyStages, setCompanyStages)}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors text-left ${
                  companyStages.includes(stage)
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Which industries interest you? <span className="text-gray-500">(Optional)</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
            {industryOptions.map((industry) => (
              <button
                key={industry}
                type="button"
                onClick={() => toggleSelection(industry, industries, setIndustries)}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors text-left ${
                  industries.includes(industry)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What company sizes are you interested in? <span className="text-gray-500">(Optional)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {companySizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSelection(size, companySizes, setCompanySizes)}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  companySizes.includes(size)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Specific companies you'd like to work for <span className="text-gray-500">(Optional)</span>
          </label>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={newPreferredCompany}
                onChange={(e) => setNewPreferredCompany(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPreferredCompany())}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                placeholder="Add a company"
              />
            </div>
            <button
              onClick={addPreferredCompany}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {preferredCompanies.map((company, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {company}
                <button
                  onClick={() => removePreferredCompany(company)}
                  className="hover:text-purple-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Companies to hide your profile from <span className="text-gray-500">(Optional)</span>
          </label>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={newHiddenCompany}
                onChange={(e) => setNewHiddenCompany(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHiddenCompany())}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                placeholder="Add a company"
              />
            </div>
            <button
              onClick={addHiddenCompany}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {hiddenCompanies.map((company, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
              >
                {company}
                <button
                  onClick={() => removeHiddenCompany(company)}
                  className="hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  // Step 4: Profile & CV
  const ProfileStep = () => {
    const [cvFile, setCvFile] = useState<File | null>(formData.profile?.cvFile || null);
    const [linkedinUrl, setLinkedinUrl] = useState(formData.profile?.linkedinUrl || '');
    const [githubUrl, setGithubUrl] = useState(formData.profile?.githubUrl || '');
    const [portfolioUrl, setPortfolioUrl] = useState(formData.profile?.portfolioUrl || '');
    const [personalWebsite, setPersonalWebsite] = useState(formData.profile?.personalWebsite || '');
    const [dragActive, setDragActive] = useState(false);

    const handleCvUpload = async (file: File) => {
      setCvFile(file);
      setIsParsingCv(true);
      
      try {
        // Use the real CV processing service
        const result = await processCV(file);
        
        if (result && result.structuredData) {
          // Store the original text for display
          setOriginalCVText(result.text || '');
          
          // Transform the structured data to match our interface
          const transformedData = {
            personalInfo: {
              fullName: result.structuredData.personalInfo?.fullName || '',
              firstName: result.structuredData.personalInfo?.firstName || '',
              lastName: result.structuredData.personalInfo?.lastName || '',
              email: result.structuredData.personalInfo?.email || '',
              phone: result.structuredData.personalInfo?.phone || '',
              location: result.structuredData.personalInfo?.location || '',
              linkedIn: result.structuredData.personalInfo?.linkedIn || '',
              github: result.structuredData.personalInfo?.github || '',
              website: result.structuredData.personalInfo?.website || '',
              portfolio: result.structuredData.personalInfo?.portfolio || ''
            },
            professionalSummary: result.structuredData.professionalSummary || '',
            workExperience: result.structuredData.workExperience || [],
            education: result.structuredData.education || [],
            skills: {
              technical: Array.isArray(result.structuredData.skills?.technical) 
                ? result.structuredData.skills.technical.join(', ') 
                : result.structuredData.skills?.technical || '',
              programming: Array.isArray(result.structuredData.skills?.programming) 
                ? result.structuredData.skills.programming.join(', ') 
                : result.structuredData.skills?.programming || '',
              frameworks: Array.isArray(result.structuredData.skills?.frameworks) 
                ? result.structuredData.skills.frameworks.join(', ') 
                : result.structuredData.skills?.frameworks || '',
              soft: Array.isArray(result.structuredData.skills?.soft) 
                ? result.structuredData.skills.soft.join(', ') 
                : result.structuredData.skills?.soft || '',
              other: Array.isArray(result.structuredData.skills?.other) 
                ? result.structuredData.skills.other.join(', ') 
                : result.structuredData.skills?.other || ''
            },
            projects: result.structuredData.projects || [],
            certifications: result.structuredData.certifications || []
          };
          
          setCvParsedData(transformedData);
          setShowCVPreview(true);
        } else {
          throw new Error('No structured data received from CV processing');
        }
      } catch (error) {
        console.error('Error parsing CV:', error);
        // Show error message to user
        alert('Failed to parse CV. Please try again or upload a different file.');
      } finally {
        setIsParsingCv(false);
      }
    };

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type === 'application/pdf' || file.type.includes('word')) {
          handleCvUpload(file);
        }
      }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleCvUpload(e.target.files[0]);
      }
    };

    const removeCv = () => {
      setCvFile(null);
      setCvParsedData(null);
    };

    const handleContinue = async () => {
      // If CV is processed but not reviewed, show preview first
      if (cvParsedData && !showCVPreview) {
        setShowCVPreview(true);
        return;
      }

      const profileData = {
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        personalWebsite
      };
      
      setFormData(prev => ({
        ...prev,
        profile: profileData
      }));

      // If no CV data, complete immediately, otherwise wait for CV review
      if (!cvParsedData) {
        await handleOnboardingComplete();
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete your profile</h2>
          <p className="text-gray-600">Upload your CV and add professional links</p>
        </div>

        {/* CV Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Upload your CV/Resume
          </label>
          
          {!cvFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drag and drop your CV here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse files (PDF, DOC, DOCX)
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Choose File
              </button>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">{cvFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeCv}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* CV Processing Overlay */}
          {isParsingCv && (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
              <style>{`
                @keyframes fadeInScale {
                  0% { opacity: 0; transform: scale(0.9) translateY(20px); }
                  100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes stepFadeIn {
                  0% { opacity: 0; transform: translateY(10px); }
                  100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes dotPulse {
                  0%, 100% { opacity: 0.3; }
                  50% { opacity: 1; }
                }
                @keyframes progressGrow {
                  0% { width: 0%; }
                  100% { width: 100%; }
                }
                .modal-fade-in { animation: fadeInScale 0.5s ease-out forwards; }
                .step-0 { animation: stepFadeIn 0.6s ease-out 1s forwards; opacity: 0; }
                .step-1 { animation: stepFadeIn 0.6s ease-out 6s forwards; opacity: 0; }
                .step-2 { animation: stepFadeIn 0.6s ease-out 12s forwards; opacity: 0; }
                .step-3 { animation: stepFadeIn 0.6s ease-out 18s forwards; opacity: 0; }
                .step-4 { animation: stepFadeIn 0.6s ease-out 24s forwards; opacity: 0; }
                .dot-pulse { animation: dotPulse 1.5s ease-in-out infinite; }
                .progress-bar { animation: progressGrow 25s ease-out forwards; }
              `}</style>
              
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 modal-fade-in">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="relative inline-flex items-center justify-center mb-3">
                    <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping"></div>
                    <div className="relative bg-purple-600 rounded-full p-2">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    AI is Analyzing Your CV
                  </h2>
                  <p className="text-sm text-gray-600">
                    Extracting insights from your resume
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full progress-bar" style={{ width: '0%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-purple-600 mt-1">
                    <span>Processing...</span>
                    <span>~25 seconds</span>
                  </div>
                </div>

                {/* Processing Steps */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 step-0">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full dot-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Extracting Personal Information</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 step-1">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full dot-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Analyzing Work Experience</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 step-2">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full dot-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Identifying Skills & Technologies</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 step-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full dot-pulse" style={{ animationDelay: '1.5s' }}></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Processing Education & Certifications</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 step-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full dot-pulse" style={{ animationDelay: '2s' }}></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Generating Profile Insights</div>
                    </div>
                  </div>
                </div>

                {/* Fun Fact */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-white">
                    <span className="text-base">🚀</span>
                    <span className="font-semibold text-xs">
                      TAL users get 3x more interview invitations!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {cvError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">Error: {cvError}</p>
            </div>
          )}
        </div>

        {/* Professional Links */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Professional Links <span className="text-gray-500">(Optional)</span>
          </label>
          
          <div className="space-y-3">
            <div className="relative">
              <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                placeholder="LinkedIn profile URL"
              />
            </div>
            
            <div className="relative">
              <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                placeholder="GitHub profile URL"
              />
            </div>
            
            <div className="relative">
              <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                placeholder="Portfolio/Project URL"
              />
            </div>
            
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="url"
                value={personalWebsite}
                onChange={(e) => setPersonalWebsite(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                placeholder="Personal website URL"
              />
            </div>
          </div>
        </div>

        {/* CV Parsed Data Preview */}
        {cvParsedData && (
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">CV Parsed Successfully</h3>
              <button
                onClick={() => setShowCVPreview(true)}
                className="ml-auto px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-1"
              >
                <Edit className="h-3 w-3" />
                Edit Details
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                <p className="text-sm text-gray-600">
                  {cvParsedData.personalInfo?.fullName || 
                   `${cvParsedData.personalInfo?.firstName} ${cvParsedData.personalInfo?.lastName}`} • 
                  {cvParsedData.personalInfo?.email} • 
                  {cvParsedData.personalInfo?.location}
                </p>
              </div>
              
              {cvParsedData.professionalSummary && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                  <p className="text-sm text-gray-600 line-clamp-3">{cvParsedData.professionalSummary}</p>
                </div>
              )}
              
              {cvParsedData.skills && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {[
                      ...(cvParsedData.skills.technical || []),
                      ...(cvParsedData.skills.programming || []),
                      ...(cvParsedData.skills.frameworks || [])
                    ].slice(0, 8).map((skill: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {[
                      ...(cvParsedData.skills.technical || []),
                      ...(cvParsedData.skills.programming || []),
                      ...(cvParsedData.skills.frameworks || [])
                    ].length > 8 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{[
                          ...(cvParsedData.skills.technical || []),
                          ...(cvParsedData.skills.programming || []),
                          ...(cvParsedData.skills.frameworks || [])
                        ].length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {cvParsedData.workExperience && cvParsedData.workExperience.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Experience ({cvParsedData.workExperience.length})</h4>
                  {cvParsedData.workExperience.slice(0, 2).map((exp: any, index: number) => (
                    <div key={index} className="text-sm text-gray-600 mb-1">
                      {exp.position} at {exp.company} ({exp.startDate} - {exp.endDate || 'Present'})
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              Click "Review & Complete" to verify and edit this information before finalizing your profile.
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={isParsingCv || cvLoading || isCompletingProfile}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompletingProfile ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Completing...
              </>
            ) : (
              <>
                {cvParsedData ? 'Review & Complete' : 'Complete Profile'}
                <CheckCircle className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Referral Dialog Component
  const ReferralDialog = () => {
    const [copied, setCopied] = useState(false);

    const copyReferralLink = () => {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const handleGetStarted = () => {
      setShowReferralDialog(false);
      navigate('/jobseeker/dashboard');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Profile Complete!
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Welcome to TAL! Share your referral link with friends and earn rewards when they join.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Referral Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                />
                <button
                  onClick={copyReferralLink}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleGetStarted}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  };

  const stepComponents = [
    PersonalInfoStep,
    PreferencesStep,
    CompaniesStep,
    ProfileStep
  ];

  const CurrentStepComponent = stepComponents[currentStep];

  return (
    <>
      {showCVPreview && cvParsedData ? (
        <div className="bg-gray-50 py-8 min-h-screen">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <CVPreview
              cvData={cvParsedData}
              originalText={originalCVText}
              onSave={handleCVSave}
              onBack={handleCVBack}
              onComplete={handleCVComplete}
              isLoading={cvLoading}
            />
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 py-8 min-h-screen">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            {/* Progress indicator */}
            <div className="mb-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                  >
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        index <= currentStep
                          ? 'border-purple-600 bg-purple-600 text-white'
                          : 'border-gray-300 bg-white text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={`ml-2 text-sm font-medium ${
                        index <= currentStep ? 'text-purple-600' : 'text-gray-500'
                      }`}
                    >
                      {step}
                    </span>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 ${
                          index < currentStep ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step content */}
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-6xl mx-auto">
              <CurrentStepComponent />
            </div>
          </div>
        </div>
      )}
      
      {/* Profile Completion Loading Overlay */}
      {isCompletingProfile && !showReferralDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping"></div>
                <div className="relative bg-green-600 rounded-full p-3">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Completing Your Profile
              </h2>
              <p className="text-gray-600 mb-4">
                Saving your information and setting up your account...
              </p>
              
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Referral Dialog */}
      {showReferralDialog && <ReferralDialog />}
    </>
  );
};

export default OnboardingFlow;
