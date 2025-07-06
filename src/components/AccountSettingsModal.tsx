import React, { useState } from 'react';
import { 
  X, User, Bell, Shield, Save, Eye, EyeOff, Camera, Upload, Check 
} from 'lucide-react';
import { useAuth, useUpdateProfile, useChangePassword } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'profile' | 'notifications' | 'security';

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { user } = useAuth();
  const { addToast } = useToast();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    interviewReminders: true,
    candidateUpdates: true,
    systemUpdates: false,
  });

  // Update profile data when user changes
  React.useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        avatar: profileData.avatar,
      });
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New passwords do not match.',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      addToast({
        type: 'error',
        title: 'Password Too Short',
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Password change failed:', error);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload the file to a server
      // For now, we'll just create a local URL
      const reader = new FileReader();
      reader.onload = () => {
        setProfileData(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <div className="bg-purple-600 text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Account Settings</h2>
              <p className="text-purple-100 mt-1">Manage your account preferences and personal information</p>
            </div>
            <button
              onClick={onClose}
              className="text-purple-200 hover:text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 min-h-full">
            <nav className="p-4">
              <div className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'security', label: 'Security', icon: Shield }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as SettingsTab)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === id
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {label}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Settings</h3>
                  <p className="text-gray-600">Manage your profile information and preferences.</p>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {profileData.avatar ? (
                          <img 
                            src={profileData.avatar} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-2 cursor-pointer hover:bg-purple-700 transition-colors">
                        <Camera className="w-4 h-4 text-white" />
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Profile Photo</h4>
                      <p className="text-sm text-gray-500">Upload a new photo or choose from your existing photos.</p>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Enter your first name"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email address cannot be changed.</p>
                  </div>

                  {/* Account Information */}
                  <div className="border-t pt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Account Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Account Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          user?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user?.status || 'Active'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email Verified:</span>
                        <span className={`ml-2 ${user?.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                          {user?.isEmailVerified ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Member Since:</span>
                        <span className="ml-2 text-gray-900">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Login Provider:</span>
                        <span className="ml-2 text-gray-900 capitalize">
                          {user?.provider || 'Email'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Settings</h3>
                  <p className="text-gray-600">Control how and when you receive notifications.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg divide-y">
                  {/* Email Notifications */}
                  <div className="p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h4>
                    <div className="space-y-4">
                      {[
                        {
                          id: 'emailNotifications',
                          title: 'General Email Notifications',
                          description: 'Receive email notifications for important updates',
                          checked: notificationSettings.emailNotifications,
                        },
                        {
                          id: 'interviewReminders',
                          title: 'Interview Reminders',
                          description: 'Get reminders about upcoming interviews',
                          checked: notificationSettings.interviewReminders,
                        },
                        {
                          id: 'candidateUpdates',
                          title: 'Candidate Updates',
                          description: 'Notifications when candidates complete assessments or update profiles',
                          checked: notificationSettings.candidateUpdates,
                        },
                        {
                          id: 'systemUpdates',
                          title: 'System Updates',
                          description: 'Important system announcements and feature updates',
                          checked: notificationSettings.systemUpdates,
                        },
                      ].map((setting) => (
                        <div key={setting.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900">{setting.title}</h5>
                            <p className="text-sm text-gray-500">{setting.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={setting.checked}
                              onChange={(e) => setNotificationSettings(prev => ({
                                ...prev,
                                [setting.id]: e.target.checked
                              }))}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div className="p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Push Notifications</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">Browser Notifications</h5>
                          <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={notificationSettings.pushNotifications}
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev,
                              pushNotifications: e.target.checked
                            }))}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Notification Frequency */}
                  <div className="p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Notification Frequency</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Digest Frequency
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500">
                          <option value="immediate">Immediate</option>
                          <option value="daily">Daily Digest</option>
                          <option value="weekly">Weekly Digest</option>
                          <option value="never">Never</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    onClick={() => {
                      addToast({
                        type: 'success',
                        title: 'Settings Saved',
                        message: 'Your notification preferences have been saved.',
                      });
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Settings</h3>
                  <p className="text-gray-600">Manage your account security and authentication.</p>
                </div>

                {/* Change Password Section */}
                {user?.provider === 'local' || !user?.provider ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Change Password</h4>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            id="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter your current password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                          >
                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            id="newPassword"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter a new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                          >
                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            id="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Confirm your new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={changePasswordMutation.isPending}
                          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                        >
                          {changePasswordMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                              Changing...
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4 mr-2" />
                              Change Password
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">OAuth Account</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          You signed in using {user?.provider}. Password changes are managed through your {user?.provider} account.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Security Information</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-sm font-medium text-gray-900">Two-Factor Authentication</span>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <div className="text-sm text-gray-500">Coming Soon</div>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-sm font-medium text-gray-900">Login Sessions</span>
                        <p className="text-sm text-gray-500">View and manage your active sessions</p>
                      </div>
                      <div className="text-sm text-gray-500">Coming Soon</div>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-sm font-medium text-gray-900">Account Recovery</span>
                        <p className="text-sm text-gray-500">Set up account recovery options</p>
                      </div>
                      <div className="text-sm text-gray-500">Coming Soon</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
