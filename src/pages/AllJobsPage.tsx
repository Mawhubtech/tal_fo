import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Copy, Archive, Trash2, Search as SearchIcon, MoreVertical, Calendar, MapPin, User, Briefcase, Plus } from 'lucide-react';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
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
    setDragOverColumn(over?.id as string || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);
    setDragOverColumn(null);
    
    if (!over) return;
    
    const activeJobId = active.id as string;
    const newStatus = over.id as JobStatus;
    
    // Check if we're dropping on a valid column
    if (activeJobId && newStatus && Object.values(COLUMN_STATUS).includes(newStatus)) {
      setJobs(prevJobs => {
        const updatedJobs = prevJobs.map(job => 
          job.id === activeJobId ? { ...job, status: newStatus } : job
        );
        console.log(`Updated job ${activeJobId} status to ${newStatus}`);
        return updatedJobs;
      });
    }
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
      if (!(event.target as Element).closest('.relative')) {
        // Close any open dropdowns
      }
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
          <p className="text-sm text-gray-600 mt-1">Manage and track job postings with drag & drop</p>
        </div>
        <Link 
          to="/dashboard/jobs/create" 
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Create Job
        </Link>
      </div>      {/* Filters and Search */}
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
      </div>{/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6 min-h-[600px] snap-x snap-mandatory">
          {Object.entries(COLUMN_STATUS).map(([key, status]) => (
            <div key={key} className="snap-start">
              <KanbanColumn
                title={status}
                status={status as JobStatus}
                jobs={jobsByStatus[status as JobStatus]}
                jobCount={jobsByStatus[status as JobStatus].length}
              />
            </div>
          ))}
        </div>
        
        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {activeJob ? <JobCard job={activeJob} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default AllJobsPage;
