import React, { useState, useRef, useEffect } from 'react';
import { X, Github, Plus, Briefcase, FolderOpen, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, FileText, Clock, GraduationCap, Zap, Globe, Smartphone, BarChart, Cpu, Code2, ExternalLink, Award, FileBadge2, Heart, Mail, Phone, Languages, Settings, Loader2, Send, Eye } from 'lucide-react'; // Ensure these icons are installed
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Button from '../../../components/Button'; // Adjust path to your Button component if necessary
import CandidateProspectsManager from '../../../components/CandidateProspectsManager';
import CandidateNotes from './CandidateNotes';
import { emailApiService, SendCandidateEmailDto, EmailLogEntry } from '../../../services/emailApiService';
import { useToast } from '../../../contexts/ToastContext';
import { useShortlistExternalCandidate } from '../../../hooks/useShortlistExternal';
import { useAuthContext } from '../../../contexts/AuthContext';

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
  companyId?: number;
  companyUrl?: string;
  startDate: string;
  endDate?: string;
  startYear?: number;
  startMonth?: number;
  endYear?: number;
  endMonth?: number;
  duration?: string;
  durationMonths?: number;
  location?: string;
  description?: string;
  department?: string;
  managementLevel?: string;
  responsibilities?: string[];
  achievements?: string[];
  technologies?: string[];
  
  // Company details with URLs and social media
  companySize?: number;
  companySizeRange?: string;
  companyIndustry?: string;
  companyWebsite?: string;
  companyType?: string;
  companyFounded?: string;
  companyFollowersCount?: number;
  companyFacebookUrl?: string[];
  companyTwitterUrl?: string[];
  companyLinkedinUrl?: string;
  companyLocationHq?: {
    fullAddress?: string;
    country?: string;
    regions?: string[];
    countryIso2?: string;
    countryIso3?: string;
    city?: string;
    state?: string;
    street?: string;
    zipcode?: string;
  };
  companyLastUpdated?: string;
  companyCategoriesAndKeywords?: string[];
  companyStockTicker?: any[];
  companyIsB2b?: boolean;
  companyAnnualRevenue?: number;
  companyAnnualRevenueCurrency?: string;
  companyEmployeesCountChangeYearlyPercentage?: number;
  companyLastFundingRoundAnnouncedDate?: string;
  companyLastFundingRoundAmountRaised?: number;
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
  
  // Enhanced PDL fields
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  institutionLocation?: string;
  institutionWebsite?: string;
  institutionDomain?: string;
  institutionLinkedIn?: string;
  institutionType?: string;
  gpa?: number | null;
  minors?: string;
  socialProfiles?: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
  pdlMetadata?: {
    schoolId?: string;
    linkedinId?: string;
    schoolType?: string;
    hasLocation?: boolean;
    hasGpa?: boolean;
    degreesCount?: number;
    majorsCount?: number;
    minorsCount?: number;
  };
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
  coreSignalId?: string; // CoreSignal person ID for external candidates
  rawCandidateData?: any; // Original candidate data from external sources (for backend)
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
  candidateId?: string; // Add optional candidateId prop for prospects management
  projectId?: string; // Add optional projectId prop for project-scoped operations
  onShortlist?: () => void; // Add shortlist handler prop
  isShortlisting?: boolean; // Add shortlisting state prop
  onGmailError?: () => void; // Callback when Gmail connection error occurs
}

const SourcingProfileSidePanel: React.FC<ProfileSidePanelProps> = ({ userData, panelState, onStateChange, candidateId, projectId, onShortlist, isShortlisting = false, onGmailError }) => {
  const [activeTab, setActiveTab] = useState(0); // For main profile tabs
  const [activeSideTab, setActiveSideTab] = useState(0); // For side panel tabs
  const [isCandidateActionsCollapsed, setIsCandidateActionsCollapsed] = useState(true); // For collapsing candidate actions - hidden by default
  
  // Keywords expansion state - track which experience cards have expanded keywords
  const [expandedKeywords, setExpandedKeywords] = useState<Set<number>>(new Set());
  
  // Email composition state
  const [isComposingEmail, setIsComposingEmail] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Email history state
  const [emailHistory, setEmailHistory] = useState<EmailLogEntry[]>([]);
  const [isLoadingEmailHistory, setIsLoadingEmailHistory] = useState(false);
  const [emailHistoryPage, setEmailHistoryPage] = useState(1);
  const [emailHistoryTotal, setEmailHistoryTotal] = useState(0);
  const [selectedEmailForView, setSelectedEmailForView] = useState<EmailLogEntry | null>(null);
  const [isEmailViewModalOpen, setIsEmailViewModalOpen] = useState(false);
  
  // Auto-save candidate state
  const [savedCandidateId, setSavedCandidateId] = useState<string | undefined>(candidateId);
  const [isCreatingCandidate, setIsCreatingCandidate] = useState(false);
  
  // Toast context
  const { addToast } = useToast();
  
  // Auth context for user info
  const { user } = useAuthContext();
  
  // Hook for shortlisting external candidates
  const shortlistExternalMutation = useShortlistExternalCandidate();
  
  // Refs for scroll-based tab switching
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null); // Ref for click-outside detection
  
  if (!userData || panelState === 'closed') {
    return null;
  }

  const { personalInfo, summary, experience, education, skills, projects, certifications, awards, interests, languages, references, customFields } = userData;

  // Click outside to close panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Add a small delay to prevent race conditions with other click handlers
      setTimeout(() => {
        const target = event.target as Node;
        
        // Ensure we have a valid target and panel ref
        if (!target || !panelRef.current) return;
        
        // Don't close if clicking on elements within the panel
        if (panelRef.current.contains(target)) return;
        
        // Don't close if clicking on modal elements, dropdowns, or other overlay elements
        const clickedElement = target as Element;
        if (clickedElement.closest('.modal, .dropdown, .tooltip, .popover, [role="dialog"], [role="menu"]')) {
          return;
        }
        
        // Close the panel when clicking outside
        onStateChange('closed');
      }, 10);
    };

    // Add listener since panel is open (component only renders when not closed)
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onStateChange]);

  // Removed debug logging - education links are now working
  
  // Auto-save candidate before sending email or adding notes
  const ensureCandidateSaved = async (): Promise<string> => {
    console.log('🔍 ensureCandidateSaved called');
    console.log('  - savedCandidateId:', savedCandidateId);
    console.log('  - candidateId prop:', candidateId);
    console.log('  - userData.coreSignalId:', userData?.coreSignalId);
    
    // If we already have a saved candidate ID (from prop or previous save), use it
    if (savedCandidateId) {
      console.log('✅ Using existing saved candidate ID:', savedCandidateId);
      return savedCandidateId;
    }
    
    // If candidateId prop is provided, the candidate is already in database
    if (candidateId) {
      console.log('✅ Using candidate ID from prop:', candidateId);
      setSavedCandidateId(candidateId);
      return candidateId;
    }
    
    // If no candidateId and no coreSignalId, we can't create the candidate
    if (!userData?.coreSignalId) {
      console.error('❌ No candidate ID or CoreSignal ID available');
      throw new Error('Cannot save candidate: No candidate ID or CoreSignal ID available');
    }
    
    console.log('📝 Creating new candidate from CoreSignal data...');
    console.log('  - CoreSignal ID:', userData.coreSignalId);
    console.log('  - Raw candidate data available:', !!userData.rawCandidateData);
    console.log('  - userData.personalInfo:', userData.personalInfo);
    console.log('  - userData.personalInfo?.fullName:', userData.personalInfo?.fullName);
    
    // Prepare candidate data for backend
    // Handle both structures: rawCandidateData.candidate or rawCandidateData directly
    let candidateDataForBackend;
    if (userData.rawCandidateData?.candidate) {
      // If rawCandidateData has nested 'candidate' property, extract it
      candidateDataForBackend = userData.rawCandidateData.candidate;
    } else if (userData.rawCandidateData) {
      // If rawCandidateData is the candidate object itself
      candidateDataForBackend = userData.rawCandidateData;
    } else {
      // Fallback: construct from userData if raw data not available
      candidateDataForBackend = {
        fullName: userData.personalInfo?.fullName,
        firstName: userData.personalInfo?.fullName?.split(' ')[0],
        lastName: userData.personalInfo?.fullName?.split(' ').slice(1).join(' '),
        email: userData.personalInfo?.email,
        phone: userData.personalInfo?.phone,
        location: userData.personalInfo?.location,
        linkedIn: userData.personalInfo?.linkedIn,
        github: userData.personalInfo?.github,
        avatar: userData.personalInfo?.avatar,
        summary: userData.summary,
        experience: userData.experience,
        education: userData.education,
        skills: userData.skills,
        coreSignalId: userData.coreSignalId
      };
    }
    
    console.log('  - candidateDataForBackend constructed:', {
      fullName: candidateDataForBackend?.fullName,
      email: candidateDataForBackend?.email,
      coreSignalId: candidateDataForBackend?.coreSignalId,
      hasRawData: !!userData.rawCandidateData,
      hasNestedCandidate: !!userData.rawCandidateData?.candidate
    });

    // Validation: Ensure we have at minimum a fullName
    if (!candidateDataForBackend?.fullName && !userData.rawCandidateData?.fullName && !userData.rawCandidateData?.full_name) {
      const errorMsg = 'Cannot save candidate: fullName is required but not available in candidate data';
      console.error('❌', errorMsg);
      console.error('  - Available userData fields:', Object.keys(userData));
      console.error('  - personalInfo:', userData.personalInfo);
      throw new Error(errorMsg);
    }
    
    // Create candidate using shortlist external endpoint
    setIsCreatingCandidate(true);
    try {
      const shortlistResult = await shortlistExternalMutation.mutateAsync({
        coreSignalId: userData.coreSignalId,
        candidateData: candidateDataForBackend,
        createdBy: user?.id || ''
      });
      
      console.log('📦 Shortlist result:', shortlistResult);
      
      // Extract the candidate ID (could be new or existing)
      const dbCandidateId = shortlistResult.candidateId || shortlistResult.existingCandidateId;
      
      if (!dbCandidateId) {
        throw new Error('Failed to get candidate ID from shortlist result');
      }
      
      console.log('✅ Candidate saved/found with ID:', dbCandidateId);
      setSavedCandidateId(dbCandidateId);
      
      // Show success message
      if (shortlistResult.success) {
        addToast({
          type: 'success',
          title: 'Candidate Saved',
          message: shortlistResult.message || 'Candidate saved successfully',
          duration: 3000
        });
      } else if (shortlistResult.existingCandidateId) {
        addToast({
          type: 'info',
          title: 'Candidate Already Exists',
          message: shortlistResult.message || 'Using existing candidate record',
          duration: 3000
        });
      }
      
      return dbCandidateId;
    } catch (error) {
      console.error('❌ Error saving candidate:', error);
      addToast({
        type: 'error',
        title: 'Failed to Save Candidate',
        message: error instanceof Error ? error.message : 'Could not save candidate to database',
        duration: 5000
      });
      throw error;
    } finally {
      setIsCreatingCandidate(false);
    }
  };
  
  // Send email function
  const sendEmail = async (emailData: { to: string; subject: string; body: string; candidateName: string }) => {
    try {
      // Convert plain text to nicely formatted HTML email
      const textContent = emailData.body
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');

      // Create a professional HTML email template
      const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailData.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                TAL Recruitment
              </h1>
            </td>
          </tr>
          
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px; color: #333333; font-size: 16px; line-height: 1.6;">
              ${textContent}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px; line-height: 1.5;">
                Best regards,<br>
                <strong style="color: #495057;">TAL Recruitment Team</strong>
              </p>
              <p style="margin: 10px 0 0 0; color: #adb5bd; font-size: 12px; line-height: 1.4;">
                This email was sent via TAL - Talent Acquisition Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim();

      // Check if we have a CoreSignal ID and no saved candidate ID (lazy creation flow)
      if (userData?.coreSignalId && !savedCandidateId && !candidateId) {
        console.log('=== Using CoreSignal email endpoint ===');
        console.log('CoreSignal ID:', userData.coreSignalId);
        console.log('Saved Candidate ID:', savedCandidateId);
        console.log('Prop Candidate ID:', candidateId);
        
        // Use CoreSignal email endpoint (creates candidate if needed)
        // Use full rawCandidateData (same as shortlist) to create complete profile
        // Handle both structures: rawCandidateData.candidate or rawCandidateData directly
        let candidateDataForBackend;
        if (userData.rawCandidateData?.candidate) {
          // If rawCandidateData has nested 'candidate' property, extract it
          candidateDataForBackend = userData.rawCandidateData.candidate;
        } else if (userData.rawCandidateData) {
          // If rawCandidateData is the candidate object itself
          candidateDataForBackend = userData.rawCandidateData;
        } else {
          // Fallback: construct from userData if raw data not available
          candidateDataForBackend = {
            fullName: userData.personalInfo?.fullName,
            firstName: userData.personalInfo?.fullName?.split(' ')[0],
            lastName: userData.personalInfo?.fullName?.split(' ').slice(1).join(' '),
            email: userData.personalInfo?.email,
            phone: userData.personalInfo?.phone,
            location: userData.personalInfo?.location,
            linkedIn: userData.personalInfo?.linkedIn,
            github: userData.personalInfo?.github,
            avatar: userData.personalInfo?.avatar,
            summary: userData.summary,
            experience: userData.experience,
            education: userData.education,
            skills: userData.skills,
            coreSignalId: userData.coreSignalId
          };
        }

        console.log('Candidate data for backend (full profile):', {
          fullName: candidateDataForBackend?.fullName,
          email: candidateDataForBackend?.email,
          experienceCount: candidateDataForBackend?.experience?.length,
          educationCount: candidateDataForBackend?.education?.length,
          skillsCount: candidateDataForBackend?.skills?.length || candidateDataForBackend?.skillMappings?.length,
          hasRawData: !!userData.rawCandidateData
        });

        const result = await emailApiService.sendCoreSignalEmail({
          coreSignalId: userData.coreSignalId,
          candidateData: candidateDataForBackend,
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          htmlBody: htmlBody,
        });

        console.log('Email sent! Result:', result);
        console.log('Candidate ID returned:', result.candidateId);

        // Cache the candidateId for future operations
        setSavedCandidateId(result.candidateId);
        console.log('Saved candidate ID cached:', result.candidateId);
        
        return true;
      } else {
        // Use regular candidate email endpoint (requires candidateId)
        const dbCandidateId = savedCandidateId || candidateId || await ensureCandidateSaved();
        
        if (!dbCandidateId) {
          throw new Error('Candidate ID is required to send email');
        }

        const emailRequest: SendCandidateEmailDto = {
          candidateId: dbCandidateId,
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          htmlBody: htmlBody,
        };

        await emailApiService.sendCandidateEmail(emailRequest);
        return true;
      }
    } catch (error: any) {
      console.error('Failed to send email:', error);
      console.log('DEBUG - Error details:', {
        status: error?.response?.status,
        message: error?.response?.data?.message,
        fullError: error?.response?.data
      });
      
      // Check for Gmail connection expired error (401 with specific message)
      if (error?.response?.status === 401) {
        const errorMessage = error.response?.data?.message || '';
        console.log('DEBUG - 401 error detected, message:', errorMessage);
        if (errorMessage.includes('Gmail') || errorMessage.includes('reconnect')) {
          console.log('DEBUG - Gmail error detected! Calling onGmailError callback');
          // Call parent callback to close panel and show modal
          if (onGmailError) {
            onGmailError();
          }
          // Throw error so it can be caught by onClick handler
          throw error;
        }
      }
      
      // Fallback to opening email client if API fails for other reasons
      const subject = encodeURIComponent(emailData.subject);
      const body = encodeURIComponent(emailData.body.replace(/<[^>]*>/g, '')); // Strip HTML for mailto
      window.open(`mailto:${emailData.to}?subject=${subject}&body=${body}`, '_self');
      throw error;
    }
  };

  // Load email history using CoreSignal ID
  const loadEmailHistory = async () => {
    if (!userData?.coreSignalId) {
      console.log('No CoreSignal ID available for email history');
      return;
    }

    console.log('Loading email history for CoreSignal ID:', userData.coreSignalId);
    setIsLoadingEmailHistory(true);
    try {
      const response = await emailApiService.getCoreSignalCandidateEmailHistory(
        userData.coreSignalId,
        {
          page: emailHistoryPage,
          limit: 10,
        }
      );
      
      console.log('Email history response:', response);
      setEmailHistory(response.emails || []);
      setEmailHistoryTotal(response.total || 0);
      
      // If we got a candidateId from the response, save it
      if (response.candidateId && !savedCandidateId) {
        console.log('Found existing candidate ID from email history:', response.candidateId);
        setSavedCandidateId(response.candidateId);
      }
    } catch (error) {
      console.error('Failed to load email history:', error);
      setEmailHistory([]);
      setEmailHistoryTotal(0);
    } finally {
      setIsLoadingEmailHistory(false);
    }
  };

  // Load email history when CoreSignal ID is available
  useEffect(() => {
    if (userData?.coreSignalId && activeSideTab === 1) {
      loadEmailHistory();
    }
  }, [userData?.coreSignalId, emailHistoryPage, activeSideTab]);
  
  // Toggle keywords expansion for a specific experience card
  const toggleKeywordsExpansion = (index: number) => {
    setExpandedKeywords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };
  
  // Helper function to parse and normalize dates for sorting
  const parseDate = (dateValue: string | number | undefined): Date => {
    if (!dateValue) return new Date(0); // Very old date for missing dates
    
    // Convert to string if it's a number
    const dateStr = String(dateValue);
    
    // Handle "Present" or similar current indicators
    if (dateStr.toLowerCase().includes('present') || dateStr.toLowerCase().includes('current')) {
      return new Date(); // Current date
    }
    
    // Try to parse various date formats
    // Handle formats like "2023", "2023-05", "May 2023", "2023-05-15", etc.
    let parsedDate: Date;
    
    // If it's just a year (4 digits) - use end of year for better sorting
    if (/^\d{4}$/.test(dateStr)) {
      const year = parseInt(dateStr);
      // For years, use December 31st to ensure proper chronological sorting
      parsedDate = new Date(year, 11, 31, 23, 59, 59); // End of year
    }
    // If it's year-month format (YYYY-MM) - use end of month
    else if (/^\d{4}-\d{2}$/.test(dateStr)) {
      const [year, month] = dateStr.split('-');
      const yearNum = parseInt(year);
      const monthNum = parseInt(month) - 1; // JavaScript months are 0-indexed
      // Use last day of the month for better sorting
      parsedDate = new Date(yearNum, monthNum + 1, 0, 23, 59, 59); // Last day of month
    }
    // If it's a full ISO date (YYYY-MM-DD)
    else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      parsedDate = new Date(dateStr);
    }
    // Try parsing other formats like "May 2023", "2023-Q4", etc.
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
    if (!dateStr) return 'N/A';
    
    const dateStrLower = dateStr.toLowerCase();
    if (dateStrLower.includes('present') || dateStrLower.includes('current')) {
      return 'Present';
    }
    
    // If it's just a year, return the year
    if (/^\d{4}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Try to parse and format nicely
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }
    
    return dateStr;
  };

  // Helper function to format email status with icon and color
  const formatEmailStatus = (status: string) => {
    const statusMap: Record<string, { icon: any; color: string; label: string }> = {
      sent: { icon: Mail, color: 'text-blue-500', label: 'Sent' },
      delivered: { icon: Mail, color: 'text-green-500', label: 'Delivered' },
      pending: { icon: Clock, color: 'text-yellow-500', label: 'Pending' },
      failed: { icon: X, color: 'text-red-500', label: 'Failed' },
      bounced: { icon: X, color: 'text-orange-500', label: 'Bounced' },
      rejected: { icon: X, color: 'text-red-600', label: 'Rejected' },
    };
    return statusMap[status.toLowerCase()] || { icon: Mail, color: 'text-gray-500', label: status };
  };


  // Helper function to sort experience chronologically (most recent first)
  const sortedExperience = experience?.slice().sort((a, b) => {
    // Get end dates - if no end date, assume it's current (ongoing)
    const getEndDate = (exp: Experience) => {
      if (exp.endDate) return parseDate(exp.endDate);
      // If no end date provided, assume it's current/ongoing
      return new Date();
    };
    
    // Get start dates - fallback to very old date if missing
    const getStartDate = (exp: Experience) => {
      if (exp.startDate) return parseDate(exp.startDate);
      return new Date(0); // Very old date for missing start dates
    };
    
    const aEndDate = getEndDate(a);
    const bEndDate = getEndDate(b);
    
    // Sort by end date descending (most recent first)
    if (aEndDate.getTime() !== bEndDate.getTime()) {
      return bEndDate.getTime() - aEndDate.getTime();
    }
    
    // If end dates are the same, sort by start date descending (most recent first)
    const aStartDate = getStartDate(a);
    const bStartDate = getStartDate(b);
    return bStartDate.getTime() - aStartDate.getTime();
  });

  // Helper function to sort education chronologically (most recent first)
  const sortedEducation = education?.slice().sort((a, b) => {
    // Determine the end date for each education entry
    const getEndDate = (edu: Education) => {
      if (edu.endDate) return parseDate(edu.endDate);
      if (edu.graduationDate) return parseDate(edu.graduationDate);
      if (edu.endYear) return parseDate(edu.endYear.toString());
      return new Date(); // Current date for ongoing education
    };
    
    // Determine the start date for each education entry
    const getStartDate = (edu: Education) => {
      if (edu.startDate) return parseDate(edu.startDate);
      if (edu.startYear) return parseDate(edu.startYear.toString());
      return new Date(0); // Very old date for missing start dates
    };
    
    const aEndDate = getEndDate(a);
    const bEndDate = getEndDate(b);
    
    // Sort by end date descending (most recent first)
    if (aEndDate.getTime() !== bEndDate.getTime()) {
      return bEndDate.getTime() - aEndDate.getTime();
    }
    
    // If end dates are the same, sort by start date descending
    const aStartDate = getStartDate(a);
    const bStartDate = getStartDate(b);
    return bStartDate.getTime() - aStartDate.getTime();
  });

  // Main profile tabs for the 2/3 section - filter out empty tabs
  const allProfileTabs = [
    { name: 'Experience', icon: Briefcase, index: 0, count: sortedExperience?.length || 0, data: sortedExperience },
    { name: 'Education', icon: GraduationCap, index: 1, count: sortedEducation?.length || 0, data: sortedEducation },
    { name: 'Skills', icon: Zap, index: 2, count: skills?.length || 0, data: skills },
    { name: 'Projects', icon: FolderOpen, index: 3, count: projects?.length || 0, data: projects },
    { name: 'Certifications', icon: FileBadge2, index: 4, count: certifications?.length || 0, data: certifications },
    { name: 'Awards', icon: Award, index: 5, count: awards?.length || 0, data: awards },
    { name: 'Languages', icon: Languages, index: 6, count: languages?.length || 0, data: languages },
    { name: 'Interests', icon: Heart, index: 7, count: interests?.length || 0, data: interests },
    { name: 'References', icon: Mail, index: 8, count: references?.length || 0, data: references },
    { name: 'Custom Fields', icon: FileText, index: 9, count: customFields?.length || 0, data: customFields },
  ];
  
  // Filter out empty tabs and re-index
  const profileTabs = allProfileTabs
    .filter(tab => tab.count > 0)
    .map((tab, index) => ({ ...tab, originalIndex: tab.index, index }));
  
  // Removed debug logging
  
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

  // Side panel tabs for the 1/3 section (candidate management)
  const sideTabs = [
    // { name: 'Prospects', icon: Briefcase, index: 0, count: 0 }, // Hidden
    { name: 'Communication', icon: Mail, index: 1, count: emailHistoryTotal },
    { name: 'Notes', icon: FileText, index: 2, count: 0 },
    // { name: 'Activity', icon: Clock, index: 3, count: 0 }, // Hidden
  ];  // Collapsed state - show only the 2/3 profile section (1/3 of total page width)
  if (panelState === 'collapsed') {
    return (
      <>
        {/* Backdrop - clicking this will close the panel */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => onStateChange('closed')}
        />
        
        {/* Side Panel - Dynamic width based on actions panel state */}
        <div 
          ref={panelRef}
          className={`fixed inset-y-0 right-0 ${isCandidateActionsCollapsed ? 'w-full sm:w-2/3 md:w-1/2 lg:w-1/3' : 'w-full sm:w-4/5 md:w-3/4 lg:w-2/3'} bg-white shadow-2xl z-50 flex transition-all duration-300 ease-in-out`}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
        {/* Profile Info Section - Full width in collapsed view */}
        <div className="flex-1 w-full flex flex-col">
          {/* Panel Header - Sticky */}
          <div className="sticky top-0 bg-white z-10">
            <div className="flex items-center justify-end p-4 border-b border-gray-200">
              <Button
                variant="primary"
                onClick={() => onStateChange('closed')}
                className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:border-purple-700 p-2"
                aria-label="Close Panel"
              >
                <X size={20} />
              </Button>
            </div>
          </div>

          {/* Profile Basic Info + Main Action Buttons */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start">
              {(() => {
                const [imageError, setImageError] = React.useState(false);
                
                if (personalInfo.avatar && !imageError) {
                  return (
                    <img 
                      src={personalInfo.avatar} 
                      alt={personalInfo.fullName}
                      className="h-12 w-12 rounded-full mr-4 flex-shrink-0 object-cover"
                      onError={() => setImageError(true)}
                    />
                  );
                } else {
                  // Generate initials from full name
                  const initials = personalInfo.fullName
                    .split(' ')
                    .map(name => name.charAt(0))
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  
                  return (
                    <div className="bg-purple-100 rounded-full h-12 w-12 flex items-center justify-center text-purple-600 text-xl font-semibold mr-4 flex-shrink-0">
                      {initials}
                    </div>
                  );
                }
              })()}
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
              
              {personalInfo.facebook && (
                <div className="flex items-center text-sm">
                  <Globe className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" />
                  <a 
                    href={personalInfo.facebook.startsWith('http') ? personalInfo.facebook : `https://${personalInfo.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-blue-600 transition-colors truncate"
                  >
                    Facebook Profile
                  </a>
                </div>
              )}
              
              {personalInfo.twitter && (
                <div className="flex items-center text-sm">
                  <Globe className="w-4 h-4 text-sky-400 mr-2 flex-shrink-0" />
                  <a 
                    href={personalInfo.twitter.startsWith('http') ? personalInfo.twitter : `https://${personalInfo.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-sky-600 transition-colors truncate"
                  >
                    Twitter Profile
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
          <div className="flex-1 flex flex-col relative">
            {/* AI-Powered Spotlight (Using Summary) */}
            {summary && (
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AI-Powered Spotlight</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
              </div>
            )}

            {/* Tabs Navigation - Responsive */}
            <div className="border-b border-gray-200 sticky top-0 bg-white z-10">
              <nav className="flex px-4 sm:px-6 overflow-x-auto" aria-label="Tabs" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                {profileTabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveTab(tab.index);
                    }}
                    className={`${
                      activeTab === tab.index
                        ? 'border-purple-500 text-purple-600 font-semibold'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-3 px-2 sm:px-3 border-b-2 text-xs flex items-center gap-1 mr-2 sm:mr-4 flex-shrink-0`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.name}</span>
                    <span className="sm:hidden">{tab.name.slice(0, 3)}</span>
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

            {/* Tab Content - Scrollable with section refs and bottom padding for floating action bar */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
              {/* Experience Tab */}
              {profileTabs[activeTab]?.originalIndex === 0 && (
                <div>
                  {sortedExperience && sortedExperience.length > 0 ? (
                    <div className="space-y-5">
                      {sortedExperience.map((exp, index) => (
                        <div key={index} className="border-b border-gray-100 pb-4 mb-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-start gap-2">
                                <Briefcase className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">{exp.position}</h4>
                                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                    <span className="text-sm text-gray-600">{exp.company}</span>
                                    
                                    {/* Company URLs inline with company name */}
                                    {(exp.companyWebsite || exp.companyLinkedinUrl || 
                                      (exp.companyFacebookUrl && exp.companyFacebookUrl.length > 0) || 
                                      (exp.companyTwitterUrl && exp.companyTwitterUrl.length > 0)) && (
                                      <div className="flex items-center gap-2">
                                        {exp.companyWebsite && (
                                          <a
                                            href={exp.companyWebsite.startsWith('http') ? exp.companyWebsite : `https://${exp.companyWebsite}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Company Website"
                                          >
                                            <Globe className="h-3.5 w-3.5" />
                                          </a>
                                        )}
                                        {exp.companyLinkedinUrl && (
                                          <a
                                            href={exp.companyLinkedinUrl.startsWith('http') ? exp.companyLinkedinUrl : `https://${exp.companyLinkedinUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-700 hover:text-blue-900 transition-colors"
                                            title="LinkedIn"
                                          >
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                            </svg>
                                          </a>
                                        )}
                                        {exp.companyFacebookUrl && exp.companyFacebookUrl.length > 0 && (
                                          <a
                                            href={exp.companyFacebookUrl[0].startsWith('http') ? exp.companyFacebookUrl[0] : `https://${exp.companyFacebookUrl[0]}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Facebook"
                                          >
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                            </svg>
                                          </a>
                                        )}
                                        {exp.companyTwitterUrl && exp.companyTwitterUrl.length > 0 && (
                                          <a
                                            href={exp.companyTwitterUrl[0].startsWith('http') ? exp.companyTwitterUrl[0] : `https://${exp.companyTwitterUrl[0]}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sky-500 hover:text-sky-700 transition-colors"
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
                                    {exp.companyIndustry && <span>• {exp.companyIndustry}</span>}
                                    {exp.companySizeRange && <span>• 👥 {exp.companySizeRange}</span>}
                                    {exp.companyLocationHq?.fullAddress && <span>• 🏢 {exp.companyLocationHq.fullAddress}</span>}
                                  </div>
                                  
                                  {/* Keywords inline - Show limited keywords with "show more" */}
                                  {exp.companyCategoriesAndKeywords && exp.companyCategoriesAndKeywords.length > 0 && (
                                    <div className="mt-2">
                                      <div className="flex flex-wrap gap-1">
                                        {(expandedKeywords.has(index) 
                                          ? exp.companyCategoriesAndKeywords 
                                          : exp.companyCategoriesAndKeywords.slice(0, 3)
                                        ).map((keyword, i) => (
                                          <span key={i} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                                            {keyword}
                                          </span>
                                        ))}
                                        {exp.companyCategoriesAndKeywords.length > 3 && (
                                          <button
                                            onClick={() => toggleKeywordsExpansion(index)}
                                            className="px-1.5 py-0.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded text-xs font-medium transition-colors"
                                          >
                                            {expandedKeywords.has(index) 
                                              ? 'Show less' 
                                              : `+${exp.companyCategoriesAndKeywords.length - 3} more`
                                            }
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 text-right whitespace-nowrap">
                              {formatDateForDisplay(exp.startDate)} - {formatDateForDisplay(exp.endDate) || 'Present'}
                            </div>
                          </div>
                          {exp.description && <p className="mt-2 text-xs text-gray-700 leading-relaxed">{exp.description}</p>}
                          
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
              {/* Removed debug logging */}
              {profileTabs[activeTab]?.originalIndex === 1 && (
                <div>
                  {(() => {
                    console.log('=== EDUCATION TAB RENDERING ===');
                    console.log('sortedEducation:', sortedEducation);
                    console.log('sortedEducation.length:', sortedEducation?.length);
                    return null;
                  })()}
                  {sortedEducation && sortedEducation.length > 0 ? (
                    <div className="space-y-4">
                      {sortedEducation.map((edu, index) => (
                        <div key={index} className={`bg-white rounded-lg shadow-sm border border-gray-100 p-4 ${index !== sortedEducation.length - 1 ? "mb-4" : ""}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex flex-1">
                              <div className="mr-3 mt-1">
                                <GraduationCap className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                                  {edu.gpa && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                      GPA: {edu.gpa}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Institution with enhanced details */}
                                <div className="mt-1">
                                  {/* Debug: Log education data to console */}
                                  {/* Removed debug logging */}
                                  {/* Check if institution field is a URL - simplified logic */}
                                  {(() => {
                                    const isURL = typeof edu.institution === 'string' && 
                                      (edu.institution.startsWith('http://') || 
                                       edu.institution.startsWith('https://') || 
                                       edu.institution.includes('linkedin.com'));
                                    
                                    console.log('URL Check for:', edu.institution, 'Result:', isURL);
                                    
                                    if (isURL) {
                                      const displayName = edu.institutionName || 
                                        (edu.institution.includes('linkedin.com/school/') 
                                          ? edu.institution.split('/school/')[1]?.replace(/-/g, ' ')?.replace(/\/$/, '') || 'LinkedIn School'
                                          : edu.institution.replace('https://', '').replace('www.', '').split('/')[0]);
                                      
                                      return (
                                        <a 
                                          href={edu.institution.startsWith('http') ? edu.institution : `https://${edu.institution}`}
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                        >
                                          {displayName}
                                          <ExternalLink className="h-3 w-3" />
                                        </a>
                                      );
                                    } else {
                                      return (
                                        <p className="text-sm text-gray-600">{edu.institution}</p>
                                      );
                                    }
                                  })()}
                                  
                                  {/* Institution type */}
                                  {edu.institutionType && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                      {edu.institutionType}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Location with priority for institutionLocation */}
                                {(edu.institutionLocation || edu.location) && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    📍 {edu.institutionLocation || edu.location}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-500 text-right whitespace-nowrap pl-2">
                              {/* Enhanced date handling with year support */}
                              {edu.startYear && edu.endYear ? `${edu.startYear} - ${edu.endYear}` :
                               edu.startDate && edu.endDate ? `${formatDateForDisplay(edu.startDate)} - ${formatDateForDisplay(edu.endDate)}` : 
                               edu.graduationDate ? formatDateForDisplay(edu.graduationDate) :
                               edu.startYear ? `${edu.startYear} - Present` :
                               edu.startDate ? `${formatDateForDisplay(edu.startDate)} - Present` : ''}
                            </div>
                          </div>
                          
                          {/* Field of Study / Major */}
                          {(edu.fieldOfStudy || edu.major) && (
                            <p className="text-xs text-gray-600 mt-1 ml-8">
                              Major: {edu.fieldOfStudy || edu.major}
                            </p>
                          )}
                          
                          {/* Minors */}
                          {edu.minors && (
                            <p className="text-xs text-gray-600 mt-0.5 ml-8">
                              Minors: {edu.minors}
                            </p>
                          )}
                          
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
                          
                          {/* Enhanced Institution Links & Social Profiles */}
                          {edu.socialProfiles && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <h5 className="text-xs font-medium mb-2 text-gray-700">Institution Links:</h5>
                              <div className="flex flex-wrap gap-2">
                                {edu.socialProfiles.website && (
                                  <a 
                                    href={edu.socialProfiles.website.startsWith('http') ? edu.socialProfiles.website : `https://${edu.socialProfiles.website}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs transition-colors"
                                  >
                                    🌐 Website
                                  </a>
                                )}
                                {edu.socialProfiles.linkedin && (
                                  <a 
                                    href={edu.socialProfiles.linkedin.startsWith('http') ? edu.socialProfiles.linkedin : `https://${edu.socialProfiles.linkedin}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs transition-colors"
                                  >
                                    💼 LinkedIn
                                  </a>
                                )}
                                {edu.socialProfiles.facebook && (
                                  <a 
                                    href={edu.socialProfiles.facebook.startsWith('http') ? edu.socialProfiles.facebook : `https://${edu.socialProfiles.facebook}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs transition-colors"
                                  >
                                    📘 Facebook
                                  </a>
                                )}
                                {edu.socialProfiles.twitter && (
                                  <a 
                                    href={edu.socialProfiles.twitter.startsWith('http') ? edu.socialProfiles.twitter : `https://${edu.socialProfiles.twitter}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs transition-colors"
                                  >
                                    🐦 Twitter
                                  </a>
                                )}
                              </div>
                              
                              {/* Institution Domain */}
                              {edu.institutionDomain && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Domain: {edu.institutionDomain}
                                </p>
                              )}
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
              {profileTabs[activeTab]?.originalIndex === 2 && (
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
              {profileTabs[activeTab]?.originalIndex === 3 && (
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
                              {project.technologies.map((tech, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs flex items-center">
                                  <span className="w-1 h-1 bg-green-700 rounded-full mr-1"></span>
                                  {tech}
                                </span>
                              ))}
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
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FolderOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No projects information</p>
                    </div>                  )}
                </div>
              )}

              {/* Certifications Tab */}
              {profileTabs[activeTab]?.originalIndex === 4 && (
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
              {profileTabs[activeTab]?.originalIndex === 5 && (
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
              {profileTabs[activeTab]?.originalIndex === 6 && (
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
              {profileTabs[activeTab]?.originalIndex === 7 && (
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
              {profileTabs[activeTab]?.originalIndex === 8 && (
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
              {profileTabs[activeTab]?.originalIndex === 9 && (
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

          {/* Floating Action Bar */}
          <div className="absolute bottom-6 left-4 right-4 py-4 flex justify-center">
            <div className='flex items-center justify-between gap-2 bg-white/20 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg px-4 py-4 max-w-md w-full'>
                <button
                  onClick={() => {
                    if (onShortlist) {
                      onShortlist();
                    }
                  }}
                  disabled={isShortlisting || !onShortlist}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  title="Add to Job"
                >
                  {isShortlisting ? (
                    <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="hidden md:inline whitespace-nowrap">
                    {isShortlisting ? 'Adding...' : 'Add to Job'}
                  </span>
                </button>
                
                <button
                  onClick={() => {
                    // Switch to Communication tab and open email composer (stay in collapsed view)
                    setIsCandidateActionsCollapsed(false); // Open actions panel
                    setActiveSideTab(1); // Communication tab
                    setIsComposingEmail(true);
                    setEmailTo(personalInfo.email || ''); // Initialize with candidate email or empty
                    setEmailSubject(`Regarding your profile - ${personalInfo.fullName}`);
                    setEmailBody(`Hi ${personalInfo.fullName.split(' ')[0]},\n\nI hope this email finds you well. I came across your profile and would like to discuss potential opportunities.\n\nBest regards`);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                  title="Send Email"
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline whitespace-nowrap">Send Email</span>
                </button>
                
                <button
                  onClick={() => {
                    // Switch to Notes tab and open actions panel
                    setIsCandidateActionsCollapsed(false); // Open actions panel
                    setActiveSideTab(2); // Notes tab
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                  title="Add Notes"
                >
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline whitespace-nowrap">Add Notes</span>
                </button>
            </div>
          </div>
        </div>

        {/* Candidate Actions Section - Right Side (shown when not collapsed) */}
        <div className={`${isCandidateActionsCollapsed ? 'w-0 overflow-hidden' : 'w-1/2'} bg-gray-50 border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
          {!isCandidateActionsCollapsed && (
            <>
              {/* Actions Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">Candidate Actions</h3>
                  <button
                    onClick={() => setIsCandidateActionsCollapsed(true)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Close actions panel"
                  >
                    <X className="w-4 h-4 text-gray-500" />
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
                                setEmailTo(personalInfo.email || ''); // Initialize with candidate email or empty
                                setEmailSubject(`Regarding your profile - ${personalInfo.fullName}`);
                                setEmailBody(`Hi ${personalInfo.fullName.split(' ')[0]},\n\nI hope this email finds you well. I came across your profile and would like to discuss potential opportunities.\n\nBest regards`);
                              }}
                              className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Compose
                            </button>
                          </div>
                          
                          <p className="text-xs text-gray-500">Start a conversation with {personalInfo.fullName}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Email Composition Form - Compact */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-gray-800">Compose Email</h4>
                            <button
                              onClick={() => setIsComposingEmail(false)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                              <input
                                type="email"
                                value={emailTo}
                                onChange={(e) => setEmailTo(e.target.value)}
                                placeholder="Enter email address"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                              <input
                                type="text"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Email subject"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                              <textarea
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={8}
                                placeholder="Type your message..."
                              />
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  if (!emailTo.trim()) {
                                    addToast({
                                      type: 'error',
                                      title: 'No Email',
                                      message: 'Please enter an email address',
                                    });
                                    return;
                                  }
                                  
                                  if (!emailSubject.trim() || !emailBody.trim()) {
                                    addToast({
                                      type: 'error',
                                      title: 'Incomplete Form',
                                      message: 'Please fill in all fields',
                                    });
                                    return;
                                  }
                                  
                                  setIsSendingEmail(true);
                                  try {
                                    await sendEmail({
                                      to: emailTo,
                                      subject: emailSubject,
                                      body: emailBody,
                                      candidateName: personalInfo.fullName,
                                    });
                                    
                                    addToast({
                                      type: 'success',
                                      title: 'Email Sent',
                                      message: `Email sent successfully to ${personalInfo.fullName}`,
                                    });
                                    
                                    setIsComposingEmail(false);
                                    setEmailSubject('');
                                    setEmailBody('');
                                    setEmailTo('');
                                    
                                    // Reload email history to show the newly sent email
                                    loadEmailHistory();
                                  } catch (error: any) {
                                    // Check if this is a Gmail reconnection error - don't show toast, modal will appear
                                    if (error?.response?.status === 401 && 
                                        (error.response?.data?.message?.includes('Gmail') || 
                                         error.response?.data?.message?.includes('reconnect'))) {
                                      // Gmail modal will be shown by sendEmail function, don't show error toast
                                      return;
                                    }
                                    
                                    addToast({
                                      type: 'error',
                                      title: 'Email Failed',
                                      message: 'Failed to send email',
                                    });
                                  } finally {
                                    setIsSendingEmail(false);
                                  }
                                }}
                                disabled={isSendingEmail || !emailTo || !emailSubject || !emailBody}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                {isSendingEmail ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4" />
                                    <span>Send Email</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => setIsComposingEmail(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {/* Email History Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <Clock className="w-4 h-4 text-gray-500 mr-2" />
                        Email History
                        {emailHistoryTotal > 0 && (
                          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {emailHistoryTotal}
                          </span>
                        )}
                      </h4>
                      
                      {isLoadingEmailHistory ? (
                        <div className="text-center py-8">
                          <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Loading email history...</p>
                        </div>
                      ) : emailHistory.length > 0 ? (
                        <div className="space-y-2">
                          {emailHistory.map((email) => {
                            const statusInfo = formatEmailStatus(email.status);
                            const StatusIcon = statusInfo.icon;
                            
                            return (
                              <div key={email.id} className="border border-gray-100 rounded-md p-3 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-xs font-medium text-gray-900 truncate">
                                      {email.subject}
                                    </h5>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                      To: {email.recipients.join(', ')}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
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
                                      <StatusIcon className="w-3 h-3" />
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                                  {email.body.replace(/<[^>]*>/g, '').substring(0, 80)}
                                  {email.body.length > 80 && '...'}
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
                                  <span className="capitalize text-xs">
                                    {statusInfo.label}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          
                          {emailHistoryTotal > emailHistory.length && (
                            <button 
                              className="w-full text-center py-2 text-xs text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded transition-colors"
                              onClick={() => {
                                setEmailHistoryPage(prev => prev + 1);
                              }}
                            >
                              Load more ({emailHistoryTotal - emailHistory.length} remaining)
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Mail className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">No emails sent yet</p>
                          <p className="text-xs text-gray-400 mt-1">Start a conversation by composing an email</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes Tab */}
                {activeSideTab === 2 && (
                  <CandidateNotes 
                    candidateId={savedCandidateId || candidateId} 
                    candidateName={personalInfo?.fullName}
                    coreSignalId={userData?.coreSignalId}
                    candidateData={
                      // Handle both structures: rawCandidateData.candidate or rawCandidateData directly
                      userData?.rawCandidateData?.candidate ? userData.rawCandidateData.candidate :
                      userData?.rawCandidateData ? userData.rawCandidateData :
                      {
                        // Fallback: construct from userData if raw data not available (same as shortlist)
                        fullName: userData?.personalInfo?.fullName,
                        firstName: userData?.personalInfo?.fullName?.split(' ')[0],
                        lastName: userData?.personalInfo?.fullName?.split(' ').slice(1).join(' '),
                        email: userData?.personalInfo?.email,
                        phone: userData?.personalInfo?.phone,
                        location: userData?.personalInfo?.location,
                        linkedIn: userData?.personalInfo?.linkedIn,
                        github: userData?.personalInfo?.github,
                        avatar: userData?.personalInfo?.avatar,
                        summary: userData?.summary,
                        experience: userData?.experience,
                        education: userData?.education,
                        skills: userData?.skills,
                        coreSignalId: userData?.coreSignalId
                      }
                    }
                    onCandidateCreated={(newCandidateId: string) => {
                      console.log('Candidate created from notes:', newCandidateId);
                      setSavedCandidateId(newCandidateId);
                    }}
                  />
                )}

                {/* Other Tabs - Show Message to Expand */}
                {activeSideTab !== 1 && activeSideTab !== 2 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 mb-3">Expand panel for full features</p>
                    <button
                      onClick={() => onStateChange('expanded')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Expand Panel
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Email View Modal */}
      {isEmailViewModalOpen && selectedEmailForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Email Details</h3>
              <button
                onClick={() => {
                  setIsEmailViewModalOpen(false);
                  setSelectedEmailForView(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Email Metadata */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-gray-500 min-w-[80px]">Subject:</span>
                  <span className="text-sm text-gray-900 font-medium">{selectedEmailForView.subject}</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-gray-500 min-w-[80px]">From:</span>
                  <span className="text-sm text-gray-900">
                    {selectedEmailForView.fromName && selectedEmailForView.fromEmail
                      ? `${selectedEmailForView.fromName} <${selectedEmailForView.fromEmail}>`
                      : selectedEmailForView.fromEmail || selectedEmailForView.user?.email || 'Unknown'}
                  </span>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-gray-500 min-w-[80px]">To:</span>
                  <span className="text-sm text-gray-900">{selectedEmailForView.recipients.join(', ')}</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-gray-500 min-w-[80px]">Status:</span>
                  <span className={`text-sm font-medium ${
                    selectedEmailForView.status === 'sent' || selectedEmailForView.status === 'delivered'
                      ? 'text-green-600'
                      : selectedEmailForView.status === 'failed' || selectedEmailForView.status === 'bounced'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}>
                    {selectedEmailForView.status.charAt(0).toUpperCase() + selectedEmailForView.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-gray-500 min-w-[80px]">Sent:</span>
                  <span className="text-sm text-gray-700">
                    {selectedEmailForView.sentAt 
                      ? new Date(selectedEmailForView.sentAt).toLocaleString()
                      : new Date(selectedEmailForView.createdAt).toLocaleString()}
                  </span>
                </div>

                {selectedEmailForView.template && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-gray-500 min-w-[80px]">Template:</span>
                    <span className="text-sm text-gray-700">{selectedEmailForView.template.name}</span>
                  </div>
                )}

                {selectedEmailForView.errorMessage && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-red-500 min-w-[80px]">Error:</span>
                    <span className="text-sm text-red-600">{selectedEmailForView.errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Email Body */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Message:</h4>
                <div 
                  className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-4 border border-gray-200"
                  dangerouslySetInnerHTML={{ __html: selectedEmailForView.body }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setIsEmailViewModalOpen(false);
                  setSelectedEmailForView(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
    );
  }

  // Expanded state - full panel covering 2/3 of page width

};

export default SourcingProfileSidePanel;
