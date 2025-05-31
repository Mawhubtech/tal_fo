import { useState } from 'react';
import api from '../lib/api';

export interface DocumentProcessingOptions {
  // Basic document processing options
  enhanceText?: boolean;
  extractJobDescription?: boolean;
  cleanupText?: boolean;
  
  // Extended options for custom processing
  extractStructuredData?: boolean;
  documentType?: 'job_description' | 'resume' | 'cover_letter' | 'general' | string;
  systemPrompt?: string;
  userPrompt?: string;
  schema?: Record<string, any>;
}

export interface JobDescriptionStructure {
  jobTitle?: string;
  company?: string;
  location?: string;
  skills?: string[];
  experienceLevel?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  workType?: string;
  salaryRange?: string;
}

export interface ResumeStructure {
  name?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  education?: Array<{
    degree?: string;
    institution?: string;
    location?: string;
    graduationDate?: string;
    gpa?: string;
    honors?: string[];
  }>;
  workExperience?: Array<{
    title?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    responsibilities?: string[];
    achievements?: string[];
  }>;
  skills?: {
    technical?: string[];
    soft?: string[];
    languages?: string[];
    certifications?: string[];
  };
  projects?: Array<{
    name?: string;
    description?: string;
    technologies?: string[];
    link?: string;
  }>;
  summary?: string;
}

export interface ResumeProcessingResult {
  text: string;
  metadata: {
    filename: string;
    size: number;
    type: string;
    pages?: number;
    wordCount: number;
  };
  generatedSchema: Record<string, any>;
  structuredData: Record<string, any>;
}

export interface ProcessedDocument {
  text: string;
  metadata: {
    filename: string;
    size: number;
    type: string;
    pages?: number;
    wordCount: number;
  };
  enhancedText?: string;
  structuredData?: JobDescriptionStructure | ResumeStructure | Record<string, any>;
}

// New interface for resume processing result with dynamic schema
export interface ResumeProcessingResult {
  // Add specific fields as per the dynamic schema requirements
  [key: string]: any;
}

export const useDocumentProcessing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProcessedDocument | ResumeProcessingResult | null>(null);

  // Main document processing method
  const processDocument = async (
    file: File,
    options: DocumentProcessingOptions = {}
  ): Promise<ProcessedDocument | null> => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
        // Add basic processing options
      if (options.enhanceText !== undefined) {
        formData.append('enhanceText', options.enhanceText.toString());
      }
      if (options.extractJobDescription !== undefined) {
        formData.append('extractJobDescription', options.extractJobDescription.toString());
      }
      if (options.cleanupText !== undefined) {
        formData.append('cleanupText', options.cleanupText.toString());
      }
      
      // Add extended options
      if (options.extractStructuredData !== undefined) {
        formData.append('extractStructuredData', options.extractStructuredData.toString());
      }
      if (options.documentType) {
        formData.append('documentType', options.documentType);
      }
      if (options.systemPrompt) {
        formData.append('systemPrompt', options.systemPrompt);
      }
      if (options.userPrompt) {
        formData.append('userPrompt', options.userPrompt);
      }      // Handle schema object if provided
      if (options.schema) {
        // Ensure the schema has the proper structure
        const schemaToSend = {
          type: options.schema.type || 'object',
          properties: options.schema.properties || {},
          required: options.schema.required || []
        };
        formData.append('schema', JSON.stringify(schemaToSend));
      }
      
      const response = await api.post('/document-processing/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });      const processedDocument = response.data as ProcessedDocument;
      setData(processedDocument);
      return processedDocument;} catch (err: any) {
      // Extract the most useful error message from the response or error object
      const errorMessage = err.response?.data?.message || err.message || 'Failed to process document';
      setError(errorMessage);
      
      // Log detailed error information for debugging
      console.error('Document processing error:', {
        message: errorMessage,
        statusCode: err.response?.status,
        responseData: err.response?.data,
        originalError: err
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Process a job description document
  const processJobDescription = async (
    file: File,
    customOptions: Partial<DocumentProcessingOptions> = {}
  ): Promise<ProcessedDocument | null> => {
    const defaultOptions: DocumentProcessingOptions = {
      extractJobDescription: true,
      cleanupText: true,
      documentType: 'job_description',
      systemPrompt: 'You are a recruitment specialist. Extract structured job information from job descriptions including required skills, experience level, location, industry, and responsibilities. Respond only with valid JSON that matches the schema.',
    };
    
    return processDocument(file, { ...defaultOptions, ...customOptions });
  };
  
  // Process a resume/CV document
  const processResume = async (
    file: File,
    customOptions: Partial<DocumentProcessingOptions> = {}
  ): Promise<ProcessedDocument | null> => {    // Default schema for resume extraction
    const resumeSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full name of the candidate' },
        contactInfo: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'Email address' },
            phone: { type: 'string', description: 'Phone number' },
            location: { type: 'string', description: 'Current location/address' },
            linkedin: { type: 'string', description: 'LinkedIn profile URL' },
          }
        },
        education: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              degree: { type: 'string' },
              institution: { type: 'string' },
              graduationDate: { type: 'string' },
            }
          }
        },
        workExperience: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              company: { type: 'string' },
              startDate: { type: 'string' },
              endDate: { type: 'string' },
              responsibilities: { type: 'array', items: { type: 'string' } },
            }
          }
        },
        skills: {
          type: 'object',
          properties: {
            technical: { type: 'array', items: { type: 'string' } },
            soft: { type: 'array', items: { type: 'string' } },
          }
        },
        summary: { type: 'string', description: 'Professional summary' }
      }
    };
      // Format schema to match SchemaDto structure
    const formattedResumeSchema = {
      type: 'object',
      properties: resumeSchema.properties,
      required: ['name', 'contactInfo', 'skills'] // Add required fields
    };
    
    const defaultOptions: DocumentProcessingOptions = {
      cleanupText: true,
      extractStructuredData: true,
      documentType: 'resume',
      systemPrompt: 'You are a resume analysis specialist. Extract structured information from resumes including education, work experience, skills, and contact details. Respond only with valid JSON that matches the schema.',
      schema: formattedResumeSchema,
    };
    
    return processDocument(file, { ...defaultOptions, ...customOptions });
  };
  
  // Process a resume with dynamic schema generation
  const processResumeWithDynamicSchema = async (
    file: File
  ): Promise<ResumeProcessingResult | null> => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/document-processing/process-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data as ResumeProcessingResult;
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to process resume';
      setError(errorMessage);
      
      console.error('Resume processing error:', {
        message: errorMessage,
        statusCode: err.response?.status,
        responseData: err.response?.data,
        originalError: err
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Process a custom document with a specified schema
  const processCustomDocument = async (
    file: File,
    schema: Record<string, any>,
    documentType: string = 'general',
    customOptions: Partial<DocumentProcessingOptions> = {}
  ): Promise<ProcessedDocument | null> => {    // Format the custom schema to match SchemaDto structure
    const formattedSchema = {
      type: 'object',
      properties: schema.properties || schema,
      required: schema.required || []
    };
    
    const defaultOptions: DocumentProcessingOptions = {
      cleanupText: true,
      extractStructuredData: true,
      documentType,
      schema: formattedSchema,
    };
    
    return processDocument(file, { ...defaultOptions, ...customOptions });
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setData(null);
  };

  return {
    processDocument,
    processJobDescription,
    processResume,
    processResumeWithDynamicSchema,
    processCustomDocument,
    loading,
    error,
    data,
    reset,
  };
};
