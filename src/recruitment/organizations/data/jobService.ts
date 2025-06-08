import type { Job } from './types';

// Mock job data with realistic tech job listings
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    departmentId: '1',
    organizationId: '1',
    location: 'San Francisco, CA',
    type: 'Full-time',
    level: 'Senior',
    salary: '$120,000 - $160,000',
    description: 'We are looking for a senior frontend developer to join our engineering team. You will be responsible for building and maintaining our web applications using React, TypeScript, and modern frontend technologies.',
    requirements: [
      '5+ years of experience with React and TypeScript',
      'Experience with state management libraries (Redux, Zustand)',
      'Strong understanding of CSS and responsive design',
      'Experience with testing frameworks (Jest, React Testing Library)',
      'Familiarity with build tools (Webpack, Vite)'
    ],
    skills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'HTML'],
    status: 'open',
    postedDate: new Date('2024-01-15'),
    applicationDeadline: new Date('2024-03-15'),
    applicantCount: 24
  },
  {
    id: '2',
    title: 'Product Manager',
    department: 'Product',
    departmentId: '2',
    organizationId: '1',
    location: 'San Francisco, CA',
    type: 'Full-time',
    level: 'Mid',
    salary: '$100,000 - $140,000',
    description: 'Join our product team as a Product Manager. You will work closely with engineering, design, and business stakeholders to define and execute our product roadmap.',
    requirements: [
      '3+ years of product management experience',
      'Experience with agile development methodologies',
      'Strong analytical and problem-solving skills',
      'Excellent communication and leadership skills',
      'Experience with product analytics tools'
    ],
    skills: ['Product Strategy', 'Analytics', 'Agile', 'User Research', 'Communication'],
    status: 'open',
    postedDate: new Date('2024-01-20'),
    applicationDeadline: new Date('2024-03-20'),
    applicantCount: 18
  },
  {
    id: '3',
    title: 'UX Designer',
    department: 'Design',
    departmentId: '3',
    organizationId: '1',
    location: 'Remote',
    type: 'Full-time',
    level: 'Mid',
    salary: '$85,000 - $115,000',
    description: 'We are seeking a talented UX Designer to join our design team. You will be responsible for creating intuitive and engaging user experiences for our products.',
    requirements: [
      '3+ years of UX design experience',
      'Proficiency in design tools (Figma, Sketch, Adobe Creative Suite)',
      'Strong portfolio demonstrating user-centered design',
      'Experience with user research and usability testing',
      'Understanding of design systems and accessibility'
    ],
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility'],
    status: 'open',
    postedDate: new Date('2024-01-18'),
    applicationDeadline: new Date('2024-03-18'),
    applicantCount: 31
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    department: 'Engineering',
    departmentId: '1',
    organizationId: '1',
    location: 'Austin, TX',
    type: 'Full-time',
    level: 'Senior',
    salary: '$110,000 - $150,000',
    description: 'Join our engineering team as a DevOps Engineer. You will be responsible for maintaining our infrastructure, implementing CI/CD pipelines, and ensuring system reliability.',
    requirements: [
      '4+ years of DevOps/Infrastructure experience',
      'Experience with cloud platforms (AWS, GCP, Azure)',
      'Proficiency in containerization (Docker, Kubernetes)',
      'Experience with Infrastructure as Code (Terraform, CloudFormation)',
      'Knowledge of monitoring and logging tools'
    ],
    skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
    status: 'open',
    postedDate: new Date('2024-01-22'),
    applicationDeadline: new Date('2024-03-22'),
    applicantCount: 15
  },
  {
    id: '5',
    title: 'Data Scientist',
    department: 'Data Science',
    departmentId: '4',
    organizationId: '2',
    location: 'New York, NY',
    type: 'Full-time',
    level: 'Mid',
    salary: '$95,000 - $130,000',
    description: 'We are looking for a Data Scientist to join our data team. You will work on machine learning models, data analysis, and insights generation to drive business decisions.',
    requirements: [
      '3+ years of data science experience',
      'Proficiency in Python and SQL',
      'Experience with machine learning frameworks (scikit-learn, TensorFlow, PyTorch)',
      'Strong statistical analysis skills',
      'Experience with data visualization tools'
    ],
    skills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Data Visualization'],
    status: 'open',
    postedDate: new Date('2024-01-25'),
    applicationDeadline: new Date('2024-03-25'),
    applicantCount: 22
  },
  {
    id: '6',
    title: 'Marketing Specialist',
    department: 'Marketing',
    departmentId: '5',
    organizationId: '2',
    location: 'Chicago, IL',
    type: 'Full-time',
    level: 'Junior',
    salary: '$50,000 - $70,000',
    description: 'Join our marketing team as a Marketing Specialist. You will help develop and execute marketing campaigns, manage social media, and analyze campaign performance.',
    requirements: [
      '1-3 years of marketing experience',
      'Experience with digital marketing tools',
      'Strong written and verbal communication skills',
      'Knowledge of social media platforms',
      'Basic understanding of analytics tools'
    ],
    skills: ['Digital Marketing', 'Social Media', 'Content Creation', 'Analytics', 'Communication'],
    status: 'open',
    postedDate: new Date('2024-01-28'),
    applicationDeadline: new Date('2024-03-28'),
    applicantCount: 35
  },
  {
    id: '7',
    title: 'Backend Developer',
    department: 'Engineering',
    departmentId: '6',
    organizationId: '3',
    location: 'Remote',
    type: 'Full-time',
    level: 'Mid',
    salary: '$90,000 - $120,000',
    description: 'We are seeking a Backend Developer to join our engineering team. You will work on building scalable APIs, database design, and system architecture.',
    requirements: [
      '3+ years of backend development experience',
      'Proficiency in Node.js, Python, or Java',
      'Experience with relational and NoSQL databases',
      'Knowledge of API design and development',
      'Understanding of software architecture principles'
    ],
    skills: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'API Development'],
    status: 'open',
    postedDate: new Date('2024-01-30'),
    applicationDeadline: new Date('2024-03-30'),
    applicantCount: 19
  },
  {
    id: '8',
    title: 'Quality Assurance Engineer',
    department: 'Engineering',
    departmentId: '6',
    organizationId: '3',
    location: 'Seattle, WA',
    type: 'Full-time',
    level: 'Mid',
    salary: '$75,000 - $100,000',
    description: 'Join our QA team to ensure the quality and reliability of our software products. You will design test cases, automate testing processes, and work closely with development teams.',
    requirements: [
      '3+ years of QA/testing experience',
      'Experience with test automation frameworks',
      'Knowledge of manual and automated testing',
      'Familiarity with bug tracking tools',
      'Understanding of software development lifecycle'
    ],
    skills: ['Test Automation', 'Selenium', 'Jest', 'Manual Testing', 'Bug Tracking'],
    status: 'open',
    postedDate: new Date('2024-02-01'),
    applicationDeadline: new Date('2024-04-01'),
    applicantCount: 12
  },
  {
    id: '9',
    title: 'Project Manager',
    department: 'Operations',
    departmentId: '7',
    organizationId: '3',
    location: 'Boston, MA',
    type: 'Full-time',
    level: 'Senior',
    salary: '$85,000 - $115,000',
    description: 'We are looking for an experienced Project Manager to lead cross-functional teams and deliver projects on time and within budget.',
    requirements: [
      '5+ years of project management experience',
      'PMP certification preferred',
      'Experience with project management tools',
      'Strong leadership and communication skills',
      'Experience managing software development projects'
    ],
    skills: ['Project Management', 'Agile', 'Scrum', 'Leadership', 'Risk Management'],
    status: 'paused',
    postedDate: new Date('2024-02-03'),
    applicationDeadline: new Date('2024-04-03'),
    applicantCount: 8
  },
  {
    id: '10',
    title: 'Sales Representative',
    department: 'Sales',
    departmentId: '8',
    organizationId: '4',
    location: 'Los Angeles, CA',
    type: 'Full-time',
    level: 'Junior',
    salary: '$45,000 - $65,000 + Commission',
    description: 'Join our sales team as a Sales Representative. You will be responsible for generating leads, building relationships with prospects, and closing deals.',
    requirements: [
      '1-2 years of sales experience',
      'Strong interpersonal and communication skills',
      'Goal-oriented and self-motivated',
      'Experience with CRM systems',
      'Bachelor\'s degree preferred'
    ],
    skills: ['Sales', 'CRM', 'Lead Generation', 'Communication', 'Negotiation'],
    status: 'closed',
    postedDate: new Date('2024-01-10'),
    applicationDeadline: new Date('2024-02-10'),
    applicantCount: 42
  }
];

export class JobService {
  private jobs: Job[] = [...mockJobs];

  // Simulate API delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAllJobs(): Promise<Job[]> {
    await this.delay(500);
    return [...this.jobs];
  }

  async getJobsByOrganization(organizationId: string): Promise<Job[]> {
    await this.delay(300);
    return this.jobs.filter(job => job.organizationId === organizationId);
  }

  async getJobsByDepartment(departmentId: string): Promise<Job[]> {
    await this.delay(300);
    return this.jobs.filter(job => job.departmentId === departmentId);
  }

  async getJobById(id: string): Promise<Job | null> {
    await this.delay(200);
    return this.jobs.find(job => job.id === id) || null;
  }

  async createJob(jobData: Omit<Job, 'id' | 'postedDate' | 'applicantCount'>): Promise<Job> {
    await this.delay(800);
    const newJob: Job = {
      ...jobData,
      id: (this.jobs.length + 1).toString(),
      postedDate: new Date(),
      applicantCount: 0
    };
    this.jobs.push(newJob);
    return newJob;
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    await this.delay(600);
    const jobIndex = this.jobs.findIndex(job => job.id === id);
    if (jobIndex === -1) return null;

    this.jobs[jobIndex] = { ...this.jobs[jobIndex], ...updates };
    return this.jobs[jobIndex];
  }

  async deleteJob(id: string): Promise<boolean> {
    await this.delay(400);
    const jobIndex = this.jobs.findIndex(job => job.id === id);
    if (jobIndex === -1) return false;

    this.jobs.splice(jobIndex, 1);
    return true;
  }

  async searchJobs(query: string, filters?: {
    organizationId?: string;
    departmentId?: string;
    type?: string;
    level?: string;
    status?: string;
    location?: string;
  }): Promise<Job[]> {
    await this.delay(400);
    let filteredJobs = [...this.jobs];

    // Apply filters
    if (filters) {
      if (filters.organizationId) {
        filteredJobs = filteredJobs.filter(job => job.organizationId === filters.organizationId);
      }
      if (filters.departmentId) {
        filteredJobs = filteredJobs.filter(job => job.departmentId === filters.departmentId);
      }
      if (filters.type) {
        filteredJobs = filteredJobs.filter(job => job.type === filters.type);
      }
      if (filters.level) {
        filteredJobs = filteredJobs.filter(job => job.level === filters.level);
      }
      if (filters.status) {
        filteredJobs = filteredJobs.filter(job => job.status === filters.status);
      }
      if (filters.location) {
        filteredJobs = filteredJobs.filter(job => 
          job.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
    }

    // Apply search query
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredJobs = filteredJobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm) ||
        job.department.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm))
      );
    }

    return filteredJobs;
  }

  async getJobStats(organizationId?: string): Promise<{
    total: number;
    open: number;
    closed: number;
    paused: number;
    totalApplicants: number;
  }> {
    await this.delay(200);
    let jobs = this.jobs;
    
    if (organizationId) {
      jobs = jobs.filter(job => job.organizationId === organizationId);
    }

    return {
      total: jobs.length,
      open: jobs.filter(job => job.status === 'open').length,
      closed: jobs.filter(job => job.status === 'closed').length,
      paused: jobs.filter(job => job.status === 'paused').length,
      totalApplicants: jobs.reduce((sum, job) => sum + job.applicantCount, 0)
    };
  }
}
