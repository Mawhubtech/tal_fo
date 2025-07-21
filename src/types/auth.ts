export interface Role {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  password: null;
  firstName: string;
  lastName: string;
  avatar?: string;
  provider?: string;
  providerId?: string;
  status: string;
  isEmailVerified: boolean;
  emailVerificationToken: null | string;
  passwordResetToken: null | string;
  passwordResetExpires: null | string;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userRole?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Backend response format (what we actually receive)
export interface BackendAuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
