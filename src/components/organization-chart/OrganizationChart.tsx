import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, Plus, Edit3, Trash2, ChevronDown, ChevronRight,
  Building2, Mail, Phone, MapPin, Briefcase, User
} from 'lucide-react';

// Types for organization chart
export interface Position {
  id: string;
  title: string;
  employeeName?: string;
  email?: string;
  phone?: string;
  department: string;
  departmentId?: string;
  parentId?: string;
  level: number;
  children?: Position[];
  isExpanded?: boolean;
}

export interface OrganizationChartProps {
  positions: Position[];
  onAddPosition?: (parentId?: string) => void;
  onEditPosition?: (position: Position) => void;
  onDeletePosition?: (positionId: string) => void;
  readOnly?: boolean;
  clientName?: string;
  departmentFilter?: string;
}

// Utility function to generate consistent colors
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA5A5', '#A178DF',
    '#75C9B7', '#FFD166', '#118AB2', '#06D6A0', '#EF476F',
    '#FFC43D', '#E76F51', '#1B9AAA', '#6A0572', '#AB83A1'
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (name: string) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Position Card Component
const PositionCard: React.FC<{
  position: Position;
  onAddChild?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleExpand?: () => void;
  readOnly?: boolean;
  isExpanded?: boolean;
}> = ({ position, onAddChild, onEdit, onDelete, onToggleExpand, readOnly, isExpanded = false }) => {
  const [showActions, setShowActions] = useState(false);
  const hasChildren = position.children && position.children.length > 0;
  const backgroundColor = stringToColor(position.department);

  return (
    <div className="relative">
      <div 
        className="bg-white border-2 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 min-w-[300px] max-w-[340px] mx-auto"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Header with avatar and basic info */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center flex-1 min-w-0">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3 shadow-sm flex-shrink-0"
              style={{ backgroundColor }}
            >
              {position.employeeName ? getInitials(position.employeeName) : <User className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate" title={position.title}>
                {position.title}
              </h4>
              {position.employeeName && (
                <p className="text-sm text-gray-600 truncate" title={position.employeeName}>{position.employeeName}</p>
              )}
              <div className="flex items-center mt-1">
                <Building2 className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                <span className="text-xs text-gray-500 truncate" title={position.department}>{position.department}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {!readOnly && (showActions || window.innerWidth < 768) && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Edit position"
              >
                <Edit3 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild?.();
                }}
                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                title="Add subordinate"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete position"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Contact information */}
        {(position.email || position.phone) && (
          <div className="space-y-1 mb-3 pt-2 border-t border-gray-100">
            {position.email && (
              <div className="flex items-center text-xs text-gray-600">
                <Mail className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate" title={position.email}>{position.email}</span>
              </div>
            )}
            {position.phone && (
              <div className="flex items-center text-xs text-gray-600">
                <Phone className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate" title={position.phone}>{position.phone}</span>
              </div>
            )}
          </div>
        )}

        {/* Expand/Collapse button for children */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand?.();
            }}
            className="w-full mt-2 pt-2 border-t border-gray-100 flex items-center justify-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Hide {position.children?.length} subordinate{position.children?.length !== 1 ? 's' : ''}
              </>
            ) : (
              <>
                <ChevronRight className="w-3 h-3 mr-1" />
                Show {position.children?.length} subordinate{position.children?.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Tree Node Component
const TreeNode: React.FC<{
  position: Position;
  onAddPosition?: (parentId?: string) => void;
  onEditPosition?: (position: Position) => void;
  onDeletePosition?: (positionId: string) => void;
  onToggleExpand?: (positionId: string) => void;
  readOnly?: boolean;
  isLast?: boolean;
  level?: number;
  expandedNodes?: Set<string>;
}> = ({ 
  position, 
  onAddPosition, 
  onEditPosition, 
  onDeletePosition, 
  onToggleExpand, 
  readOnly,
  isLast = false,
  level = 0,
  expandedNodes = new Set()
}) => {
  const hasChildren = position.children && position.children.length > 0;
  const showChildren = hasChildren && expandedNodes.has(position.id);

  return (
    <div className="relative">
      <div className="flex flex-col items-center">
        {/* Position Card */}
        <PositionCard
          position={position}
          onAddChild={() => onAddPosition?.(position.id)}
          onEdit={() => onEditPosition?.(position)}
          onDelete={() => onDeletePosition?.(position.id)}
          onToggleExpand={() => onToggleExpand?.(position.id)}
          readOnly={readOnly}
          isExpanded={expandedNodes.has(position.id)}
        />

        {/* Children */}
        {showChildren && (
          <div className="mt-8 relative">
            {/* Vertical line from parent */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-300"></div>
            
            {/* Horizontal line for multiple children */}
            {position.children!.length > 1 && (
              <div 
                className="absolute top-8 h-0.5 bg-gray-300" 
                style={{
                  left: `calc(${100 / position.children!.length / 2}% + ${150 / position.children!.length}px)`,
                  right: `calc(${100 / position.children!.length / 2}% + ${150 / position.children!.length}px)`
                }}
              ></div>
            )}

            {/* Children grid with better spacing */}
            <div className={`flex flex-wrap justify-center gap-12 pt-8 ${
              position.children!.length === 1 ? 'max-w-[340px]' : 
              position.children!.length === 2 ? 'max-w-[720px]' :
              position.children!.length === 3 ? 'max-w-[1080px]' :
              'max-w-[1440px]'
            } mx-auto`}>
              {position.children!.map((child, index) => (
                <div key={child.id} className="relative flex-shrink-0">
                  {/* Vertical line to child */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-300"></div>
                  
                  <div className="pt-8">
                    <TreeNode
                      position={child}
                      onAddPosition={onAddPosition}
                      onEditPosition={onEditPosition}
                      onDeletePosition={onDeletePosition}
                      onToggleExpand={onToggleExpand}
                      readOnly={readOnly}
                      isLast={index === position.children!.length - 1}
                      level={level + 1}
                      expandedNodes={expandedNodes}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Organization Chart Component
const OrganizationChart: React.FC<OrganizationChartProps> = ({
  positions,
  onAddPosition,
  onEditPosition,
  onDeletePosition,
  readOnly = false,
  clientName,
  departmentFilter
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const chartRef = useRef<HTMLDivElement>(null);

  // Since the API already returns hierarchical data, we don't need to build the tree
  // We just use the positions as they are (they already have children populated)
  const treeData = positions;

  const handleToggleExpand = (positionId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      const wasExpanded = newSet.has(positionId);
      if (wasExpanded) {
        newSet.delete(positionId);
      } else {
        newSet.add(positionId);
      }
      return newSet;
    });
  };

  // Auto-expand nodes with children on initial load
  useEffect(() => {
    if (treeData.length > 0) {
      const nodesToExpand = new Set<string>();
      
      const expandNodesWithChildren = (nodes: Position[]) => {
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            nodesToExpand.add(node.id);
            expandNodesWithChildren(node.children);
          }
        });
      };
      
      expandNodesWithChildren(treeData);
      setExpandedNodes(nodesToExpand);
    }
  }, [positions]);

  if (treeData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-100 rounded-lg inline-block mb-4">
          <Building2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Organization Structure</h3>
        <p className="text-gray-500 mb-4">
          {departmentFilter 
            ? "This department doesn't have any positions defined yet."
            : `${clientName || 'This organization'} doesn't have any positions defined yet.`}
        </p>
        {!readOnly && (
          <button
            onClick={() => onAddPosition?.()}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Position
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Chart controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {departmentFilter ? 'Department' : 'Organization'} Chart
          </h3>
          <p className="text-sm text-gray-500">
            {treeData.length} position{treeData.length !== 1 ? 's' : ''} 
            {departmentFilter ? ' in this department' : ` at ${clientName}`}
          </p>
          {departmentFilter && (
            <p className="text-xs text-blue-600 mt-1">
              💡 This shows only the {departmentFilter} department hierarchy. 
              Clear the filter to see the complete organization structure.
            </p>
          )}
        </div>
        
        {!readOnly && (
          <button
            onClick={() => onAddPosition?.()}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Position
          </button>
        )}
      </div>

      {/* Organization Chart */}
      <div 
        ref={chartRef}
        className="w-full overflow-x-auto overflow-y-visible bg-gray-50 rounded-lg p-12"
        style={{ minHeight: '500px' }}
      >
        <div className="flex flex-col items-center space-y-12 min-w-max">
          {treeData.map((rootPosition, index) => (
            <div key={rootPosition.id} className="w-full flex justify-center">
              <TreeNode
                key={rootPosition.id}
                position={rootPosition}
                onAddPosition={onAddPosition}
                onEditPosition={onEditPosition}
                onDeletePosition={onDeletePosition}
                onToggleExpand={handleToggleExpand}
                readOnly={readOnly}
                isLast={index === treeData.length - 1}
                expandedNodes={expandedNodes}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-500">
        <div className="flex items-center">
          <div className="w-3 h-0.5 bg-gray-300 mr-2"></div>
          <span>Reports to</span>
        </div>
        <div className="flex items-center">
          <Users className="w-3 h-3 mr-1" />
          <span>Click to expand/collapse</span>
        </div>
        {!readOnly && (
          <div className="flex items-center">
            <Plus className="w-3 h-3 mr-1" />
            <span>Hover to see actions</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationChart;
