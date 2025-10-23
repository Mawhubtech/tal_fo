import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  UserApiService, 
  UserProfile, 
  UpdateProfileData, 
  ChangePasswordData, 
  NotificationPreferences 
} from '../services/userApiService';

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: UserApiService.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateProfileData) => UserApiService.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user-profile'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => UserApiService.changePassword(data),
  });
};

export const useUpdateNotifications = () => {
  return useMutation({
    mutationFn: (preferences: NotificationPreferences) => 
      UserApiService.updateNotificationPreferences(preferences),
  });
};
