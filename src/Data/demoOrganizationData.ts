import type { Position } from '../services/positionApiService';

// Demo organization chart data for testing - Shows complete company hierarchy
export const demoOrganizationData: Position[] = [
  // ==== EXECUTIVE LEVEL (Level 0) ====
  {
    id: 'pos-1',
    title: 'Chief Executive Officer',
    employeeName: 'John Smith',
    email: 'john.smith@company.com',
    phone: '+1 (555) 123-4567',
    department: 'Executive',
    departmentId: 'dept-1',
    level: 0,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // ==== DEPARTMENT HEADS (Level 1) ====
  {
    id: 'pos-2',
    title: 'Chief Technology Officer',
    employeeName: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 123-4568',
    department: 'Technology',
    departmentId: 'dept-2',
    parentId: 'pos-1',
    level: 1,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pos-3',
    title: 'Chief Financial Officer',
    employeeName: 'Michael Brown',
    email: 'michael.brown@company.com',
    phone: '+1 (555) 123-4569',
    department: 'Finance',
    departmentId: 'dept-3',
    parentId: 'pos-1',
    level: 1,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pos-4',
    title: 'Head of Marketing',
    employeeName: 'Emily Davis',
    email: 'emily.davis@company.com',
    phone: '+1 (555) 123-4570',
    department: 'Marketing',
    departmentId: 'dept-4',
    parentId: 'pos-1',
    level: 1,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pos-15',
    title: 'Chief Human Resources Officer',
    employeeName: 'Amanda Wilson',
    email: 'amanda.wilson@company.com',
    phone: '+1 (555) 123-4580',
    department: 'Human Resources',
    departmentId: 'dept-5',
    parentId: 'pos-1',
    level: 1,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // ==== TECHNOLOGY DEPARTMENT (dept-2) ====
  // Level 2 - Engineering Managers
  {
    id: 'pos-5',
    title: 'Engineering Manager - Frontend',
    employeeName: 'David Wilson',
    email: 'david.wilson@company.com',
    phone: '+1 (555) 123-4571',
    department: 'Technology',
    departmentId: 'dept-2',
    parentId: 'pos-2',
    level: 2,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pos-6',
    title: 'Engineering Manager - Backend',
    employeeName: 'Lisa Chen',
    email: 'lisa.chen@company.com',
    phone: '+1 (555) 123-4572',
    department: 'Technology',
    departmentId: 'dept-2',
    parentId: 'pos-2',
    level: 2,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pos-16',
    title: 'DevOps Manager',
    employeeName: 'Carlos Rodriguez',
    email: 'carlos.rodriguez@company.com',
    phone: '+1 (555) 123-4581',
    department: 'Technology',
    departmentId: 'dept-2',
    parentId: 'pos-2',
    level: 2,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // Level 3 - Senior Engineers
  {
    id: 'pos-9',
    title: 'Senior Frontend Developer',
    employeeName: 'Alex Rodriguez',
    email: 'alex.rodriguez@company.com',
    phone: '+1 (555) 123-4575',
    department: 'Technology',
    departmentId: 'dept-2',
    parentId: 'pos-5',
    level: 3,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pos-17',
    title: 'Senior Backend Developer',
    employeeName: 'Priya Patel',
    email: 'priya.patel@company.com',
    phone: '+1 (555) 123-4582',
    department: 'Technology',
    departmentId: 'dept-2',
    parentId: 'pos-6',
    level: 3,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pos-18',
    title: 'Senior DevOps Engineer',
    employeeName: 'James Kim',
    email: 'james.kim@company.com',
    phone: '+1 (555) 123-4583',
    department: 'Technology',
    departmentId: 'dept-2',
    parentId: 'pos-16',
    level: 3,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // Level 4 - Junior Engineers and Interns
  {
    id: 'pos-10',
    title: 'Frontend Developer',
    employeeName: 'Sophie Martin',
    email: 'sophie.martin@company.com',
    phone: '+1 (555) 123-4576',
    department: 'Technology',
    departmentId: 'dept-2',
    parentId: 'pos-9',
    level: 4,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pos-19',
    title: 'Junior Backend Developer',
    employeeName: 'Ryan Thompson',
    email: 'ryan.thompson@company.com',
    phone: '+1 (555) 123-4584',
    department: 'Technology',
    departmentId: 'dept-2',
    parentId: 'pos-17',
    level: 4,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pos-20',
    title: 'Software Engineering Intern',
    employeeName: 'Maya Gonzalez',
    email: 'maya.gonzalez@company.com',
    department: 'Technology',
    departmentId: 'dept-2',
    parentId: 'pos-9',
    level: 4,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // ==== FINANCE DEPARTMENT (dept-3) ====
  // Level 2 - Finance Managers
  {
    id: 'pos-7',
    title: 'Accounting Manager',
    employeeName: 'Robert Taylor',
    email: 'robert.taylor@company.com',
    phone: '+1 (555) 123-4573',
    department: 'Finance',
    departmentId: 'dept-3',
    parentId: 'pos-3',
    level: 2,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pos-21',
    title: 'Financial Planning Manager',
    employeeName: 'Jennifer Lee',
    email: 'jennifer.lee@company.com',
    phone: '+1 (555) 123-4585',
    department: 'Finance',
    departmentId: 'dept-3',
    parentId: 'pos-3',
    level: 2,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // Level 3 - Finance Staff
  {
    id: 'pos-22',
    title: 'Senior Financial Analyst',
    employeeName: 'Mark Anderson',
    email: 'mark.anderson@company.com',
    phone: '+1 (555) 123-4586',
    department: 'Finance',
    departmentId: 'dept-3',
    parentId: 'pos-21',
    level: 3,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pos-23',
    title: 'Staff Accountant',
    employeeName: 'Laura White',
    email: 'laura.white@company.com',
    phone: '+1 (555) 123-4587',
    department: 'Finance',
    departmentId: 'dept-3',
    parentId: 'pos-7',
    level: 3,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // ==== MARKETING DEPARTMENT (dept-4) ====
  // Level 2 - Marketing Managers
  {
    id: 'pos-8',
    title: 'Digital Marketing Manager',
    employeeName: 'Jessica Garcia',
    email: 'jessica.garcia@company.com',
    phone: '+1 (555) 123-4574',
    department: 'Marketing',
    departmentId: 'dept-4',
    parentId: 'pos-4',
    level: 2,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pos-24',
    title: 'Content Marketing Manager',
    employeeName: 'Daniel Miller',
    email: 'daniel.miller@company.com',
    phone: '+1 (555) 123-4588',
    department: 'Marketing',
    departmentId: 'dept-4',
    parentId: 'pos-4',
    level: 2,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // Level 3 - Marketing Staff
  {
    id: 'pos-25',
    title: 'Social Media Specialist',
    employeeName: 'Emma Johnson',
    email: 'emma.johnson@company.com',
    phone: '+1 (555) 123-4589',
    department: 'Marketing',
    departmentId: 'dept-4',
    parentId: 'pos-8',
    level: 3,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pos-26',
    title: 'Content Writer',
    employeeName: 'Kevin Brown',
    email: 'kevin.brown@company.com',
    phone: '+1 (555) 123-4590',
    department: 'Marketing',
    departmentId: 'dept-4',
    parentId: 'pos-24',
    level: 3,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pos-27',
    title: 'Marketing Coordinator',
    department: 'Marketing', // Vacant position
    departmentId: 'dept-4',
    parentId: 'pos-8',
    level: 3,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // ==== HUMAN RESOURCES DEPARTMENT (dept-5) ====
  // Level 2 - HR Managers
  {
    id: 'pos-28',
    title: 'Talent Acquisition Manager',
    employeeName: 'Rachel Davis',
    email: 'rachel.davis@company.com',
    phone: '+1 (555) 123-4591',
    department: 'Human Resources',
    departmentId: 'dept-5',
    parentId: 'pos-15',
    level: 2,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pos-29',
    title: 'HR Operations Manager',
    employeeName: 'Thomas Wilson',
    email: 'thomas.wilson@company.com',
    phone: '+1 (555) 123-4592',
    department: 'Human Resources',
    departmentId: 'dept-5',
    parentId: 'pos-15',
    level: 2,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // Level 3 - HR Staff
  {
    id: 'pos-30',
    title: 'Senior Recruiter',
    employeeName: 'Lisa Zhang',
    email: 'lisa.zhang@company.com',
    phone: '+1 (555) 123-4593',
    department: 'Human Resources',
    departmentId: 'dept-5',
    parentId: 'pos-28',
    level: 3,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pos-31',
    title: 'HR Generalist',
    employeeName: 'Andrew Clark',
    email: 'andrew.clark@company.com',
    phone: '+1 (555) 123-4594',
    department: 'Human Resources',
    departmentId: 'dept-5',
    parentId: 'pos-29',
    level: 3,
    clientId: 'client-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Demo departments data - Updated with Human Resources
export const demoDepartments = [
  {
    id: 'dept-1',
    name: 'Executive',
    color: '#8B5CF6',
    icon: '👑'
  },
  {
    id: 'dept-2',
    name: 'Technology',
    color: '#3B82F6',
    icon: '💻'
  },
  {
    id: 'dept-3',
    name: 'Finance',
    color: '#10B981',
    icon: '💰'
  },
  {
    id: 'dept-4',
    name: 'Marketing',
    color: '#F59E0B',
    icon: '📢'
  },
  {
    id: 'dept-5',
    name: 'Human Resources',
    color: '#EF4444',
    icon: '👥'
  }
];

// Helper function to get positions by department
export const getPositionsByDepartment = (departmentId: string): Position[] => {
  return demoOrganizationData.filter(position => position.departmentId === departmentId);
};

// Helper function to get department statistics
export const getDepartmentStats = () => {
  return demoDepartments.map(dept => {
    const deptPositions = getPositionsByDepartment(dept.id);
    const filledPositions = deptPositions.filter(pos => pos.employeeName);
    
    return {
      ...dept,
      totalPositions: deptPositions.length,
      filledPositions: filledPositions.length,
      vacantPositions: deptPositions.length - filledPositions.length,
      positions: deptPositions
    };
  });
};

// Examples of department-specific organization charts:

// Technology Department Only (dept-2)
export const technologyDepartmentChart = getPositionsByDepartment('dept-2');
// Shows: CTO → Engineering Managers → Senior Engineers → Junior Engineers/Interns

// Finance Department Only (dept-3) 
export const financeDepartmentChart = getPositionsByDepartment('dept-3');
// Shows: CFO → Accounting Manager & Financial Planning Manager → Staff

// Marketing Department Only (dept-4)
export const marketingDepartmentChart = getPositionsByDepartment('dept-4');
// Shows: Head of Marketing → Digital Marketing & Content Marketing Managers → Specialists

// Human Resources Department Only (dept-5)
export const hrDepartmentChart = getPositionsByDepartment('dept-5');
// Shows: CHRO → Talent Acquisition & HR Operations Managers → Recruiters & HR Staff

// Executive Department Only (dept-1)
export const executiveDepartmentChart = getPositionsByDepartment('dept-1');
// Shows: CEO only (top level)
