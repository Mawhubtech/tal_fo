// Notification types for the unified notification system
export enum NotificationType {
  // Job notifications
  JOB_CREATED = 'job.created',
  JOB_UPDATED = 'job.updated',
  JOB_DELETED = 'job.deleted',
  JOB_STATUS_CHANGED = 'job.status_changed',
  
  // Team invitation notifications
  TEAM_INVITATION_RECEIVED = 'team.invitation_received',
  TEAM_INVITATION_ACCEPTED = 'team.invitation_accepted',
  TEAM_INVITATION_REJECTED = 'team.invitation_rejected',
  TEAM_MEMBER_ADDED = 'team.member_added',
  TEAM_MEMBER_REMOVED = 'team.member_removed',
  
  // Candidate notifications
  CANDIDATE_APPLIED = 'candidate.applied',
  CANDIDATE_STATUS_CHANGED = 'candidate.status_changed',
  
  // Communication notifications
  EMAIL_RECEIVED = 'email.received',
  MESSAGE_RECEIVED = 'message.received',
  
  // General system notifications
  SYSTEM_ANNOUNCEMENT = 'system.announcement',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  userId: string;
}

// WebSocket event payloads
export interface JobCreatedNotification {
  jobId: string;
  jobTitle: string;
  companyName?: string;
  createdBy: string;
}

export interface JobStatusChangedNotification {
  jobId: string;
  jobTitle: string;
  oldStatus: string;
  newStatus: string;
}

export interface TeamInvitationNotification {
  invitationId: string;
  jobId: string;
  jobTitle: string;
  invitedBy: string;
  invitedByName: string;
  role: string;
}

export interface TeamInvitationResponseNotification {
  jobId: string;
  jobTitle: string;
  userId: string;
  userName: string;
  accepted: boolean;
}
