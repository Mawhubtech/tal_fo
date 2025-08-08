import React, { useState } from 'react';
import { Building2, Users, Eye } from 'lucide-react';
import { 
  demoOrganizationData, 
  demoDepartments, 
  getDepartmentStats,
  technologyDepartmentChart,
  financeDepartmentChart,
  marketingDepartmentChart,
  hrDepartmentChart,
  executiveDepartmentChart
} from './demoOrganizationData';
import OrganizationChart from './OrganizationChart';

// Demo component to showcase organization chart relationships
interface OrganizationChartDemoProps {
  clientName?: string;
  compact?: boolean;
}

const OrganizationChartDemo: React.FC<OrganizationChartDemoProps> = ({ 
  clientName = "Demo Company",
  compact = false 
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [showFullChart, setShowFullChart] = useState(true);

  const departmentCharts: Record<string, any[]> = {
    'dept-1': executiveDepartmentChart,
    'dept-2': technologyDepartmentChart,
    'dept-3': financeDepartmentChart,
    'dept-4': marketingDepartmentChart,
    'dept-5': hrDepartmentChart
  };

  const getFilteredPositions = () => {
    if (!selectedDepartment) return demoOrganizationData;
    return departmentCharts[selectedDepartment] || [];
  };

  const departmentStats = getDepartmentStats();

  return (
    <div className={`${compact ? 'p-4' : 'p-6'} bg-gray-50 min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {!compact && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Organization Chart for {clientName}</h1>
            <p className="text-gray-600">
              This demo shows how the main organization chart relates to department-specific views.
            </p>
          </div>
        )}

        {/* Toggle View */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Chart View</h3>
              <p className="text-sm text-gray-600">
                Switch between complete organization view and department-specific views
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setShowFullChart(true);
                  setSelectedDepartment('');
                }}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showFullChart 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Full Organization
              </button>
              <button
                onClick={() => setShowFullChart(false)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  !showFullChart 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Department View
              </button>
            </div>
          </div>
        </div>

        {/* Department Stats */}
        <div className="mb-6 bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {departmentStats.map(dept => (
              <div 
                key={dept.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedDepartment === dept.id && !showFullChart
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200'
                }`}
                onClick={() => {
                  setSelectedDepartment(dept.id);
                  setShowFullChart(false);
                }}
              >
                <div className="flex items-center mb-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white mr-3"
                    style={{ backgroundColor: dept.color }}
                  >
                    {dept.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{dept.name}</h4>
                    <p className="text-xs text-gray-500">Click to view</p>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Positions:</span>
                    <span className="font-medium">{dept.totalPositions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Filled:</span>
                    <span className="font-medium text-green-600">{dept.filledPositions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vacant:</span>
                    <span className="font-medium text-orange-600">{dept.vacantPositions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Filter (when in department view) */}
        {!showFullChart && (
          <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Select Department:</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose a department...</option>
                  {demoDepartments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.icon} {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Eye className="w-4 h-4 mr-1" />
                {selectedDepartment ? 'Department View' : 'Select Department'}
              </div>
            </div>
          </div>
        )}

        {/* Explanation Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Understanding the Relationship
              </h4>
              <div className="text-sm text-blue-800">
                {showFullChart ? (
                  <p>
                    <strong>Full Organization View:</strong> Shows the complete company hierarchy starting from the CEO. 
                    All departments are interconnected through the executive level. This view helps understand overall company structure and cross-departmental relationships.
                  </p>
                ) : selectedDepartment ? (
                  <p>
                    <strong>Department View:</strong> Shows only positions within the selected department. 
                    This filtered view helps focus on internal department structure, reporting lines, and team organization within a specific functional area.
                  </p>
                ) : (
                  <p>
                    <strong>Department View Mode:</strong> Select a department above to see its internal organization structure. 
                    Each department maintains its own hierarchy while connecting to the overall company structure through department heads.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Organization Chart */}
        <div className="bg-white rounded-lg shadow-sm border">
          {selectedDepartment || showFullChart ? (
            <OrganizationChart
              positions={getFilteredPositions()}
              clientName={clientName}
              departmentFilter={!showFullChart ? selectedDepartment : undefined}
              readOnly={true}
            />
          ) : (
            <div className="p-12 text-center">
              <div className="p-4 bg-gray-100 rounded-lg inline-block mb-4">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Department</h3>
              <p className="text-gray-500">
                Choose a department from the statistics above or use the dropdown to view its organization chart.
              </p>
            </div>
          )}
        </div>

        {/* Key Insights */}
        <div className="mt-6 bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📊 Complete Organization</h4>
              <p className="text-sm text-gray-600">
                The full chart shows {demoOrganizationData.length} total positions across {demoDepartments.length} departments, 
                with {demoOrganizationData.filter(p => p.employeeName).length} filled positions.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🎯 Department Focus</h4>
              <p className="text-sm text-gray-600">
                Department views help managers focus on their team structure, identify gaps, 
                and plan for growth within their specific functional area.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🔗 Interconnected Structure</h4>
              <p className="text-sm text-gray-600">
                Each department connects to the overall organization through department heads 
                who report to the executive team, maintaining clear accountability lines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationChartDemo;
