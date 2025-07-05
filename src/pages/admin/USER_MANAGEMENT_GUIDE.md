# User Management Page - Admin Guide

## Overview
The User Management Page provides comprehensive administrative functionality for managing users in the TAL platform. This includes full CRUD operations, role management, and detailed user information viewing.

## Features

### 📊 Dashboard & Statistics
- Real-time user statistics (total, active, inactive, banned, admins)
- Visual cards showing key metrics

### 🔍 Search & Filtering
- **Search**: Real-time search across user names and emails (debounced)
- **Status Filter**: Filter by active, inactive, or banned users
- **Role Filter**: Filter by user roles (dynamically loaded from backend)
- **Pagination**: Navigate through large user lists efficiently

### 👤 User Operations

#### Create New User
- Add new users with basic information (name, email, password)
- Assign roles and clients during creation
- Set initial user status
- Form validation ensures data integrity

#### Edit Existing User
- Modify all user information
- Update roles and client assignments
- Change user status
- Password field optional for updates

#### View User Details
- Comprehensive user information display
- Jobs the user is hiring for
- Organizations the user is attached to
- User activity and metadata

#### User Status Management
- **Activate/Deactivate**: Control user access
- **Ban Users**: Restrict access for policy violations
- **Archive/Restore**: Soft delete functionality

#### Administrative Actions
- **Delete User**: Permanent removal (with confirmation)
- **Send Password Reset**: Trigger password reset email
- **Send Email Verification**: Resend verification emails

### 🔐 Role & Permission Management
- Assign multiple roles to users
- Remove roles from users
- Dynamic role loading from backend
- Visual role badges with color coding

### 🏢 Organization & Job Association
- View jobs a user is hiring for
- See organizations user belongs to
- Detailed relationship information

## Technical Implementation

### Key Components
- **UserManagementPage**: Main page component with full functionality
- **UserModal**: Create/edit user modal with validation
- **UserDetailsModal**: Detailed user view with actions
- **adminUserApiService**: API service for all user operations
- **useAdminUsers**: React Query hooks for data management

### API Integration
- RESTful API endpoints for all operations
- Real-time data updates with React Query
- Optimistic updates for better UX
- Error handling with toast notifications

### State Management
- React Query for server state
- Local state for UI interactions
- Debounced search to reduce API calls
- Pagination state management

## Usage Tips

### For Admins
1. **Search Efficiently**: Use the search bar to quickly find specific users
2. **Filter Strategically**: Combine status and role filters for targeted results
3. **Bulk Management**: Use pagination to process large user lists
4. **Safety First**: Always confirm destructive actions like deletion

### For Developers
1. **Extend Carefully**: New features should integrate with existing hooks
2. **Validate Data**: Always validate user input before API calls
3. **Handle Errors**: Implement proper error boundaries and user feedback
4. **Test Thoroughly**: Verify all CRUD operations work correctly

## Security Considerations
- All operations require admin privileges
- Sensitive actions (delete, ban) include confirmations
- Password handling follows security best practices
- Role assignments are validated server-side

## Error Handling
- Network errors show user-friendly messages
- Form validation prevents invalid submissions
- Loading states provide visual feedback
- Toast notifications confirm successful operations

## Future Enhancements
- Bulk user operations (select multiple users)
- Advanced filtering options
- User import/export functionality
- Audit log for user changes
- Advanced permission matrix
