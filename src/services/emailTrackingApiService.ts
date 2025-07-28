import apiClient from '../lib/api';

export interface EmailTrackingEvent {
  id: string;
  executionId: string;
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'complained' | 'unsubscribed' | 'failed';
  source: 'tracking_pixel' | 'email_provider_webhook' | 'manual_tracking' | 'chrome_extension' | 'api_integration';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  deviceType?: string;
  operatingSystem?: string;
  browser?: string;
  emailClient?: string;
  linkUrl?: string;
  linkText?: string;
  replySubject?: string;
  replySnippet?: string;
  providerEventId?: string;
  providerMessageId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface TrackingAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalReplied: number;
  totalBounced: number;
  totalUnsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  responseRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  avgTimeToOpen: number;
  avgTimeToClick: number;
  avgTimeToReply: number;
  uniqueOpeners: number;
  uniqueClickers: number;
  topDevices: Array<{ device: string; count: number }>;
  topEmailClients: Array<{ client: string; count: number }>;
  topLocations: Array<{ location: string; count: number }>;
  engagementByHour: Array<{ hour: number; opens: number; clicks: number }>;
  engagementByDay: Array<{ day: string; opens: number; clicks: number }>;
}

export interface EngagementInsights {
  bestSendTimes: Array<{ hour: number; dayOfWeek: number; openRate: number }>;
  deviceBreakdown: Array<{ device: string; percentage: number }>;
  emailClientBreakdown: Array<{ client: string; percentage: number }>;
  geographicDistribution: Array<{ country: string; opens: number; clicks: number }>;
  abTestResults?: Array<{ variant: string; openRate: number; clickRate: number; responseRate: number }>;
}

export interface TrackEmailEventRequest {
  executionId: string;
  eventType: EmailTrackingEvent['eventType'];
  source?: EmailTrackingEvent['source'];
  userAgent?: string;
  ipAddress?: string;
  linkUrl?: string;
  linkText?: string;
  replySubject?: string;
  replySnippet?: string;
  metadata?: Record<string, any>;
}

class EmailTrackingApiService {
  /**
   * Track an email event (open, click, etc.)
   */
  async trackEmailEvent(data: TrackEmailEventRequest): Promise<EmailTrackingEvent> {
    const response = await apiClient.post('/track/email/open', data);
    return response.data;
  }

  /**
   * Track an email click event
   */
  async trackEmailClick(data: TrackEmailEventRequest): Promise<EmailTrackingEvent> {
    const response = await apiClient.post('/track/email/click', data);
    return response.data;
  }

  /**
   * Track a manual event
   */
  async trackManualEvent(data: TrackEmailEventRequest): Promise<EmailTrackingEvent> {
    const response = await apiClient.post('/track/manual', data);
    return response.data;
  }

  /**
   * Get analytics for a specific sequence step
   */
  async getStepAnalytics(stepId: string): Promise<TrackingAnalytics> {
    const response = await apiClient.get(`/track/step/${stepId}/analytics`);
    return response.data;
  }

  /**
   * Get analytics for an entire sequence
   */
  async getSequenceAnalytics(sequenceId: string): Promise<TrackingAnalytics> {
    const response = await apiClient.get(`/track/sequence/${sequenceId}/analytics`);
    return response.data;
  }

  /**
   * Get engagement insights for optimization
   */
  async getEngagementInsights(sequenceId?: string): Promise<EngagementInsights> {
    const url = sequenceId 
      ? `/track/engagement-insights?sequenceId=${sequenceId}`
      : '/track/engagement-insights';
    const response = await apiClient.get(url);
    return response.data;
  }

  /**
   * Get tracking events for a specific execution
   */
  async getExecutionEvents(executionId: string): Promise<EmailTrackingEvent[]> {
    const response = await apiClient.get(`/track/execution/${executionId}/events`);
    return response.data;
  }

  /**
   * Get recent tracking events with pagination
   */
  async getRecentEvents(params?: {
    limit?: number;
    offset?: number;
    eventType?: EmailTrackingEvent['eventType'];
    sequenceId?: string;
  }): Promise<{
    events: EmailTrackingEvent[];
    total: number;
    hasMore: boolean;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.eventType) queryParams.append('eventType', params.eventType);
    if (params?.sequenceId) queryParams.append('sequenceId', params.sequenceId);

    const response = await apiClient.get(`/track/events?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get device analytics
   */
  async getDeviceAnalytics(sequenceId?: string): Promise<{
    devices: Array<{ device: string; count: number; percentage: number }>;
    browsers: Array<{ browser: string; count: number; percentage: number }>;
    operatingSystems: Array<{ os: string; count: number; percentage: number }>;
  }> {
    const url = sequenceId 
      ? `/track/device-analytics?sequenceId=${sequenceId}`
      : '/track/device-analytics';
    const response = await apiClient.get(url);
    return response.data;
  }

  /**
   * Get geographic analytics
   */
  async getGeographicAnalytics(sequenceId?: string): Promise<{
    countries: Array<{ country: string; count: number; percentage: number }>;
    cities: Array<{ city: string; country: string; count: number; percentage: number }>;
    timezones: Array<{ timezone: string; count: number; percentage: number }>;
  }> {
    const url = sequenceId 
      ? `/track/geographic-analytics?sequenceId=${sequenceId}`
      : '/track/geographic-analytics';
    const response = await apiClient.get(url);
    return response.data;
  }

  /**
   * Get timing analytics
   */
  async getTimingAnalytics(sequenceId?: string): Promise<{
    hourlyDistribution: Array<{ hour: number; opens: number; clicks: number; replies: number }>;
    dailyDistribution: Array<{ dayOfWeek: number; opens: number; clicks: number; replies: number }>;
    optimalSendTimes: Array<{ hour: number; dayOfWeek: number; score: number }>;
  }> {
    const url = sequenceId 
      ? `/track/timing-analytics?sequenceId=${sequenceId}`
      : '/track/timing-analytics';
    const response = await apiClient.get(url);
    return response.data;
  }
}

export const emailTrackingApiService = new EmailTrackingApiService();
export default emailTrackingApiService;
