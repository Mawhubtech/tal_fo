import React, { useState, useRef } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, User, Users, AlertTriangle } from 'lucide-react';
import { useCVProcessing } from '../hooks/useCVProcessing';
import { transformCVDataToCandidate, isDataSufficient, getMissingCriticalData, removeNullValues } from '../utils/cvDataTransformer';

const SingleCVProcessing: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<any | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [overrideData, setOverrideData] = useState<any>({
    personalInfo: { fullName: '', firstName: '', middleName: '', lastName: '', email: '', phone: '', location: '' }
  });
  const [processingStep, setProcessingStep] = useState<'upload' | 'review' | 'create'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { processCV, createFromProcessed, loading, error } = useCVProcessing();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setProcessedData(null);
      setProcessingStep('upload');
    }
  };

  const handleProcessCV = async () => {
    if (!selectedFile) return;
    
    try {
      const result = await processCV(selectedFile);
      if (result) {
        setProcessedData(result);
        setProcessingStep('review');
        
        // Check if we have sufficient data for candidate creation
        const hasRequiredData = isDataSufficient(result.structuredData);
        
        // Pre-fill override data with cleaned extracted personal info if available
        if (result.structuredData?.personalInfo) {
          const cleanedPersonalInfo = removeNullValues(result.structuredData.personalInfo);
          setOverrideData({
            personalInfo: {
              fullName: cleanedPersonalInfo?.fullName || '',
              firstName: cleanedPersonalInfo?.firstName || '',
              middleName: cleanedPersonalInfo?.middleName || '',
              lastName: cleanedPersonalInfo?.lastName || '',
              email: cleanedPersonalInfo?.email || '',
              phone: cleanedPersonalInfo?.phone || '',
              location: cleanedPersonalInfo?.location || cleanedPersonalInfo?.city || ''
            }
          });
        }
        
        // Show create form automatically if missing critical data
        if (!hasRequiredData) {
          setShowCreateForm(true);
        }
      }
    } catch (err) {
      console.error('Error processing CV:', err);
    }
  };

  const handleCreateCandidate = async () => {
    if (!processedData) return;
    
    try {
      // Transform the structured data to the proper format expected by the backend
      const transformedData = transformCVDataToCandidate(
        processedData.structuredData,
        showCreateForm ? overrideData : undefined
      );
      
      console.log('Transformed data for backend:', transformedData);
      
      // Send the properly formatted data to the backend
      const result = await createFromProcessed(
        transformedData, // Use transformed data instead of raw structuredData
        undefined, // No document ID since we're processing without saving
        undefined  // Override data is already applied in transformation
      );
      
      if (result) {
        setProcessingStep('create');
      }
    } catch (err) {
      console.error('Error creating candidate:', err);
    }
  };

  const handleOverrideChange = (field: string, value: string) => {
    setOverrideData((prev: any) => {
      const updatedPersonalInfo = {
        ...prev.personalInfo,
        [field]: value
      };
      
      // Synchronize name fields with full name
      if (field === 'firstName' || field === 'middleName' || field === 'lastName') {
        const firstName = field === 'firstName' ? value : prev.personalInfo.firstName;
        const middleName = field === 'middleName' ? value : prev.personalInfo.middleName;
        const lastName = field === 'lastName' ? value : prev.personalInfo.lastName;
        
        // Construct fullName from parts, including middleName if available
        const nameParts = [firstName, middleName, lastName].filter(part => part && part.trim() !== '');
        if (nameParts.length > 0) {
          updatedPersonalInfo.fullName = nameParts.join(' ').trim();
        }
      } else if (field === 'fullName') {
        // Try to extract first, middle, and last name from full name
        const nameParts = value.trim().split(' ');
        if (nameParts.length === 1) {
          // Only first name
          updatedPersonalInfo.firstName = nameParts[0];
          updatedPersonalInfo.middleName = '';
          updatedPersonalInfo.lastName = '';
        } else if (nameParts.length === 2) {
          // First and last name
          updatedPersonalInfo.firstName = nameParts[0];
          updatedPersonalInfo.middleName = '';
          updatedPersonalInfo.lastName = nameParts[1];
        } else if (nameParts.length > 2) {
          // First, middle (could be multiple parts), and last name
          updatedPersonalInfo.firstName = nameParts[0];
          updatedPersonalInfo.middleName = nameParts.slice(1, -1).join(' ');
          updatedPersonalInfo.lastName = nameParts[nameParts.length - 1];
        }
      }
      
      return {
        ...prev,
        personalInfo: updatedPersonalInfo
      };
    });
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Single CV Processing</h2>
        <p className="text-sm text-gray-500 mt-1">Upload and process a single candidate CV</p>
      </div>
      
      <div className="p-6">
        {/* Upload Step */}
        {processingStep === 'upload' && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center">
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Upload CV</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Supports PDF, DOCX, and text files up to 10MB
                </p>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.doc,.txt"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select File
                </button>
                
                {selectedFile && (
                  <div className="w-full mt-4 p-3 bg-gray-50 rounded-md flex items-center">
                    <FileText className="w-5 h-5 text-blue-500 mr-2" />
                    <div className="flex-1 truncate text-sm text-gray-600">{selectedFile.name}</div>
                    <div className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleProcessCV}
                disabled={!selectedFile || loading}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  !selectedFile || loading
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⌛</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Process CV
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md mt-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Review Step */}
        {processingStep === 'review' && processedData && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <p className="text-sm text-green-700">CV processed successfully! Review the extracted data below.</p>
            </div>
            
            {/* Data Quality Indicator */}
            {(() => {
              const missingData = getMissingCriticalData(processedData.structuredData);
              if (missingData.length > 0) {
                return (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-700 font-medium">Missing Critical Information</p>
                      <p className="text-sm text-yellow-600 mt-1">
                        The following required fields are missing: {missingData.join(', ')}. 
                        Please edit the information below before creating the candidate.
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                <h3 className="text-sm font-medium text-gray-700">Extracted Information</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Personal Information</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-xs text-gray-500">Full Name</div>
                      <div className="text-sm text-gray-800">
                        {(() => {
                          const fullName = processedData.structuredData.personalInfo?.fullName;
                          return (fullName && fullName !== 'null') ? fullName : 'N/A';
                        })()}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-xs text-gray-500">First Name</div>
                        <div className="text-sm text-gray-800">
                          {(() => {
                            const firstName = processedData.structuredData.personalInfo?.firstName;
                            return (firstName && firstName !== 'null') ? firstName : 'N/A';
                          })()}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-xs text-gray-500">Middle Name</div>
                        <div className="text-sm text-gray-800">
                          {(() => {
                            const middleName = processedData.structuredData.personalInfo?.middleName;
                            return (middleName && middleName !== 'null') ? middleName : 'N/A';
                          })()}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-xs text-gray-500">Last Name</div>
                        <div className="text-sm text-gray-800">
                          {(() => {
                            const lastName = processedData.structuredData.personalInfo?.lastName;
                            return (lastName && lastName !== 'null') ? lastName : 'N/A';
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="text-sm text-gray-800">
                        {(() => {
                          const email = processedData.structuredData.personalInfo?.email;
                          return (email && email !== 'null') ? email : 'N/A';
                        })()}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-xs text-gray-500">Phone</div>
                      <div className="text-sm text-gray-800">
                        {(() => {
                          const phone = processedData.structuredData.personalInfo?.phone;
                          return (phone && phone !== 'null') ? phone : 'N/A';
                        })()}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-xs text-gray-500">Location</div>
                      <div className="text-sm text-gray-800">
                        {(() => {
                          const location = processedData.structuredData.personalInfo?.location || 
                                          processedData.structuredData.personalInfo?.city;
                          return (location && location !== 'null') ? location : 'N/A';
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Skills</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      {(() => {
                        const skills = processedData.structuredData?.skills;
                        const cleanedSkills = removeNullValues(skills);
                        
                        if (!cleanedSkills) {
                          return <div className="text-sm text-gray-500">No skills detected</div>;
                        }
                        
                        const hasSkills = (cleanedSkills.technical?.length > 0 || 
                                         cleanedSkills.soft?.length > 0 || 
                                         cleanedSkills.other?.length > 0 ||
                                         cleanedSkills.programming?.length > 0 ||
                                         cleanedSkills.frameworks?.length > 0 ||
                                         cleanedSkills.tools?.length > 0);
                        
                        if (!hasSkills) {
                          return <div className="text-sm text-gray-500">No skills detected</div>;
                        }
                        
                        return (
                          <div className="flex flex-wrap gap-1">
                            {cleanedSkills.technical?.map((skill: string, index: number) => (
                              <span key={`tech-${index}`} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {skill}
                              </span>
                            ))}
                            {cleanedSkills.programming?.map((skill: string, index: number) => (
                              <span key={`prog-${index}`} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                {skill}
                              </span>
                            ))}
                            {cleanedSkills.frameworks?.map((skill: string, index: number) => (
                              <span key={`framework-${index}`} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                                {skill}
                              </span>
                            ))}
                            {cleanedSkills.tools?.map((skill: string, index: number) => (
                              <span key={`tool-${index}`} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                {skill}
                              </span>
                            ))}
                            {cleanedSkills.soft?.map((skill: string, index: number) => (
                              <span key={`soft-${index}`} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                {skill}
                              </span>
                            ))}
                            {cleanedSkills.other?.map((skill: string, index: number) => (
                              <span key={`other-${index}`} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-700 mt-4">Experience</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {(() => {
                        const experience = processedData.structuredData?.workExperience;
                        const cleanedExperience = removeNullValues(experience);
                        
                        if (!cleanedExperience || cleanedExperience.length === 0) {
                          return <div className="text-sm text-gray-500">No experience details detected</div>;
                        }
                        
                        return cleanedExperience.map((exp: any, index: number) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-md">
                            <div className="font-medium text-sm">{exp.position || exp.jobTitle || 'Position'}</div>
                            <div className="text-sm">{exp.company || 'Company'}</div>
                            <div className="text-xs text-gray-500">
                              {exp.startDate || 'Start'} - {exp.endDate || 'Present'}
                            </div>
                            {exp.duration && <div className="text-xs text-gray-500">{exp.duration}</div>}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center mb-4">
                <input 
                  type="checkbox" 
                  id="override-data" 
                  checked={showCreateForm} 
                  onChange={() => setShowCreateForm(!showCreateForm)} 
                  className="mr-2"
                />
                <label htmlFor="override-data" className="text-sm text-gray-700">Edit candidate information before creating</label>
              </div>
              
              {showCreateForm && (
                <div className="border border-gray-200 rounded-md p-4 mb-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={overrideData.personalInfo.fullName} 
                      onChange={(e) => handleOverrideChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input 
                        type="text" 
                        value={overrideData.personalInfo.firstName} 
                        onChange={(e) => handleOverrideChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                      <input 
                        type="text" 
                        value={overrideData.personalInfo.middleName} 
                        onChange={(e) => handleOverrideChange('middleName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input 
                        type="text" 
                        value={overrideData.personalInfo.lastName} 
                        onChange={(e) => handleOverrideChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={overrideData.personalInfo.email} 
                      onChange={(e) => handleOverrideChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input 
                      type="text" 
                      value={overrideData.personalInfo.phone} 
                      onChange={(e) => handleOverrideChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input 
                      type="text" 
                      value={overrideData.personalInfo.location} 
                      onChange={(e) => handleOverrideChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setProcessingStep('upload')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back
                </button>
                
                <button
                  type="button"
                  onClick={handleCreateCandidate}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⌛</span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 mr-2" />
                      Create Candidate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Create Confirmation Step */}
        {processingStep === 'create' && (
          <div className="space-y-6">
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Candidate Created Successfully!</h3>
              <p className="text-sm text-gray-600 mb-6">The candidate has been created from the processed CV data.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setProcessedData(null);
                    setProcessingStep('upload');
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Process Another CV
                </button>
                
                <button
                  type="button"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                >
                  <a href="/dashboard/candidates" className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    View Candidates
                  </a>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleCVProcessing;
