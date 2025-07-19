import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Eye,
  Download
} from 'lucide-react';
import { useJobSeekerProfile, useUpdateComprehensiveProfile } from '../../../../hooks/useJobSeekerProfile';
import jsPDF from 'jspdf';
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
  const updateProfile = useUpdateComprehensiveProfile();
  const [activeSection, setActiveSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Hooks for scrollable navigation
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Transform profile data to form data - memoized to prevent recreation on every render
  const getDefaultFormData = useMemo((): CandidateFormData => {
    const candidate = profile?.candidate;
    
    // Helper function to ensure array fields
    const ensureArray = (value: any): any[] => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
      return [];
    };
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
        responsibilities: ensureArray(exp.responsibilities),
        achievements: ensureArray(exp.achievements),
        technologies: ensureArray(exp.technologies),
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
        courses: ensureArray(edu.courses),
        honors: ensureArray(edu.honors),
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
        technologies: ensureArray(proj.technologies),
        url: proj.url || '',
        repositoryUrl: proj.repositoryUrl || '',
        startDate: proj.startDate || '',
        endDate: proj.endDate || '',
        role: proj.role || '',
        achievements: ensureArray(proj.achievements),
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
        achievements: ensureArray(interest.achievements),
        relatedSkills: ensureArray(interest.relatedSkills),
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
  }, [profile, user]); // Dependencies for useMemo

  const { register, control, handleSubmit, watch, reset, formState: { isDirty } } = useForm<CandidateFormData>({
    defaultValues: getDefaultFormData
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

  // Functions for scrollable navigation - memoized to prevent re-creation
  const checkScrollability = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (profile) {
      reset(getDefaultFormData);
    }
  }, [profile, reset, getDefaultFormData]);

  // Optimized change detection - only watch for changes when editing
  useEffect(() => {
    if (!isEditing) return;
    
    const subscription = watch(() => {
      setHasChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [watch, isEditing]);

  // Effect for scroll detection
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

  const onSubmit = useCallback(async (data: CandidateFormData) => {
    setIsSaving(true);
    try {
      console.log('Saving candidate data:', data);
      
      // Call the comprehensive update API
      await updateProfile.mutateAsync({
        personalInfo: data.personalInfo,
        experience: data.experience,
        education: data.education,
        skills: data.skills,
        projects: data.projects,
        certifications: data.certifications,
        awards: data.awards,
        languages: data.languages,
        interests: data.interests,
        references: data.references,
        customFields: data.customFields,
      });
      
      setHasChanges(false);
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error('Error saving profile:', error);
      // You could add a toast notification here
      alert('Error saving profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [updateProfile, refetch]);

  // Download CV as PDF
  const downloadPDF = useCallback(async () => {
    setIsDownloading(true);
    try {
      const data = watchedData;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Set up fonts and spacing
      let yPosition = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      
      // Helper function to add text with automatic line wrapping
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, indent: number = 0) => {
        if (!text) return yPosition;
        
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = pdf.splitTextToSize(text, contentWidth - indent);
        lines.forEach((line: string) => {
          if (yPosition > 270) { // Near bottom of page
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, margin + indent, yPosition);
          yPosition += fontSize * 0.5; // Line spacing
        });
        return yPosition;
      };
      
      // Helper function to add section header
      const addSectionHeader = (title: string) => {
        yPosition += 5; // Extra space before section
        addText(title, 14, true);
        yPosition += 3; // Space after header
        
        // Add underline
        pdf.setDrawColor(150, 150, 150);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      };
      
      // Header - Name and Contact Info
      addText(data.personalInfo?.fullName || 'Professional CV', 18, true);
      yPosition += 5;
      
      // Contact information
      const contactInfo = [];
      if (data.personalInfo?.email) contactInfo.push(`Email: ${data.personalInfo.email}`);
      if (data.personalInfo?.phone) contactInfo.push(`Phone: ${data.personalInfo.phone}`);
      if (data.personalInfo?.location) contactInfo.push(`Location: ${data.personalInfo.location}`);
      
      if (contactInfo.length > 0) {
        addText(contactInfo.join(' | '), 10);
        yPosition += 3;
      }
      
      // Professional links
      const professionalLinks = [];
      if (data.personalInfo?.linkedIn) professionalLinks.push(`LinkedIn: ${data.personalInfo.linkedIn}`);
      if (data.personalInfo?.github) professionalLinks.push(`GitHub: ${data.personalInfo.github}`);
      if (data.personalInfo?.website) professionalLinks.push(`Website: ${data.personalInfo.website}`);
      
      if (professionalLinks.length > 0) {
        addText(professionalLinks.join(' | '), 10);
        yPosition += 3;
      }
      
      // Professional Summary
      if (data.personalInfo?.summary) {
        addSectionHeader('PROFESSIONAL SUMMARY');
        addText(data.personalInfo.summary, 10);
        yPosition += 5;
      }
      
      // Work Experience
      if (data.experience && data.experience.length > 0) {
        addSectionHeader('WORK EXPERIENCE');
        
        data.experience.forEach((exp, index) => {
          // Job title and company
          const jobHeader = `${exp.position || 'Position'} at ${exp.company || 'Company'}`;
          addText(jobHeader, 12, true);
          
          // Date and location
          const dateLocation = [];
          if (exp.startDate) {
            const endDate = exp.endDate || 'Present';
            dateLocation.push(`${exp.startDate} - ${endDate}`);
          }
          if (exp.location) dateLocation.push(exp.location);
          
          if (dateLocation.length > 0) {
            addText(dateLocation.join(' | '), 10);
          }
          
          // Description
          if (exp.description) {
            yPosition += 2;
            addText(exp.description, 10);
          }
          
          // Responsibilities
          if (exp.responsibilities && Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0) {
            yPosition += 2;
            exp.responsibilities.forEach((resp: string) => {
              addText(`• ${resp}`, 10, false, 5);
            });
          }
          
          // Achievements
          if (exp.achievements && Array.isArray(exp.achievements) && exp.achievements.length > 0) {
            yPosition += 2;
            addText('Key Achievements:', 10, true, 5);
            exp.achievements.forEach((achievement: string) => {
              addText(`• ${achievement}`, 10, false, 5);
            });
          }
          
          // Technologies
          if (exp.technologies && Array.isArray(exp.technologies) && exp.technologies.length > 0) {
            yPosition += 2;
            addText(`Technologies: ${exp.technologies.join(', ')}`, 10, false, 5);
          }
          
          yPosition += 5; // Space between jobs
        });
      }
      
      // Education
      if (data.education && data.education.length > 0) {
        addSectionHeader('EDUCATION');
        
        data.education.forEach((edu) => {
          const eduHeader = `${edu.degree || 'Degree'} - ${edu.institution || 'Institution'}`;
          addText(eduHeader, 12, true);
          
          const eduDetails = [];
          if (edu.major) eduDetails.push(`Major: ${edu.major}`);
          if (edu.graduationDate) eduDetails.push(`Graduated: ${edu.graduationDate}`);
          if (edu.gpa) eduDetails.push(`GPA: ${edu.gpa}`);
          
          if (eduDetails.length > 0) {
            addText(eduDetails.join(' | '), 10);
          }
          
          if (edu.description) {
            yPosition += 2;
            addText(edu.description, 10);
          }
          
          yPosition += 3;
        });
      }
      
      // Skills
      if (data.skills && data.skills.length > 0) {
        addSectionHeader('SKILLS & EXPERTISE');
        
        // Group skills by category
        const skillsByCategory: { [key: string]: string[] } = {};
        data.skills.forEach((skill) => {
          const category = skill.category || 'Other';
          if (!skillsByCategory[category]) {
            skillsByCategory[category] = [];
          }
          const skillText = skill.level ? `${skill.name} (${skill.level})` : skill.name;
          skillsByCategory[category].push(skillText);
        });
        
        Object.entries(skillsByCategory).forEach(([category, skills]) => {
          addText(`${category.charAt(0).toUpperCase() + category.slice(1)}:`, 11, true);
          addText(skills.join(', '), 10, false, 5);
          yPosition += 3;
        });
      }
      
      // Projects
      if (data.projects && data.projects.length > 0) {
        addSectionHeader('PROJECTS');
        
        data.projects.slice(0, 5).forEach((project) => { // Limit to 5 projects for space
          addText(project.name || 'Project', 12, true);
          
          if (project.role) {
            addText(`Role: ${project.role}`, 10);
          }
          
          const projectDates = [];
          if (project.startDate) {
            const endDate = project.endDate || 'Present';
            projectDates.push(`${project.startDate} - ${endDate}`);
          }
          if (projectDates.length > 0) {
            addText(projectDates.join(' | '), 10);
          }
          
          if (project.description) {
            yPosition += 2;
            addText(project.description, 10);
          }
          
          if (project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0) {
            yPosition += 2;
            addText(`Technologies: ${project.technologies.join(', ')}`, 10);
          }
          
          if (project.url) {
            addText(`URL: ${project.url}`, 10);
          }
          
          yPosition += 4;
        });
      }
      
      // Certifications
      if (data.certifications && data.certifications.length > 0) {
        addSectionHeader('CERTIFICATIONS');
        
        data.certifications.forEach((cert) => {
          const certHeader = `${cert.name || 'Certification'} - ${cert.issuer || 'Issuer'}`;
          addText(certHeader, 11, true);
          
          const certDetails = [];
          if (cert.dateIssued) certDetails.push(`Issued: ${cert.dateIssued}`);
          if (cert.expirationDate) certDetails.push(`Expires: ${cert.expirationDate}`);
          if (cert.credentialId) certDetails.push(`ID: ${cert.credentialId}`);
          
          if (certDetails.length > 0) {
            addText(certDetails.join(' | '), 10);
          }
          
          if (cert.credentialUrl) {
            addText(`Verification: ${cert.credentialUrl}`, 10);
          }
          
          yPosition += 3;
        });
      }
      
      // Languages
      if (data.languages && data.languages.length > 0) {
        addSectionHeader('LANGUAGES');
        
        const languageList = data.languages.map((lang) => 
          `${lang.language} (${lang.proficiency || 'Basic'})`
        );
        addText(languageList.join(', '), 10);
        yPosition += 3;
      }
      
      // Awards
      if (data.awards && data.awards.length > 0) {
        addSectionHeader('AWARDS & RECOGNITION');
        
        data.awards.forEach((award) => {
          const awardHeader = `${award.name || 'Award'} - ${award.issuer || 'Issuer'}`;
          addText(awardHeader, 11, true);
          
          if (award.date) {
            addText(`Date: ${award.date}`, 10);
          }
          
          if (award.description) {
            addText(award.description, 10);
          }
          
          yPosition += 3;
        });
      }
      
      // Interests
      if (data.interests && data.interests.length > 0) {
        addSectionHeader('INTERESTS');
        
        const interestList = data.interests.map((interest) => interest.name).join(', ');
        addText(interestList, 10);
        yPosition += 3;
      }
      
      // References
      if (data.references && data.references.length > 0) {
        addSectionHeader('REFERENCES');
        
        data.references.forEach((ref) => {
          const refHeader = `${ref.name || 'Reference'} - ${ref.position || 'Position'}`;
          addText(refHeader, 11, true);
          
          const refDetails = [];
          if (ref.company) refDetails.push(ref.company);
          if (ref.email) refDetails.push(ref.email);
          if (ref.phone) refDetails.push(ref.phone);
          
          if (refDetails.length > 0) {
            addText(refDetails.join(' | '), 10);
          }
          
          if (ref.relationship) {
            addText(`Relationship: ${ref.relationship}`, 10);
          }
          
          yPosition += 4;
        });
      }
      
      // Generate filename with candidate name and date
      const candidateName = data.personalInfo?.fullName || 'CV';
      const date = new Date().toISOString().split('T')[0];
      const filename = `${candidateName.replace(/\s+/g, '_')}_CV_${date}.pdf`;
      
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [watchedData]);

  // Memoized sections array to prevent recreation
  const sections = useMemo(() => [
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
  ], []);

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

  // Helper function to render other sections - memoized to prevent unnecessary re-renders
  const renderOtherSections = useMemo(() => {
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
  }, [activeSection, control, register, isEditing, watchedData]);

  // Render CV preview - memoized to prevent expensive re-renders
  const renderCVPreview = useMemo(() => {
    if (!showPreview) return null;
    
    const data = watchedData;
    
    // Helper function to ensure technologies is always an array
    const getTechnologiesArray = (technologies: any): string[] => {
      if (Array.isArray(technologies)) {
        return technologies;
      }
      if (typeof technologies === 'string') {
        return technologies.split(',').map(t => t.trim()).filter(t => t.length > 0);
      }
      return [];
    };

    // Helper function to ensure any field is always an array
    const getArrayValue = (value: any): any[] => {
      if (Array.isArray(value)) {
        return value;
      }
      if (typeof value === 'string') {
        return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
      }
      return [];
    };
    
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
            <div className="flex items-center justify-center flex-wrap gap-3 text-xs">
              {data.personalInfo?.linkedIn && (
                <div className="flex items-center text-blue-600">
                  <Linkedin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="break-all">{data.personalInfo.linkedIn}</span>
                </div>
              )}
              {data.personalInfo?.github && (
                <div className="flex items-center text-gray-700">
                  <Github className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="break-all">{data.personalInfo.github}</span>
                </div>
              )}
              {data.personalInfo?.website && (
                <div className="flex items-center text-purple-600">
                  <Globe className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="break-all">{data.personalInfo.website}</span>
                </div>
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
                    {exp.responsibilities && getArrayValue(exp.responsibilities).length > 0 && (
                      <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5 ml-2">
                        {getArrayValue(exp.responsibilities).slice(0, 3).map((resp, respIndex) => (
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
                    {project.technologies && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {getTechnologiesArray(project.technologies).slice(0, 5).map((tech, techIndex) => (
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

          {/* References */}
          {data.references && data.references.length > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                References
              </h2>
              <div className="space-y-2">
                {data.references.slice(0, 3).map((ref, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{ref.name}</h3>
                        <p className="text-xs text-purple-600">{ref.position} at {ref.company}</p>
                        <p className="text-xs text-gray-600">{ref.relationship}</p>
                      </div>
                      <div className="text-right text-xs text-gray-600">
                        <p>{ref.email}</p>
                        {ref.phone && <p>{ref.phone}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Fields */}
          {data.customFields && data.customFields.length > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Additional Information
              </h2>
              <div className="space-y-2">
                {data.customFields.map((field, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-gray-900">{field.fieldName}:</span>
                      <span className="text-xs text-gray-700 ml-2 flex-1 text-right">
                        {field.fieldType === 'url' ? (
                          <a href={field.fieldValue} className="text-purple-600 hover:text-purple-700">
                            {field.fieldValue}
                          </a>
                        ) : (
                          field.fieldValue
                        )}
                      </span>
                    </div>
                    {field.fieldDescription && (
                      <p className="text-xs text-gray-600 mt-1">{field.fieldDescription}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }, [showPreview, watchedData]); // Dependencies for renderCVPreview memoization

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
            {!showPreview && (
              <button
                onClick={downloadPDF}
                disabled={isDownloading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? 'Generating...' : 'Download PDF'}
              </button>
            )}
            {showPreview && (
              <button
                onClick={downloadPDF}
                disabled={isDownloading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? 'Generating...' : 'Download PDF'}
              </button>
            )}
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
              {['projects', 'certifications', 'awards', 'languages', 'interests', 'references', 'custom'].includes(activeSection) && renderOtherSections}
            </form>
          </div>
        </div>

        {/* CV Preview */}
        {showPreview && (
          <div className="col-span-5">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Live CV Preview
                </h3>
                <button
                  onClick={downloadPDF}
                  disabled={isDownloading}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Download className="h-4 w-4 mr-1" />
                  {isDownloading ? 'Generating...' : 'Download PDF'}
                </button>
              </div>
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto bg-white rounded shadow-sm">
                {renderCVPreview}
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

export default React.memo(ProfileTab);
