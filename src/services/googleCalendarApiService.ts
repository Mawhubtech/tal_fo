import apiClient from '../lib/api';

export interface GoogleCalendarSyncSettings {
  isGoogleCalendarConnected: boolean;
  lastSyncAt?: string;
  syncEnabled: boolean;
  googleCalendarId?: string;
}

export interface SyncResult {
  imported: number;
  exported: number;
  updated: number;
  conflicts: number;
}

export interface SyncResponse {
  message: string;
  result: SyncResult;
}

export interface EnableSyncResponse {
  message: string;
  requiresAuth?: boolean;
  authUrl?: string;
}

export class GoogleCalendarApiService {
  /**
   * Get Google Calendar sync settings
   */
  static async getSyncSettings(): Promise<GoogleCalendarSyncSettings> {
    const response = await apiClient.get('/google-calendar/settings');
    return response.data;
  }

  /**
   * Enable Google Calendar sync - may require additional permissions
   */
  static async enableSync(): Promise<EnableSyncResponse> {
    const response = await apiClient.post('/google-calendar/enable');
    return response.data;
  }

  /**
   * Sync events to Google Calendar
   */
  static async syncToGoogle(): Promise<SyncResponse> {
    const response = await apiClient.post('/google-calendar/sync/to-google');
    return response.data;
  }

  /**
   * Sync events from Google Calendar
   */
  static async syncFromGoogle(): Promise<SyncResponse> {
    const response = await apiClient.post('/google-calendar/sync/from-google');
    return response.data;
  }

  /**
   * Full two-way sync with Google Calendar
   */
  static async fullSync(): Promise<SyncResponse> {
    const response = await apiClient.post('/google-calendar/sync/full');
    return response.data;
  }

  /**
   * Delete event from Google Calendar
   */
  static async deleteFromGoogle(eventId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/google-calendar/event/${eventId}/google`);
    return response.data;
  }
}
