import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Copy, Archive, Trash2, Search as SearchIcon, MoreVertical, Calendar, MapPin, User, Briefcase, Plus, List } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Mock data for demonstration
const mockJobs = [
  { id: '1', title: 'Software Engineer', department: 'Engineering', location: 'New York, NY', status: 'Open', applications: 25, hiringManager: 'Jane Doe', createdDate: '2025-05-15' },
  { id: '2', title: 'Product Manager', department: 'Product', location: 'San Francisco, CA', status: 'Closed', applications: 40, hiringManager: 'John Smith', createdDate: '2025-04-01' },
  { id: '3', title: 'UX Designer', department: 'Design', location: 'Remote', status: 'Draft', applications: 0, hiringManager: 'Alice Brown', createdDate: '2025-05-20' },
  { id: '4', title: 'Frontend Developer', department: 'Engineering', location: 'Austin, TX', status: 'Open', applications: 15, hiringManager: 'Mike Wilson', createdDate: '2025-05-10' },
  { id: '5', title: 'Data Scientist', department: 'Analytics', location: 'Seattle, WA', status: 'Draft', applications: 8, hiringManager: 'Sarah Davis', createdDate: '2025-05-18' },
  { id: '6', title: 'Marketing Manager', department: 'Marketing', location: 'Los Angeles, CA', status: 'Closed', applications: 32, hiringManager: 'Tom Johnson', createdDate: '2025-04-20' },
];

const COLUMN_STATUS = {
  Open: 'Open',
  Closed: 'Closed',
  Draft: 'Draft',
} as const;

type JobStatus = keyof typeof COLUMN_STATUS;

// Helper function for status color, moved to AllJobsPage scope
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Open':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Closed':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Draft':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Fallback for other statuses
  }
};

// Job Card Component
interface JobCardProps {
  job: {
    id: string;
    title: string;
    department: string;
    location: string;
    status: string;
    applications: number;
    hiringManager: string;
    createdDate: string;
  };
  isDragging?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, isDragging = false }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: job.id,
    data: {
      type: 'job',
      job,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div className="bg-white rounded-lg shadow-lg border-2 border-purple-300 p-4 opacity-90 rotate-2 transform scale-105 transition-all">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{job.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
            {job.status}
          </span>
        </div>
        
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center">
            <Briefcase size={12} className="mr-2 text-gray-400" />
            <span>{job.department}</span>
          </div>
          <div className="flex items-center">
            <MapPin size={12} className="mr-2 text-gray-400" />
            <span>{job.location}</span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Applications</span>
            <span className="text-sm font-semibold text-purple-600">{job.applications}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing group ${
        isSortableDragging ? 'opacity-30 scale-95' : 'hover:scale-[1.02]'
      }`}
    >      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-purple-600 transition-colors">{job.title}</h3>
        <div className="flex items-center space-x-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
            {job.status}
          </span>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical size={16} className="text-gray-400" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[120px]">
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center">
                  <Eye size={14} className="mr-2" /> View
                </button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center">
                  <Copy size={14} className="mr-2" /> Duplicate
                </button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center">
                  <Archive size={14} className="mr-2" /> Archive
                </button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center text-red-600">
                  <Trash2 size={14} className="mr-2" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center">
          <Briefcase size={12} className="mr-2 text-gray-400" />
          <span>{job.department}</span>
        </div>
        <div className="flex items-center">
          <MapPin size={12} className="mr-2 text-gray-400" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center">
          <User size={12} className="mr-2 text-gray-400" />
          <span>{job.hiringManager}</span>
        </div>
        <div className="flex items-center">
          <Calendar size={12} className="mr-2 text-gray-400" />
          <span>{job.createdDate}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Applications</span>
          <span className="text-sm font-semibold text-purple-600">{job.applications}</span>
        </div>
      </div>
    </div>
  );
};

// Kanban Column Component
interface KanbanColumnProps {
  title: string;
  status: JobStatus;
  jobs: any[];
  jobCount: number;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, status, jobs, jobCount }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
    },
  });

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'border-green-500';
      case 'Closed':
        return 'border-red-500';
      case 'Draft':
        return 'border-gray-500';
      default:
        return 'border-yellow-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm min-w-[280px]">
      {/* Column Header */}
      <div className={`px-4 py-3 border-t-4 rounded-t-lg flex justify-between items-center ${getBorderColor(status)} ${
        isOver ? 'bg-purple-50' : ''
      }`}>
        <div>
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <p className="text-xs text-gray-500">{jobCount} jobs</p>
        </div>
        
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical size={16} />
        </button>
      </div>
      
      {/* Jobs in this column */}
      <div ref={setNodeRef} className="p-2 overflow-y-auto max-h-[calc(100vh-350px)]">
        <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
          <div className={`transition-all duration-200 ${isOver ? 'bg-purple-50 rounded-lg p-2' : ''}`}>
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
            
            {/* Empty state */}
            {jobs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400">
                <p className="text-sm">No jobs in {title.toLowerCase()}</p>
                <button className="mt-2 text-xs text-purple-600 hover:text-purple-800 flex items-center">
                  <Plus size={12} className="mr-1" />
                  Add job
                </button>
              </div>
            )}
            
            {isOver && jobs.length > 0 && (
              <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 bg-purple-50 text-center text-purple-600 text-sm font-medium mt-2">
                Drop here to move job
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

const AllJobsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [jobs, setJobs] = useState(mockJobs);
  const [activeJob, setActiveJob] = useState<any>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [view, setView] = useState<'kanban' | 'list'>('kanban'); // New state for view mode
  const [openListDropdownId, setOpenListDropdownId] = useState<string | null>(null); // State for list view dropdowns
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const job = jobs.find(job => job.id === active.id);
    setActiveJob(job);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    // Set dragOverColumn for visual feedback if needed, but ensure it's type 'column'
    if (over?.data?.current?.type === 'column') {
      setDragOverColumn(over.id as string);
    } else {
      setDragOverColumn(null); // Clear if not over a column directly
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);
    setDragOverColumn(null);

    if (!over) return;

    const activeId = active.id as string;

    // If dropped on itself or no significant move (over.id might be the same as active.id if not moved to a new droppable)
    // However, dnd-kit usually ensures over.id is different if dropped on a new target.
    // A common check is if active.id === over.id, but this might prevent reordering if an item is picked and dropped in the same spot.
    // The main check is if 'over' is a valid target.

    setJobs(currentJobs => {
      const activeJobIndex = currentJobs.findIndex(job => job.id === activeId);
      if (activeJobIndex === -1) return currentJobs; // Active job not found

      const activeJobData = currentJobs[activeJobIndex];

      // Case 1: Dropping onto a droppable column area
      if (over.data.current?.type === 'column') {
        const newStatus = over.id as JobStatus; // The ID of the droppable column is its status
        
        // Check if status is changing and is a valid status
        if (activeJobData.status !== newStatus && Object.values(COLUMN_STATUS).includes(newStatus)) {
          return currentJobs.map(job =>
            job.id === activeId ? { ...job, status: newStatus } : job
          );
        }
        return currentJobs; // No change needed
      }

      // Case 2: Dropping onto another job card
      if (over.data.current?.type === 'job') {
        const overJobId = over.id as string;
        const overJobIndex = currentJobs.findIndex(job => job.id === overJobId);

        if (overJobIndex === -1) return currentJobs; // Target job not found
        if (activeId === overJobId) return currentJobs; // Dropped on itself

        const overJobData = currentJobs[overJobIndex];

        if (activeJobData.status === overJobData.status) {
          // Reorder within the same column
          return arrayMove(currentJobs, activeJobIndex, overJobIndex);
        } else {
          // Moving to a different column (where overJobData resides)
          const newStatus = overJobData.status as JobStatus;
          if (Object.values(COLUMN_STATUS).includes(newStatus)) {
            // Create a temporary array with the status of the active job updated.
            // The job's position in this array is still `activeJobIndex`.
            const jobsWithUpdatedStatus = currentJobs.map((job, index) =>
              index === activeJobIndex ? { ...job, status: newStatus } : job
            );
            
            // Now, move this job (which is at `activeJobIndex` in `jobsWithUpdatedStatus`)
            // to the `overJobIndex`.
            return arrayMove(jobsWithUpdatedStatus, activeJobIndex, overJobIndex);
          }
          return currentJobs; // Invalid new status
        }
      }
      return currentJobs; // Fallback if not a recognized drop target type
    });
  };

  const filteredJobs = jobs.filter(job => {
    return (
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (departmentFilter ? job.department === departmentFilter : true)
    );
  });
  const jobsByStatus = {
    Open: filteredJobs.filter(job => job.status === 'Open'),
    Closed: filteredJobs.filter(job => job.status === 'Closed'),
    Draft: filteredJobs.filter(job => job.status === 'Draft'),
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // For JobCard dropdowns, they manage their own state.
      // This is for the list view dropdown.
      if (!(event.target as Element).closest('.relative-dropdown-container')) {
        setOpenListDropdownId(null);
      }
      // To close JobCard dropdowns, you might need a more global solution or pass down a handler.
      // For now, JobCard's internal `setShowDropdown` handles its own closure on click away if its `relative` div is not the target.
      // The current JobCard dropdown closes if you click outside its `relative` div.
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Jobs</h1>
          <p className="text-sm text-gray-600 mt-1">
            {view === 'kanban' ? 'Manage and track job postings with drag & drop' : 'View and manage all job postings'}
          </p>
        </div>
        <Link 
          to="/dashboard/jobs/create" 
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Create Job
        </Link>
      </div>

      {/* View Switcher */}
      <div className="mb-6">
        <div className="flex space-x-2 bg-white border border-gray-200 rounded-md p-1 w-min">
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
              view === 'kanban' 
                ? 'bg-purple-600 text-white shadow-sm' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setView('kanban')}
          >
            <Briefcase size={16} className="mr-2" />
            Kanban
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
              view === 'list' 
                ? 'bg-purple-600 text-white shadow-sm' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setView('list')}
          >
            <List size={16} className="mr-2" />
            List
          </button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Search by job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <select
              id="department"
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Analytics">Analytics</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600">{jobsByStatus.Open.length} Open</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-gray-600">{jobsByStatus.Closed.length} Closed</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                <span className="text-gray-600">{jobsByStatus.Draft.length} Draft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Kanban Board View */}
      {view === 'kanban' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-6 min-h-[600px] snap-x snap-mandatory">
            {Object.entries(COLUMN_STATUS).map(([key, statusValue]) => (
              <div key={key} className="snap-start">
                <KanbanColumn
                  title={statusValue}
                  status={statusValue as JobStatus}
                  jobs={jobsByStatus[statusValue as JobStatus]}
                  jobCount={jobsByStatus[statusValue as JobStatus].length}
                />
              </div>
            ))}
          </div>
          
          <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
            {activeJob ? <JobCard job={activeJob} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredJobs.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <div key={job.id} className="p-4 hover:bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 mb-4 sm:mb-0">
                    <div className="flex items-center mb-1">
                      <Link to={`/dashboard/jobs/${job.id}`} className="font-semibold text-gray-900 hover:text-purple-600 transition-colors text-base">
                        {job.title}
                      </Link>
                      <span className={`ml-3 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                      <div className="flex items-center">
                        <Briefcase size={14} className="mr-1.5 text-gray-400" /> {job.department}
                      </div>
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1.5 text-gray-400" /> {job.location}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                       <div className="flex items-center">
                         <User size={12} className="mr-1.5" /> Hiring Manager: {job.hiringManager}
                       </div>
                       <div className="flex items-center">
                         <Calendar size={12} className="mr-1.5" /> Created: {job.createdDate}
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 sm:space-x-4">
                     <div className="text-right sm:text-center">
                        <p className="text-lg font-semibold text-purple-600">{job.applications}</p>
                        <p className="text-xs text-gray-500">Applications</p>
                     </div>
                     <div className="relative relative-dropdown-container"> {/* Added class for click outside */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenListDropdownId(openListDropdownId === job.id ? null : job.id);
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                          title="More options"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {openListDropdownId === job.id && (
                          <div 
                            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-xl z-20 py-1"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside dropdown
                          >
                            <Link to={`/dashboard/jobs/${job.id}`} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                              <Eye size={14} className="mr-2" /> View Details
                            </Link>
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                              <Copy size={14} className="mr-2" /> Duplicate
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                              <Archive size={14} className="mr-2" /> Archive
                            </button>
                            <div className="my-1 border-t border-gray-100"></div>
                            <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
                              <Trash2 size={14} className="mr-2" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <Briefcase size={32} className="text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No jobs match your current filters. Try adjusting your search or filter criteria.
              </p>
              { (searchTerm || departmentFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDepartmentFilter('');
                  }}
                  className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AllJobsPage;
