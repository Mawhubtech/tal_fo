# Department Management Feature

## Overview
This feature provides complete CRUD (Create, Read, Update, Delete) operations for departments from the frontend. Departments are organizational units that belong to clients and help organize job postings and employee management.

## Implementation Details

### 1. Department Form Component (`DepartmentForm.tsx`)
A comprehensive form component that handles both creating and editing departments with the following features:

- **Required Fields:**
  - Department name
  - Client ID (automatically provided)

- **Optional Fields:**
  - Description
  - Manager name and email
  - Total employees count
  - Department color (from predefined palette)
  - Department icon (from predefined emojis)

- **Features:**
  - Form validation with error handling
  - Color picker with predefined options
  - Icon picker with department-relevant emojis
  - Live preview of the department card
  - Loading states and error handling
  - Integration with backend API
  - **Support for both create and edit modes**

### 2. Department Delete Dialog (`DeleteDepartmentDialog.tsx`)
A confirmation dialog for department deletion with:
- Warning about permanent data loss
- Information about potential impacts on jobs and employees
- Loading state during deletion
- Accessible design with proper ARIA attributes

### 3. Create Department Page (`CreateDepartmentPage.tsx`)
A standalone page that allows users to:
- Select a client from the available clients
- Create a new department for the selected client
- Navigate back to the client detail page after creation

### 4. Client Detail Page Integration
Enhanced the Client Detail Page (`ClientDetailPage.tsx`) with:
- New "Departments" tab showing all departments for the client
- **Department creation, editing, and deletion capabilities**
- **Edit and delete buttons on each department card (visible on hover)**
- Department cards showing key information
- Clickable department count metric in the overview
- Support for URL query parameters (e.g., `?tab=departments`)
- **Proper state management for edit/delete operations**

### 5. Client Management Page Integration
Added a "Create Department" button to the Client Management Page (`ClientManagementPage.tsx`) for quick access to department creation.

## CRUD Operations

### Create Department
- Click "Add Department" button in the departments tab
- Fill out the form with department details
- Choose a color and icon
- Submit to create the department

### Read Departments
- View all departments for a client in the "Departments" tab
- See department details including name, manager, description, employee count, and active jobs

### Update Department
- **Hover over a department card to reveal action buttons**
- **Click the edit (pencil) icon**
- **Form opens pre-populated with current department data**
- **Modify any fields and submit to update**

### Delete Department
- **Hover over a department card to reveal action buttons**
- **Click the delete (trash) icon**
- **Confirmation dialog appears with warning about data loss**
- **Confirm deletion to permanently remove the department**

## Routes Added

- `/dashboard/clients/create-department` - Standalone department creation page
- `/dashboard/admin/clients/create-department` - Admin section access

## API Integration

The feature integrates with the existing backend API through `DepartmentApiService`:
- `createDepartment()` - Creates a new department
- `getDepartmentsByClient()` - Fetches departments for a specific client
- **`updateDepartment()` - Updates an existing department**
- **`deleteDepartment()` - Deletes a department**

## UI/UX Features

1. **Consistent Design**: Follows the existing design system with purple color scheme
2. **Interactive Elements**: Hover effects, loading states, and smooth transitions
3. **Responsive Layout**: Works on desktop and mobile devices
4. **Form Validation**: Real-time validation with clear error messages
5. **Visual Feedback**: Color and icon previews, loading spinners
6. **Navigation**: Breadcrumbs and back buttons for easy navigation
7. **Accessibility**: Proper ARIA labels, keyboard navigation, and screen reader support
8. ****Hover States**: Action buttons appear on hover (desktop) or are always visible (mobile)**
9. ****Confirmation Dialogs**: Safe deletion with clear warnings**
10. ****Edit Mode**: Form intelligently switches between create and edit modes**

## How to Use

### Create Department:
1. Navigate to any client detail page
2. Click on the "Departments" tab or the department count metric
3. Click "Add Department" button
4. Fill out the form and submit

### Edit Department:
1. **Go to client detail page → Departments tab**
2. **Hover over the department card you want to edit**
3. **Click the blue pencil (edit) icon**
4. **Modify the form fields as needed**
5. **Click "Update Department" to save changes**

### Delete Department:
1. **Go to client detail page → Departments tab**
2. **Hover over the department card you want to delete**
3. **Click the red trash (delete) icon**
4. **Read the warning in the confirmation dialog**
5. **Click "Delete Department" to confirm (this cannot be undone)**

### From Client Management Page:
1. Go to the clients list page
2. Click "Create Department" button
3. Select a client from the grid
4. Fill out the form and submit

### From Create Department Page:
1. Navigate to `/dashboard/clients/create-department`
2. Select a client
3. Fill out the form and submit

## Technical Notes

- Departments are linked to clients via `clientId`
- Color values are stored as hex codes
- Icons are stored as Unicode emojis
- Form data is validated both client-side and server-side
- The component uses React hooks for state management
- Error handling includes both network errors and validation errors
- **Edit mode preserves existing data and only updates changed fields**
- **Delete operations include proper confirmation to prevent accidental data loss**
- **State management ensures UI updates immediately after successful operations**

## Safety Features

- **Confirmation dialog for deletions with clear warnings**
- **Form validation prevents invalid data submission**
- **Loading states prevent multiple simultaneous operations**
- **Error handling with user-friendly messages**
- **Optimistic UI updates with rollback capability on errors**

## Future Enhancements

Potential improvements could include:
- Bulk department operations (edit/delete multiple)
- Department templates by industry
- Department hierarchy (sub-departments)
- Department analytics and metrics
- Integration with job posting workflow
- Employee assignment to departments
- **Audit trail for department changes**
- **Bulk import/export of departments**
- **Department archiving instead of permanent deletion**
