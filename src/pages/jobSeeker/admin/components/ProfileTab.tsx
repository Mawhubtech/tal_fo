import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  User, 
  Upload, 
  FileText, 
  Calendar, 
  Edit3, 
  MapPin, 
  Briefcase, 
  Target, 
  DollarSign, 
  Clock, 
  Star, 
  Building, 
  CheckCircle, 
  XCircle,
  Mail,
  Phone,
  GraduationCap,
  Award,
  Code,
  Plus,
  X,
  Save,
  Globe,
  Github,
  Linkedin,
  ExternalLink,
  Languages,
  Trophy,
  BookOpen,
  Users,
  ArrowLeft,
  ArrowRight,
  Eye
} from 'lucide-react';
import { useJobSeekerProfile } from '../../../../hooks/useJobSeekerProfile';
import {
  ProjectsSection,
  CertificationsSection,
  AwardsSection,
  LanguagesSection,
  InterestsSection,
  ReferencesSection,
  CustomFieldsSection
} from './ProfileSections';

interface ProfileTabProps {
  user: any;
}

// Define comprehensive candidate data structure
export interface CandidateFormData {
  personalInfo: {
    fullName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedIn: string;
    github: string;
    summary: string;
    currentPosition: string;
    salaryExpectation: string;
  };
  experience: Array<{
    id?: string;
    position: string;
    company: string;
    startDate: string;
    endDate?: string;
    location?: string;
    description?: string;
    responsibilities: string[];
    achievements: string[];
    technologies: string[];
  }>;
  education: Array<{
    id?: string;
    degree: string;
    institution: string;
    major?: string;
    minor?: string;
    graduationDate?: string;
    location?: string;
    gpa?: number;
    courses: string[];
    honors: string[];
    description?: string;
  }>;
  skills: Array<{
    id?: string;
    name: string;
    category: string;
    level?: string;
  }>;
  projects: Array<{
    id?: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    repositoryUrl?: string;
    startDate?: string;
    endDate?: string;
    role?: string;
    achievements: string[];
  }>;
  certifications: Array<{
    id?: string;
    name: string;
    issuer: string;
    dateIssued: string;
    expirationDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    description?: string;
  }>;
  awards: Array<{
    id?: string;
    name: string;
    issuer: string;
    date: string;
    description?: string;
    category?: string;
    recognitionLevel?: string;
  }>;
  languages: Array<{
    id?: string;
    language: string;
    proficiency: string;
    speakingLevel?: string;
    writingLevel?: string;
    readingLevel?: string;
    isNative?: boolean;
    certificationName?: string;
  }>;
  interests: Array<{
    id?: string;
    name: string;
    category: string;
    level: string;
    description?: string;
    yearsOfExperience?: number;
    achievements: string[];
    relatedSkills: string[];
  }>;
  references: Array<{
    id?: string;
    name: string;
    position: string;
    company: string;
    email: string;
    phone?: string;
    relationship: string;
    yearsKnown?: number;
  }>;
  customFields: Array<{
    id?: string;
    fieldName: string;
    fieldKey: string;
    fieldType: string;
    fieldValue: string;
    fieldDescription?: string;
  }>;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ user }) => {
  const { data: profile, isLoading, error, refetch } = useJobSeekerProfile();
  const [activeSection, setActiveSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Transform profile data to form data
  const getDefaultFormData = (): CandidateFormData => {
    const candidate = profile?.candidate;
    return {
      personalInfo: {
        fullName: candidate?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        firstName: candidate?.firstName || user?.firstName || '',
        lastName: candidate?.lastName || user?.lastName || '',
        email: candidate?.email || user?.email || '',
        phone: candidate?.phone || '',
        location: candidate?.location || '',
        website: candidate?.website || profile?.personalWebsite || '',
        linkedIn: candidate?.linkedIn || profile?.linkedinUrl || '',
        github: candidate?.github || profile?.githubUrl || '',
        summary: candidate?.summary || '',
        currentPosition: candidate?.currentPosition || '',
        salaryExpectation: candidate?.salaryExpectation || '',
      },
      experience: candidate?.experience?.map((exp: any) => ({
        id: exp.id,
        position: exp.position || '',
        company: exp.company || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        location: exp.location || '',
        description: exp.description || '',
        responsibilities: exp.responsibilities || [],
        achievements: exp.achievements || [],
        technologies: exp.technologies || [],
      })) || [],
      education: candidate?.education?.map((edu: any) => ({
        id: edu.id,
        degree: edu.degree || '',
        institution: edu.institution || '',
        major: edu.major || edu.field || '',
        minor: edu.minor || '',
        graduationDate: edu.graduationDate || edu.graduationYear?.toString() || '',
        location: edu.location || '',
        gpa: edu.gpa || undefined,
        courses: edu.courses || [],
        honors: edu.honors || [],
        description: edu.description || '',
      })) || [],
      skills: candidate?.skillMappings?.map((sm: any) => ({
        id: sm.id,
        name: sm.skill?.name || '',
        category: sm.skill?.category || 'other',
        level: sm.level || '',
      })) || [],
      projects: (candidate as any)?.projects?.map((proj: any) => ({
        id: proj.id,
        name: proj.name || '',
        description: proj.description || '',
        technologies: proj.technologies || [],
        url: proj.url || '',
        repositoryUrl: proj.repositoryUrl || '',
        startDate: proj.startDate || '',
        endDate: proj.endDate || '',
        role: proj.role || '',
        achievements: proj.achievements || [],
      })) || [],
      certifications: (candidate as any)?.certifications?.map((cert: any) => ({
        id: cert.id,
        name: cert.name || '',
        issuer: cert.issuer || '',
        dateIssued: cert.dateIssued || '',
        expirationDate: cert.expirationDate || '',
        credentialId: cert.credentialId || '',
        credentialUrl: cert.credentialUrl || '',
        description: cert.description || '',
      })) || [],
      awards: (candidate as any)?.awards?.map((award: any) => ({
        id: award.id,
        name: award.name || '',
        issuer: award.issuer || '',
        date: award.date || '',
        description: award.description || '',
        category: award.category || '',
        recognitionLevel: award.recognitionLevel || '',
      })) || [],
      languages: (candidate as any)?.languages?.map((lang: any) => ({
        id: lang.id,
        language: lang.language || '',
        proficiency: lang.proficiency || 'basic',
        speakingLevel: lang.speakingLevel || '',
        writingLevel: lang.writingLevel || '',
        readingLevel: lang.readingLevel || '',
        isNative: lang.isNative || false,
        certificationName: lang.certificationName || '',
      })) || [],
      interests: (candidate as any)?.interests?.map((interest: any) => ({
        id: interest.id,
        name: interest.name || '',
        category: interest.category || 'other',
        level: interest.level || 'casual',
        description: interest.description || '',
        yearsOfExperience: interest.yearsOfExperience || undefined,
        achievements: interest.achievements || [],
        relatedSkills: interest.relatedSkills || [],
      })) || [],
      references: (candidate as any)?.references?.map((ref: any) => ({
        id: ref.id,
        name: ref.name || '',
        position: ref.position || '',
        company: ref.company || '',
        email: ref.email || '',
        phone: ref.phone || '',
        relationship: ref.relationship || '',
        yearsKnown: ref.yearsKnown || undefined,
      })) || [],
      customFields: (candidate as any)?.customFields?.map((field: any) => ({
        id: field.id,
        fieldName: field.fieldName || '',
        fieldKey: field.fieldKey || '',
        fieldType: field.fieldType || 'text',
        fieldValue: field.fieldValue || '',
        fieldDescription: field.fieldDescription || '',
      })) || [],
    };
  };

  const { register, control, handleSubmit, watch, reset, formState: { isDirty } } = useForm<CandidateFormData>({
    defaultValues: getDefaultFormData()
  });

  // Field arrays for dynamic sections
  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: 'experience'
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: 'education'
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: 'skills'
  });

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: 'projects'
  });

  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control,
    name: 'certifications'
  });

  const { fields: awardFields, append: appendAward, remove: removeAward } = useFieldArray({
    control,
    name: 'awards'
  });

  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control,
    name: 'languages'
  });

  const { fields: interestFields, append: appendInterest, remove: removeInterest } = useFieldArray({
    control,
    name: 'interests'
  });

  const { fields: referenceFields, append: appendReference, remove: removeReference } = useFieldArray({
    control,
    name: 'references'
  });

  const { fields: customFieldFields, append: appendCustomField, remove: removeCustomField } = useFieldArray({
    control,
    name: 'customFields'
  });

  const watchedData = watch();

  useEffect(() => {
    if (profile) {
      reset(getDefaultFormData());
    }
  }, [profile, reset]);

  useEffect(() => {
    const subscription = watch(() => {
      setHasChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: CandidateFormData) => {
    setIsSaving(true);
    try {
      // Here you would implement the API call to update candidate data
      console.log('Saving candidate data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: BookOpen },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'awards', label: 'Awards', icon: Trophy },
    { id: 'languages', label: 'Languages', icon: Languages },
    { id: 'interests', label: 'Interests', icon: Star },
    { id: 'references', label: 'References', icon: Users },
    { id: 'custom', label: 'Custom Fields', icon: Edit3 }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your profile information</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-red-600">
            <p>Error loading profile data. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render section navigation
  const renderSectionNav = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScrollability = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      }
    };

    useEffect(() => {
      const container = scrollContainerRef.current;
      if (container) {
        checkScrollability();
        container.addEventListener('scroll', checkScrollability);
        window.addEventListener('resize', checkScrollability);
        
        return () => {
          container.removeEventListener('scroll', checkScrollability);
          window.removeEventListener('resize', checkScrollability);
        };
      }
    }, []);

    const scrollLeft = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      }
    };

    const scrollRight = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      }
    };

    return (
      <div className="bg-white rounded-lg shadow mb-6 relative">
        {/* Left scroll indicator */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-white to-transparent w-8 flex items-center justify-start pl-1 hover:from-gray-50"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </button>
        )}
        
        {/* Right scroll indicator */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-white to-transparent w-8 flex items-center justify-end pr-1 hover:from-gray-50"
          >
            <ArrowRight className="h-4 w-4 text-gray-600" />
          </button>
        )}

        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
          style={{ scrollbarWidth: 'thin' }}
        >
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-w-fit flex-shrink-0 ${
                  activeSection === section.id
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render personal info section
  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            {...register('personalInfo.fullName')}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              {...register('personalInfo.email')}
              disabled={!isEditing}
              type="email"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              {...register('personalInfo.phone')}
              disabled={!isEditing}
              type="tel"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              {...register('personalInfo.location')}
              disabled={!isEditing}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Position</label>
          <input
            {...register('personalInfo.currentPosition')}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
          <textarea
            {...register('personalInfo.summary')}
            disabled={!isEditing}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
      </div>

      {/* Professional Links */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Professional Links</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                {...register('personalInfo.linkedIn')}
                disabled={!isEditing}
                type="url"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
            <div className="relative">
              <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                {...register('personalInfo.github')}
                disabled={!isEditing}
                type="url"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              {...register('personalInfo.website')}
              disabled={!isEditing}
              type="url"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render experience section
  const renderExperience = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
        {isEditing && (
          <button
            type="button"
            onClick={() => appendExperience({
              position: '',
              company: '',
              startDate: '',
              endDate: '',
              location: '',
              description: '',
              responsibilities: [],
              achievements: [],
              technologies: []
            })}
            className="flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Experience
          </button>
        )}
      </div>

      {experienceFields.map((field, index) => (
        <div key={field.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Experience #{index + 1}</h4>
            {isEditing && experienceFields.length > 1 && (
              <button
                type="button"
                onClick={() => removeExperience(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input
                {...register(`experience.${index}.position`)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                {...register(`experience.${index}.company`)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                {...register(`experience.${index}.startDate`)}
                disabled={!isEditing}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                {...register(`experience.${index}.endDate`)}
                disabled={!isEditing}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                {...register(`experience.${index}.location`)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register(`experience.${index}.description`)}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>
      ))}
    </div>
  );

  // Render education section
  const renderEducation = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Education</h3>
        {isEditing && (
          <button
            type="button"
            onClick={() => appendEducation({
              degree: '',
              institution: '',
              major: '',
              minor: '',
              graduationDate: '',
              location: '',
              gpa: undefined,
              courses: [],
              honors: [],
              description: ''
            })}
            className="flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Education
          </button>
        )}
      </div>

      {educationFields.map((field, index) => (
        <div key={field.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Education #{index + 1}</h4>
            {isEditing && educationFields.length > 1 && (
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
              <input
                {...register(`education.${index}.degree`)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
              <input
                {...register(`education.${index}.institution`)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
              <input
                {...register(`education.${index}.major`)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Date</label>
              <input
                {...register(`education.${index}.graduationDate`)}
                disabled={!isEditing}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render skills section
  const renderSkills = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Skills & Expertise</h3>
        {isEditing && (
          <button
            type="button"
            onClick={() => appendSkill({
              name: '',
              category: 'technical',
              level: 'intermediate'
            })}
            className="flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Skill
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skillFields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Code className="h-4 w-4 text-purple-600 mr-2" />
                <span className="text-sm font-medium">Skill #{index + 1}</span>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Skill Name</label>
                <input
                  {...register(`skills.${index}.name`)}
                  disabled={!isEditing}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  {...register(`skills.${index}.category`)}
                  disabled={!isEditing}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                >
                  <option value="technical">Technical</option>
                  <option value="programming">Programming</option>
                  <option value="framework">Framework</option>
                  <option value="database">Database</option>
                  <option value="soft">Soft Skills</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Level</label>
                <select
                  {...register(`skills.${index}.level`)}
                  disabled={!isEditing}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Helper function to render other sections
  const renderOtherSections = () => {
    switch (activeSection) {
      case 'projects':
        return <ProjectsSection control={control} register={register} isEditing={isEditing} />;
      case 'certifications':
        return <CertificationsSection control={control} register={register} isEditing={isEditing} />;
      case 'awards':
        return <AwardsSection control={control} register={register} isEditing={isEditing} />;
      case 'languages':
        return <LanguagesSection control={control} register={register} isEditing={isEditing} />;
      case 'interests':
        return <InterestsSection control={control} register={register} isEditing={isEditing} />;
      case 'references':
        return <ReferencesSection control={control} register={register} isEditing={isEditing} />;
      case 'custom':
        return <CustomFieldsSection control={control} register={register} isEditing={isEditing} watchedData={watchedData} />;
      default:
        return null;
    }
  };

  // Render CV preview
  const renderCVPreview = () => {
    const data = watchedData;
    
    return (
      <div className="bg-white p-4 shadow rounded-lg text-sm">
        <div className="max-w-full">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {data.personalInfo?.fullName || 'Your Name'}
            </h1>
            <div className="flex items-center justify-center flex-wrap gap-2 text-xs text-gray-600 mb-2">
              {data.personalInfo?.email && (
                <div className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  {data.personalInfo.email}
                </div>
              )}
              {data.personalInfo?.phone && (
                <div className="flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  {data.personalInfo.phone}
                </div>
              )}
              {data.personalInfo?.location && (
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {data.personalInfo.location}
                </div>
              )}
            </div>
            
            {/* Professional Links */}
            <div className="flex items-center justify-center flex-wrap gap-2 text-xs">
              {data.personalInfo?.linkedIn && (
                <a href={data.personalInfo.linkedIn} className="text-blue-600 hover:text-blue-700 flex items-center">
                  <Linkedin className="h-3 w-3 mr-1" />
                  LinkedIn
                </a>
              )}
              {data.personalInfo?.github && (
                <a href={data.personalInfo.github} className="text-gray-600 hover:text-gray-700 flex items-center">
                  <Github className="h-3 w-3 mr-1" />
                  GitHub
                </a>
              )}
              {data.personalInfo?.website && (
                <a href={data.personalInfo.website} className="text-purple-600 hover:text-purple-700 flex items-center">
                  <Globe className="h-3 w-3 mr-1" />
                  Website
                </a>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {data.personalInfo?.summary && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                Professional Summary
              </h2>
              <p className="text-xs text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Work Experience
              </h2>
              <div className="space-y-3">
                {data.experience.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{exp.position}</h3>
                        <p className="text-xs text-purple-600 font-medium">{exp.company}</p>
                      </div>
                      <div className="text-right text-xs text-gray-600">
                        <p>{exp.startDate} - {exp.endDate || 'Present'}</p>
                        {exp.location && <p>{exp.location}</p>}
                      </div>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-gray-700 mb-1">{exp.description}</p>
                    )}
                    {exp.responsibilities && exp.responsibilities.length > 0 && (
                      <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5 ml-2">
                        {exp.responsibilities.slice(0, 3).map((resp, respIndex) => (
                          <li key={respIndex}>{resp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Education
              </h2>
              <div className="space-y-2">
                {data.education.map((edu, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{edu.degree}</h3>
                        <p className="text-xs text-purple-600">{edu.institution}</p>
                        {edu.major && <p className="text-xs text-gray-600">{edu.major}</p>}
                      </div>
                      <div className="text-right text-xs text-gray-600">
                        {edu.graduationDate && <p>{edu.graduationDate}</p>}
                        {edu.gpa && <p>GPA: {edu.gpa}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Skills & Expertise
              </h2>
              <div className="flex flex-wrap gap-1">
                {data.skills.slice(0, 12).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700"
                  >
                    {skill.name}
                    {skill.level && (
                      <span className="ml-1 text-purple-600">({skill.level})</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Projects
              </h2>
              <div className="space-y-3">
                {data.projects.slice(0, 3).map((project, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
                        {project.role && <p className="text-xs text-purple-600">{project.role}</p>}
                      </div>
                      <div className="text-right text-xs text-gray-600">
                        {project.startDate && (
                          <p>{project.startDate} - {project.endDate || 'Present'}</p>
                        )}
                      </div>
                    </div>
                    {project.description && (
                      <p className="text-xs text-gray-700 mb-1">{project.description}</p>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {project.technologies.slice(0, 5).map((tech, techIndex) => (
                          <span key={techIndex} className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {data.certifications && data.certifications.length > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Certifications
              </h2>
              <div className="space-y-2">
                {data.certifications.slice(0, 4).map((cert, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{cert.name}</h3>
                        <p className="text-xs text-purple-600">{cert.issuer}</p>
                      </div>
                      <div className="text-right text-xs text-gray-600">
                        {cert.dateIssued && <p>{cert.dateIssued}</p>}
                        {cert.expirationDate && <p>Expires: {cert.expirationDate}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Languages
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {data.languages.slice(0, 6).map((lang, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-xs font-medium text-gray-900">{lang.language}</span>
                    <span className="text-xs text-gray-600 capitalize">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awards */}
          {data.awards && data.awards.length > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Awards & Recognition
              </h2>
              <div className="space-y-2">
                {data.awards.slice(0, 3).map((award, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{award.name}</h3>
                        <p className="text-xs text-purple-600">{award.issuer}</p>
                      </div>
                      <div className="text-right text-xs text-gray-600">
                        {award.date && <p>{award.date}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {data.interests && data.interests.length > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Interests
              </h2>
              <div className="flex flex-wrap gap-1">
                {data.interests.slice(0, 8).map((interest, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {interest.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Custom scrollbar for profile tabs */
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background-color: #f3f4f6;
        }
        .hover\\:scrollbar-thumb-gray-400:hover::-webkit-scrollbar-thumb {
          background-color: #9ca3af;
        }
        
        /* Ensure scrollbar is always visible on mobile */
        @media (max-width: 768px) {
          .scrollbar-thin::-webkit-scrollbar {
            height: 8px;
          }
          .scrollbar-thin {
            scrollbar-width: auto;
          }
        }
      `}</style>
      <div className="w-full">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your complete professional profile</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setHasChanges(false);
                    reset();
                  }}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSaving}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className={`${showPreview ? 'grid grid-cols-12 gap-6' : 'space-y-6'}`}>
        {/* Profile Form */}
        <div className={showPreview ? 'col-span-7' : 'w-full'}>
          {renderSectionNav()}

          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              {activeSection === 'personal' && renderPersonalInfo()}
              {activeSection === 'experience' && renderExperience()}
              {activeSection === 'education' && renderEducation()}
              {activeSection === 'skills' && renderSkills()}
              {['projects', 'certifications', 'awards', 'languages', 'interests', 'references', 'custom'].includes(activeSection) && renderOtherSections()}
            </form>
          </div>
        </div>

        {/* CV Preview */}
        {showPreview && (
          <div className="col-span-5">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Live CV Preview
              </h3>
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto bg-white rounded shadow-sm">
                {renderCVPreview()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Job Preferences Summary (for compatibility) */}
      {profile && !showPreview && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Briefcase className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">Contract Types</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.contractTypes?.map((type: string, index: number) => (
                  <span key={index} className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                    {type}
                  </span>
                )) || <span className="text-gray-500">Not specified</span>}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">Start Availability</span>
              </div>
              <p className="text-gray-700">{profile.startAvailability || 'Not specified'}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">Salary Range</span>
              </div>
              <p className="text-gray-700">
                {(profile as any).salaryRange || (profile as any).targetSalary ? `$${Number((profile as any).targetSalary).toLocaleString()}` : 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default ProfileTab;
