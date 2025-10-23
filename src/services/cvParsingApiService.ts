import apiClient from '../lib/api';

export interface CVParseResult {
  personalInfo: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  summary?: string;
  skills: string[];
  experiences: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationYear: string;
  }>;
}

export interface CVUploadResponse {
  success: boolean;
  message: string;
  data: CVParseResult;
  filename?: string;
  filePath?: string;
}

class CVParsingApiService {
  async uploadAndParseCV(file: File): Promise<CVUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await apiClient.post<CVUploadResponse>(
        '/api/v1/cv/parse',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error uploading and parsing CV:', error);
      throw error.response?.data || { 
        success: false, 
        message: 'Failed to upload and parse CV',
        data: {
          personalInfo: { name: '', email: '', phone: '', location: '' },
          summary: '',
          skills: [],
          experiences: [],
          education: []
        }
      };
    }
  }

  async getParseResult(jobId: string): Promise<CVParseResult> {
    try {
      const response = await apiClient.get<{ data: CVParseResult }>(
        `/api/v1/cv/parse/${jobId}`
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Error getting parse result:', error);
      throw error.response?.data || { message: 'Failed to get parse result' };
    }
  }

  // Mock implementation for development - replace with real AI service
  async mockParseCV(file: File): Promise<CVParseResult> {
    // Simulate parsing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock parsed data
    return {
      personalInfo: {
        name: `Parsed User Name`,
        email: 'parsed.user@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA'
      },
      summary: 'Experienced software developer with 5+ years of experience in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of building scalable applications and leading development teams.',
      skills: [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 
        'AWS', 'Docker', 'PostgreSQL', 'MongoDB', 'Git',
        'Agile', 'Project Management', 'Team Leadership'
      ],
      experiences: [
        {
          company: 'Tech Corp Inc.',
          position: 'Senior Software Developer',
          startDate: '2021-03',
          endDate: '2024-12',
          current: false,
          description: 'Led development of customer-facing applications using React and Node.js. Implemented microservices architecture and improved system performance by 40%.'
        },
        {
          company: 'StartupXYZ',
          position: 'Full Stack Developer',
          startDate: '2019-06',
          endDate: '2021-02',
          current: false,
          description: 'Built MVP product from scratch using modern web technologies. Collaborated with product team to define requirements and deliver features.'
        }
      ],
      education: [
        {
          institution: 'University of Technology',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          graduationYear: '2019'
        }
      ]
    };
  }
}

export const cvParsingApiService = new CVParsingApiService();
