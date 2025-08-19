import { InterviewTemplate } from './interviewTemplate.types';

// Interview Types for Frontend
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  provider?: string;
  providerId?: string;
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedIn?: string;
  github?: string;
  avatar?: string;
  summary?: string;
  currentPosition?: string;
  salaryExpectation?: string;
  status: string;
  rating: string;
  appliedDate?: string;
  lastActivity?: string;
  source?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  department: string;
  departmentId: string;
  location: string;
  type: string;
  status: string;
  urgency: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  remote: boolean;
  skills: string[];
  benefits: string[];
  requirements: string[];
  responsibilities: string[];
  hiringTeam?: any;
  applicationDeadline: string;
  applicantsCount: number;
  organizationId: string;
  customQuestions?: any;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  candidateId: string;
  status: string;
  stage: string;
  appliedDate: string;
  lastActivityDate: string;
  notes: string;
  coverLetter?: string;
  score: string;
  customFields?: any;
  resumeUrl?: string;
  portfolioUrl?: string;
  candidate: Candidate;
  job: Job;
  createdAt: string;
  updatedAt: string;
}

export enum InterviewType {
  PHONE_SCREEN = 'Phone Screen',
  TECHNICAL = 'Technical',
  BEHAVIORAL = 'Behavioral',
  FINAL = 'Final',
  PANEL = 'Panel',
  CULTURE_FIT = 'Culture Fit',
  CASE_STUDY = 'Case Study',
  PRESENTATION = 'Presentation',
}

export enum InterviewMode {
  IN_PERSON = 'In-person',
  VIDEO_CALL = 'Video Call',
  PHONE_CALL = 'Phone Call',
  HYBRID = 'Hybrid',
}

export enum InterviewStatus {
  SCHEDULED = 'Scheduled',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  RESCHEDULED = 'Rescheduled',
  NO_SHOW = 'No Show',
}

export enum InterviewStage {
  INITIAL_SCREENING = 'Initial Screening',
  FIRST_ROUND = 'First Round',
  SECOND_ROUND = 'Second Round',
  THIRD_ROUND = 'Third Round',
  FINAL_ROUND = 'Final Round',
  FOLLOW_UP = 'Follow-up',
}

export enum ParticipantRole {
  INTERVIEWER = 'Interviewer',
  PANEL_MEMBER = 'Panel Member',
  OBSERVER = 'Observer',
  FACILITATOR = 'Facilitator',
  HIRING_MANAGER = 'Hiring Manager',
  TECHNICAL_LEAD = 'Technical Lead',
  HR_REPRESENTATIVE = 'HR Representative',
}

export enum ParticipantStatus {
  INVITED = 'Invited',
  ACCEPTED = 'Accepted',
  DECLINED = 'Declined',
  TENTATIVE = 'Tentative',
  NO_RESPONSE = 'No Response',
}

export enum FeedbackCategory {
  TECHNICAL_SKILLS = 'Technical Skills',
  COMMUNICATION = 'Communication',
  PROBLEM_SOLVING = 'Problem Solving',
  CULTURAL_FIT = 'Cultural Fit',
  LEADERSHIP = 'Leadership',
  EXPERIENCE = 'Experience',
  MOTIVATION = 'Motivation',
  TEAMWORK = 'Teamwork',
  OVERALL = 'Overall',
}

export interface InterviewParticipant {
  id: string;
  interviewId: string;
  userId?: string; // Optional for manual participants
  user?: User; // Optional for manual participants
  name?: string; // For manual participants
  email?: string; // For manual participants
  role: ParticipantRole;
  status: ParticipantStatus;
  isRequired: boolean;
  inviteSentAt?: string;
  responseAt?: string;
  notes?: string;
  createdAt: string;
}

export interface InterviewFeedback {
  id: string;
  submittedBy: string;
  submitter: User;
  category: FeedbackCategory;
  rating: number;
  comments?: string;
  strengths?: string;
  areasForImprovement?: string;
  specificExamples?: string;
  recommendation?: string;
  wouldHire?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  jobApplicationId: string;
  jobApplication: JobApplication;
  scheduledBy: string;
  scheduler: User;
  templateId?: string;
  template?: InterviewTemplate; // Now properly typed
  type: InterviewType;
  mode: InterviewMode;
  status: InterviewStatus;
  stage: InterviewStage;
  scheduledAt: string;
  durationMinutes: number;
  actualStartTime?: string;
  actualEndTime?: string;
  location?: string;
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  agenda?: string;
  notes?: string;
  preparationNotes?: string;
  overallRating?: number;
  result?: string;
  recommendation?: string;
  nextSteps?: string;
  cancellationReason?: string;
  rescheduledFrom?: string;
  reminderSent: boolean;
  feedbackSubmitted: boolean;
  participants: InterviewParticipant[];
  feedback: InterviewFeedback[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInterviewParticipant {
  userId?: string;
  name?: string;
  email?: string;
  role: ParticipantRole;
  isRequired?: boolean;
  notes?: string;
}

export interface CreateInterviewRequest {
  jobApplicationId: string;
  templateId?: string;
  type: InterviewType;
  mode: InterviewMode;
  stage: InterviewStage;
  scheduledAt: string;
  durationMinutes?: number;
  location?: string;
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  agenda?: string;
  notes?: string;
  preparationNotes?: string;
  participants: CreateInterviewParticipant[];
}

export interface UpdateInterviewRequest {
  type?: InterviewType;
  mode?: InterviewMode;
  status?: InterviewStatus;
  stage?: InterviewStage;
  scheduledAt?: string;
  durationMinutes?: number;
  actualStartTime?: string;
  actualEndTime?: string;
  location?: string;
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  agenda?: string;
  notes?: string;
  preparationNotes?: string;
  overallRating?: number;
  result?: string;
  recommendation?: string;
  nextSteps?: string;
  cancellationReason?: string;
  reminderSent?: boolean;
  feedbackSubmitted?: boolean;
}

export interface RescheduleInterviewRequest {
  newScheduledAt: string;
  reason: string;
  durationMinutes?: number;
  location?: string;
  meetingLink?: string;
}

export interface CancelInterviewRequest {
  reason: string;
  notifyParticipants?: string;
}

export interface CreateInterviewFeedbackRequest {
  category: FeedbackCategory;
  rating: number;
  comments?: string;
  strengths?: string;
  areasForImprovement?: string;
  specificExamples?: string;
  recommendation?: string;
  wouldHire?: boolean;
}

export interface UpdateParticipantStatusRequest {
  status: ParticipantStatus;
  notes?: string;
}

export interface InterviewFilters {
  jobApplicationId?: string;
  jobId?: string;
  status?: InterviewStatus;
  type?: InterviewType;
  stage?: InterviewStage;
  startDate?: string;
  endDate?: string;
  interviewerId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface InterviewsResponse {
  interviews: Interview[];
  total: number;
}

export interface InterviewStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  today: number;
  thisWeek: number;
}
