import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAIStructuredQuery } from '../../../hooks/useAIStructuredQuery';
import { ContractType, ContractStatus, CreateContractDto } from '../../../types/contract.types';

interface AIContractGeneratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: AIGeneratedContractData) => void;
  currentData?: {
    clientName?: string;
    clientIndustry?: string;
    clientSize?: string;
    organizationName?: string;
  };
}

interface AIGeneratedContractData {
  title: string;
  contractType: ContractType;
  description: string;
  terms: string;
  contractValue: number;
  commissionRate: number;
  paymentTerms: {
    paymentMethod: string;
    paymentSchedule: string;
    invoicingFrequency: string;
    currency: string;
    additionalTerms: string;
  };
  deliverables: Array<{
    description: string;
    quantity: number;
    timeline: string;
    metrics: string[];
  }>;
  isAutoRenewal: boolean;
  renewalPeriodMonths: number;
}

const AIContractGeneratorDialog: React.FC<AIContractGeneratorDialogProps> = ({
  isOpen,
  onClose,
  onGenerate,
  currentData
}) => {
  const [userInput, setUserInput] = useState('');
  const [generationStep, setGenerationStep] = useState<'input' | 'generating' | 'success' | 'error'>('input');
  const { data, loading, error, structuredQuery, reset } = useAIStructuredQuery();

  // Body scroll prevention and ESC key handler
  useEffect(() => {
    if (isOpen) {
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
      
      // ESC key handler
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onClose]);

  // Overlay click handler
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setGenerationStep('input');
      reset();
    }
  }, [isOpen, reset]);

  // Handle successful AI response
  useEffect(() => {
    if (data && !loading && !error) {
      setGenerationStep('success');
      // Auto-apply the generated data after a brief success display
      setTimeout(() => {
        onGenerate(data.data as AIGeneratedContractData);
        handleClose();
      }, 1500);
    }
  }, [data, loading, error, onGenerate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setGenerationStep('error');
    }
  }, [error]);

  const handleClose = () => {
    setUserInput('');
    setGenerationStep('input');
    reset();
    onClose();
  };

  const generateContractContent = async () => {
    if (!userInput.trim()) return;

    setGenerationStep('generating');

    // Build the prompt with context
    const contextualInfo = [];
    if (currentData?.clientName) contextualInfo.push(`Client Name: ${currentData.clientName}`);
    if (currentData?.clientIndustry) contextualInfo.push(`Client Industry: ${currentData.clientIndustry}`);
    if (currentData?.clientSize) contextualInfo.push(`Client Size: ${currentData.clientSize}`);
    if (currentData?.organizationName) contextualInfo.push(`HR Organization: ${currentData.organizationName}`);

    const contextSection = contextualInfo.length > 0 
      ? `\n\nClient Context:\n${contextualInfo.join('\n')}`
      : '';

    const prompt = `Generate a comprehensive recruitment contract based on this description: "${userInput}"${contextSection}

Please create detailed, professional contract content that includes:
- A clear contract title that reflects the scope of services
- Appropriate contract type based on the requirements
- A detailed description of services to be provided
- Comprehensive terms and conditions
- Fair contract value and commission rates based on industry standards
- Clear payment terms and schedules
- Specific deliverables with measurable outcomes
- Renewal terms if applicable

Make the contract professional, legally sound, and tailored to the recruitment industry and client needs.`;

    // Define the schema for structured output
    const schema = {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'A clear, professional contract title that describes the scope of recruitment services'
        },
        contractType: {
          type: 'string',
          enum: ['recruitment_services', 'contingency', 'retained_search', 'temporary_staffing', 'permanent_placement'],
          description: 'The type of recruitment contract based on the service model'
        },
        description: {
          type: 'string',
          description: 'A comprehensive description of the recruitment services to be provided, including scope and objectives'
        },
        terms: {
          type: 'string',
          description: 'Detailed terms and conditions including service standards, responsibilities, confidentiality, and legal clauses'
        },
        contractValue: {
          type: 'number',
          description: 'Total estimated contract value in the appropriate currency based on scope and client size'
        },
        commissionRate: {
          type: 'number',
          description: 'Commission rate percentage (typically 15-25% for recruitment services)'
        },
        paymentTerms: {
          type: 'object',
          properties: {
            paymentMethod: {
              type: 'string',
              description: 'Method of payment (e.g., Wire Transfer, ACH, Check)'
            },
            paymentSchedule: {
              type: 'string',
              description: 'When payments are due (e.g., Net 30, Upon placement, Milestone-based)'
            },
            invoicingFrequency: {
              type: 'string',
              description: 'How often invoices are sent (e.g., Monthly, Per placement, Quarterly)'
            },
            currency: {
              type: 'string',
              description: 'Currency for payments (e.g., USD, EUR, SAR, AED, QAR, KWD, BHD, OMR, JOD, LBP, EGP, ILS, TRY, etc.)'
            },
            additionalTerms: {
              type: 'string',
              description: 'Additional payment terms like late fees, refund policies, etc.'
            }
          },
          required: ['paymentMethod', 'paymentSchedule', 'invoicingFrequency', 'currency']
        },
        deliverables: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
                description: 'Description of the deliverable'
              },
              quantity: {
                type: 'number',
                description: 'Number of deliverables expected'
              },
              timeline: {
                type: 'string',
                description: 'Timeline for delivery'
              },
              metrics: {
                type: 'array',
                items: { type: 'string' },
                description: 'Success metrics for this deliverable'
              }
            },
            required: ['description', 'quantity', 'timeline', 'metrics']
          },
          description: 'List of specific deliverables and their success criteria'
        },
        isAutoRenewal: {
          type: 'boolean',
          description: 'Whether the contract auto-renews'
        },
        renewalPeriodMonths: {
          type: 'number',
          description: 'Renewal period in months if auto-renewal is enabled'
        }
      },
      required: ['title', 'contractType', 'description', 'terms', 'contractValue', 'commissionRate', 'paymentTerms', 'deliverables', 'isAutoRenewal']
    };

    const systemPrompt = `You are an expert legal and recruitment professional with extensive experience in drafting recruitment contracts. Your task is to create comprehensive, legally sound contract content that protects both parties while being fair and industry-standard. Focus on creating content that is:

1. Legally compliant and professionally written
2. Fair to both the recruitment agency and client
3. Clear about expectations, deliverables, and success metrics
4. Industry-appropriate with competitive rates
5. Comprehensive in covering potential scenarios

Use standard recruitment industry practices and rates. Always respond with valid JSON that matches the provided schema exactly.`;

    try {
      await structuredQuery({
        prompt,
        schema,
        systemPrompt,
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        max_tokens: 4000,
        temperature: 0.7
      });
    } catch (err) {
      console.error('AI contract generation error:', err);
      setGenerationStep('error');
    }
  };

  const retryGeneration = () => {
    setGenerationStep('input');
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Contract Generator</h2>
              <p className="text-sm text-gray-500">Generate comprehensive recruitment contracts with AI</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {generationStep === 'input' && (
            <>
              <div className="mb-6">
                <label htmlFor="contract-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Requirements
                </label>
                <textarea
                  id="contract-description"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Describe the type of recruitment contract you need. For example:

• Full-time recruitment services for software engineering roles
• Retained search for C-level executive positions
• Temporary staffing for seasonal hiring needs
• Contingency-based recruitment for sales positions

Include any specific requirements, expectations, or special terms you need."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
              </div>

              {currentData && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Client Context:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    {currentData.clientName && <div><span className="font-medium">Client:</span> {currentData.clientName}</div>}
                    {currentData.clientIndustry && <div><span className="font-medium">Industry:</span> {currentData.clientIndustry}</div>}
                    {currentData.clientSize && <div><span className="font-medium">Size:</span> {currentData.clientSize}</div>}
                    {currentData.organizationName && <div><span className="font-medium">HR Organization:</span> {currentData.organizationName}</div>}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generateContractContent}
                  disabled={!userInput.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Contract</span>
                </button>
              </div>
            </>
          )}

          {generationStep === 'generating' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Contract</h3>
              <p className="text-gray-500">Creating comprehensive contract content with AI...</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}

          {generationStep === 'success' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Contract Generated Successfully!</h3>
              <p className="text-gray-500">Applying the generated content to your contract form...</p>
            </div>
          )}

          {generationStep === 'error' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generation Failed</h3>
              <p className="text-gray-500 mb-4">
                {error || 'Failed to generate contract content. Please try again.'}
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={retryGeneration}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIContractGeneratorDialog;
