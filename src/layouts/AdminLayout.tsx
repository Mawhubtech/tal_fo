import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { 
  Users, UserPlus, Building, Target, BarChart3, Settings, GitBranch,
   Bell, Search, Shield, ChevronRight, ChevronDown,
  Activity, Database, Lock,
  LayoutDashboard
} from 'lucide-react';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [notifications] = useState(3); // Mock notification count
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const adminNavigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      path: '/dashboard/admin',
      icon: LayoutDashboard,
      description: 'Admin dashboard overview'
    },
    {
      id: 'user-management',
      label: 'User Management',
      path: '/dashboard/admin/users',
      icon: Users,
      description: 'Manage system users and permissions',
      submenu: [
        {
          id: 'users',
          label: 'Users',
          path: '/dashboard/admin/users',
          description: 'Manage system users'
        },
        {
          id: 'user-clients',
          label: 'User-Client Access',
          path: '/dashboard/admin/user-clients',
          description: 'Manage user access to organizations'
        }
      ]
    },
    {
      id: 'pipelines',
      label: 'Pipelines',
      path: '/dashboard/admin/pipelines',
      icon: GitBranch,
      description: 'Create and manage recruitment pipelines'
    },
    {
      id: 'candidate-profiles',
      label: 'Candidate Profiles',
      path: '/dashboard/admin/candidate-profiles',
      icon: UserPlus,
      description: 'Manage candidate data and profiles'
    },
    {
      id: 'company-management',
      label: 'Company Management',
      path: '/dashboard/admin/company-management',
      icon: Building,
      description: 'Manage client companies'
    },
    {
      id: 'job-board-config',
      label: 'Job Board Config',
      path: '/dashboard/admin/job-board-config',
      icon: Target,
      description: 'Configure job board integrations'
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      path: '/dashboard/admin/analytics',
      icon: BarChart3,
      description: 'View platform analytics'
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      path: '/dashboard/admin/system-settings',
      icon: Settings,
      description: 'Configure platform settings'
    }
  ];

  const quickActions = [
    { label: 'Add User', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'System Health', icon: Activity, color: 'bg-green-100 text-green-600' },
    { label: 'Backup Data', icon: Database, color: 'bg-purple-100 text-purple-600' },
    { label: 'Security Audit', icon: Lock, color: 'bg-red-100 text-red-600' }
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const isSubmenuActive = (item: any) => {
    if (!item.submenu) return false;
    return item.submenu.some((subItem: any) => isActive(subItem.path));
  };

  const toggleMenu = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const isMenuExpanded = (menuId: string) => {
    return expandedMenus.has(menuId) || isSubmenuActive(adminNavigationItems.find(item => item.id === menuId));
  };

  const getCurrentPageTitle = () => {
    const currentItem = adminNavigationItems.find(item => isActive(item.path));
    return currentItem ? currentItem.label : 'Admin Panel';
  };

  const getCurrentPageDescription = () => {
    const currentItem = adminNavigationItems.find(item => isActive(item.path));
    return currentItem ? currentItem.description : 'Manage platform settings and configurations';
  };

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Admin', path: '/dashboard/admin' }
    ];

    if (pathSegments.length > 2) {
      const currentItem = adminNavigationItems.find(item => isActive(item.path));
      if (currentItem && currentItem.path !== '/dashboard/admin') {
        breadcrumbs.push({ label: currentItem.label, path: currentItem.path });
      }
    }

    return breadcrumbs;
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumb Navigation */}
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                {getBreadcrumbs().map((crumb, index) => (
                  <React.Fragment key={crumb.path}>
                    {index > 0 && <ChevronRight className="h-4 w-4" />}
                    <Link 
                      to={crumb.path}
                      className={`hover:text-gray-700 ${
                        index === getBreadcrumbs().length - 1 
                          ? 'text-gray-900 font-medium' 
                          : 'text-gray-500'
                      }`}
                    >
                      {crumb.label}
                    </Link>
                  </React.Fragment>
                ))}
              </nav>
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{getCurrentPageTitle()}</h1>
                  <p className="text-sm text-gray-600">{getCurrentPageDescription()}</p>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="hidden lg:flex items-center space-x-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className={`p-2 rounded-lg ${action.color} hover:opacity-80 transition-opacity`}
                    title={action.label}
                  >
                    <action.icon className="h-4 w-4" />
                  </button>
                ))}
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search admin..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - No sidebar since we use the main app sidebar */}
      <div className="p-6">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default AdminLayout;
