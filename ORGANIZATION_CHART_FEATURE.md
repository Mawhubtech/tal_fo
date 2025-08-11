# Organization Chart Feature

## Overview

The Organization Chart feature provides a visual representation of the company hierarchy for each client, allowing users to create, view, and manage organizational structures with an intuitive drag-and-drop interface.

## Features

### Core Functionality
- **Visual Organization Chart**: Interactive tree-view displaying company hierarchy
- **Position Management**: Create, edit, and delete positions
- **Department Filtering**: Filter chart by specific departments
- **Hierarchical Structure**: Support for multi-level reporting relationships
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Position Management
- **Create Positions**: Add new positions with title, employee details, and reporting structure
- **Edit Positions**: Update existing position information
- **Delete Positions**: Remove positions with automatic hierarchy restructuring
- **Employee Information**: Store name, email, phone, and department details
- **Vacant Positions**: Support for unfilled positions in the organization

### Visual Features
- **Color-Coded Departments**: Each department has a unique color
- **Employee Avatars**: Auto-generated initials or user icons
- **Expandable/Collapsible Nodes**: Hide/show subordinates for cleaner view
- **Interactive Actions**: Hover actions for edit, add, and delete operations
- **Connection Lines**: Visual lines showing reporting relationships

## Components

### 1. OrganizationChart Component
Main component that renders the interactive organization chart.

**Props:**
- `positions`: Array of position objects
- `onAddPosition`: Callback for adding new positions
- `onEditPosition`: Callback for editing positions
- `onDeletePosition`: Callback for deleting positions
- `readOnly`: Boolean to disable editing (for internal users)
- `clientName`: Client name for display
- `departmentFilter`: Optional department ID to filter positions

### 2. PositionForm Component
Modal form for creating and editing positions.

**Props:**
- `isOpen`: Boolean to control modal visibility
- `onClose`: Callback for closing the modal
- `onSave`: Callback for saving position data
- `position`: Position object for editing (optional)
- `parentPosition`: Parent position for new positions (optional)
- `clientId`: Client ID
- `clientName`: Client name
- `departments`: Array of available departments
- `allPositions`: All positions for parent selection
- `mode`: 'create' or 'edit'

### 3. DeletePositionDialog Component
Confirmation dialog for position deletion.

**Props:**
- `isOpen`: Boolean to control dialog visibility
- `positionTitle`: Title of position being deleted
- `employeeName`: Name of employee (optional)
- `hasSubordinates`: Boolean indicating if position has subordinates
- `subordinatesCount`: Number of direct subordinates
- `onConfirm`: Callback for confirming deletion
- `onCancel`: Callback for canceling deletion
- `loading`: Boolean for loading state

## API Integration

### Position API Service
The `PositionApiService` handles all API communication for position data.

**Key Methods:**
- `getOrganizationChart(clientId, departmentId?)`: Get chart data
- `createPosition(data)`: Create new position
- `updatePosition(id, data)`: Update existing position
- `deletePosition(id)`: Delete position
- `movePosition(id, newParentId)`: Move position in hierarchy

### React Query Hooks
Custom hooks for data fetching and state management:

- `useOrganizationChart(clientId, departmentId?)`: Fetch chart data
- `useCreatePosition()`: Create position mutation
- `useUpdatePosition()`: Update position mutation
- `useDeletePosition()`: Delete position mutation

## Usage

### Adding the Organization Chart Tab

The organization chart is integrated as a tab in the Client Detail Page:

```tsx
// In ClientDetailPage.tsx
const tabs = [
  { id: 'overview', label: 'Overview', icon: Building },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'contracts', label: 'Contracts', icon: Target },
  { id: 'departments', label: 'Departments', icon: Users },
  { id: 'organization', label: 'Organization Chart', icon: Building2 }
];
```

### Department Filtering

Users can filter the organization chart by department:

```tsx
<select
  value={organizationDepartmentFilter}
  onChange={(e) => handleDepartmentFilterChange(e.target.value)}
>
  <option value="">All Departments</option>
  {departments.map(dept => (
    <option key={dept.id} value={dept.id}>
      {dept.name}
    </option>
  ))}
</select>
```

### Creating Positions

```tsx
const handlePositionSave = async (positionData) => {
  if (editingPosition) {
    await updatePositionMutation.mutateAsync({
      id: editingPosition.id,
      data: positionData
    });
  } else {
    await createPositionMutation.mutateAsync({
      ...positionData,
      clientId: clientId
    });
  }
};
```

## Data Structure

### Position Object
```typescript
interface Position {
  id: string;
  title: string;
  employeeName?: string;
  email?: string;
  phone?: string;
  department: string;
  departmentId?: string;
  parentId?: string;
  level: number;
  clientId: string;
  children?: Position[];
  isExpanded?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Department Object
```typescript
interface Department {
  id: string;
  name: string;
  color: string;
}
```

## Styling and Theming

The organization chart uses Tailwind CSS for styling with the following design principles:

- **Consistent Colors**: Department-based color coding
- **Clean Layout**: Minimal, professional appearance
- **Responsive Design**: Mobile-first approach
- **Interactive Elements**: Hover states and transitions
- **Accessibility**: Proper contrast and keyboard navigation

### Key CSS Classes
- `bg-white rounded-lg shadow-sm`: Card styling
- `hover:shadow-md transition-all`: Interactive effects
- `text-purple-600`: Primary brand color
- `bg-gray-50`: Background sections

## Error Handling

The feature includes comprehensive error handling:

1. **API Failures**: Graceful fallback to demo data
2. **Validation Errors**: Form validation with error messages
3. **Network Issues**: Loading states and retry mechanisms
4. **Data Integrity**: Circular reference prevention

## Demo Data

For development and testing, demo organization data is provided:

```typescript
// demoOrganizationData.ts
export const demoOrganizationData: Position[] = [
  // CEO, CTO, CFO, and other positions with realistic hierarchy
];
```

## Future Enhancements

### Planned Features
1. **Drag & Drop**: Move positions by dragging in the chart
2. **Export Functions**: PDF/PNG export of organization chart
3. **Bulk Import**: Import positions from CSV/Excel
4. **Advanced Filtering**: Filter by level, vacant positions, etc.
5. **Team Views**: Department-specific organization charts
6. **Position Templates**: Pre-defined position templates
7. **Reporting**: Organization structure analytics

### Performance Optimizations
1. **Virtualization**: For large organization charts
2. **Lazy Loading**: Load departments on demand
3. **Caching**: Smart caching strategies
4. **Optimistic Updates**: Immediate UI updates

## Accessibility

The organization chart follows accessibility best practices:

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels
- **Color Contrast**: WCAG 2.1 AA compliance
- **Focus Management**: Clear focus indicators
- **Alternative Text**: Descriptive alt text for visual elements

## Testing

### Unit Tests
- Component rendering tests
- API service tests
- Hook functionality tests
- Utility function tests

### Integration Tests
- Full workflow tests
- API integration tests
- Error scenario tests

### E2E Tests
- Complete user journey tests
- Cross-browser compatibility
- Mobile responsiveness tests

## Troubleshooting

### Common Issues

1. **Charts Not Loading**: Check API endpoint availability
2. **Empty Charts**: Verify client has departments and positions
3. **Permission Errors**: Check user role permissions
4. **Styling Issues**: Verify Tailwind CSS is properly configured

### Debug Mode

Enable debug mode by setting `DEBUG_ORG_CHART=true` in environment variables to see additional logging and development tools.

## Contributing

When contributing to the organization chart feature:

1. Follow existing component patterns
2. Add proper TypeScript types
3. Include comprehensive tests
4. Update documentation
5. Follow accessibility guidelines
6. Test on multiple devices and browsers
