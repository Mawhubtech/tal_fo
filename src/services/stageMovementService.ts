import apiClient from './api';

export interface StageMovementHistory {
  id: string;
  fromStage?: string;
  fromStageId?: string;
  toStage: string;
  toStageId: string;
  reason: string;
  notes?: string;
  metadata?: Record<string, any>;
  changedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  pipelineId: string;
  timeInPreviousStageHours?: number;
  changedAt: string;
}

export interface MoveStageRequest {
  toStageId: string;
  reason?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface BulkMoveStageRequest {
  applicationIds: string[];
  toStageId: string;
  reason: string;
}

export interface StageMovementStats {
  averageTimeInStage: Record<string, number>;
  conversionRates: Record<string, number>;
  dropoffPoints: Array<{ stage: string; dropoffRate: number }>;
  totalMovements: number;
}

export const stageMovementService = {
  async moveApplicationToStage(applicationId: string, moveRequest: MoveStageRequest) {
    const response = await apiClient.post(`/job-applications/${applicationId}/move-stage`, moveRequest);
    return response.data;
  },

  async getStageHistory(applicationId: string): Promise<StageMovementHistory[]> {
    const response = await apiClient.get(`/job-applications/${applicationId}/stage-history`);
    return response.data;
  },

  async bulkMoveApplicationsToStage(bulkMoveRequest: BulkMoveStageRequest) {
    const response = await apiClient.post('/job-applications/bulk-move-stage', bulkMoveRequest);
    return response.data;
  },

  async getApplicationsByPipelineStage(pipelineId: string): Promise<Record<string, any[]>> {
    const response = await apiClient.get(`/job-applications/pipeline/${pipelineId}/by-stage`);
    return response.data;
  },

  async getStageMovementStats(pipelineId: string, timeframe?: { from: Date; to: Date }): Promise<StageMovementStats> {
    const params = new URLSearchParams();
    if (timeframe) {
      params.append('from', timeframe.from.toISOString());
      params.append('to', timeframe.to.toISOString());
    }

    const response = await apiClient.get(`/job-applications/pipeline/${pipelineId}/stats?${params.toString()}`);
    return response.data;
  },

  // Additional helper methods for specific stage movement scenarios
  async moveApplicationToSpecificStage(applicationId: string, stageName: string, pipelineId: string, reason?: string, notes?: string) {
    // Get pipeline stages to find the stage ID
    const pipelineResponse = await apiClient.get(`/pipelines/${pipelineId}`);
    
    const pipeline = pipelineResponse.data;
    const stage = pipeline.stages?.find((s: any) => s.name === stageName);
    
    if (!stage) {
      throw new Error(`Stage "${stageName}" not found in pipeline`);
    }

    return this.moveApplicationToStage(applicationId, {
      toStageId: stage.id,
      reason: reason || 'stage_specific_move',
      notes,
      metadata: {
        stageName,
        pipelineId,
        moveType: 'specific_stage'
      }
    });
  },

  async rejectApplication(applicationId: string, reason: string, notes?: string) {
    return this.moveApplicationToStage(applicationId, {
      toStageId: 'rejected', // This should be a special stage ID for rejected
      reason: 'rejection',
      notes: notes || reason,
      metadata: {
        rejectionReason: reason,
        moveType: 'rejection'
      }
    });
  },

  async advanceToNextStage(applicationId: string, pipelineId: string, reason?: string, notes?: string) {
    // Get current application data and pipeline to determine next stage
    const [appResponse, pipelineResponse] = await Promise.all([
      apiClient.get(`/job-applications/${applicationId}`),
      apiClient.get(`/pipelines/${pipelineId}`)
    ]);

    const application = appResponse.data;
    const pipeline = pipelineResponse.data;
    
    const currentStage = pipeline.stages?.find((s: any) => s.id === application.currentPipelineStageId);
    const sortedStages = pipeline.stages?.sort((a: any, b: any) => a.order - b.order) || [];
    const currentIndex = sortedStages.findIndex((s: any) => s.id === currentStage?.id);
    
    if (currentIndex === -1 || currentIndex >= sortedStages.length - 1) {
      throw new Error('Cannot advance: application is already at the final stage');
    }
    
    const nextStage = sortedStages[currentIndex + 1];
    
    return this.moveApplicationToStage(applicationId, {
      toStageId: nextStage.id,
      reason: reason || 'advance_next_stage',
      notes,
      metadata: {
        previousStage: currentStage?.name,
        nextStage: nextStage.name,
        moveType: 'advance_next'
      }
    });
  },

  async moveAfterTaskCompletion(applicationId: string, toStageId: string, taskId: string, taskTitle: string, taskType?: string, notes?: string) {
    return this.moveApplicationToStage(applicationId, {
      toStageId,
      reason: 'task_completed',
      notes: notes || `Moved after completing task: ${taskTitle}`,
      metadata: {
        moveType: 'automated',
        trigger: 'task_completion',
        taskId,
        taskTitle,
        taskType: taskType || 'unknown'
      }
    });
  },

  async moveAfterInterviewCompleted(applicationId: string, toStageId: string, interviewId: string, interviewType: string, rating?: number, notes?: string) {
    return this.moveApplicationToStage(applicationId, {
      toStageId,
      reason: 'interview_completed',
      notes: notes || `Moved after completing ${interviewType} interview`,
      metadata: {
        moveType: 'automated',
        trigger: 'interview_completion',
        interviewId,
        interviewType,
        interviewRating: rating
      }
    });
  },
};
