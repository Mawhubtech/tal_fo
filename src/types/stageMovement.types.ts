// Stage movement reason enum - should match backend enum
export enum StageChangeReason {
  MANUAL_MOVE = 'manual_move',
  AUTOMATED_MOVE = 'automated_move',
  APPLICATION_SUBMITTED = 'application_submitted',
  DRAG_DROP = 'drag_drop',
  INTERVIEW_COMPLETED = 'interview_completed',
  INTERVIEW_FAILED = 'interview_failed',
  TASK_COMPLETED = 'task_completed',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_REJECTED = 'offer_rejected',
  CANDIDATE_WITHDRAWN = 'candidate_withdrawn',
  REJECTED_BY_COMPANY = 'rejected_by_company',
  SYSTEM_UPDATE = 'system_update',
}

// Type for stage movement request
export interface StageMovementRequest {
  toStageId: string;
  reason?: StageChangeReason | string;
  notes?: string;
  metadata?: Record<string, any>;
}

// Type for stage movement history entry
export interface StageMovementHistoryEntry {
  id: string;
  applicationId: string;
  fromStage?: string;
  fromStageId?: string;
  toStage: string;
  toStageId: string;
  reason: StageChangeReason;
  notes?: string;
  metadata?: Record<string, any>;
  changedById?: string;
  pipelineId: string;
  timeInPreviousStageHours?: number;
  changedAt: string;
}
