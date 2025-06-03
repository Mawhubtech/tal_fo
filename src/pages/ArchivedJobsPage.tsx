import React, { useState, useEffect } from 'react';
import { Eye, RotateCcw, Trash2, Search as SearchIcon, MoreVertical, Calendar, MapPin, User, Briefcase, Archive } from 'lucide-react';
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
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Mock data for demonstration - assuming similar structure to AllJobsPage but with archived-specific fields if any
const mockArchivedJobs = [
	{
		id: '10',
		title: 'Senior Marketing Manager',
		department: 'Marketing',
		location: 'London, UK',
		status: 'Recently Archived',
		applications: 55,
		hiringManager: 'Emily White',
		createdDate: '2024-11-01',
		archivedDate: '2025-01-15',
	},
	{
		id: '11',
		title: 'Data Analyst',
		department: 'Analytics',
		location: 'Remote',
		status: 'Recently Archived',
		applications: 30,
		hiringManager: 'Michael Green',
		createdDate: '2024-10-20',
		archivedDate: '2024-12-20',
	},
	{
		id: '12',
		title: 'Frontend Developer',
		department: 'Engineering',
		location: 'San Francisco, CA',
		status: 'Old Archive',
		applications: 45,
		hiringManager: 'David Lee',
		createdDate: '2024-08-15',
		archivedDate: '2024-11-30',
	},
	{
		id: '13',
		title: 'Product Designer',
		department: 'Design',
		location: 'New York, NY',
		status: 'Old Archive',
		applications: 38,
		hiringManager: 'Sarah Johnson',
		createdDate: '2024-07-10',
		archivedDate: '2024-10-15',
	},
	{
		id: '14',
		title: 'DevOps Engineer',
		department: 'Engineering',
		location: 'Austin, TX',
		status: 'Permanently Deleted',
		applications: 22,
		hiringManager: 'Alex Chen',
		createdDate: '2024-06-01',
		archivedDate: '2024-09-20',
	},
];

const ARCHIVE_STATUS = {
  'Recently Archived': 'Recently Archived',
  'Old Archive': 'Old Archive',
  'Permanently Deleted': 'Permanently Deleted',
} as const;

type ArchiveStatus = keyof typeof ARCHIVE_STATUS;

// Archived Job Card Component
interface ArchivedJobCardProps {
  job: {
    id: string;
    title: string;
    department: string;
    location: string;
    status: string;
    applications: number;
    hiringManager: string;
    createdDate: string;
    archivedDate: string;
  };
  isDragging?: boolean;
  onReopen: (jobId: string) => void;
  onDelete: (jobId: string) => void;
}

const ArchivedJobCard: React.FC<ArchivedJobCardProps> = ({ job, isDragging = false, onReopen, onDelete }) => {
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
      type: 'archived-job',
      job,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Recently Archived':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Old Archive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Permanently Deleted':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing opacity-80 ${
        isDragging || isSortableDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{job.title}</h3>
        <div className="flex items-center space-x-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
            <Archive size={10} className="inline mr-1" />
            Archived
          </span>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertical size={16} className="text-gray-400" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[120px]">
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center">
                  <Eye size={14} className="mr-2" /> View
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onReopen(job.id);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center text-green-600"
                >
                  <RotateCcw size={14} className="mr-2" /> Reopen
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(job.id);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center text-red-600"
                >
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
          <span>Archived: {job.archivedDate}</span>
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

// Archive Kanban Column Component
interface ArchiveColumnProps {
  title: string;
  status: ArchiveStatus;
  jobs: any[];
  jobCount: number;
  onReopen: (jobId: string) => void;
  onDelete: (jobId: string) => void;
}

const ArchiveColumn: React.FC<ArchiveColumnProps> = ({ title, status, jobs, jobCount, onReopen, onDelete }) => {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  const getColumnColor = (status: string) => {
    switch (status) {
      case 'Recently Archived':
        return 'border-yellow-200 bg-yellow-50';
      case 'Old Archive':
        return 'border-gray-200 bg-gray-50';
      case 'Permanently Deleted':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div ref={setNodeRef} className={`flex-1 min-w-[300px] rounded-lg border-2 ${getColumnColor(status)} p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800 text-lg">{title}</h2>
        <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600 border">
          {jobCount}
        </span>
      </div>
      
      <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 min-h-[200px]">
          {jobs.map((job) => (
            <ArchivedJobCard 
              key={job.id} 
              job={job} 
              onReopen={onReopen}
              onDelete={onDelete}
            />
          ))}
          {jobs.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-sm">No jobs in {title.toLowerCase()}</div>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

const ArchivedJobsPage: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [departmentFilter, setDepartmentFilter] = useState('');
	const [archivedDateFilter, setArchivedDateFilter] = useState('');
	const [jobs, setJobs] = useState(mockArchivedJobs);
	const [activeJob, setActiveJob] = useState<any>(null);

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

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveJob(null);
		
		if (!over) return;
		
		const activeJobId = active.id as string;
		const newStatus = over.id as ArchiveStatus;
		
		if (activeJobId && newStatus && Object.values(ARCHIVE_STATUS).includes(newStatus)) {
			setJobs(prevJobs => 
				prevJobs.map(job => 
					job.id === activeJobId ? { ...job, status: newStatus } : job
				)
			);
			console.log(`Updated archived job ${activeJobId} status to ${newStatus}`);
		}
	};

	const handleReopenJob = (jobId: string) => {
		console.log(`Reopening job ${jobId}`);
		// TODO: Implement API call to change job status back to active
	};

	const handleDeletePermanently = (jobId: string) => {
		console.log(`Deleting job ${jobId} permanently`);
		// TODO: Implement API call to delete job permanently
	};

	const filteredArchivedJobs = jobs.filter((job) => {
		const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesDepartment = departmentFilter ? job.department === departmentFilter : true;
		// TODO: Implement date range filtering for archivedDate
		const matchesDate = true; // Placeholder for date filter logic
		return matchesSearch && matchesDepartment && matchesDate;
	});

	const jobsByStatus = {
		'Recently Archived': filteredArchivedJobs.filter(job => job.status === 'Recently Archived'),
		'Old Archive': filteredArchivedJobs.filter(job => job.status === 'Old Archive'),
		'Permanently Deleted': filteredArchivedJobs.filter(job => job.status === 'Permanently Deleted'),
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
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900">Archived Jobs</h1>
					<p className="text-sm text-gray-600 mt-1">Manage archived job postings with drag & drop</p>
				</div>
			</div>

			{/* Filters and Search */}
			<div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<label htmlFor="searchArchived" className="block text-sm font-medium text-gray-700 mb-2">
							Search Jobs
						</label>
						<div className="relative">
							<input
								type="text"
								id="searchArchived"
								className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
								placeholder="Search by job title..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
							</div>
						</div>
					</div>
					
					<div>
						<label htmlFor="departmentArchived" className="block text-sm font-medium text-gray-700 mb-2">
							Department
						</label>
						<select
							id="departmentArchived"
							className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
					
					<div>
						<label htmlFor="archivedDate" className="block text-sm font-medium text-gray-700 mb-2">
							Archived Date
						</label>
						<select
							id="archivedDate"
							className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
							value={archivedDateFilter}
							onChange={(e) => setArchivedDateFilter(e.target.value)}
						>
							<option value="">Any Time</option>
							<option value="last_30_days">Last 30 days</option>
							<option value="last_90_days">Last 90 days</option>
							<option value="last_year">Last Year</option>
						</select>
					</div>
					
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
						<div className="flex flex-col space-y-1 text-sm">
							<div className="flex items-center">
								<div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
								<span>{jobsByStatus['Recently Archived'].length} Recent</span>
							</div>
							<div className="flex items-center">
								<div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
								<span>{jobsByStatus['Old Archive'].length} Old</span>
							</div>
							<div className="flex items-center">
								<div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
								<span>{jobsByStatus['Permanently Deleted'].length} Deleted</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Archive Kanban Board */}
			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<div className="flex space-x-6 overflow-x-auto pb-4 min-h-[600px]">
					{Object.entries(ARCHIVE_STATUS).map(([key, status]) => (
						<ArchiveColumn
							key={key}
							title={status}
							status={status as ArchiveStatus}
							jobs={jobsByStatus[status as ArchiveStatus]}
							jobCount={jobsByStatus[status as ArchiveStatus].length}
							onReopen={handleReopenJob}
							onDelete={handleDeletePermanently}
						/>
					))}
				</div>
				
				<DragOverlay>
					{activeJob ? (
						<ArchivedJobCard 
							job={activeJob} 
							isDragging 
							onReopen={handleReopenJob}
							onDelete={handleDeletePermanently}
						/>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
};

export default ArchivedJobsPage;
