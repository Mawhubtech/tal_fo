import { IntakeMeetingQuestion } from '../types/intakeMeetingTemplate.types';

export const defaultIntakeMeetingQuestions: Omit<IntakeMeetingQuestion, 'id'>[] = [
  {
    question: "Why do you need to hire for this role?",
    type: "textarea",
    category: "Role Requirements",
    section: "Role Discussion",
    required: true,
    placeholder: "Describe the business need and context for this hiring decision...",
    order: 1,
    helpText: "Understanding the underlying need helps us craft better job descriptions and target the right candidates."
  },
  {
    question: "What's the structure of the current team?",
    type: "textarea",
    category: "Team Structure",
    section: "Role Discussion",
    required: true,
    placeholder: "Describe the team size, roles, and hierarchy...",
    order: 2
  },
  {
    question: "Who does this person report to? Please include the name and the role.",
    type: "text",
    category: "Reporting Structure",
    section: "Role Discussion",
    required: true,
    placeholder: "e.g., John Smith - Engineering Manager",
    order: 3
  },
  {
    question: "Can you describe the team dynamics and collaboration expectations (within the Group & with other Groups/Functions) for this role?",
    type: "textarea",
    category: "Team Dynamics",
    section: "Role Discussion",
    required: true,
    placeholder: "Describe collaboration style, communication patterns, cross-functional work...",
    order: 4
  },
  {
    question: "How does it fit into the larger company structure?",
    type: "textarea",
    category: "Company Structure",
    section: "Role Discussion",
    required: false,
    placeholder: "Explain how this role contributes to company goals and fits within the organization...",
    order: 5,
    helpText: "Alternative to the team dynamics question - use whichever is more relevant."
  },
  {
    question: "What are the main responsibilities that your new hire will have?",
    type: "textarea",
    category: "Responsibilities",
    section: "Role Responsibilities",
    required: true,
    placeholder: "List the key responsibilities and accountabilities...",
    order: 6
  },
  {
    question: "What will their Day-to-Day consist of?",
    type: "textarea",
    category: "Daily Activities",
    section: "Role Responsibilities",
    required: true,
    placeholder: "Describe a typical day or week in this role...",
    order: 7
  },
  {
    question: "What are the key measurements of success in this position? KPIs",
    type: "textarea",
    category: "Success Metrics",
    section: "Role Responsibilities",
    required: true,
    placeholder: "Define specific metrics, goals, and success indicators...",
    order: 8
  },
  {
    question: "What are the top three contributions this new hire will make to the company within their first 90 & 120 days?",
    type: "textarea",
    category: "Early Impact",
    section: "Role Responsibilities",
    required: true,
    placeholder: "90 days: ...\n120 days: ...",
    order: 9
  },
  {
    question: "What are the most significant challenges this candidate will face in this role, and how do you see them overcoming these challenges?",
    type: "textarea",
    category: "Challenges",
    section: "Role Responsibilities",
    required: true,
    placeholder: "Identify key challenges and expected solutions or approaches...",
    order: 10
  },
  {
    question: "What specific certifications/qualifications + skills/experience requirements are non-negotiable for this position?",
    type: "textarea",
    category: "Hard Requirements",
    section: "Candidate Requirements",
    required: true,
    placeholder: "List must-have qualifications, certifications, and technical skills...",
    order: 11,
    helpText: "These will be used to screen candidates at the front end of the process."
  },
  {
    question: "Are there any specific soft skills or interpersonal qualities that are especially important for this position?",
    type: "textarea",
    category: "Soft Skills",
    section: "Candidate Requirements",
    required: true,
    placeholder: "Communication style, leadership qualities, teamwork abilities...",
    order: 12
  },
  {
    question: "What does a successful candidate's background and experience look like in terms of years of experience, industries they've worked in, or projects they've completed?",
    type: "textarea",
    category: "Experience Profile",
    section: "Candidate Requirements",
    required: true,
    placeholder: "Years of experience, relevant industries, types of projects...",
    order: 13
  },
  {
    question: "Are there any specific companies you'd like to hire from, and why?",
    type: "textarea",
    category: "Target Companies",
    section: "Candidate Requirements",
    required: false,
    placeholder: "Target companies and reasoning...",
    order: 14,
    helpText: "Alternative to the experience profile question - use whichever is more relevant."
  },
  {
    question: "What are the non-negotiables for this position? The 5 things this person needs to have to be the right hire?",
    type: "textarea",
    category: "Non-negotiables",
    section: "Candidate Requirements",
    required: true,
    placeholder: "1. ...\n2. ...\n3. ...\n4. ...\n5. ...",
    order: 15
  },
  {
    question: "Is there any sensitivity or confidentiality around this hire we should be aware of?",
    type: "textarea",
    category: "Confidentiality",
    section: "Logistics",
    required: false,
    placeholder: "Any sensitive information or confidential aspects of this hiring process...",
    order: 16
  },
  {
    question: "What does the Salary & Benefits package look like?",
    type: "textarea",
    category: "Compensation",
    section: "Logistics",
    required: true,
    placeholder: "Salary range, benefits, equity, bonuses, etc...",
    order: 17
  },
  {
    question: "When do you need this candidate to start?",
    type: "date",
    category: "Timeline",
    section: "Logistics",
    required: true,
    placeholder: "Target start date",
    order: 18
  },
  {
    question: "What is the interview process & who will be participating?",
    type: "textarea",
    category: "Interview Process",
    section: "Logistics",
    required: true,
    placeholder: "Describe the interview stages and participants...",
    order: 19
  },
  {
    question: "What are the questions you'd like to ask this person before meeting them?",
    type: "textarea",
    category: "Screening Questions",
    section: "Logistics",
    required: false,
    placeholder: "Initial screening questions or phone screen topics...",
    order: 20
  }
];

export const createDefaultIntakeMeetingTemplate = () => ({
  name: "Role Discussion | Intake Meeting",
  description: "Comprehensive intake meeting template for recruiters to understand client requirements and formulate job descriptions and interview templates.",
  questions: defaultIntakeMeetingQuestions,
  isDefault: true
});
