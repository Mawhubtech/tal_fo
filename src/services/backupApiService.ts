import apiClient from './api';

export interface BackupItem {
  filename: string;
  filepath: string;
  size: number;
  created: string;
  type: 'manual' | 'scheduled';
  note?: string;
}

export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  oldestBackup?: string;
  newestBackup?: string;
}

export interface BackupResult {
  success: boolean;
  filename?: string;
  filepath?: string;
  size?: number;
  timestamp?: string;
  error?: string;
}

export interface BackupResponse {
  success: boolean;
  message: string;
  backup?: BackupResult;
}

export interface BackupListResponse {
  success: boolean;
  backups: BackupItem[];
  stats: BackupStats;
}

export interface BackupStatsResponse {
  success: boolean;
  stats: BackupStats;
}

export class BackupApiService {
  private static readonly BASE_URL = '/api/v1/backup';

  /**
   * Create a new database backup
   */
  static async createBackup(type: 'manual' | 'scheduled' = 'manual', note?: string): Promise<BackupResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/create`, {
        note: note || ''
      }, {
        params: { type }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  /**
   * Get list of all backups
   */
  static async listBackups(): Promise<BackupListResponse> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/list`);
      return response.data;
    } catch (error) {
      console.error('Error fetching backups:', error);
      throw error;
    }
  }

  /**
   * Delete a backup file
   */
  static async deleteBackup(filename: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`${this.BASE_URL}/${filename}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting backup:', error);
      throw error;
    }
  }

  /**
   * Download a backup file
   */
  static async downloadBackup(filename: string): Promise<void> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/download/${filename}`, {
        responseType: 'blob'
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading backup:', error);
      throw error;
    }
  }

  /**
   * Get backup statistics
   */
  static async getBackupStats(): Promise<BackupStatsResponse> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching backup stats:', error);
      throw error;
    }
  }

  /**
   * Update backup note
   */
  static async updateBackupNote(filename: string, note: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.put(`${this.BASE_URL}/${filename}/note`, {
        note
      });
      return response.data;
    } catch (error) {
      console.error('Error updating backup note:', error);
      throw error;
    }
  }

  /**
   * Get backup metadata
   */
  static async getBackupMetadata(filename: string): Promise<{ success: boolean; metadata: any }> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/${filename}/metadata`);
      return response.data;
    } catch (error) {
      console.error('Error fetching backup metadata:', error);
      throw error;
    }
  }

  /**
   * Format file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}

export default BackupApiService;
