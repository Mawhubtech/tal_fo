import React, { useState, useEffect } from 'react';
import { X, Github, Plus, Briefcase, FolderOpen, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, FileText, Clock, GraduationCap, Zap, Globe, Smartphone, BarChart, Cpu, Code2, ExternalLink, ArrowRight, Award, FileBadge2, Heart, Mail, Phone, Languages, Send, MessageCircle, User, Calendar, Save, Edit3, Trash2, AlertCircle, CheckCircle2, XCircle, Eye } from 'lucide-react'; // Ensure these icons are installed
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './ProfileSidePanel.css';
import Button from './Button'; // Adjust path to your Button component if necessary
import ConfirmationModal from './ConfirmationModal';
import { candidateNotesApiService, CandidateNote } from '../services/candidateNotesApiService';
import { emailApiService, SendCandidateEmailDto, EmailLogEntry, EmailHistoryResponse } from '../services/emailApiService';
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
}

export interface Education {
  degree: string;
  institution: string;
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
}

const ProfileSidePanel: React.FC<ProfileSidePanelProps> = ({ userData, panelState, onStateChange, isLoading = false, candidateId }) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState(0); // For main profile tabs
  const [activeSideTab, setActiveSideTab] = useState(0); // For side panel tabs - default to Communication tab
  const [isCandidateActionsCollapsed, setIsCandidateActionsCollapsed] = useState(false); // For collapsing candidate actions - default to expanded
  
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
  
  // Confirmation modal state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // Load notes when component mounts or candidateId changes
  useEffect(() => {
    if (candidateId && panelState !== 'closed') {
      loadNotes();
      loadEmailHistory();
    }
  }, [candidateId, panelState]);

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

  // Helper function to sort experience chronologically (most recent first)
  const sortedExperience = experience?.slice().sort((a, b) => {
    const aEndDate = parseDate(a.endDate);
    const bEndDate = parseDate(b.endDate);
    
    // Sort by end date descending (most recent first)
    if (aEndDate.getTime() !== bEndDate.getTime()) {
      return bEndDate.getTime() - aEndDate.getTime();
    }
    
    // If end dates are the same, sort by start date descending
    const aStartDate = parseDate(a.startDate);
    const bStartDate = parseDate(b.startDate);
    return bStartDate.getTime() - aStartDate.getTime();
  });

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
  const profileTabs = [
    { name: 'Experience', icon: Briefcase, index: 0, count: sortedExperience?.length || 0 },
    { name: 'Education', icon: GraduationCap, index: 1, count: sortedEducation?.length || 0 },
    { name: 'Skills', icon: Zap, index: 2, count: skills?.length || 0 },
    { name: 'Projects', icon: FolderOpen, index: 3, count: projects?.length || 0 },
    { name: 'Certifications', icon: FileBadge2, index: 4, count: certifications?.length || 0 },
    { name: 'Awards', icon: Award, index: 5, count: awards?.length || 0 },
    { name: 'Languages', icon: Languages, index: 6, count: languages?.length || 0 },
    { name: 'Interests', icon: Heart, index: 7, count: interests?.length || 0 },
    { name: 'References', icon: Mail, index: 8, count: references?.length || 0 },
    { name: 'Custom Fields', icon: FileText, index: 9, count: customFields?.length || 0 },
  ];

  // Side panel tabs for the 1/3 section (candidate management)
  const sideTabs = [
    { name: 'Activity', icon: Clock, index: 0, count: 0 },
    { name: 'Communication', icon: Mail, index: 1, count: 0 },
    { name: 'Notes', icon: FileText, index: 2, count: notes.length },
    { name: 'Pipeline', icon: Briefcase, index: 3, count: 0 },
  ];  // Collapsed state - show only the 2/3 profile section (1/3 of total page width)
  if (panelState === 'collapsed') {
    return (
      <div className="fixed inset-y-0 right-0 w-1/3 bg-white shadow-2xl z-50 flex">
        {/* Profile Info Section - Full width in collapsed view */}
        <div className="flex-1 w-full flex flex-col">
          {/* Panel Header - Sticky */}
          <div className="sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">              <div className="flex items-center">
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

          {/* Profile Basic Info + Main Action Buttons */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start">
              <div className="bg-purple-100 rounded-full h-12 w-12 flex items-center justify-center text-purple-600 text-xl font-semibold mr-4 flex-shrink-0">
                {personalInfo.fullName.charAt(0)}
              </div>
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
                      >                        <Github size={16} />
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
                  <Globe className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <a 
                    href={personalInfo.linkedIn.startsWith('http') ? personalInfo.linkedIn : `https://${personalInfo.linkedIn}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-purple-600 transition-colors truncate"
                  >
                    LinkedIn Profile
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

          {/* Scrollable Content Area - Collapsed view with tabs */}
          <div className="flex-1 overflow-y-auto">
            {/* AI-Powered Spotlight (Using Summary) */}
            {summary && (
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AI-Powered Spotlight</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
              </div>
            )}

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex px-6 overflow-x-auto" aria-label="Tabs" style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: '#e5e7eb #f9fafb'
              }}>
                {profileTabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.index)}
                    className={`${
                      activeTab === tab.index
                        ? 'border-purple-500 text-purple-600 font-semibold'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-3 px-1 border-b-2 text-xs flex items-center gap-1 mr-4 flex-shrink-0`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
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

            {/* Tab Content - Compact view for collapsed state */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Experience Tab */}
              {activeTab === 0 && (
                <div>
                  {sortedExperience && sortedExperience.length > 0 ? (
                    <div className="space-y-5">
                      {sortedExperience.map((exp, index) => (
                        <div key={index} className={`bg-white rounded-lg shadow-sm border border-gray-100 p-4 ${index !== experience.length - 1 ? "mb-4" : ""}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex">
                              <div className="mr-3 mt-1">
                                <Briefcase className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{exp.position}</h4>
                                <p className="text-sm text-gray-600">{exp.company}</p>
                                {exp.location && <p className="text-xs text-gray-500 mt-0.5">{exp.location}</p>}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 text-right whitespace-nowrap pl-2">
                              {formatDateForDisplay(exp.startDate)} - {formatDateForDisplay(exp.endDate) || 'Present'}
                            </div>
                          </div>
                          {exp.description && <p className="mt-3 text-sm text-gray-700 leading-relaxed">{exp.description}</p>}
                          
                          {exp.responsibilities && exp.responsibilities.length > 0 && (
                            <div className="mt-3">
                              <h5 className="text-xs font-medium mb-1">Responsibilities:</h5>
                              <ul className="list-disc list-inside pl-2 space-y-1">
                                {exp.responsibilities.map((resp, i) => (
                                  <li key={i} className="text-xs text-gray-600">{resp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {exp.achievements && exp.achievements.length > 0 && (
                            <div className="mt-3">
                              <h5 className="text-xs font-medium mb-1">Key Achievements:</h5>
                              <ul className="list-disc list-inside pl-2 space-y-1">
                                {exp.achievements.map((ach, i) => (
                                  <li key={i} className="text-xs text-gray-600">{ach}</li>
                                ))}
                              </ul>
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
              {activeTab === 1 && (
                <div>
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
              {activeTab === 2 && (
                <div>
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
              )}              {/* Projects Tab */}
              {activeTab === 3 && (
                <div>
                  {projects && projects.length > 0 ? (
                    <div className="space-y-4">
                      {projects.slice(0, 2).map((project, index) => (
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
                                <h4 className="font-medium text-gray-900 text-sm">{project.name}</h4>
                                {project.date && <div className="text-xs text-gray-500">{project.date}</div>}
                              </div>
                            </div>
                          </div>
                          {project.description && (
                            <p className="mt-2 text-xs text-gray-700 leading-relaxed line-clamp-2 ml-8">{project.description}</p>
                          )}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1 ml-8">
                              {project.technologies.slice(0, 3).map((tech, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs flex items-center">
                                  <span className="w-1 h-1 bg-green-700 rounded-full mr-1"></span>
                                  {tech}
                                </span>
                              ))}
                              {project.technologies.length > 3 && (
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs flex items-center">
                                  <span className="w-1 h-1 bg-gray-600 rounded-full mr-1"></span>
                                  +{project.technologies.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          {project.url && (
                            <div className="mt-2 ml-8">
                              <a 
                                href={project.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-800 text-xs flex items-center gap-1"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span>View Project</span>
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                      {projects.length > 2 && (
                        <button
                          onClick={() => onStateChange('expanded')}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium mt-2 flex items-center"
                        >
                          View all {projects.length} projects
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FolderOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No projects information</p>
                    </div>                  )}
                </div>
              )}

              {/* Certifications Tab */}
              {activeTab === 4 && (
                <div>
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
              {activeTab === 5 && (
                <div>
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
              {activeTab === 6 && (
                <div>
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
              {activeTab === 7 && (
                <div>
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
              {activeTab === 8 && (
                <div>
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
              {activeTab === 9 && (
                <div>
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
                onClick={() => onStateChange('collapsed')} 
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 flex items-center text-sm p-2 rounded-md mr-1"
              >
                <ChevronRight size={20} />
                 <span className="ml-1 font-medium">Collapse</span>
              </Button>
            </div>            <Button variant="ghost" onClick={() => onStateChange('closed')} className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 flex items-center text-sm p-2 rounded-md">
              <X size={18} className="mr-1" /> Back to Search
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
                <Globe className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <a 
                  href={personalInfo.linkedIn.startsWith('http') ? personalInfo.linkedIn : `https://${personalInfo.linkedIn}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-purple-600 transition-colors truncate"
                >
                  LinkedIn Profile
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
        
        {/* Scrollable Content Area - Tabbed Experience, Education, Skills, Projects */}
        <div className="flex-1 overflow-y-auto">          {/* AI-Powered Spotlight (Using Summary) */}
          {summary && (
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AI-Powered Spotlight</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex px-6 overflow-x-auto" aria-label="Tabs" style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#e5e7eb #f9fafb'
            }}>
              {profileTabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.index)}
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
          <div className="flex-1 overflow-y-auto p-6">
            {/* Experience Tab */}
            {activeTab === 0 && (
              <div>
                {sortedExperience && sortedExperience.length > 0 ? (
                  <div className="space-y-5">
                    {sortedExperience.map((exp, index) => (
                      <div key={index} className={`bg-white rounded-lg shadow-sm border border-gray-100 p-4 ${index !== sortedExperience.length - 1 ? "mb-4" : ""}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex">
                            <div className="mr-3 mt-1">
                              <Briefcase className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{exp.position}</h4>
                              <p className="text-sm text-gray-600">{exp.company}</p>
                              {exp.location && <p className="text-xs text-gray-500 mt-0.5">{exp.location}</p>}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 text-right whitespace-nowrap pl-2">
                            {formatDateForDisplay(exp.startDate)} - {formatDateForDisplay(exp.endDate) || 'Present'}
                          </div>
                        </div>
                        {exp.description && <p className="mt-3 text-sm text-gray-700 leading-relaxed">{exp.description}</p>}
                        
                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-xs font-medium mb-1">Responsibilities:</h5>
                            <ul className="list-disc list-inside pl-2 space-y-1">
                              {exp.responsibilities.map((resp, i) => (
                                <li key={i} className="text-xs text-gray-600">{resp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {exp.achievements && exp.achievements.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-xs font-medium mb-1">Key Achievements:</h5>
                            <ul className="list-disc list-inside pl-2 space-y-1">
                              {exp.achievements.map((ach, i) => (
                                <li key={i} className="text-xs text-gray-600">{ach}</li>
                              ))}
                            </ul>
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
            {activeTab === 1 && (
              <div>
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
            {activeTab === 2 && (
              <div>
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
            {activeTab === 3 && (
              <div>
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
              {activeTab === 4 && (
                <div>
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
              {activeTab === 5 && (
                <div>
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
              {activeTab === 6 && (
                <div>
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
              {activeTab === 7 && (
                <div>
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
              {activeTab === 8 && (
                <div>
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
              {activeTab === 9 && (
                <div>
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
                  <div className="text-center py-8">
                    <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No pipeline data available</p>
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
