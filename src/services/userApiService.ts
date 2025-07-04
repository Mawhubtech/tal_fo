import apiClient from './api';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  applicationUpdates: boolean;
  interviewReminders: boolean;
}

export class UserApiService {
  static async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get('/users/me');
    return response.data.user;
  }

  static async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await apiClient.patch('/users/me', data);
    return response.data.user;
  }

  static async changePassword(data: ChangePasswordData): Promise<void> {
    await apiClient.patch('/auth/change-password', data);
  }

  static async updateNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    await apiClient.patch('/users/me/notifications', preferences);
  }
}
