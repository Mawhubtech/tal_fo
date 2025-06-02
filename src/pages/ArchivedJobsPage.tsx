import React, { useState } from 'react';
// import { Link } from 'react-router-dom'; // Link is not used
import { Eye, RotateCcw, Trash2, Search as SearchIcon } from 'lucide-react'; // Removed Filter icon, Link import

// Mock data for demonstration - assuming similar structure to AllJobsPage but with archived-specific fields if any
const mockArchivedJobs = [
	{
		id: '10',
		title: 'Senior Marketing Manager',
		department: 'Marketing',
		location: 'London, UK',
		status: 'Archived',
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
		status: 'Archived',
		applications: 30,
		hiringManager: 'Michael Green',
		createdDate: '2024-10-20',
		archivedDate: '2024-12-20',
	},
];

const ArchivedJobsPage: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [departmentFilter, setDepartmentFilter] = useState('');
	const [archivedDateFilter, setArchivedDateFilter] = useState(''); // e.g., 'last_30_days'

	const filteredArchivedJobs = mockArchivedJobs.filter((job) => {
		// Basic filtering, can be expanded
		const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesDepartment = departmentFilter ? job.department === departmentFilter : true;
		// TODO: Implement date range filtering for archivedDate
		const matchesDate = true; // Placeholder for date filter logic
		return matchesSearch && matchesDepartment && matchesDate;
	});

	const handleReopenJob = (jobId: string) => {
		console.log(`Reopening job ${jobId}`);
		// TODO: Implement API call to change job status
	};

	const handleDeletePermanently = (jobId: string) => {
		console.log(`Deleting job ${jobId} permanently`);
		// TODO: Implement API call to delete job
	};

	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold mb-6">Archived Jobs</h1>

			{/* Filters and Search */}
			<div className="mb-4 p-4 bg-gray-100 rounded-md">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<div>
						<label
							htmlFor="searchArchived"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Search
						</label>
						<div className="relative">
							<input
								type="text"
								id="searchArchived"
								className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
						<label
							htmlFor="departmentArchived"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Department
						</label>
						<select
							id="departmentArchived"
							className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
							value={departmentFilter}
							onChange={(e) => setDepartmentFilter(e.target.value)}
						>
							<option value="">All Departments</option>
							{/* TODO: Populate dynamically */}
							<option value="Engineering">Engineering</option>
							<option value="Product">Product</option>
							<option value="Design">Design</option>
							<option value="Marketing">Marketing</option>
							<option value="Analytics">Analytics</option>
						</select>
					</div>
					<div>
						<label
							htmlFor="archivedDate"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Archived Date
						</label>
						<select
							id="archivedDate"
							className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
							value={archivedDateFilter}
							onChange={(e) => setArchivedDateFilter(e.target.value)}
						>
							<option value="">Any Time</option>
							<option value="last_30_days">Last 30 days</option>
							<option value="last_90_days">Last 90 days</option>
							<option value="last_year">Last Year</option>
							{/* TODO: Add custom date range option */}
						</select>
					</div>
				</div>
			</div>

			{/* Archived Jobs Table */}
			<div className="overflow-x-auto bg-white shadow-md rounded-lg">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-100">
						<tr>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
							>
								Job Title
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
							>
								Department
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
							>
								Location
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
							>
								Applications
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
							>
								Hiring Manager
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
							>
								Archived Date
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
							>
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{filteredArchivedJobs.length > 0 ? (
							filteredArchivedJobs.map((job) => (
								<tr key={job.id} className="hover:bg-gray-50 opacity-75">
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
										{job.title}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{job.department}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{job.location}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
										{job.applications}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{job.hiringManager}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{job.archivedDate}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
										<div className="flex items-center space-x-2">
											<button
												title="View Details"
												className="text-purple-500 hover:text-purple-700"
											>
												<Eye size={18} />
											</button>
											<button
												title="Reopen Job"
												onClick={() => handleReopenJob(job.id)}
												className="text-green-500 hover:text-green-700"
											>
												<RotateCcw size={18} />
											</button>
											<button
												title="Delete Permanently"
												onClick={() => handleDeletePermanently(job.id)}
												className="text-red-500 hover:text-red-700"
											>
												<Trash2 size={18} />
											</button>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={7}
									className="px-6 py-12 text-center text-sm text-gray-500"
								>
									No archived jobs found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default ArchivedJobsPage;
