# Email Authentication Implementation

This document describes the email authentication system implemented for TalGPT frontend using React Query, React Hook Form, and Zod validation.

## Overview

The authentication system provides:
- User registration with email/password
- User login with email/password
- JWT token-based authentication
- Automatic token refresh
- Protected routes
- Comprehensive error handling
- Toast notifications for user feedback

## Architecture

### Core Components

#### 1. API Configuration (`src/lib/api.ts`)
- Axios instance with base configuration
- Request interceptor for adding auth tokens
- Response interceptor for handling token refresh
- Automatic logout on refresh failure

#### 2. Authentication Service (`src/services/authService.ts`)
- `login(data)` - Authenticate user
- `register(data)` - Register new user
- `getProfile()` - Get current user profile
- `refreshToken()` - Refresh JWT token
- `logout()` - Clear local tokens

#### 3. React Query Hooks (`src/hooks/useAuth.ts`)
- `useLogin()` - Login mutation
- `useRegister()` - Registration mutation
- `useProfile()` - User profile query
- `useLogout()` - Logout mutation
- `useAuth()` - Combined auth state

#### 4. Authentication Context (`src/contexts/AuthContext.tsx`)
- Provides auth state throughout the app
- Wraps useAuth hook for easy consumption

#### 5. Form Components
- `LoginForm` - Email/password login form
- `RegisterForm` - User registration form
- `AuthModal` - Modal wrapper for auth forms

#### 6. Validation (`src/lib/validations.ts`)
- Zod schemas for login and registration
- Type-safe form validation
- Strong password requirements

### Data Flow

```
User Input → Form Validation → API Call → Token Storage → State Update → UI Update
```

1. User fills out login/register form
2. Form validates input using Zod schemas
3. Valid data sent to backend API
4. Tokens stored in localStorage
5. React Query cache updated
6. UI reflects authenticated state

## API Integration

The system integrates with these backend endpoints:

### POST `/api/v1/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST `/api/v1/auth/register`
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### GET `/api/v1/auth/profile`
Returns current user profile (requires auth token)

### POST `/api/v1/auth/refresh`
Refreshes JWT token (requires refresh token)

## Configuration

### Environment Variables
```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_URL=http://localhost:5173
```

### Token Storage
- Access tokens stored in `localStorage` as `accessToken`
- Refresh tokens stored in `localStorage` as `refreshToken`
- Automatic cleanup on logout

## Usage Examples

### Using Authentication in Components

```tsx
import { useAuthContext } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {user?.firstName}!</div>;
};
```

### Protected Routes

```tsx
import ProtectedRoute from '../components/ProtectedRoute';

<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### Manual Login/Logout

```tsx
import { useLogin, useLogout } from '../hooks/useAuth';

const AuthComponent = () => {
  const login = useLogin();
  const logout = useLogout();

  const handleLogin = async () => {
    try {
      await login.mutateAsync({
        email: 'user@example.com',
        password: 'password123'
      });
      // Success!
    } catch (error) {
      // Handle error
    }
  };

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};
```

## Error Handling

### API Error Hook (`src/hooks/useApiError.ts`)
Provides standardized error messages for common HTTP status codes:

- 400: Invalid request
- 401: Invalid credentials
- 403: Access denied
- 409: Account already exists
- 422: Invalid input data
- 429: Too many requests
- 500: Server error
- 503: Service unavailable

### Toast Notifications (`src/contexts/ToastContext.tsx`)
User-friendly notifications for:
- Successful login/registration
- Error messages
- General feedback

## Security Features

1. **JWT Token Authentication**
   - Short-lived access tokens
   - Refresh token rotation
   - Automatic token cleanup

2. **Input Validation**
   - Email format validation
   - Strong password requirements
   - XSS protection through proper escaping

3. **Error Handling**
   - No sensitive information in error messages
   - Rate limiting awareness
   - Graceful degradation

## Development Tools

### React Query DevTools
Enabled in development for debugging queries and mutations:
- View cache state
- Monitor network requests
- Debug authentication flow

### Error Boundary
Catches and displays runtime errors gracefully:
- Development error details
- User-friendly error messages
- Recovery options

## File Structure

```
src/
├── components/
│   ├── AuthModal.tsx          # Modal wrapper for auth forms
│   ├── LoginForm.tsx          # Email/password login form
│   ├── RegisterForm.tsx       # User registration form
│   ├── ProtectedRoute.tsx     # Route protection component
│   └── ErrorBoundary.tsx     # Error catching component
├── contexts/
│   ├── AuthContext.tsx        # Authentication context
│   └── ToastContext.tsx       # Toast notification context
├── hooks/
│   ├── useAuth.ts            # Authentication hooks
│   └── useApiError.ts        # Error handling hook
├── lib/
│   ├── api.ts                # Axios configuration
│   ├── config.ts             # App configuration
│   └── validations.ts        # Zod schemas
├── services/
│   └── authService.ts        # API service functions
├── types/
│   └── auth.ts               # TypeScript interfaces
└── pages/
    └── Dashboard.tsx         # Protected dashboard page
```

## Testing

To test the authentication system:

1. Start the backend server on port 3000
2. Start the frontend development server
3. Navigate to `/signin`
4. Try registering a new account
5. Try logging in with existing credentials
6. Test protected routes (dashboard)
7. Test automatic logout on token expiry

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend allows frontend origin
   - Check API base URL configuration

2. **Token Issues**
   - Clear localStorage if tokens are corrupted
   - Check token expiry times

3. **Validation Errors**
   - Check password requirements
   - Ensure email format is valid

4. **Network Errors**
   - Verify backend is running on correct port
   - Check environment variables

### Debug Steps

1. Open browser DevTools
2. Check Network tab for API calls
3. Inspect localStorage for tokens
4. Use React Query DevTools for cache state
5. Check console for error messages

## Future Enhancements

- Password reset functionality
- Email verification
- Social login integration
- Two-factor authentication
- Session management
- Remember me functionality
