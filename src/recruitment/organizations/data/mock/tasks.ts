import type { Task } from './types';

export const mockTasksByJob: Record<string, Task[]> = {
  'job-101': [
    {
      id: 't1',
      title: 'Review John Smith\'s portfolio',
      description: 'Assess technical skills and project experience',
      dueDate: '2025-06-10T10:00:00',
      priority: 'High',
      status: 'Pending',
      assignedTo: 'Sarah Johnson',
      candidateId: '1',
      candidateName: 'John Smith',
      type: 'Review'
    },
    {
      id: 't2',
      title: 'Schedule technical interview for Sarah Wilson',
      description: 'Coordinate with engineering team for technical assessment',
      dueDate: '2025-06-08T14:00:00',
      priority: 'Medium',
      status: 'In Progress',
      assignedTo: 'Alex Chen',
      candidateId: '2',
      candidateName: 'Sarah Wilson',
      type: 'Schedule'
    },
    {
      id: 't3',
      title: 'Prepare offer for David Lee',
      description: 'Draft offer letter and compensation package',
      dueDate: '2025-06-12T09:00:00',
      priority: 'High',
      status: 'Pending',
      assignedTo: 'HR Team',
      candidateId: '5',
      candidateName: 'David Lee',
      type: 'Offer'
    },
    {
      id: 't4',
      title: 'Follow up with Emily Chen',
      description: 'Check availability for final interview scheduling',
      dueDate: '2025-06-11T16:00:00',
      priority: 'Medium',
      status: 'Pending',
      assignedTo: 'Sarah Johnson',
      candidateId: '4',
      candidateName: 'Emily Chen',
      type: 'Follow-up'
    }
  ],
  'job-201': [
    {
      id: 't5',
      title: 'Review Alex Johnson\'s product portfolio',
      description: 'Evaluate product management experience and case studies',
      dueDate: '2025-06-09T11:00:00',
      priority: 'Medium',
      status: 'Pending',
      assignedTo: 'Michael Chen',
      candidateId: '7',
      candidateName: 'Alex Johnson',
      type: 'Review'
    },
    {
      id: 't6',
      title: 'Prepare product case study for Maria Garcia',
      description: 'Design assessment materials for product interview',
      dueDate: '2025-06-10T15:00:00',
      priority: 'Medium',
      status: 'In Progress',
      assignedTo: 'Product Team',
      candidateId: '8',
      candidateName: 'Maria Garcia',
      type: 'Interview'
    }
  ]
};
