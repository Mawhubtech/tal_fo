import React, { useState, useEffect } from 'react';
import { X, Github, Plus, Briefcase, FolderOpen, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, FileText, Clock, GraduationCap, Zap, Globe, Smartphone, BarChart, Cpu, Code2, ExternalLink, ArrowRight, Award, FileBadge2, Heart, Mail, Phone, Languages, Send, MessageCircle, User, Calendar, Save, Edit3, Trash2, AlertCircle, CheckCircle2, XCircle, Eye, MapPin, DollarSign, Building, Star, TrendingUp, Target, Settings, CheckCircle, Loader2 } from 'lucide-react'; // Ensure these icons are installed
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './ProfileSidePanel.css';
import Button from './Button'; // Adjust path to your Button component if necessary
import ConfirmationModal from './ConfirmationModal';
import { candidateNotesApiService, CandidateNote } from '../services/candidateNotesApiService';
import { emailApiService, SendCandidateEmailDto, EmailLogEntry, EmailHistoryResponse } from '../services/emailApiService';
import { jobApiService } from '../services/jobApiService';
import { pipelineService, Pipeline } from '../services/pipelineService';
import { useJobApplicationsByCandidate } from '../hooks/useJobApplications';
import { useJobSuggestions } from '../hooks/useJobs';
import { useSourcingProspects } from '../hooks/useSourcingProspects';
import { useToast } from '../contexts/ToastContext';
// Assuming ProfilePage.tsx is in the same directory or adjust path accordingly
// to import UserStructuredData and other related types.
// Define interfaces for type safety - ADD 'export' HERE
export interface PersonalInfo {
  fullName: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedIn?: string;
  github?: string;
  facebook?: string;
  twitter?: string;
  avatar?: string;
}

export interface Experience {
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
  responsibilities?: string[];
  achievements?: string[];
  technologies?: string[];
  metadata?: {
    // Job classification
    department?: string;
    managementLevel?: string;
    duration?: string;
    durationMonths?: number;
    
    // Company details
    companyId?: number;
    companySize?: number;
    companySizeRange?: string;
    companyIndustry?: string;
    companyType?: string;
    companyWebsite?: string;
    companyFounded?: number;
    companyFollowersCount?: number;
    
    // Company location
    companyLocationHq?: {
      fullAddress?: string;
      country?: string;
      regions?: string[];
    };
    
    // Company financials
    companyAnnualRevenue?: number;
    companyAnnualRevenueCurrency?: string;
    companyEmployeesCountChangeYearlyPercentage?: number;
    
    // Company social media
    companyLinkedinUrl?: string;
    companyFacebookUrl?: string[];
    companyTwitterUrl?: string[];
    
    // Company focus areas
    companyCategoriesAndKeywords?: string[];
    
    // Data source info
    source?: string;
    enrichedAt?: string;
  };
}

export interface Education {
  degree: string;
  institution: string;
  institutionName?: string; // Original institution name when URL is prioritized
  institutionUrl?: string; // Institution URL from CoreSignal
  startDate?: string;
  endDate?: string;
  graduationDate?: string;
  location?: string;
  description?: string;
  major?: string;
  courses?: string[];
  honors?: string[];
}

export interface Project {
  name: string;
  date?: string;
  description?: string;
  technologies?: string[];
  url?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  dateIssued: string;
  expirationDate?: string;
}

export interface Award {
  name: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface Language {
  language: string;
  proficiency: string;
  speakingLevel?: string;
  writingLevel?: string;
  readingLevel?: string;
  isNative?: boolean;
  certificationName?: string;
  certificationScore?: string;
  certificationDate?: string;
}

export interface Reference {
  name: string;
  position: string;
  company: string;
  email: string;
  phone?: string;
  referenceType?: string;
  status?: string;
  relationship?: string;
  yearsKnown?: number;
  notes?: string;
  feedback?: string;
}

export interface Skill {
  id: number;
  name: string;
  category?: string;
  level?: string;
  description?: string;
  yearsOfExperience?: number;
  achievements?: string[];
  relatedSkills?: string[];
  isActive?: boolean;
  isProfessionallyRelevant?: boolean;
  createdAt?: string;
  updatedAt?: string;
  candidateId?: number;
}

export interface Interest {
  id: string;
  name: string;
  category?: string;
  level?: string;
  description?: string | null;
  yearsOfExperience?: number | null;
  achievements?: string[];
  relatedSkills?: string[];
  isActive?: boolean;
  isProfessionallyRelevant?: boolean;
  createdAt?: string;
  updatedAt?: string;
  candidateId?: string;
}

export interface CustomField {
  fieldName: string;
  fieldKey: string;
  fieldType: string;
  fieldValue: string | null;
  fieldDescription?: string;
  isActive?: boolean;
  isRequired?: boolean;
}

export interface UserStructuredData {
  personalInfo: PersonalInfo;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: (string | Skill)[];
  projects?: Project[];
  certifications?: Certification[];
  awards?: Award[];
  interests?: (string | Interest)[];
  languages?: Language[];
  references?: Reference[];
  customFields?: CustomField[];
}

export interface UserData { // If UserData is also needed elsewhere
  fileName: string;
  fileSize: number;
  extractedText: string;
  structuredData: UserStructuredData;
}

export type PanelState = 'closed' | 'collapsed' | 'expanded';

interface ProfileSidePanelProps {
  userData: UserStructuredData | null;
  panelState: PanelState;
  onStateChange: (state: PanelState) => void;
  isLoading?: boolean;
  candidateId?: string; // Add candidateId prop for API calls
  onShortlist?: () => void; // Add shortlist handler prop
  isShortlisting?: boolean; // Add shortlisting state prop
}

const ProfileSidePanel: React.FC<ProfileSidePanelProps> = ({ userData, panelState, onStateChange, isLoading = false, candidateId, onShortlist, isShortlisting = false }) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState(0); // For main profile tabs
  const [activeSideTab, setActiveSideTab] = useState(0); // For side panel tabs - default to Communication tab
  const [isCandidateActionsCollapsed, setIsCandidateActionsCollapsed] = useState(true); // For collapsing candidate actions - default to collapsed
  
  // Email composition state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isComposingEmail, setIsComposingEmail] = useState(false);
  
  // Notes state
  const [notes, setNotes] = useState<CandidateNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  
  // Email history state
  const [emailHistory, setEmailHistory] = useState<EmailLogEntry[]>([]);
  const [isLoadingEmailHistory, setIsLoadingEmailHistory] = useState(false);
  const [emailHistoryPage, setEmailHistoryPage] = useState(1);
  const [emailHistoryTotal, setEmailHistoryTotal] = useState(0);
  
  // Email view modal state
  const [selectedEmailForView, setSelectedEmailForView] = useState<EmailLogEntry | null>(null);
  const [isEmailViewModalOpen, setIsEmailViewModalOpen] = useState(false);
  
  // Pipeline and job matches state - now using real backend data hooks
  const [isLoadingPipelines, setIsLoadingPipelines] = useState(false);
  const [isLoadingSuggestedJobs, setIsLoadingSuggestedJobs] = useState(false);
  
  // Real backend data hooks
  const { data: jobApplicationsData, isLoading: applicationsLoading } = useJobApplicationsByCandidate(candidateId || '');
  const { data: jobSuggestionsData, isLoading: jobsLoading } = useJobSuggestions(
    candidateId || '',
    undefined, // Not filtering by organization for now
    { enabled: !!candidateId }
  );
  const { data: prospectsData, isLoading: prospectsLoading } = useSourcingProspects({
    search: userData?.personalInfo?.email || ''
  });
  
  // Confirmation modal state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // Refs for auto-scroll tab switching
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const sectionRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // Load notes when component mounts or candidateId changes
  useEffect(() => {
    if (candidateId && panelState !== 'closed') {
      loadNotes();
      loadEmailHistory();
    }
  }, [candidateId, panelState]);

  // Compute profile tabs (before early return for loading state)
  const sortedExperience = React.useMemo(() => {
    return userData?.experience?.slice().sort((a, b) => {
      const aEndDate = a.endDate ? new Date(a.endDate) : new Date();
      const bEndDate = b.endDate ? new Date(b.endDate) : new Date();
      if (aEndDate.getTime() !== bEndDate.getTime()) {
        return bEndDate.getTime() - aEndDate.getTime();
      }
      const aStartDate = new Date(a.startDate);
      const bStartDate = new Date(b.startDate);
      return bStartDate.getTime() - aStartDate.getTime();
    });
  }, [userData?.experience]);

  const allProfileTabs = React.useMemo(() => [
    { name: 'Experience', icon: Briefcase, index: 0, count: sortedExperience?.length || 0, data: sortedExperience },
    { name: 'Education', icon: GraduationCap, index: 1, count: userData?.education?.length || 0, data: userData?.education },
    { name: 'Skills', icon: Zap, index: 2, count: userData?.skills?.length || 0, data: userData?.skills },
    { name: 'Projects', icon: FolderOpen, index: 3, count: userData?.projects?.length || 0, data: userData?.projects },
    { name: 'Certifications', icon: FileBadge2, index: 4, count: userData?.certifications?.length || 0, data: userData?.certifications },
    { name: 'Awards', icon: Award, index: 5, count: userData?.awards?.length || 0, data: userData?.awards },
    { name: 'Languages', icon: Languages, index: 6, count: userData?.languages?.length || 0, data: userData?.languages },
    { name: 'Interests', icon: Heart, index: 7, count: userData?.interests?.length || 0, data: userData?.interests },
    { name: 'References', icon: Mail, index: 8, count: userData?.references?.length || 0, data: userData?.references },
    { name: 'Custom Fields', icon: FileText, index: 9, count: userData?.customFields?.length || 0, data: userData?.customFields },
  ], [userData, sortedExperience]);

  const profileTabs = React.useMemo(() => 
    allProfileTabs
      .filter(tab => tab.count > 0)
      .map((tab, index) => ({ ...tab, originalIndex: tab.index, index })),
    [allProfileTabs]
  );

  // Reset active tab if current tab is out of bounds
  useEffect(() => {
    if (activeTab >= profileTabs.length && profileTabs.length > 0) {
      setActiveTab(0);
    }
  }, [profileTabs.length, activeTab]);

  // Auto-switch tabs based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || profileTabs.length === 0) return;
      
      const scrollContainer = scrollContainerRef.current;
      const scrollTop = scrollContainer.scrollTop;
      const containerHeight = scrollContainer.clientHeight;
      
      // Find which section is most visible
      let newActiveTab = 0;
      let maxVisibility = 0;
      
      sectionRefs.current.forEach((section, index) => {
        if (section && index < profileTabs.length) {
          const rect = section.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          
          const sectionTop = rect.top - containerRect.top;
          const sectionBottom = rect.bottom - containerRect.top;
          
          // Calculate how much of the section is visible
          const visibleTop = Math.max(0, sectionTop);
          const visibleBottom = Math.min(containerHeight, sectionBottom);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          const sectionHeight = rect.height;
          
          const visibility = sectionHeight > 0 ? visibleHeight / sectionHeight : 0;
          
          if (visibility > maxVisibility && visibility > 0.3) { // 30% threshold
            maxVisibility = visibility;
            newActiveTab = index;
          }
        }
      });
      
      setActiveTab(newActiveTab);
    };
    
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [profileTabs.length]);

  const loadNotes = async () => {
    if (!candidateId) return;
    
    try {
      setIsLoadingNotes(true);
      const response = await candidateNotesApiService.getNotes(candidateId);
      setNotes(response.notes);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const saveNote = async (content: string) => {
    if (!candidateId || !content.trim()) return;

    try {
      const newNote = await candidateNotesApiService.createNote(candidateId, {
        candidateId,
        content: content.trim(),
        isPrivate: false,
        isImportant: false
      });
      setNotes([newNote, ...notes]);
      setNewNote('');
      addToast({
        type: 'success',
        title: 'Note Saved',
        message: 'Your note has been saved successfully.',
        duration: 3000
      });
    } catch (error) {
      console.error('Failed to save note:', error);
      addToast({
        type: 'error',
        title: 'Failed to Save Note',
        message: 'Please try again or check your connection.',
        duration: 4000
      });
    }
  };

  const updateNote = async (noteId: string, content: string) => {
    if (!candidateId || !content.trim()) return;

    try {
      const updatedNote = await candidateNotesApiService.updateNote(candidateId, noteId, {
        content: content.trim()
      });
      setNotes(notes.map(n => n.id === noteId ? updatedNote : n));
      setEditingNoteId(null);
      setEditingNoteContent('');
      addToast({
        type: 'success',
        title: 'Note Updated',
        message: 'Your note has been updated successfully.',
        duration: 3000
      });
    } catch (error) {
      console.error('Failed to update note:', error);
      addToast({
        type: 'error',
        title: 'Failed to Update Note',
        message: 'Please try again or check your connection.',
        duration: 4000
      });
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!candidateId) return;

    try {
      await candidateNotesApiService.deleteNote(candidateId, noteId);
      setNotes(notes.filter(n => n.id !== noteId));
      addToast({
        type: 'success',
        title: 'Note Deleted',
        message: 'The note has been deleted successfully.',
        duration: 3000
      });
    } catch (error) {
      console.error('Failed to delete note:', error);
      addToast({
        type: 'error',
        title: 'Failed to Delete Note',
        message: 'Please try again or check your connection.',
        duration: 4000
      });
    }
  };

  // Email history functions
  const loadEmailHistory = async () => {
    if (!candidateId) return;
    
    try {
      setIsLoadingEmailHistory(true);
      const response = await emailApiService.getCandidateEmailHistory(candidateId, {
        page: emailHistoryPage,
        limit: 10
      });
      setEmailHistory(response.emails);
      setEmailHistoryTotal(response.total);
    } catch (error) {
      console.error('Failed to load email history:', error);
      // Don't show error toast for missing endpoint, as it's expected during development
    } finally {
      setIsLoadingEmailHistory(false);
    }
  };

  // Pipeline functions
  const getProspectStatus = () => {
    const prospects = prospectsData?.prospects || [];
    return {
      isInPipeline: prospects.length > 0,
      currentStage: prospects[0]?.currentStage?.name,
      pipelineName: prospects[0]?.pipeline?.name,
      lastActivity: prospects[0]?.lastContact || prospects[0]?.updatedAt,
      status: prospects[0]?.status
    };
  };

  // Format salary display for job suggestions
  const formatSalary = (suggestion: any) => {
    const job = suggestion.job;
    if (!job.salaryMin && !job.salaryMax) return null;
    const currency = job.currency || 'USD';
    const symbol = currency === 'USD' ? '$' : currency;
    
    if (job.salaryMin && job.salaryMax) {
      return `${symbol}${(job.salaryMin / 1000).toFixed(0)}k - ${symbol}${(job.salaryMax / 1000).toFixed(0)}k`;
    } else if (job.salaryMin) {
      return `From ${symbol}${(job.salaryMin / 1000).toFixed(0)}k`;
    } else if (job.salaryMax) {
      return `Up to ${symbol}${(job.salaryMax / 1000).toFixed(0)}k`;
    }
    return null;
  };

  // Get match score color
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const formatEmailStatus = (status: string) => {
    switch (status) {
      case 'sent':
        return { color: 'text-green-600', icon: CheckCircle2 };
      case 'failed':
        return { color: 'text-red-600', icon: XCircle };
      case 'pending':
        return { color: 'text-yellow-600', icon: Clock };
      case 'delivered':
        return { color: 'text-blue-600', icon: CheckCircle2 };
      default:
        return { color: 'text-gray-600', icon: AlertCircle };
    }
  };

  // Confirmation modal handlers
  const handleDeleteNoteClick = (noteId: string) => {
    setNoteToDelete(noteId);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (noteToDelete) {
      await deleteNote(noteToDelete);
      setNoteToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setNoteToDelete(null);
  };

  const sendEmail = async (emailData: { to: string; subject: string; body: string; candidateName: string }) => {
    try {
      if (!candidateId) {
        throw new Error('Candidate ID is required to send email');
      }

      const emailRequest: SendCandidateEmailDto = {
        candidateId,
        to: emailData.to,
        subject: emailData.subject,
        body: emailData.body,
        htmlBody: emailData.body, // For now, use the same content for HTML
      };

      await emailApiService.sendCandidateEmail(emailRequest);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      // Fallback to opening email client if API fails
      const subject = encodeURIComponent(emailData.subject);
      const body = encodeURIComponent(emailData.body.replace(/<[^>]*>/g, '')); // Strip HTML for mailto
      window.open(`mailto:${emailData.to}?subject=${subject}&body=${body}`, '_self');
      throw error;
    }
  };
  
  if (panelState === 'closed') {
    return null;
  }

  // Show loading state when data is being fetched
  if (isLoading || !userData) {
    return (
      <div className={`fixed top-0 right-0 h-full bg-white shadow-xl z-50 transition-all duration-300 ease-in-out ${
        panelState === 'expanded' ? 'w-2/3' : panelState === 'collapsed' ? 'w-1/3' : 'w-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header with loading state */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div>
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex space-x-2">
              {panelState === 'expanded' && (
                <button
                  onClick={() => onStateChange('collapsed')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Collapse panel"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              )}
              {panelState === 'collapsed' && (
                <button
                  onClick={() => onStateChange('expanded')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Expand panel"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <button
                onClick={() => onStateChange('closed')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Close panel"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Loading content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Personal info loading skeleton */}
              <div className="space-y-4">
                <div className="w-24 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-3">
                  <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Summary loading skeleton */}
              <div className="space-y-4">
                <div className="w-20 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Experience loading skeleton */}
              <div className="space-y-4">
                <div className="w-28 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-1/3 h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="w-full h-3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-4/5 h-3 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills loading skeleton */}
              <div className="space-y-4">
                <div className="w-16 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { personalInfo, summary, experience, education, skills, projects, certifications, awards, interests, languages, references, customFields } = userData;

  // Helper function to parse and normalize dates for sorting
  const parseDate = (dateStr: string | undefined): Date => {
    if (!dateStr) return new Date(0); // Very old date for missing dates
    
    // Handle "Present" or similar current indicators
    if (dateStr.toLowerCase().includes('present') || dateStr.toLowerCase().includes('current')) {
      return new Date(); // Current date
    }
    
    // Try to parse various date formats
    // Handle formats like "2023", "2023-05", "May 2023", "2023-05-15", etc.
    let parsedDate: Date;
    
    // If it's just a year (4 digits)
    if (/^\d{4}$/.test(dateStr)) {
      parsedDate = new Date(parseInt(dateStr), 11, 31); // December 31st of that year
    }
    // If it's year-month format (YYYY-MM)
    else if (/^\d{4}-\d{2}$/.test(dateStr)) {
      const [year, month] = dateStr.split('-');
      parsedDate = new Date(parseInt(year), parseInt(month) - 1, 1); // First day of the month
    }
    // If it's a full ISO date (YYYY-MM-DD)
    else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      parsedDate = new Date(dateStr);
    }
    // Try parsing other formats like "May 2023"
    else {
      parsedDate = new Date(dateStr);
    }
    
    // If parsing failed, return a very old date
    if (isNaN(parsedDate.getTime())) {
      return new Date(0);
    }
    
    return parsedDate;
  };

  // Helper function to format date for display (Month YYYY)
  const formatDateForDisplay = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    
    if (dateStr.toLowerCase().includes('present') || dateStr.toLowerCase().includes('current')) {
      return 'Present';
    }
    
    const date = parseDate(dateStr);
    if (date.getTime() === 0) return dateStr; // Return original if parsing failed
    
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Sorting is now done in useMemo hooks above (before early return)

  // Helper function to sort education chronologically (most recent first)
  const sortedEducation = education?.slice().sort((a, b) => {
    // Determine the end date for each education entry
    const getEndDate = (edu: Education) => {
      if (edu.endDate) return parseDate(edu.endDate);
      if (edu.graduationDate) return parseDate(edu.graduationDate);
      return new Date(); // Current date for ongoing education
    };
    
    const aEndDate = getEndDate(a);
    const bEndDate = getEndDate(b);
    
    // Sort by end date descending (most recent first)
    if (aEndDate.getTime() !== bEndDate.getTime()) {
      return bEndDate.getTime() - aEndDate.getTime();
    }
    
    // If end dates are the same, sort by start date descending
    const aStartDate = parseDate(a.startDate);
    const bStartDate = parseDate(b.startDate);
    return bStartDate.getTime() - aStartDate.getTime();
  });

  // Main profile tabs for the 2/3 section
  // (Now computed earlier with useMemo before the early return)

  // Side panel tabs for the 1/3 section (candidate management)
  const sideTabs = [
    { name: 'Activity', icon: Clock, index: 0, count: 0 },
    { name: 'Communication', icon: Mail, index: 1, count: 0 },
    { name: 'Notes', icon: FileText, index: 2, count: notes.length },
    { name: 'Pipeline', icon: Briefcase, index: 3, count: (jobApplicationsData?.applications?.length || 0) + (jobSuggestionsData?.suggestions?.length || 0) },
  ];  // Collapsed state - show only the 2/3 profile section (1/3 of total page width)
  if (panelState === 'collapsed') {
    return (
      <div className="fixed inset-y-0 right-0 w-1/3 bg-white shadow-2xl z-50 flex">
        {/* Profile Info Section - Full width in collapsed view */}
        <div className="flex-1 w-full flex flex-col">
          {/* Panel Header - Sticky */}
          <div className="sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                {personalInfo.avatar ? (
                  <img 
                    src={personalInfo.avatar} 
                    alt={personalInfo.fullName}
                    className="h-8 w-8 rounded-full mr-3 flex-shrink-0 object-cover"
                  />
                ) : (
                  <div className="bg-purple-100 rounded-full h-8 w-8 flex items-center justify-center text-purple-600 text-sm font-semibold mr-3 flex-shrink-0">
                    {personalInfo.fullName.charAt(0)}
                  </div>
                )}
                <h3 className="text-md font-semibold text-gray-800">{personalInfo.fullName}</h3>
              </div>
              <div className="flex items-center">
                {onShortlist && (
                  <Button
                    variant="primary"
                    onClick={onShortlist}
                    disabled={isShortlisting}
                    className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:border-purple-700 disabled:bg-gray-400 disabled:border-gray-400 flex items-center text-xs p-2 rounded-md mr-2"
                    aria-label="Shortlist Candidate"
                  >
                    {isShortlisting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => onStateChange('expanded')}
                  className="text-gray-500 hover:text-gray-700 p-2"
                  aria-label="Expand Panel"
                >
                  <ChevronLeft size={20} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => onStateChange('closed')}
                  className="text-gray-500 hover:text-gray-700 p-2 ml-1"
                  aria-label="Close Panel"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Basic Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-start">
              {personalInfo.avatar ? (
                <img 
                  src={personalInfo.avatar} 
                  alt={personalInfo.fullName}
                  className="h-10 w-10 rounded-full mr-3 flex-shrink-0 object-cover"
                />
              ) : (
                <div className="bg-purple-100 rounded-full h-10 w-10 flex items-center justify-center text-purple-600 text-lg font-semibold mr-3 flex-shrink-0">
                  {personalInfo.fullName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 truncate">{personalInfo.fullName}</h2>
                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                  <span className="truncate">{personalInfo.location}</span>
                  {personalInfo.github && (
                    <>
                      <span className="mx-1">·</span>
                      <a
                        href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-purple-600 flex items-center"
                        title="GitHub Profile"
                      >
                        <Github size={14} />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Contact Information - Compact */}
            <div className="mt-3 space-y-2">
              {personalInfo.email && (
                <div className="flex items-center text-xs">
                  <Mail className="w-3 h-3 text-gray-400 mr-1.5 flex-shrink-0" />
                  <a 
                    href={`mailto:${personalInfo.email}`}
                    className="text-gray-700 hover:text-purple-600 transition-colors truncate"
                  >
                    {personalInfo.email}
                  </a>
                </div>
              )}
              
              {personalInfo.phone && (
                <div className="flex items-center text-xs">
                  <Phone className="w-3 h-3 text-gray-400 mr-1.5 flex-shrink-0" />
                  <a 
                    href={`tel:${personalInfo.phone}`}
                    className="text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    {personalInfo.phone}
                  </a>
                </div>
              )}
              
              {personalInfo.linkedIn && (
                <div className="flex items-center text-xs">
                  <a 
                    href={personalInfo.linkedIn.startsWith('http') ? personalInfo.linkedIn : `https://${personalInfo.linkedIn}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                    title="View LinkedIn Profile"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                </div>
              )}
              
              {personalInfo.website && personalInfo.website.trim() && (
                <div className="flex items-center text-xs">
                  <ExternalLink className="w-3 h-3 text-gray-400 mr-1.5 flex-shrink-0" />
                  <a 
                    href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-purple-600 transition-colors truncate"
                  >
                    {personalInfo.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* AI-Powered Spotlight - Fixed, non-scrolling */}
          {summary && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">AI-Powered Spotlight</h3>
              <p className="text-xs text-gray-700 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Scrollable Content Area with Tabs */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto flex flex-col relative">
            {/* Tabs Navigation - Sticky */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
              <nav className="flex px-4 overflow-x-auto" aria-label="Tabs" style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: '#e5e7eb #f9fafb'
              }}>
                {profileTabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => {
                      setActiveTab(tab.index);
                      // Scroll to the section using scrollIntoView
                      setTimeout(() => {
                        const sectionElement = sectionRefs.current[tab.index];
                        if (sectionElement) {
                          sectionElement.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start',
                            inline: 'nearest'
                          });
                        }
                      }, 50);
                    }}
                    className={`${
                      activeTab === tab.index
                        ? 'border-purple-600 text-purple-700 font-semibold'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-2 border-b-2 text-xs flex items-center gap-1 mr-3 flex-shrink-0`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.name}
                    {tab.count > 0 && (
                      <span className={`${
                        activeTab === tab.index ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      } py-0.5 px-1 rounded-full text-xs font-medium`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content - All sections rendered with bottom padding for floating action bar */}
            <div className="flex-1 p-4 pb-24">
              {/* Experience Tab */}
              {profileTabs.some(tab => tab.originalIndex === 0) && (
                <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 0)] = el)} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-purple-600" />
                    Experience
                  </h3>
                  {sortedExperience && sortedExperience.length > 0 ? (
                    <div className="space-y-3">
                      {sortedExperience.map((exp, index) => (
                        <div key={index} className="bg-white rounded border border-gray-100 p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-1">
                              <div className="mr-2 mt-0.5">
                                <Briefcase className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 text-xs">{exp.position}</h4>
                                
                                {/* Company with social media links */}
                                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                  <p className="text-xs text-gray-600">{exp.company}</p>
                                  {exp.metadata && (exp.metadata.companyWebsite || exp.metadata.companyLinkedinUrl || exp.metadata.companyFacebookUrl || exp.metadata.companyTwitterUrl) && (
                                    <div className="flex items-center gap-0.5">
                                      {exp.metadata.companyWebsite && (
                                        <a
                                          href={exp.metadata.companyWebsite.startsWith('http') ? exp.metadata.companyWebsite : `https://${exp.metadata.companyWebsite}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-gray-600 hover:text-purple-600"
                                          title="Company Website"
                                        >
                                          <Globe className="h-3 w-3" />
                                        </a>
                                      )}
                                      {exp.metadata.companyLinkedinUrl && (
                                        <a
                                          href={exp.metadata.companyLinkedinUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800"
                                          title="LinkedIn"
                                        >
                                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                                          </svg>
                                        </a>
                                      )}
                                      {exp.metadata.companyFacebookUrl && exp.metadata.companyFacebookUrl.length > 0 && (
                                        <a
                                          href={exp.metadata.companyFacebookUrl[0]}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-500 hover:text-blue-700"
                                          title="Facebook"
                                        >
                                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                          </svg>
                                        </a>
                                      )}
                                      {exp.metadata.companyTwitterUrl && exp.metadata.companyTwitterUrl.length > 0 && (
                                        <a
                                          href={exp.metadata.companyTwitterUrl[0]}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sky-500 hover:text-sky-700"
                                          title="Twitter"
                                        >
                                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                          </svg>
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Compact company metadata */}
                                <div className="flex items-center gap-1.5 flex-wrap mt-1 text-xs text-gray-500">
                                  {exp.location && <span>📍 {exp.location}</span>}
                                  {exp.metadata?.companyIndustry && <span>• {exp.metadata.companyIndustry}</span>}
                                  {exp.metadata?.companySizeRange && <span>• 👥 {exp.metadata.companySizeRange}</span>}
                                  {exp.metadata?.companyLocationHq?.fullAddress && <span>• 🏢 {exp.metadata.companyLocationHq.fullAddress}</span>}
                                </div>
                                
                                {/* Department and management level badges */}
                                {exp.metadata && (exp.metadata.department || exp.metadata.managementLevel) && (
                                  <div className="flex items-center gap-1 flex-wrap mt-1.5">
                                    {exp.metadata.department && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">
                                        {exp.metadata.department}
                                      </span>
                                    )}
                                    {exp.metadata.managementLevel && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-50 text-purple-700 border border-purple-200">
                                        {exp.metadata.managementLevel}
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                {/* Company financials and growth - compact inline */}
                                {exp.metadata && (exp.metadata.companyAnnualRevenue || exp.metadata.companyEmployeesCountChangeYearlyPercentage) && (
                                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5 text-xs">
                                    {exp.metadata.companyAnnualRevenue && (
                                      <span className="text-gray-600">
                                        💰 {exp.metadata.companyAnnualRevenueCurrency} {exp.metadata.companyAnnualRevenue.toLocaleString()}
                                      </span>
                                    )}
                                    {exp.metadata.companyEmployeesCountChangeYearlyPercentage !== undefined && (
                                      <span className={`font-medium ${exp.metadata.companyEmployeesCountChangeYearlyPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        📈 {exp.metadata.companyEmployeesCountChangeYearlyPercentage > 0 ? '+' : ''}
                                        {exp.metadata.companyEmployeesCountChangeYearlyPercentage.toFixed(1)}% YoY
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                {/* Keywords inline - Show all keywords */}
                                {exp.metadata?.companyCategoriesAndKeywords && exp.metadata.companyCategoriesAndKeywords.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {exp.metadata.companyCategoriesAndKeywords.map((keyword, i) => (
                                      <span key={i} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 text-right whitespace-nowrap pl-2">
                              {formatDateForDisplay(exp.startDate)} - {formatDateForDisplay(exp.endDate) || 'Present'}
                              {exp.metadata?.duration && (
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {exp.metadata.duration}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Only show description if it's NOT auto-generated from metadata (for backward compatibility with manually added experiences) */}
                          {exp.description && !exp.metadata?.source && (
                            <p className="mt-1.5 text-xs text-gray-700 leading-relaxed">{exp.description}</p>
                          )}
                          
                          {exp.responsibilities && exp.responsibilities.length > 0 && (
                            <div className="mt-1.5">
                              <h5 className="text-xs font-medium text-gray-700 mb-0.5">Responsibilities:</h5>
                              <ul className="list-disc list-inside pl-1.5 space-y-0.5">
                                {exp.responsibilities.map((resp, i) => (
                                  <li key={i} className="text-xs text-gray-600">{resp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {exp.achievements && exp.achievements.length > 0 && (
                            <div className="mt-1.5">
                              <h5 className="text-xs font-medium text-gray-700 mb-0.5">Achievements:</h5>
                              <ul className="list-disc list-inside pl-1.5 space-y-0.5">
                                {exp.achievements.map((ach, i) => (
                                  <li key={i} className="text-xs text-gray-600">{ach}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {exp.technologies && exp.technologies.length > 0 && (
                            <div className="mt-1.5">
                              <h5 className="text-xs font-medium text-gray-700 mb-0.5">Technologies:</h5>
                              <div className="flex flex-wrap gap-1">
                                {exp.technologies.map((tech, i) => (
                                  <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No experience information</p>
                  )}
                </div>
              )}

              {/* Education Tab */}
              {profileTabs.some(tab => tab.originalIndex === 1) && (
                <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 1)] = el)} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-purple-600" />
                    Education
                  </h3>
                  {sortedEducation && sortedEducation.length > 0 ? (
                    <div className="space-y-3">
                      {sortedEducation.map((edu, index) => (
                        <div key={index} className="bg-white rounded border border-gray-100 p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-1">
                              <div className="mr-2 mt-0.5">
                                <GraduationCap className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 text-xs">{edu.degree}</h4>
                                <p className="text-xs text-gray-600">{edu.institution}</p>
                                {edu.location && <p className="text-xs text-gray-500 mt-0.5">{edu.location}</p>}
                                {edu.major && <p className="text-xs text-gray-600 mt-0.5">Major: {edu.major}</p>}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 text-right whitespace-nowrap pl-2">
                              {edu.startDate && edu.endDate ? `${formatDateForDisplay(edu.startDate)} - ${formatDateForDisplay(edu.endDate)}` : 
                               edu.graduationDate ? formatDateForDisplay(edu.graduationDate) :
                               edu.startDate ? `${formatDateForDisplay(edu.startDate)} - Present` : ''}
                            </div>
                          </div>
                          {edu.description && <p className="mt-1.5 text-xs text-gray-700 leading-relaxed">{edu.description}</p>}
                          
                          {edu.courses && edu.courses.length > 0 && (
                            <div className="mt-1.5">
                              <h5 className="text-xs font-medium mb-0.5">Relevant Courses:</h5>
                              <div className="flex flex-wrap gap-1">
                                {edu.courses.map((course, i) => (
                                  <span key={i} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                    {course}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {edu.honors && edu.honors.length > 0 && (
                            <div className="mt-1.5">
                              <h5 className="text-xs font-medium mb-0.5">Honors & Awards:</h5>
                              <ul className="list-disc list-inside pl-1.5 space-y-0.5">
                                {edu.honors.map((honor, i) => (
                                  <li key={i} className="text-xs text-gray-600">{honor}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No education information</p>
                  )}
                </div>
              )}

              {/* Skills Tab */}
              {profileTabs.some(tab => tab.originalIndex === 2) && (
                <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 2)] = el)} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-purple-600" />
                    Skills
                  </h3>
                  {skills && skills.length > 0 ? (
                    <div className="bg-white rounded border border-gray-100 p-3">
                      <div className="flex items-center mb-2">
                        <Zap className="h-3.5 w-3.5 text-yellow-500 mr-1.5" />
                        <h4 className="text-xs font-medium text-gray-800">Professional Skills</h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center">
                            <Zap className="h-2.5 w-2.5 mr-1 text-purple-600" />
                            {typeof skill === 'string' ? skill : skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No skills information</p>
                  )}
                </div>
              )}

              {/* Projects Tab */}
              {profileTabs.some(tab => tab.originalIndex === 3) && (
                <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 3)] = el)} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
                    <FolderOpen className="h-4 w-4 text-purple-600" />
                    Projects
                  </h3>
                  {projects && projects.length > 0 ? (
                    <div className="space-y-3">
                      {projects.map((project, index) => (
                        <div key={index} className="bg-white rounded border border-gray-100 p-3">
                          <div className="flex items-start">
                            <div className="mr-2 mt-0.5">
                              {project.name.toLowerCase().includes('web') ? (
                                <Globe className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                              ) : project.name.toLowerCase().includes('mobile') || project.name.toLowerCase().includes('app') ? (
                                <Smartphone className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
                              ) : project.name.toLowerCase().includes('data') || project.name.toLowerCase().includes('analytics') ? (
                                <BarChart className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                              ) : project.name.toLowerCase().includes('ai') || project.name.toLowerCase().includes('ml') ? (
                                <Cpu className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                              ) : (
                                <Code2 className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-xs">{project.name}</h4>
                              {project.date && <div className="text-xs text-gray-500 mt-0.5">{project.date}</div>}
                              {project.description && (
                                <p className="text-xs text-gray-700 mt-1 leading-relaxed">{project.description}</p>
                              )}
                              {project.technologies && project.technologies.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {project.technologies.map((tech, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs flex items-center">
                                      <span className="w-1 h-1 bg-green-700 rounded-full mr-1"></span>
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {project.url && (
                                <div className="mt-1.5">
                                  <a 
                                    href={project.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-purple-600 hover:text-purple-800 text-xs flex items-center gap-0.5"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    <span>View Project</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No projects information</p>
                  )}
                </div>
              )}

              {/* Certifications Tab */}
              {profileTabs.some(tab => tab.originalIndex === 4) && (
                <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 4)] = el)} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
                    <FileBadge2 className="h-4 w-4 text-purple-600" />
                    Certifications
                  </h3>
                  {certifications && certifications.length > 0 ? (
                    <div className="space-y-3">
                      {certifications.map((cert, index) => (
                        <div key={index} className="bg-white rounded border border-gray-100 p-3">
                          <div className="flex items-start">
                            <div className="mr-2 mt-0.5">
                              <FileBadge2 className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-xs">{cert.name}</h4>
                              <p className="text-xs text-gray-600">{cert.issuer}</p>
                              <div className="text-xs text-gray-500 mt-0.5">
                                Issued: {new Date(cert.dateIssued).toLocaleDateString()}
                                {cert.expirationDate && (
                                  <span> • Expires: {new Date(cert.expirationDate).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No certifications</p>
                  )}
                </div>
              )}

              {/* Awards Tab */}
              {profileTabs.some(tab => tab.originalIndex === 5) && (
                <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 5)] = el)} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-purple-600" />
                    Awards
                  </h3>
                  {awards && awards.length > 0 ? (
                    <div className="space-y-3">
                      {awards.map((award, index) => (
                        <div key={index} className="bg-white rounded border border-gray-100 p-3">
                          <div className="flex items-start">
                            <div className="mr-2 mt-0.5">
                              <Award className="h-3.5 w-3.5 text-yellow-600 flex-shrink-0" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-xs">{award.name}</h4>
                              <p className="text-xs text-gray-600">{award.issuer}</p>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {new Date(award.date).toLocaleDateString()}
                              </div>
                              {award.description && (
                                <p className="text-xs text-gray-700 mt-1 leading-relaxed">{award.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No awards</p>
                  )}
                </div>
              )}

              {/* Languages Tab */}
              {profileTabs.some(tab => tab.originalIndex === 6) && (
                <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 6)] = el)} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
                    <Languages className="h-4 w-4 text-purple-600" />
                    Languages
                  </h3>
                  {languages && languages.length > 0 ? (
                    <div className="space-y-3">
                      {languages.map((language, index) => (
                        <div key={index} className="bg-white rounded border border-gray-100 p-3">
                          <div className="flex items-start">
                            <div className="mr-2 mt-0.5">
                              <Languages className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-xs">{language.language}</h4>
                              <div className="mt-1 flex flex-wrap gap-1">
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                  {language.proficiency}
                                </span>
                                {language.isNative && (
                                  <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                    Native
                                  </span>
                                )}
                              </div>
                              {(language.speakingLevel || language.writingLevel || language.readingLevel) && (
                                <div className="mt-1 space-y-0.5">
                                  {language.speakingLevel && (
                                    <div className="text-xs text-gray-600">
                                      <span className="font-medium">Speaking:</span> {language.speakingLevel}
                                    </div>
                                  )}
                                  {language.writingLevel && (
                                    <div className="text-xs text-gray-600">
                                      <span className="font-medium">Writing:</span> {language.writingLevel}
                                    </div>
                                  )}
                                  {language.readingLevel && (
                                    <div className="text-xs text-gray-600">
                                      <span className="font-medium">Reading:</span> {language.readingLevel}
                                    </div>
                                  )}
                                </div>
                              )}
                              {language.certificationName && (
                                <div className="mt-1 text-xs text-gray-600">
                                  <span className="font-medium">Certification:</span> {language.certificationName}
                                  {language.certificationScore && (
                                    <span> (Score: {language.certificationScore})</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No languages</p>
                  )}
                </div>
              )}

              {/* Interests Tab */}
              {profileTabs.some(tab => tab.originalIndex === 7) && (
                <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 7)] = el)} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-purple-600" />
                    Interests
                  </h3>
                  {interests && interests.length > 0 ? (
                    <div className="bg-white rounded border border-gray-100 p-3">
                      <div className="flex items-center mb-2">
                        <Heart className="h-3.5 w-3.5 text-red-500 mr-1.5" />
                        <h4 className="text-xs font-medium text-gray-800">Personal Interests</h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {interests.map((interest, index) => (
                          <span key={index} className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium flex items-center">
                            <Heart className="h-2.5 w-2.5 mr-1 text-red-500" />
                            {typeof interest === 'string' ? interest : interest.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No interests</p>
                  )}
                </div>
              )}

              {/* References Tab */}
              {profileTabs.some(tab => tab.originalIndex === 8) && (
                <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 8)] = el)} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-purple-600" />
                    References
                  </h3>
                  {references && references.length > 0 ? (
                    <div className="space-y-3">
                      {references.map((reference, index) => (
                        <div key={index} className="bg-white rounded border border-gray-100 p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center">
                              <Mail className="h-3.5 w-3.5 text-blue-600 mr-1.5" />
                              <h4 className="text-xs font-medium text-gray-800">{reference.name}</h4>
                            </div>
                            {reference.status && (
                              <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                                reference.status === 'verified' ? 'bg-green-100 text-green-800' :
                                reference.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                                reference.status === 'available' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {reference.status}
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Position:</span>
                              <span>{reference.position}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Company:</span>
                              <span>{reference.company}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Email:</span>
                              <span className="text-blue-600">{reference.email}</span>
                            </div>
                            {reference.phone && (
                              <div className="flex items-center">
                                <span className="font-medium mr-1">Phone:</span>
                                <span>{reference.phone}</span>
                              </div>
                            )}
                            {reference.relationship && (
                              <div className="flex items-center">
                                <span className="font-medium mr-1">Relationship:</span>
                                <span>{reference.relationship}</span>
                              </div>
                            )}
                            {reference.yearsKnown && (
                              <div className="flex items-center">
                                <span className="font-medium mr-1">Years Known:</span>
                                <span>{reference.yearsKnown} years</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No references</p>
                  )}
                </div>
              )}

              {/* Custom Fields Tab */}
              {profileTabs.some(tab => tab.originalIndex === 9) && (
                <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 9)] = el)} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-purple-600" />
                    Custom Fields
                  </h3>
                  {customFields && customFields.length > 0 ? (
                    <div className="space-y-3">
                      {customFields.map((field, index) => (
                        <div key={index} className="bg-white rounded border border-gray-100 p-3">
                          <div className="flex items-center mb-1">
                            <FileText className="h-3.5 w-3.5 text-purple-600 mr-1.5" />
                            <h4 className="text-xs font-medium text-gray-800">{field.fieldName}</h4>
                            {field.isRequired && (
                              <span className="ml-1.5 px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Type:</span>
                              <span className="capitalize">{field.fieldType}</span>
                            </div>
                            {field.fieldValue && (
                              <div className="flex items-start">
                                <span className="font-medium mr-1">Value:</span>
                                <span className="flex-1">{field.fieldValue}</span>
                              </div>
                            )}
                            {field.fieldDescription && (
                              <div className="flex items-start">
                                <span className="font-medium mr-1">Description:</span>
                                <span className="flex-1 text-gray-500">{field.fieldDescription}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No custom fields</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Floating Action Bar */}
          <div className="absolute bottom-6 left-4 right-4 py-4 flex justify-center">
			  {/* <div className='bg-white/50 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg px-1 py-1.5'> */}
            <div className="flex items-center justify-between gap-2 bg-white/20 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg px-4 py-4 max-w-md w-full">
              <button
                onClick={() => {
                  // TODO: Implement add to job functionality
                  console.log('Add to job clicked');
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                title="Add to Job"
              >
                <Plus className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:inline whitespace-nowrap">Add to Job</span>
              </button>
              
              <button
                onClick={() => {
                  // TODO: Implement send email functionality
                  console.log('Send email clicked');
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                title="Send Email"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:inline whitespace-nowrap">Send Email</span>
              </button>
              
              <button
                onClick={() => {
                  // TODO: Implement add notes functionality
                  console.log('Add notes clicked');
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium relative"
                title="Add Notes"
              >
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:inline whitespace-nowrap">Add Notes</span>
                {notes.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notes.length}
                  </span>
                )}
              </button>
            </div>
			{/* </div> */}
          </div>
        </div>
      </div>
    );
  }

  // Expanded state - full panel covering 2/3 of page width
  return (
    <div className="profile-side-panel fixed inset-y-0 right-0 w-2/3 bg-white shadow-2xl z-50 flex">
      {/* Profile Info Section - Responsive width based on candidate actions state */}
      <div className={`${isCandidateActionsCollapsed ? 'flex-1' : 'flex-1 w-2/3'} flex flex-col border-r border-gray-200 transition-all duration-300 ease-in-out`}>
        {/* Panel Header - Sticky */}
        <div className="sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => onStateChange('closed')} 
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 flex items-center text-sm p-2 rounded-md mr-2"
              >
                <ChevronLeft size={18} className="mr-1" /> Back to Search
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsCandidateActionsCollapsed(!isCandidateActionsCollapsed)}
                className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:border-purple-700 flex items-center text-sm p-2 rounded-md mr-2"
              >
                <Settings size={18} className="mr-1" /> Actions
              </Button>
              {onShortlist && (
                <Button
                  variant="primary"
                  onClick={onShortlist}
                  disabled={isShortlisting}
                  className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:border-purple-700 disabled:bg-gray-400 disabled:border-gray-400 flex items-center text-sm p-2 rounded-md mr-2"
                >
                  {isShortlisting ? (
                    <>
                      <Loader2 size={18} className="mr-1 animate-spin" /> Adding...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} className="mr-1" /> Shortlist
                    </>
                  )}
                </Button>
              )}
            </div>
            <Button 
              variant="primary" 
              onClick={() => onStateChange('collapsed')} 
              className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:border-purple-700 flex items-center text-sm p-2 rounded-md"
            >
              <ChevronRight size={20} />
              <span className="ml-1 font-medium">Collapse</span>
            </Button>
          </div>
        </div>

        {/* Profile Basic Info + Main Action Buttons */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start">
            {personalInfo.avatar ? (
              <img 
                src={personalInfo.avatar} 
                alt={personalInfo.fullName}
                className="h-12 w-12 rounded-full mr-4 flex-shrink-0 object-cover"
              />
            ) : (
              <div className="bg-purple-100 rounded-full h-12 w-12 flex items-center justify-center text-purple-600 text-xl font-semibold mr-4 flex-shrink-0">
                {personalInfo.fullName.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{personalInfo.fullName}</h2>
              <div className="flex items-center text-sm text-gray-500 mt-0.5">
                {personalInfo.location}
                {personalInfo.github && (
                  <>
                    <span className="mx-1.5">·</span>
                    <a
                      href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-purple-600 flex items-center"
                      title="GitHub Profile"
                    >                      <Github size={16} />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="mt-4 space-y-3">
            {personalInfo.email && (
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <a 
                  href={`mailto:${personalInfo.email}`}
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                >
                  {personalInfo.email}
                </a>
              </div>
            )}
            
            {personalInfo.phone && (
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <a 
                  href={`tel:${personalInfo.phone}`}
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                >
                  {personalInfo.phone}
                </a>
              </div>
            )}
            
            {personalInfo.linkedIn && (
              <div className="flex items-center text-sm">
                <a 
                  href={personalInfo.linkedIn.startsWith('http') ? personalInfo.linkedIn : `https://${personalInfo.linkedIn}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                  title="View LinkedIn Profile"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
              </div>
            )}
            
            {personalInfo.website && personalInfo.website.trim() && (
              <div className="flex items-center text-sm">
                <ExternalLink className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <a 
                  href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-purple-600 transition-colors truncate"
                >
                  {personalInfo.website}
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* AI-Powered Spotlight (Using Summary) - Fixed, non-scrolling */}
        {summary && (
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AI-Powered Spotlight</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Scrollable Content Area - Tabbed Experience, Education, Skills, Projects */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto flex flex-col">
          {/* Tabs Navigation - Sticky */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
            <nav className="flex px-6 overflow-x-auto" aria-label="Tabs" style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#e5e7eb #f9fafb'
            }}>
              {profileTabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => {
                    setActiveTab(tab.index);
                    // Scroll to the section using scrollIntoView
                    setTimeout(() => {
                      const sectionElement = sectionRefs.current[tab.index];
                      if (sectionElement) {
                        sectionElement.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'start',
                          inline: 'nearest'
                        });
                      }
                    }, 50);
                  }}
                  className={`${
                    activeTab === tab.index
                      ? 'border-purple-600 text-purple-700 font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-3 px-3 border-b-2 text-sm flex items-center gap-1.5 mr-4 flex-shrink-0`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                  {tab.count > 0 && (
                    <span className={`${
                      activeTab === tab.index ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    } py-0.5 px-1.5 rounded-full text-xs font-medium`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6">
            {/* EXPANDED VIEW - AUTO SCROLL ENABLED */}
            {/* Experience Tab */}
            {profileTabs.some(tab => tab.originalIndex === 0) && (
              <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 0)] = el)} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                  Experience
                </h3>
                {sortedExperience && sortedExperience.length > 0 ? (
                  <div className="space-y-4">
                    {sortedExperience.map((exp, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-1">
                            <div className="mr-3 mt-1">
                              <Briefcase className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{exp.position}</h4>
                              
                              {/* Company with social media links */}
                              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                <p className="text-sm text-gray-600">{exp.company}</p>
                                {exp.metadata && (exp.metadata.companyWebsite || exp.metadata.companyLinkedinUrl || exp.metadata.companyFacebookUrl || exp.metadata.companyTwitterUrl) && (
                                  <div className="flex items-center gap-1">
                                    {exp.metadata.companyWebsite && (
                                      <a
                                        href={exp.metadata.companyWebsite.startsWith('http') ? exp.metadata.companyWebsite : `https://${exp.metadata.companyWebsite}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-600 hover:text-purple-600"
                                        title="Company Website"
                                      >
                                        <Globe className="h-3.5 w-3.5" />
                                      </a>
                                    )}
                                    {exp.metadata.companyLinkedinUrl && (
                                      <a
                                        href={exp.metadata.companyLinkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                        title="LinkedIn"
                                      >
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                                        </svg>
                                      </a>
                                    )}
                                    {exp.metadata.companyFacebookUrl && exp.metadata.companyFacebookUrl.length > 0 && (
                                      <a
                                        href={exp.metadata.companyFacebookUrl[0]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-700"
                                        title="Facebook"
                                      >
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                      </a>
                                    )}
                                    {exp.metadata.companyTwitterUrl && exp.metadata.companyTwitterUrl.length > 0 && (
                                      <a
                                        href={exp.metadata.companyTwitterUrl[0]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sky-500 hover:text-sky-700"
                                        title="Twitter"
                                      >
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                        </svg>
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Compact company metadata */}
                              <div className="flex items-center gap-2 flex-wrap mt-1.5 text-xs text-gray-500">
                                {exp.location && <span>📍 {exp.location}</span>}
                                {exp.metadata?.companyIndustry && <span>• {exp.metadata.companyIndustry}</span>}
                                {exp.metadata?.companySizeRange && <span>• 👥 {exp.metadata.companySizeRange}</span>}
                                {exp.metadata?.companyLocationHq?.fullAddress && <span>• 🏢 {exp.metadata.companyLocationHq.fullAddress}</span>}
                              </div>
                              
                              {/* Department and management level badges */}
                              {exp.metadata && (exp.metadata.department || exp.metadata.managementLevel) && (
                                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                                  {exp.metadata.department && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">
                                      {exp.metadata.department}
                                    </span>
                                  )}
                                  {exp.metadata.managementLevel && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-50 text-purple-700 border border-purple-200">
                                      {exp.metadata.managementLevel}
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              {/* Company financials and growth - compact inline */}
                              {exp.metadata && (exp.metadata.companyAnnualRevenue || exp.metadata.companyEmployeesCountChangeYearlyPercentage) && (
                                <div className="flex items-center gap-2 flex-wrap mt-2 text-xs">
                                  {exp.metadata.companyAnnualRevenue && (
                                    <span className="text-gray-600">
                                      💰 {exp.metadata.companyAnnualRevenueCurrency} {exp.metadata.companyAnnualRevenue.toLocaleString()}
                                    </span>
                                  )}
                                  {exp.metadata.companyEmployeesCountChangeYearlyPercentage !== undefined && (
                                    <span className={`font-medium ${exp.metadata.companyEmployeesCountChangeYearlyPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      📈 {exp.metadata.companyEmployeesCountChangeYearlyPercentage > 0 ? '+' : ''}
                                      {exp.metadata.companyEmployeesCountChangeYearlyPercentage.toFixed(1)}% YoY
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              {/* Keywords inline - Show all keywords */}
                              {exp.metadata?.companyCategoriesAndKeywords && exp.metadata.companyCategoriesAndKeywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {exp.metadata.companyCategoriesAndKeywords.map((keyword, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 text-right whitespace-nowrap pl-2">
                            {formatDateForDisplay(exp.startDate)} - {formatDateForDisplay(exp.endDate) || 'Present'}
                            {exp.metadata?.duration && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                {exp.metadata.duration}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Only show description if it's NOT auto-generated from metadata (for backward compatibility with manually added experiences) */}
                        {exp.description && !exp.metadata?.source && (
                          <p className="mt-2 text-xs text-gray-700 leading-relaxed">{exp.description}</p>
                        )}
                        
                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                          <div className="mt-2">
                            <h5 className="text-xs font-medium text-gray-700 mb-1">Responsibilities:</h5>
                            <ul className="list-disc list-inside pl-2 space-y-0.5">
                              {exp.responsibilities.map((resp, i) => (
                                <li key={i} className="text-xs text-gray-600">{resp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {exp.achievements && exp.achievements.length > 0 && (
                          <div className="mt-2">
                            <h5 className="text-xs font-medium text-gray-700 mb-1">Achievements:</h5>
                            <ul className="list-disc list-inside pl-2 space-y-0.5">
                              {exp.achievements.map((ach, i) => (
                                <li key={i} className="text-xs text-gray-600">{ach}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {exp.technologies && exp.technologies.length > 0 && (
                          <div className="mt-2">
                            <h5 className="text-xs font-medium text-gray-700 mb-1">Technologies:</h5>
                            <div className="flex flex-wrap gap-1">
                              {exp.technologies.map((tech, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No experience information available</p>
                  </div>
                )}
              </div>
            )}

            {/* Education Tab */}
            {profileTabs.some(tab => tab.originalIndex === 1) && (
              <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 1)] = el)} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  Education
                </h3>
                {sortedEducation && sortedEducation.length > 0 ? (
                  <div className="space-y-4">
                    {sortedEducation.map((edu, index) => (
                      <div key={index} className={`bg-white rounded-lg shadow-sm border border-gray-100 p-4 ${index !== sortedEducation.length - 1 ? "mb-4" : ""}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex">
                            <div className="mr-3 mt-1">
                              <GraduationCap className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                              <p className="text-sm text-gray-600">{edu.institution}</p>
                              {edu.location && <p className="text-xs text-gray-500 mt-0.5">{edu.location}</p>}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 text-right whitespace-nowrap pl-2">
                            {edu.startDate && edu.endDate ? `${formatDateForDisplay(edu.startDate)} - ${formatDateForDisplay(edu.endDate)}` : 
                             edu.graduationDate ? formatDateForDisplay(edu.graduationDate) :
                             edu.startDate ? `${formatDateForDisplay(edu.startDate)} - Present` : ''}
                          </div>
                        </div>
                        {edu.major && <p className="text-xs text-gray-600 mt-1 ml-8">Major: {edu.major}</p>}
                        {edu.description && <p className="mt-3 text-sm text-gray-700 leading-relaxed">{edu.description}</p>}
                        
                        {edu.courses && edu.courses.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-xs font-medium mb-1">Relevant Courses:</h5>
                            <div className="flex flex-wrap gap-1">
                              {edu.courses.map((course, i) => (
                                <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                  {course}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {edu.honors && edu.honors.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-xs font-medium mb-1">Honors & Awards:</h5>
                            <ul className="list-disc list-inside pl-2 space-y-1">
                              {edu.honors.map((honor, i) => (
                                <li key={i} className="text-xs text-gray-600">{honor}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No education information available</p>
                  </div>
                )}
              </div>
            )}

            {/* Skills Tab */}
            {profileTabs.some(tab => tab.originalIndex === 2) && (
              <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 2)] = el)} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Skills
                </h3>
                {skills && skills.length > 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center mb-3">
                      <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                      <h3 className="text-md font-medium text-gray-800">Professional Skills</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium flex items-center">
                          <Zap className="h-3.5 w-3.5 mr-1 text-purple-600" />
                          {typeof skill === 'string' ? skill : skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No skills information available</p>
                  </div>
                )}
              </div>
            )}

            {/* Projects Tab */}
            {profileTabs.some(tab => tab.originalIndex === 3) && (
              <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 3)] = el)} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-purple-600" />
                  Projects
                </h3>
                {projects && projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.map((project, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex">
                            <div className="mr-3 mt-0.5">
                              {project.name.toLowerCase().includes('web') ? (
                                <Globe className="h-5 w-5 text-blue-600" />
                              ) : project.name.toLowerCase().includes('mobile') || project.name.toLowerCase().includes('app') ? (
                                <Smartphone className="h-5 w-5 text-indigo-600" />
                              ) : project.name.toLowerCase().includes('data') || project.name.toLowerCase().includes('analytics') ? (
                                <BarChart className="h-5 w-5 text-emerald-600" />
                              ) : project.name.toLowerCase().includes('ai') || project.name.toLowerCase().includes('ml') ? (
                                <Cpu className="h-5 w-5 text-red-600" />
                              ) : (
                                <Code2 className="h-5 w-5 text-purple-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{project.name}</h4>
                              {project.date && <div className="text-sm text-gray-500">{project.date}</div>}
                            </div>
                          </div>
                        </div>
                        {project.description && (
                          <p className="mt-3 text-sm text-gray-700 leading-relaxed ml-8">{project.description}</p>
                        )}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2 ml-8">
                            {project.technologies.map((tech, i) => (
                              <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm flex items-center">
                                <span className="w-1.5 h-1.5 bg-green-700 rounded-full mr-1.5"></span>
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                        {project.url && (
                          <div className="mt-3 ml-8">
                            <a 
                              href={project.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>View Project</span>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No projects information available</p>
                  </div>
                )}
              </div>
            )}

              {/* Certifications Tab */}
              {profileTabs.some(tab => tab.originalIndex === 4) && (
                <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 4)] = el)} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                    <FileBadge2 className="h-5 w-5 text-purple-600" />
                    Certifications
                  </h3>
                  {certifications && certifications.length > 0 ? (
                    <div className="space-y-4">
                      {certifications.map((cert, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                          <div className="flex items-start">
                            <div className="mr-3 mt-1">
                              <FileBadge2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{cert.name}</h4>
                              <p className="text-sm text-gray-600">{cert.issuer}</p>
                              <div className="text-xs text-gray-500 mt-1">
                                Issued: {new Date(cert.dateIssued).toLocaleDateString()}
                                {cert.expirationDate && (
                                  <span> • Expires: {new Date(cert.expirationDate).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileBadge2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No certifications available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Awards Tab */}
              {profileTabs.some(tab => tab.originalIndex === 5) && (
                <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 5)] = el)} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    Awards
                  </h3>
                  {awards && awards.length > 0 ? (
                    <div className="space-y-4">
                      {awards.map((award, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                          <div className="flex items-start">
                            <div className="mr-3 mt-1">
                              <Award className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{award.name}</h4>
                              <p className="text-sm text-gray-600">{award.issuer}</p>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(award.date).toLocaleDateString()}
                              </div>
                              {award.description && (
                                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{award.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No awards available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Languages Tab */}
              {profileTabs.some(tab => tab.originalIndex === 6) && (
                <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 6)] = el)} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                    <Languages className="h-5 w-5 text-purple-600" />
                    Languages
                  </h3>
                  {languages && languages.length > 0 ? (
                    <div className="space-y-4">
                      {languages.map((language, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                          <div className="flex items-start">
                            <div className="mr-3 mt-1">
                              <Languages className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{language.language}</h4>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                  {language.proficiency}
                                </span>
                                {language.isNative && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                    Native
                                  </span>
                                )}
                              </div>
                              {(language.speakingLevel || language.writingLevel || language.readingLevel) && (
                                <div className="mt-2 space-y-1">
                                  {language.speakingLevel && (
                                    <div className="text-xs text-gray-600">
                                      <span className="font-medium">Speaking:</span> {language.speakingLevel}
                                    </div>
                                  )}
                                  {language.writingLevel && (
                                    <div className="text-xs text-gray-600">
                                      <span className="font-medium">Writing:</span> {language.writingLevel}
                                    </div>
                                  )}
                                  {language.readingLevel && (
                                    <div className="text-xs text-gray-600">
                                      <span className="font-medium">Reading:</span> {language.readingLevel}
                                    </div>
                                  )}
                                </div>
                              )}
                              {language.certificationName && (
                                <div className="mt-2 text-xs text-gray-600">
                                  <span className="font-medium">Certification:</span> {language.certificationName}
                                  {language.certificationScore && (
                                    <span> (Score: {language.certificationScore})</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Languages className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No languages information available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Interests Tab */}
              {profileTabs.some(tab => tab.originalIndex === 7) && (
                <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 7)] = el)} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-purple-600" />
                    Interests
                  </h3>
                  {interests && interests.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                      <div className="flex items-center mb-3">
                        <Heart className="h-5 w-5 text-red-500 mr-2" />
                        <h3 className="text-md font-medium text-gray-800">Personal Interests</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {interests.map((interest, index) => (
                          <span key={index} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium flex items-center">
                            <Heart className="h-3.5 w-3.5 mr-1 text-red-500" />
                            {typeof interest === 'string' ? interest : interest.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No interests information available</p>
                    </div>
                  )}
                </div>
              )}

              {/* References Tab */}
              {profileTabs.some(tab => tab.originalIndex === 8) && (
                <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 8)] = el)} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-purple-600" />
                    References
                  </h3>
                  {references && references.length > 0 ? (
                    <div className="space-y-4">
                      {references.map((reference, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <Mail className="h-5 w-5 text-blue-600 mr-2" />
                              <h3 className="text-md font-medium text-gray-800">{reference.name}</h3>
                            </div>
                            {reference.status && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                reference.status === 'verified' ? 'bg-green-100 text-green-800' :
                                reference.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                                reference.status === 'available' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {reference.status}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <span className="font-medium mr-2">Position:</span>
                              <span>{reference.position}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium mr-2">Company:</span>
                              <span>{reference.company}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium mr-2">Email:</span>
                              <span className="text-blue-600">{reference.email}</span>
                            </div>
                            {reference.phone && (
                              <div className="flex items-center">
                                <span className="font-medium mr-2">Phone:</span>
                                <span>{reference.phone}</span>
                              </div>
                            )}
                            {reference.relationship && (
                              <div className="flex items-center">
                                <span className="font-medium mr-2">Relationship:</span>
                                <span>{reference.relationship}</span>
                              </div>
                            )}
                            {reference.yearsKnown && (
                              <div className="flex items-center">
                                <span className="font-medium mr-2">Years Known:</span>
                                <span>{reference.yearsKnown} years</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No references information available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Fields Tab */}
              {profileTabs.some(tab => tab.originalIndex === 9) && (
                <div ref={(el) => (sectionRefs.current[profileTabs.findIndex(tab => tab.originalIndex === 9)] = el)} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Custom Fields
                  </h3>
                  {customFields && customFields.length > 0 ? (
                    <div className="space-y-4">
                      {customFields.map((field, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                          <div className="flex items-center mb-2">
                            <FileText className="h-5 w-5 text-purple-600 mr-2" />
                            <h3 className="text-md font-medium text-gray-800">{field.fieldName}</h3>
                            {field.isRequired && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <span className="font-medium mr-2">Type:</span>
                              <span className="capitalize">{field.fieldType}</span>
                            </div>
                            {field.fieldValue && (
                              <div className="flex items-start">
                                <span className="font-medium mr-2">Value:</span>
                                <span className="flex-1">{field.fieldValue}</span>
                              </div>
                            )}
                            {field.fieldDescription && (
                              <div className="flex items-start">
                                <span className="font-medium mr-2">Description:</span>
                                <span className="flex-1 text-gray-500">{field.fieldDescription}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No custom fields available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Candidate Actions Section - Right Side Panel (1/3) */}
      <div className={`${isCandidateActionsCollapsed ? 'w-0 overflow-hidden' : 'w-1/3'} bg-gray-50 border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
        {!isCandidateActionsCollapsed && (
          <>
            {/* Actions Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Candidate Actions</h3>
                <button
                  onClick={() => setIsCandidateActionsCollapsed(true)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Collapse actions panel"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Side Tabs Navigation */}
            <div className="border-b border-gray-200 bg-white">
              <nav className="flex" aria-label="Side Tabs">
                {sideTabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveSideTab(tab.index)}
                    className={`${
                      activeSideTab === tab.index
                        ? 'border-purple-500 text-purple-600 font-semibold'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-3 border-b-2 text-xs flex items-center gap-1`}
                  >
                    <tab.icon className="w-3 h-3" />
                    {tab.name}
                    {tab.count > 0 && (
                      <span className={`${
                        activeSideTab === tab.index ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      } py-0.5 px-1 rounded text-xs font-medium`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Side Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Sequences Tab */}


              {/* Communication Tab */}
              {activeSideTab === 1 && (
                <div className="space-y-4">
                  {!isComposingEmail ? (
                    <>
                      {/* Email Composition Header */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                            <Mail className="w-4 h-4 text-blue-500 mr-2" />
                            Email Communication
                          </h4>
                          <button
                            onClick={() => {
                              setIsComposingEmail(true);
                              setEmailSubject(`Regarding your profile - ${personalInfo.fullName}`);
                              setEmailBody(`Hi ${personalInfo.fullName.split(' ')[0]},\n\nI hope this email finds you well. I came across your profile and would like to discuss potential opportunities.\n\nBest regards`);
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Compose Email
                          </button>
                        </div>
                        
                        {/* Email History */}
                        {isLoadingEmailHistory ? (
                          <div className="text-center py-6">
                            <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-gray-500 text-sm">Loading email history...</p>
                          </div>
                        ) : emailHistory.length > 0 ? (
                          <div className="space-y-3">
                            {emailHistory.map((email) => {
                              const statusInfo = formatEmailStatus(email.status);
                              const StatusIcon = statusInfo.icon;
                              
                              return (
                                <div key={email.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h5 className="text-sm font-medium text-gray-900 line-clamp-1">
                                        {email.subject}
                                      </h5>
                                      <p className="text-xs text-gray-500 mt-1">
                                        To: {email.recipients.join(', ')}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-2">
                                      <button
                                        onClick={() => {
                                          setSelectedEmailForView(email);
                                          setIsEmailViewModalOpen(true);
                                        }}
                                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="View email"
                                      >
                                        <Eye className="w-3 h-3" />
                                      </button>
                                      <div className={`flex items-center ${statusInfo.color}`}>
                                        <StatusIcon className="w-4 h-4" />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                                    {email.body.replace(/<[^>]*>/g, '').substring(0, 100)}
                                    {email.body.length > 100 && '...'}
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>
                                      {email.sentAt ? 
                                        new Date(email.sentAt).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        }) : 
                                        new Date(email.createdAt).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })
                                      }
                                    </span>
                                    <span className="capitalize">
                                      {email.status}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                            
                            {emailHistoryTotal > emailHistory.length && (
                              <button 
                                className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                onClick={() => {
                                  setEmailHistoryPage(prev => prev + 1);
                                  loadEmailHistory();
                                }}
                              >
                                Load more emails ({emailHistoryTotal - emailHistory.length} remaining)
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <Mail className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No emails sent to this candidate yet</p>
                            <p className="text-gray-400 text-xs mt-1">Start a conversation by composing an email</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Email Composition Form */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                            <Edit3 className="w-4 h-4 text-blue-500 mr-2" />
                            Compose Email
                          </h4>
                          <button
                            onClick={() => {
                              setIsComposingEmail(false);
                              setEmailSubject('');
                              setEmailBody('');
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Email Form */}
                        <div className="space-y-3">
                          {/* To Field */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">To:</label>
                            <input
                              type="email"
                              value={personalInfo.email || ''}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                            />
                          </div>

                          {/* Subject Field */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Subject:</label>
                            <input
                              type="text"
                              value={emailSubject}
                              onChange={(e) => setEmailSubject(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter email subject"
                            />
                          </div>

                          {/* Message Body */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Message:</label>
                            <div className="border border-gray-300 rounded-md">
                              <ReactQuill
                                value={emailBody}
                                onChange={setEmailBody}
                                theme="snow"
                                placeholder="Type your message here..."
                                style={{ 
                                  height: '200px',
                                  marginBottom: '42px'
                                }}
                                modules={{
                                  toolbar: [
                                    [{ 'header': [1, 2, false] }],
                                    ['bold', 'italic', 'underline'],
                                    ['link'],
                                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                    ['clean']
                                  ],
                                }}
                              />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-3">
                            <button
                              onClick={async () => {
                                try {
                                  await sendEmail({
                                    to: personalInfo.email!,
                                    subject: emailSubject,
                                    body: emailBody,
                                    candidateName: personalInfo.fullName
                                  });
                                  addToast({
                                    type: 'success',
                                    title: 'Email Sent Successfully',
                                    message: `Your email has been sent to ${personalInfo.fullName}`,
                                    duration: 5000
                                  });
                                  setIsComposingEmail(false);
                                  setEmailSubject('');
                                  setEmailBody('');
                                  // Reload email history to show the new email
                                  loadEmailHistory();
                                } catch (error) {
                                  addToast({
                                    type: 'error',
                                    title: 'Failed to Send Email',
                                    message: 'Please try again or check your connection.',
                                    duration: 5000
                                  });
                                }
                              }}
                              disabled={!emailSubject.trim() || !emailBody.trim()}
                              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${
                                emailSubject.trim() && emailBody.trim()
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              <Send className="w-3 h-3" />
                              Send Email
                            </button>
                            <button
                              onClick={() => {
                                setIsComposingEmail(false);
                                setEmailSubject('');
                                setEmailBody('');
                              }}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Notes Tab */}
              {activeSideTab === 2 && (
                <div className="space-y-4">
                  {/* Add Note Form */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <FileText className="w-4 h-4 text-green-500 mr-2" />
                      Add Note
                    </h4>
                    <div className="space-y-3">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note about this candidate..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                      <button
                        onClick={() => {
                          if (newNote.trim()) {
                            saveNote(newNote);
                          }
                        }}
                        disabled={!newNote.trim()}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 ${
                          newNote.trim()
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Save className="w-3 h-3" />
                        Save Note
                      </button>
                    </div>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-3">
                    {isLoadingNotes ? (
                      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-500 text-sm">Loading notes...</p>
                      </div>
                    ) : notes.length > 0 ? (
                      notes.map((note) => (
                        <div key={note.id} className="bg-white rounded-lg border border-gray-200 p-4">
                          {editingNoteId === note.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={editingNoteContent}
                                onChange={(e) => setEditingNoteContent(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (editingNoteContent.trim()) {
                                      updateNote(note.id, editingNoteContent);
                                    }
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingNoteId(null);
                                    setEditingNoteContent('');
                                  }}
                                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-xs text-gray-500">
                                  {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}
                                  {note.updatedAt && note.updatedAt !== note.createdAt && (
                                    <span className="ml-1">(edited)</span>
                                  )}
                                  {note.author && (
                                    <span className="ml-2">by {note.author.firstName} {note.author.lastName}</span>
                                  )}
                                </span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingNoteId(note.id);
                                      setEditingNoteContent(note.content);
                                    }}
                                    className="p-1 text-gray-400 hover:text-blue-600"
                                    title="Edit note"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteNoteClick(note.id)}
                                    className="p-1 text-gray-400 hover:text-red-600"
                                    title="Delete note"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                        <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No notes available</p>
                        <p className="text-gray-400 text-xs mt-1">Add your first note above</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeSideTab === 0 && (
                <div className="space-y-4">
                  {/* Contact Actions */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <MessageCircle className="w-4 h-4 text-blue-500 mr-2" />
                      Contact Actions
                    </h4>
                    <div className="space-y-3">
                      {/* Email Action */}
                      {personalInfo.email && (
                        <button
                          onClick={() => {
                            const subject = encodeURIComponent(`Regarding your profile - ${personalInfo.fullName}`);
                            const body = encodeURIComponent(`Hi ${personalInfo.fullName.split(' ')[0]},\n\nI hope this email finds you well. I came across your profile and would like to discuss potential opportunities.\n\nBest regards`);
                            window.open(`mailto:${personalInfo.email}?subject=${subject}&body=${body}`, '_self');
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                        >
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-600 group-hover:text-blue-600 mr-3" />
                            <div className="text-left">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-blue-900">Send Email</div>
                              <div className="text-xs text-gray-500 group-hover:text-blue-600">{personalInfo.email}</div>
                            </div>
                          </div>
                          <Send className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                        </button>
                      )}

                      {/* Phone Action */}
                      {personalInfo.phone && (
                        <button
                          onClick={() => window.open(`tel:${personalInfo.phone}`, '_self')}
                          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group"
                        >
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-600 group-hover:text-green-600 mr-3" />
                            <div className="text-left">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-green-900">Call</div>
                              <div className="text-xs text-gray-500 group-hover:text-green-600">{personalInfo.phone}</div>
                            </div>
                          </div>
                          <Phone className="w-4 h-4 text-gray-400 group-hover:text-green-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Professional Profiles */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <User className="w-4 h-4 text-purple-500 mr-2" />
                      Professional Profiles
                    </h4>
                    <div className="space-y-3">
                      {/* LinkedIn Action */}
                      {personalInfo.linkedIn && (
                        <button
                          onClick={() => window.open(personalInfo.linkedIn.startsWith('http') ? personalInfo.linkedIn : `https://${personalInfo.linkedIn}`, '_blank')}
                          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                        >
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-blue-600 rounded mr-3 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">in</span>
                            </div>
                            <div className="text-left">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-blue-900">LinkedIn Profile</div>
                              <div className="text-xs text-gray-500 group-hover:text-blue-600">View professional profile</div>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                        </button>
                      )}

                      {/* GitHub Action */}
                      {personalInfo.github && (
                        <button
                          onClick={() => window.open(personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`, '_blank')}
                          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center">
                            <Github className="w-4 h-4 text-gray-600 group-hover:text-gray-800 mr-3" />
                            <div className="text-left">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-gray-900">GitHub Profile</div>
                              <div className="text-xs text-gray-500 group-hover:text-gray-600">View code repositories</div>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        </button>
                      )}

                      {/* Website Action */}
                      {personalInfo.website && personalInfo.website.trim() && (
                        <button
                          onClick={() => window.open(personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`, '_blank')}
                          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
                        >
                          <div className="flex items-center">
                            <Globe className="w-4 h-4 text-gray-600 group-hover:text-purple-600 mr-3" />
                            <div className="text-left">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-purple-900">Personal Website</div>
                              <div className="text-xs text-gray-500 group-hover:text-purple-600 truncate max-w-32">{personalInfo.website}</div>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <Calendar className="w-4 h-4 text-orange-500 mr-2" />
                      Quick Actions
                    </h4>
                    <div className="space-y-3">
                      {/* Schedule Meeting */}
                      <button
                        onClick={() => {
                          if (personalInfo.email) {
                            const subject = encodeURIComponent(`Meeting Request - ${personalInfo.fullName}`);
                            const body = encodeURIComponent(`Hi ${personalInfo.fullName.split(' ')[0]},\n\nI would like to schedule a meeting to discuss potential opportunities. Please let me know your availability for a 30-minute call.\n\nBest regards`);
                            window.open(`mailto:${personalInfo.email}?subject=${subject}&body=${body}`, '_self');
                          }
                        }}
                        disabled={!personalInfo.email}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors group ${
                          personalInfo.email 
                            ? 'border-gray-200 hover:border-orange-300 hover:bg-orange-50' 
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center">
                          <Calendar className={`w-4 h-4 mr-3 ${
                            personalInfo.email 
                              ? 'text-gray-600 group-hover:text-orange-600' 
                              : 'text-gray-400'
                          }`} />
                          <div className="text-left">
                            <div className={`text-sm font-medium ${
                              personalInfo.email 
                                ? 'text-gray-900 group-hover:text-orange-900' 
                                : 'text-gray-500'
                            }`}>Schedule Meeting</div>
                            <div className={`text-xs ${
                              personalInfo.email 
                                ? 'text-gray-500 group-hover:text-orange-600' 
                                : 'text-gray-400'
                            }`}>
                              {personalInfo.email ? 'Send meeting request' : 'Email required'}
                            </div>
                          </div>
                        </div>
                        <Send className={`w-4 h-4 ${
                          personalInfo.email 
                            ? 'text-gray-400 group-hover:text-orange-500' 
                            : 'text-gray-300'
                        }`} />
                      </button>

                      {/* Add to Pipeline */}
                      <button
                        onClick={() => {
                          // This would integrate with your pipeline/CRM system
                          alert('Pipeline integration would be implemented here');
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
                      >
                        <div className="flex items-center">
                          <Plus className="w-4 h-4 text-gray-600 group-hover:text-indigo-600 mr-3" />
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-900">Add to Pipeline</div>
                            <div className="text-xs text-gray-500 group-hover:text-indigo-600">Track recruitment progress</div>
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <Clock className="w-4 h-4 text-gray-500 mr-2" />
                      Recent Activity
                    </h4>
                    <div className="text-center py-6">
                      <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No recent activity</p>
                      <p className="text-gray-400 text-xs mt-1">Contact history will appear here</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pipeline Tab */}
              {activeSideTab === 3 && (
                <div className="space-y-4">
                  {/* Prospects Status */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <Star className="w-4 h-4 text-purple-500 mr-2" />
                      Prospects Status
                    </h4>
                    
                    {prospectsLoading ? (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Loading prospect status...
                      </div>
                    ) : (() => {
                      const prospectStatus = getProspectStatus();
                      return prospectStatus.isInPipeline ? (
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                            <span className="font-medium text-gray-900">In {prospectStatus.pipelineName} pipeline</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Current Stage: <span className="font-medium">{prospectStatus.currentStage}</span></p>
                            {prospectStatus.status && (
                              <p className="mt-1">
                                Status: 
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  prospectStatus.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                  prospectStatus.status === 'contacted' ? 'bg-purple-100 text-purple-800' :
                                  prospectStatus.status === 'responded' ? 'bg-green-100 text-green-800' :
                                  prospectStatus.status === 'interested' ? 'bg-emerald-100 text-emerald-800' :
                                  prospectStatus.status === 'not_interested' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {prospectStatus.status.replace('_', ' ')}
                                </span>
                              </p>
                            )}
                            {prospectStatus.lastActivity && (
                              <p className="text-xs text-gray-500 mt-1">
                                Last activity: {new Date(prospectStatus.lastActivity).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center mb-2">
                            <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                            <span>Not currently in any sourcing pipeline.</span>
                          </div>
                          <p>Add this candidate to a sourcing pipeline to track their progress through outreach and recruitment.</p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Current Pipelines */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                        <Star className="w-4 h-4 text-blue-500 mr-2" />
                        Current Pipelines
                      </h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {jobApplicationsData?.applications?.length || 0} active
                      </span>
                    </div>
                    
                    {applicationsLoading ? (
                      <div className="text-center py-6">
                        <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-500 text-sm">Loading pipelines...</p>
                      </div>
                    ) : jobApplicationsData?.applications?.length > 0 ? (
                      <div className="space-y-3">
                        {jobApplicationsData.applications.map((application) => (
                          <div key={application.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h5 className="text-sm font-medium text-gray-900 mb-1">
                                  {application.job?.title || 'Unknown Job'}
                                </h5>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Building className="w-3 h-3 mr-1" />
                                  {application.job?.department || 'Unknown Department'}
                                  <span className="mx-2">•</span>
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {application.job?.location || 'Unknown Location'}
                                </div>
                              </div>
                              <div className="ml-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  application.status === 'Applied' || application.status === 'Screening'
                                    ? 'bg-blue-100 text-blue-800'
                                    : application.status === 'Phone Interview' || application.status === 'Technical Interview'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : application.status === 'Final Interview' || application.status === 'Offer Extended'
                                    ? 'bg-green-100 text-green-800'
                                    : application.status === 'Hired'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : application.status === 'Rejected' || application.status === 'Withdrawn'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {application.currentPipelineStageName || application.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-500">
                              Applied: {new Date(application.appliedDate).toLocaleDateString()}
                              {application.updatedAt && (
                                <>
                                  <span className="mx-2">•</span>
                                  Last activity: {new Date(application.updatedAt).toLocaleDateString()}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No active pipelines</p>
                        <p className="text-gray-400 text-xs mt-1">Add candidate to a pipeline to get started</p>
                      </div>
                    )}
                  </div>

                  {/* Suggested Job Matches */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                        <Target className="w-4 h-4 text-green-500 mr-2" />
                        Suggested Job Matches
                      </h4>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {jobSuggestionsData?.suggestions?.length || 0} available
                      </span>
                    </div>
                    
                    {jobsLoading ? (
                      <div className="text-center py-6">
                        <div className="w-6 h-6 border-2 border-green-300 border-t-green-600 rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-500 text-sm">Loading job matches...</p>
                      </div>
                    ) : jobSuggestionsData?.suggestions?.length > 0 ? (
                      <div className="space-y-3">
                        {jobSuggestionsData.suggestions.map((suggestion) => (
                          <div key={suggestion.job.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h5 className="text-sm font-medium text-gray-900">
                                  {suggestion.job.title}
                                </h5>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Building className="w-3 h-3 mr-1" />
                                  {suggestion.job.department}
                                  <span className="mx-2">•</span>
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {suggestion.job.location}
                                </div>
                              </div>
                              <div className="flex items-center ml-2">
                                <div className={`flex items-center px-2 py-1 rounded-full ${getMatchScoreColor(suggestion.matchScore)}`}>
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  <span className="text-xs font-medium">{suggestion.matchScore}% match</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {suggestion.job.description || 'No description available'}
                            </div>
                            
                            <div className="flex items-center justify-between text-xs mb-2">
                              <div className="flex items-center text-gray-500">
                                <DollarSign className="w-3 h-3 mr-1" />
                                {formatSalary(suggestion) || 'Salary not specified'}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {suggestion.job.skills?.slice(0, 3).map((skill: string, index: number) => (
                                  <span key={index} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                    {skill}
                                  </span>
                                ))}
                                {suggestion.job.skills?.length > 3 && (
                                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                    +{suggestion.job.skills.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Match breakdown */}
                            <div className="text-xs text-gray-500 mb-2">
                              Skills: {suggestion.matchReasons?.skillMatch || 0}% • 
                              Experience: {suggestion.matchReasons?.experienceMatch || 0}% • 
                              Seniority: {suggestion.matchReasons?.seniorityMatch || 0}%
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex gap-2 mt-2">
                              <button className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors">
                                Add to Pipeline
                              </button>
                              <button className="px-2 py-1 border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-50 transition-colors">
                                View Job
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Target className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No job matches found</p>
                        <p className="text-gray-400 text-xs mt-1">Check back later for new opportunities</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Collapsed Actions Toggle */}
        {isCandidateActionsCollapsed && (
          <div className="p-2 border-b border-gray-200 bg-white">
            <button
              onClick={() => setIsCandidateActionsCollapsed(false)}
              className="w-full p-2 hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
              title="Expand actions panel"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Email View Modal */}
      {isEmailViewModalOpen && selectedEmailForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Email Details</h3>
              <button
                onClick={() => {
                  setIsEmailViewModalOpen(false);
                  setSelectedEmailForView(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Email Header */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Subject: </span>
                      <span className="text-gray-900">{selectedEmailForView.subject}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">To: </span>
                      <span className="text-gray-900">{selectedEmailForView.recipients.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Sent: </span>
                      <span className="text-gray-900">
                        {selectedEmailForView.sentAt ? 
                          new Date(selectedEmailForView.sentAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 
                          new Date(selectedEmailForView.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        }
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status: </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedEmailForView.status === 'sent' ? 'bg-green-100 text-green-800' :
                        selectedEmailForView.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                        selectedEmailForView.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedEmailForView.status.charAt(0).toUpperCase() + selectedEmailForView.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Message:</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div 
                      className="text-gray-900 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: selectedEmailForView.body.replace(/\n/g, '<br/>') 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsEmailViewModalOpen(false);
                  setSelectedEmailForView(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSidePanel;
