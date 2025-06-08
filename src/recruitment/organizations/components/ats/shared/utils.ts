// Calendar utility functions
export const getCalendarDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }
  
  return days;
};

export const getItemsForDate = <T extends { dueDate?: string; date?: string }>(
  date: Date, 
  items: T[]
): T[] => {
  return items.filter(item => {
    const itemDate = new Date(item.dueDate || item.date || '');
    return itemDate.toDateString() === date.toDateString();
  });
};

export const getStageColor = (stage: string): string => {
  switch (stage) {
    case 'Applied': return 'border-blue-500';
    case 'Phone Screen': return 'border-indigo-500';
    case 'Technical Interview': return 'border-purple-500';
    case 'Final Interview': return 'border-pink-500';
    case 'Offer': return 'border-orange-500';
    case 'Hired': return 'border-green-500';
    case 'Rejected': return 'border-red-500';
    default: return 'border-gray-500';
  }
};

export const getScoreColor = (score: number): string => {
  if (score >= 4.5) return 'text-green-600';
  if (score >= 4.0) return 'text-yellow-600';
  return 'text-red-600';
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'Low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Scheduled': return 'bg-blue-100 text-blue-800';
    case 'Completed': return 'bg-green-100 text-green-800';
    case 'Cancelled': return 'bg-red-100 text-red-800';
    case 'In Progress': return 'bg-yellow-100 text-yellow-800';
    case 'Pending': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
