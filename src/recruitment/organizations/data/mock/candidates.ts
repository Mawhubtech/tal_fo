import type { Candidate } from './types';

export const mockCandidatesByJob: Record<string, Candidate[]> = {
  'job-101': [
    {
      id: '1',
      name: 'John Smith',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      email: 'john.smith@example.com',
      phone: '(555) 123-4567',
      stage: 'Applied',
      score: 4.8,
      lastUpdated: '2025-01-30T14:30:00',
      tags: ['React', 'TypeScript', 'Senior'],
      source: 'LinkedIn',
      appliedDate: '2025-01-28'
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      email: 'sarah.wilson@example.com',
      phone: '(555) 234-5678',
      stage: 'Phone Screen',
      score: 4.6,
      lastUpdated: '2025-01-29T10:15:00',
      tags: ['JavaScript', 'Vue.js', 'Frontend'],
      source: 'Indeed',
      appliedDate: '2025-01-25'
    },
    {
      id: '3',
      name: 'Michael Davis',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      email: 'michael.davis@example.com',
      phone: '(555) 345-6789',
      stage: 'Technical Interview',
      score: 4.9,
      lastUpdated: '2025-01-28T16:45:00',
      tags: ['React', 'Node.js', 'Full Stack'],
      source: 'Referral',
      appliedDate: '2025-01-22'
    },
    {
      id: '4',
      name: 'Emily Chen',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      email: 'emily.chen@example.com',
      phone: '(555) 456-7890',
      stage: 'Final Interview',
      score: 4.7,
      lastUpdated: '2025-01-27T11:20:00',
      tags: ['Angular', 'CSS', 'UI/UX'],
      source: 'Career Page',
      appliedDate: '2025-01-20'
    },
    {
      id: '5',
      name: 'David Lee',
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
      email: 'david.lee@example.com',
      phone: '(555) 567-8901',
      stage: 'Offer',
      score: 4.8,
      lastUpdated: '2025-01-26T09:00:00',
      tags: ['React', 'TypeScript', 'Leadership'],
      source: 'AngelList',
      appliedDate: '2025-01-18'
    },
    {
      id: '6',
      name: 'Lisa Rodriguez',
      avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
      email: 'lisa.rodriguez@example.com',
      phone: '(555) 678-9012',
      stage: 'Hired',
      score: 4.9,
      lastUpdated: '2025-01-25T14:00:00',
      tags: ['React', 'TypeScript', 'Mentor'],
      source: 'LinkedIn',
      appliedDate: '2025-01-15'
    }
  ],
  'job-201': [
    {
      id: '7',
      name: 'Alex Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
      email: 'alex.johnson@example.com',
      phone: '(555) 789-0123',
      stage: 'Applied',
      score: 4.5,
      lastUpdated: '2025-01-30T09:30:00',
      tags: ['Product Strategy', 'Mobile', 'Analytics'],
      source: 'Indeed',
      appliedDate: '2025-01-29'
    },
    {
      id: '8',
      name: 'Maria Garcia',
      avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
      email: 'maria.garcia@example.com',
      phone: '(555) 890-1234',
      stage: 'Phone Screen',
      score: 4.7,
      lastUpdated: '2025-01-29T15:45:00',
      tags: ['Product Management', 'iOS', 'Android'],
      source: 'Referral',
      appliedDate: '2025-01-26'
    }
  ]
};
