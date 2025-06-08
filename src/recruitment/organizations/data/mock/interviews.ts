import type { Interview } from './types';

export const mockInterviewsByJob: Record<string, Interview[]> = {
  'job-101': [
    {
      id: 'i1',
      candidateId: '2',
      candidateName: 'Sarah Wilson',
      candidateAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      interviewers: ['Sarah Johnson', 'Alex Chen'],
      interviewType: 'Technical',
      date: '2025-06-10T14:00:00',
      duration: 60,
      format: 'Video',
      location: 'Google Meet',
      status: 'Scheduled',
      notes: 'Focus on React and JavaScript fundamentals'
    },
    {
      id: 'i2',
      candidateId: '3',
      candidateName: 'Michael Davis',
      candidateAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      interviewers: ['Sarah Johnson', 'Tech Lead'],
      interviewType: 'Final',
      date: '2025-06-12T10:00:00',
      duration: 45,
      format: 'In-person',
      location: 'San Francisco Office',
      status: 'Scheduled',
      notes: 'Culture fit and leadership discussion'
    },
    {
      id: 'i3',
      candidateId: '1',
      candidateName: 'John Smith',
      candidateAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      interviewers: ['Sarah Johnson'],
      interviewType: 'Phone Screen',
      date: '2025-06-08T15:00:00',
      duration: 30,
      format: 'Phone',
      location: '+1 (555) 123-4567',
      status: 'Completed',
      notes: 'Strong technical background, proceed to technical interview'
    },
    {
      id: 'i4',
      candidateId: '4',
      candidateName: 'Emily Chen',
      candidateAvatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      interviewers: ['Sarah Johnson', 'Design Lead'],
      interviewType: 'Final',
      date: '2025-06-11T11:00:00',
      duration: 60,
      format: 'Video',
      location: 'Zoom',
      status: 'Scheduled',
      notes: 'Final interview for senior frontend position'
    }
  ],
  'job-201': [
    {
      id: 'i5',
      candidateId: '7',
      candidateName: 'Alex Johnson',
      candidateAvatar: 'https://randomuser.me/api/portraits/men/7.jpg',
      interviewers: ['Michael Chen'],
      interviewType: 'Product',
      date: '2025-06-11T13:00:00',
      duration: 60,
      format: 'Video',
      location: 'Zoom',
      status: 'Scheduled',
      notes: 'Product strategy and mobile experience discussion'
    },
    {
      id: 'i6',
      candidateId: '8',
      candidateName: 'Maria Garcia',
      candidateAvatar: 'https://randomuser.me/api/portraits/women/8.jpg',
      interviewers: ['Michael Chen', 'Product Team'],
      interviewType: 'Technical',
      date: '2025-06-13T09:00:00',
      duration: 90,
      format: 'In-person',
      location: 'San Francisco Office',
      status: 'Scheduled',
      notes: 'Technical product assessment and case study review'
    }
  ]
};
