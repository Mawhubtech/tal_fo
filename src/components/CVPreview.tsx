import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Code,
  Plus,
  X,
  Save,
  Edit3,
  Calendar,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  ArrowLeft
} from 'lucide-react';

interface CVPreviewData {
  personalInfo: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    github?: string;
    website?: string;
    portfolio?: string;
  };
  professionalSummary?: string;
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    location?: string;
    responsibilities?: string[];
    description?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    graduationDate?: string;
    gpa?: string;
  }>;
  skills: {
    technical?: string;
    programming?: string;
    frameworks?: string;
    soft?: string;
    other?: string;
  };
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

interface CVPreviewProps {
  cvData: CVPreviewData;
  originalText: string;
  onSave: (data: CVPreviewData) => void;
  onComplete: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

const CVPreview: React.FC<CVPreviewProps> = ({ 
  cvData, 
  originalText, 
  onSave, 
  onComplete, 
  onBack,
  isLoading = false 
}) => {
  const [activeSection, setActiveSection] = useState('personal');
  const [hasChanges, setHasChanges] = useState(false);

  const { register, control, handleSubmit, watch, reset } = useForm({
    defaultValues: cvData
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience
  } = useFieldArray({
    control,
    name: 'workExperience'
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation
  } = useFieldArray({
    control,
    name: 'education'
  });

  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject
  } = useFieldArray({
    control,
    name: 'projects'
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification
  } = useFieldArray({
    control,
    name: 'certifications'
  });

  const watchedData = watch();

  useEffect(() => {
    const subscription = watch(() => {
      setHasChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = (data: CVPreviewData) => {
    onSave(data);
    setHasChanges(false);
  };

  const handleComplete = () => {
    if (hasChanges) {
      handleSubmit(onSubmit)();
    }
    onComplete();
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: Award },
    { id: 'certifications', label: 'Certifications', icon: Award }
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            {...register('personalInfo.firstName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            {...register('personalInfo.lastName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              {...register('personalInfo.email')}
              type="email"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              {...register('personalInfo.phone')}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            {...register('personalInfo.location')}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
          <div className="relative">
            <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              {...register('personalInfo.linkedIn')}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
          <div className="relative">
            <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              {...register('personalInfo.github')}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              {...register('personalInfo.website')}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
          <div className="relative">
            <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              {...register('personalInfo.portfolio')}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h3>
      <textarea
        {...register('professionalSummary')}
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
        placeholder="Enter your professional summary..."
      />
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
        <button
          type="button"
          onClick={() => appendExperience({
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            location: '',
            responsibilities: [],
            description: ''
          })}
          className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Experience
        </button>
      </div>

      {experienceFields.map((field, index) => (
        <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-900">Experience {index + 1}</h4>
            <button
              type="button"
              onClick={() => removeExperience(index)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                {...register(`workExperience.${index}.company`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input
                {...register(`workExperience.${index}.position`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                {...register(`workExperience.${index}.startDate`)}
                type="month"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                {...register(`workExperience.${index}.endDate`)}
                type="month"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                placeholder="Present"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                {...register(`workExperience.${index}.location`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register(`workExperience.${index}.description`)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              placeholder="Describe your role and achievements..."
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Education</h3>
        <button
          type="button"
          onClick={() => appendEducation({
            institution: '',
            degree: '',
            field: '',
            graduationDate: '',
            gpa: ''
          })}
          className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Education
        </button>
      </div>

      {educationFields.map((field, index) => (
        <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
            <button
              type="button"
              onClick={() => removeEducation(index)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
              <input
                {...register(`education.${index}.institution`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
              <input
                {...register(`education.${index}.degree`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
              <input
                {...register(`education.${index}.field`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Date</label>
              <input
                {...register(`education.${index}.graduationDate`)}
                type="month"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
              <input
                {...register(`education.${index}.gpa`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                placeholder="Optional"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills</label>
          <input
            {...register('skills.technical')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            placeholder="Comma-separated skills (e.g., JavaScript, Python, React)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Programming Languages</label>
          <input
            {...register('skills.programming')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            placeholder="Comma-separated languages"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Frameworks & Libraries</label>
          <input
            {...register('skills.frameworks')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            placeholder="Comma-separated frameworks"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Soft Skills</label>
          <input
            {...register('skills.soft')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            placeholder="Comma-separated soft skills"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Other Skills</label>
          <input
            {...register('skills.other')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            placeholder="Comma-separated other skills"
          />
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
        <button
          type="button"
          onClick={() => appendProject({
            name: '',
            description: '',
            technologies: [],
            url: ''
          })}
          className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </button>
      </div>

      {projectFields.map((field, index) => (
        <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-900">Project {index + 1}</h4>
            <button
              type="button"
              onClick={() => removeProject(index)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                {...register(`projects.${index}.name`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
              <input
                {...register(`projects.${index}.url`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register(`projects.${index}.description`)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
            <input
              {...register(`projects.${index}.technologies`)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              placeholder="Comma-separated technologies"
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderCertifications = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
        <button
          type="button"
          onClick={() => appendCertification({
            name: '',
            issuer: '',
            date: ''
          })}
          className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Certification
        </button>
      </div>

      {certificationFields.map((field, index) => (
        <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-900">Certification {index + 1}</h4>
            <button
              type="button"
              onClick={() => removeCertification(index)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
              <input
                {...register(`certifications.${index}.name`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
              <input
                {...register(`certifications.${index}.issuer`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Obtained</label>
            <input
              {...register(`certifications.${index}.date`)}
              type="month"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'personal': return renderPersonalInfo();
      case 'summary': return renderSummary();
      case 'experience': return renderExperience();
      case 'education': return renderEducation();
      case 'skills': return renderSkills();
      case 'projects': return renderProjects();
      case 'certifications': return renderCertifications();
      default: return renderPersonalInfo();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Complete Button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Form
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Review & Edit Your CV</h1>
              <p className="text-gray-600">Verify and edit the information extracted from your CV</p>
            </div>
          </div>
          <div className="flex gap-3">
            {hasChanges && (
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            )}
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              Complete Profile
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Sidebar - Editable Fields */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
          {/* Section Navigation */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              {sections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      activeSection === section.id
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              {renderContent()}
            </form>
          </div>
        </div>

        {/* Right Side - Live CV Preview */}
        <div className="w-1/2 bg-gray-50 overflow-y-auto">
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Live CV Preview</h3>
              </div>
              
              {/* Live Preview Content */}
              <div className="space-y-6">
                {/* Header Section with Name and Contact */}
                <div className="text-center border-b border-gray-200 pb-6 mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {watchedData.personalInfo?.firstName && watchedData.personalInfo?.lastName 
                      ? `${watchedData.personalInfo.firstName} ${watchedData.personalInfo.lastName}`
                      : watchedData.personalInfo?.fullName || 'Your Name'
                    }
                  </h1>
                  
                  {/* Contact Information */}
                  <div className="flex flex-wrap justify-center gap-4 text-gray-600 mb-4">
                    {watchedData.personalInfo?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{watchedData.personalInfo.email}</span>
                      </div>
                    )}
                    {watchedData.personalInfo?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{watchedData.personalInfo.phone}</span>
                      </div>
                    )}
                    {watchedData.personalInfo?.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{watchedData.personalInfo.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Professional Links */}
                  {(watchedData.personalInfo?.linkedIn || watchedData.personalInfo?.github || watchedData.personalInfo?.website || watchedData.personalInfo?.portfolio) && (
                    <div className="flex flex-wrap justify-center gap-4">
                      {watchedData.personalInfo?.linkedIn && (
                        <a href={watchedData.personalInfo.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </a>
                      )}
                      {watchedData.personalInfo?.github && (
                        <a href={watchedData.personalInfo.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline flex items-center gap-1">
                          <Github className="h-4 w-4" />
                          GitHub
                        </a>
                      )}
                      {watchedData.personalInfo?.website && (
                        <a href={watchedData.personalInfo.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          Website
                        </a>
                      )}
                      {watchedData.personalInfo?.portfolio && (
                        <a href={watchedData.personalInfo.portfolio} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline flex items-center gap-1">
                          <ExternalLink className="h-4 w-4" />
                          Portfolio
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Professional Summary */}
                {watchedData.professionalSummary && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Summary</h3>
                    <p className="text-gray-700 leading-relaxed">{watchedData.professionalSummary}</p>
                  </div>
                )}

                {/* Work Experience */}
                {watchedData.workExperience && watchedData.workExperience.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Work Experience</h3>
                    <div className="space-y-4">
                      {watchedData.workExperience.map((exp: any, index: number) => (
                        <div key={index} className="border-l-2 border-purple-200 pl-4">
                          <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                          <p className="text-purple-600 font-medium">{exp.company}</p>
                          <p className="text-sm text-gray-600">
                            {exp.startDate} - {exp.endDate || 'Present'}
                            {exp.location && ` • ${exp.location}`}
                          </p>
                          {exp.description && (
                            <p className="text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {watchedData.education && watchedData.education.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
                    <div className="space-y-3">
                      {watchedData.education.map((edu: any, index: number) => (
                        <div key={index} className="border-l-2 border-blue-200 pl-4">
                          <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                          <p className="text-blue-600 font-medium">{edu.institution}</p>
                          <p className="text-sm text-gray-600">
                            {edu.field && `${edu.field} • `}
                            {edu.graduationDate}
                            {edu.gpa && ` • GPA: ${edu.gpa}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {watchedData.skills && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                    <div className="space-y-2">
                      {watchedData.skills.technical && (
                        <div>
                          <span className="font-medium text-gray-700">Technical: </span>
                          <span className="text-gray-600">{watchedData.skills.technical}</span>
                        </div>
                      )}
                      {watchedData.skills.programming && (
                        <div>
                          <span className="font-medium text-gray-700">Programming: </span>
                          <span className="text-gray-600">{watchedData.skills.programming}</span>
                        </div>
                      )}
                      {watchedData.skills.frameworks && (
                        <div>
                          <span className="font-medium text-gray-700">Frameworks: </span>
                          <span className="text-gray-600">{watchedData.skills.frameworks}</span>
                        </div>
                      )}
                      {watchedData.skills.soft && (
                        <div>
                          <span className="font-medium text-gray-700">Soft Skills: </span>
                          <span className="text-gray-600">{watchedData.skills.soft}</span>
                        </div>
                      )}
                      {watchedData.skills.other && (
                        <div>
                          <span className="font-medium text-gray-700">Other: </span>
                          <span className="text-gray-600">{watchedData.skills.other}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {watchedData.projects && watchedData.projects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Projects</h3>
                    <div className="space-y-3">
                      {watchedData.projects.map((project: any, index: number) => (
                        <div key={index} className="border-l-2 border-green-200 pl-4">
                          <h4 className="font-semibold text-gray-900">{project.name}</h4>
                          {project.description && (
                            <p className="text-gray-700 mt-1">{project.description}</p>
                          )}
                          {project.technologies && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Technologies: </span>
                              {Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies}
                            </p>
                          )}
                          {project.url && (
                            <a href={project.url} className="text-green-600 hover:underline text-sm flex items-center gap-1 mt-1">
                              <ExternalLink className="h-3 w-3" />
                              View Project
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {watchedData.certifications && watchedData.certifications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Certifications</h3>
                    <div className="space-y-3">
                      {watchedData.certifications.map((cert: any, index: number) => (
                        <div key={index} className="border-l-2 border-yellow-200 pl-4">
                          <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                          <p className="text-yellow-600 font-medium">{cert.issuer}</p>
                          <p className="text-sm text-gray-600">{cert.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Original CV Text (collapsed by default) */}
                {originalText && (
                  <div className="border-t border-gray-200 pt-4">
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        View Original CV Text
                      </summary>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                          {originalText}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVPreview;
