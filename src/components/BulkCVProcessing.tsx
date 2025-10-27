import React, { useState, useRef } from 'react';
import { Package, Upload, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Settings, Zap, Sparkles } from 'lucide-react';
import { useCVProcessing } from '../hooks/useCVProcessing';
import { useToast } from '../contexts/ToastContext';
import ConfirmationDialog from './ConfirmationDialog';

const BulkCVProcessing: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedResults, setProcessedResults] = useState<any[] | null>(null);
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});
  const [processingStep, setProcessingStep] = useState<'upload' | 'results'>('upload');
  const [maxConcurrency, setMaxConcurrency] = useState(2);
  const [batchSize, setBatchSize] = useState(5);
  const [aiProcessingMode, setAiProcessingMode] = useState<'parallel' | 'sequential' | 'batch'>('parallel');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [processingOptions, setProcessingOptions] = useState<any>(null);
  const [showCreateAllConfirm, setShowCreateAllConfirm] = useState(false);
  const [isCreatingAll, setIsCreatingAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { processBulkCVs, createFromProcessed, loading, error } = useCVProcessing();
  const { addToast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'application/zip' || file.type === 'application/x-zip-compressed')) {
      setSelectedFile(file);
      setProcessedResults(null);
      setProcessingStep('upload');
    } else if (file) {
      addToast({
        type: 'error',
        title: 'Invalid File',
        message: 'Please select a valid ZIP file'
      });
    }
  };

  const handleProcessBulk = async () => {
    if (!selectedFile) return;
    
    try {
      const options = {
        maxConcurrency,
        batchSize,
        aiProcessingMode,
        enableProgressTracking: true
      };
      
      const result = await processBulkCVs(selectedFile, options);
      if (result && result.results) {
        setProcessedResults(result.results);
        setProcessingOptions(result.options);
        setProcessingStep('results');
        
        // Initialize expanded state for all results
        const expanded: Record<string, boolean> = {};        result.results.forEach((_, index) => {
          expanded[index.toString()] = false;
        });
        setExpandedResults(expanded);
      }
    } catch (err) {
      console.error('Error processing bulk CVs:', err);
    }
  };

  const toggleExpand = (index: string) => {
    setExpandedResults(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  const handleCreateCandidate = async (structuredData: any, index: string) => {
    if (!structuredData) return;
    
    try {
      // Format the structured data to ensure it's compatible with the backend
      console.log('Sending bulk data to backend:', { structuredData });
      
      await createFromProcessed(structuredData);
      
      // Mark this result as processed
      setExpandedResults(prev => ({
        ...prev,
        [index]: false
      }));
      
      // Update processed results to mark as created
      setProcessedResults(prev => {
        if (!prev) return prev;
        
        const updated = [...prev];
        updated[parseInt(index)] = {
          ...updated[parseInt(index)],
          candidateCreated: true
        };
        
        return updated;
      });
    } catch (err) {
      console.error('Error creating candidate:', err);
    }
  };

  const handleCreateAllCandidates = async () => {
    if (!processedResults) return;
    
    // Filter for successful results that haven't been created yet
    const eligibleResults = processedResults.filter(
      (result, index) => result.success && !result.candidateCreated && result.structuredData
    );
    
    if (eligibleResults.length === 0) {
      addToast({
        type: 'info',
        title: 'No Candidates Available',
        message: 'All successful results have already been processed.'
      });
      return;
    }
    
    // Show confirmation dialog
    setShowCreateAllConfirm(true);
  };

  const handleConfirmCreateAll = async () => {
    if (!processedResults) return;
    
    setIsCreatingAll(true);
    setShowCreateAllConfirm(false);
    
    let successCount = 0;
    let failureCount = 0;
    
    try {
      // Process each eligible result
      for (let i = 0; i < processedResults.length; i++) {
        const result = processedResults[i];
        
        if (result.success && !result.candidateCreated && result.structuredData) {
          try {
            console.log(`Creating candidate ${successCount + 1}: ${result.filename}`);
            await createFromProcessed(result.structuredData);
            
            // Mark as created
            setProcessedResults(prev => {
              if (!prev) return prev;
              const updated = [...prev];
              updated[i] = {
                ...updated[i],
                candidateCreated: true
              };
              return updated;
            });
            
            successCount++;
            
            // Small delay between creations to avoid overwhelming the backend
            if (i < processedResults.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          } catch (err) {
            console.error(`Error creating candidate for ${result.filename}:`, err);
            failureCount++;
          }
        }
      }
      
      // Show completion message
      if (successCount > 0) {
        addToast({
          type: 'success',
          title: 'Bulk Creation Complete',
          message: `Successfully created ${successCount} candidates!${failureCount > 0 ? ` ${failureCount} failed.` : ''}`
        });
      } else {
        addToast({
          type: 'error',
          title: 'Creation Failed',
          message: 'No candidates were created. Please check the console for errors.'
        });
      }
      
    } catch (err) {
      console.error('Error in bulk candidate creation:', err);
      addToast({
        type: 'error',
        title: 'Bulk Creation Error',
        message: 'An error occurred during bulk candidate creation. Please try again.'
      });
    } finally {
      setIsCreatingAll(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
      {/* Modern Header with Performance Stats */}
      <div className="px-8 py-6 bg-purple-50 border-b border-slate-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-600 rounded-xl shadow-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                Bulk CV Processing
              </h2>
              <div className="px-3 py-1 bg-purple-100 rounded-full border border-purple-200">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-700">AI-Powered</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Process multiple CVs simultaneously with intelligent batch processing and parallel AI extraction
            </p>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-slate-700">Performance Mode</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {maxConcurrency}× concurrent • {batchSize} per batch • {aiProcessingMode}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        {/* Upload Step */}
        {processingStep === 'upload' && (
          <div className="space-y-8">
            {/* Modern Upload Zone */}
            <div className="border-2 border-dashed border-slate-300 hover:border-purple-400 rounded-2xl p-12 text-center bg-white transition-all duration-200">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-purple-100 rounded-2xl mb-6">
                  <Package className="w-12 h-12 text-purple-600" />
                </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Upload ZIP Archive</h3>
                  <p className="text-sm text-slate-600 mb-6 max-w-md">
                    Upload a ZIP file containing multiple candidate CVs for batch processing.
                    <br />
                    <span className="text-xs text-slate-500">Supports PDF, DOCX, DOC, and TXT files within the ZIP</span>
                  </p>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".zip"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group/btn flex items-center gap-3 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Upload className="w-5 h-5 group-hover/btn:animate-bounce" />
                  Select ZIP File
                </button>
                
                {selectedFile && (
                  <div className="w-full max-w-md mt-8 p-5 bg-blue-50 rounded-xl border border-blue-200 shadow-sm animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 p-3 bg-white rounded-lg shadow-sm">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 truncate">{selectedFile.name}</div>
                        <div className="text-sm text-slate-600 mt-1">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for batch processing
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Advanced Performance Settings */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                <div className="flex items-center">
                  <Zap className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-700">Performance Settings</h3>
                  <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    Advanced
                  </span>
                </div>
                {showAdvancedSettings ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </div>
              
              {showAdvancedSettings && (
                <div className="p-4 space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Optimize processing speed and AI performance by adjusting these settings based on your system capabilities, file size, and AI service rate limits.
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Concurrency
                        <span className="text-xs text-gray-500 ml-1">(1-5)</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={maxConcurrency}
                        onChange={(e) => setMaxConcurrency(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Files processed simultaneously. Lower values recommended for AI processing.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Batch Size
                        <span className="text-xs text-gray-500 ml-1">(1-20)</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={batchSize}
                        onChange={(e) => setBatchSize(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Files per batch. Smaller batches reduce memory usage.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI Processing Mode
                      </label>
                      <select
                        value={aiProcessingMode}
                        onChange={(e) => setAiProcessingMode(e.target.value as 'parallel' | 'sequential' | 'batch')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="parallel">Parallel</option>
                        <option value="sequential">Sequential</option>
                        <option value="batch">Batch</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {aiProcessingMode === 'parallel' && 'Fastest but may hit rate limits'}
                        {aiProcessingMode === 'sequential' && 'Slowest but most reliable'}
                        {aiProcessingMode === 'batch' && 'Balanced speed and reliability'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setMaxConcurrency(1);
                          setBatchSize(3);
                          setAiProcessingMode('sequential');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 bg-blue-50 rounded"
                      >
                        Conservative
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMaxConcurrency(2);
                          setBatchSize(5);
                          setAiProcessingMode('batch');
                        }}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium px-2 py-1 bg-purple-50 rounded"
                      >
                        Balanced
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMaxConcurrency(3);
                          setBatchSize(8);
                          setAiProcessingMode('parallel');
                        }}
                        className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 bg-green-50 rounded"
                      >
                        Fast
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>Current: {maxConcurrency} concurrent, {batchSize} per batch, {aiProcessingMode} AI mode</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Action Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleProcessBulk}
                disabled={!selectedFile || loading}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-200 transform ${
                  !selectedFile || loading
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-xl hover:scale-105'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing with AI...</span>
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    <span>Process ZIP File</span>
                    <div className="px-3 py-1 bg-white/20 rounded-lg text-xs font-medium">
                      {maxConcurrency}×{batchSize} {aiProcessingMode}
                    </div>
                  </>
                )}
              </button>
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="p-5 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-in slide-in-from-right duration-300">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-1">Processing Error</h4>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Results Step */}
        {processingStep === 'results' && processedResults && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-sm text-green-700 font-medium">
                  Processing completed successfully!
                </p>
              </div>
              <div className="text-sm text-green-600 space-y-1">
                <div>📊 {processedResults.length} files processed total</div>
                <div>✅ {processedResults.filter(r => r.success).length} successful</div>
                <div>❌ {processedResults.filter(r => !r.success).length} failed</div>
                <div>👥 {processedResults.filter(r => r.candidateCreated).length} candidates created</div>
                {processedResults.filter(r => r.success && !r.candidateCreated).length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 mt-2">
                    <span className="text-blue-700 font-medium">
                      🚀 {processedResults.filter(r => r.success && !r.candidateCreated).length} candidates ready to create
                    </span>
                  </div>
                )}
                {processingOptions && (
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <div className="flex items-center text-xs text-green-600">
                      <Zap className="w-3 h-3 mr-1" />
                      Performance: {processingOptions.maxConcurrency} concurrent, {processingOptions.batchSize} per batch
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700">Processed CV Results</h3>
                <div className="flex items-center space-x-4">
                  {processedResults.some(result => result.success && !result.candidateCreated) && (
                    <button
                      type="button"
                      onClick={handleCreateAllCandidates}
                      disabled={loading}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        loading
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {loading ? (
                        <>
                          <span className="animate-spin mr-1">⌛</span>
                          Creating...
                        </>
                      ) : (
                        <>
                          Create All ({processedResults.filter(r => r.success && !r.candidateCreated).length})
                        </>
                      )}
                    </button>
                  )}
                  <div className="text-sm text-gray-500">Click on a result to expand details</div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {processedResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No results to display</div>
                ) : (
                  processedResults.map((result, index) => (
                    <div key={index} className="border-b border-gray-200">
                      <div 
                        className={`px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 ${
                          result.success ? '' : 'bg-red-50'
                        } ${result.candidateCreated ? 'bg-green-50' : ''}`}
                        onClick={() => toggleExpand(index.toString())}
                      >
                        <div className="flex items-center">
                          {result.success ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                          )}
                          <span className="font-medium text-gray-700">{result.filename}</span>
                          {result.candidateCreated && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                              Candidate Created
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center">
                          {result.success && !result.candidateCreated && (
                            <button
                              type="button"
                              className="mr-4 px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateCandidate(result.structuredData, index.toString());
                              }}
                            >
                              Create Candidate
                            </button>
                          )}
                          
                          {expandedResults[index.toString()] ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                      
                      {expandedResults[index.toString()] && result.success && (
                        <div className="px-4 py-3 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-700">Personal Information</h4>                              <div className="bg-white p-3 rounded-md shadow-sm">
                                <div className="text-xs text-gray-500">Full Name</div>
                                <div className="text-sm text-gray-800">{result.structuredData?.personalInfo?.fullName || 'N/A'}</div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <div className="bg-white p-3 rounded-md shadow-sm">
                                  <div className="text-xs text-gray-500">First Name</div>
                                  <div className="text-sm text-gray-800">
                                    {result.structuredData?.personalInfo?.firstName && result.structuredData?.personalInfo?.firstName !== 'null'
                                      ? result.structuredData.personalInfo.firstName 
                                      : 'N/A'}
                                  </div>
                                </div>
                                
                                <div className="bg-white p-3 rounded-md shadow-sm">
                                  <div className="text-xs text-gray-500">Last Name</div>
                                  <div className="text-sm text-gray-800">
                                    {result.structuredData?.personalInfo?.lastName && result.structuredData?.personalInfo?.lastName !== 'null' 
                                      ? result.structuredData.personalInfo.lastName 
                                      : 'N/A'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-white p-3 rounded-md shadow-sm">
                                <div className="text-xs text-gray-500">Email</div>
                                <div className="text-sm text-gray-800">
                                  {result.structuredData?.personalInfo?.email && result.structuredData?.personalInfo?.email !== 'null'
                                    ? result.structuredData.personalInfo.email 
                                    : 'N/A'}
                                </div>
                              </div>
                              
                              <div className="bg-white p-3 rounded-md shadow-sm">
                                <div className="text-xs text-gray-500">Phone</div>
                                <div className="text-sm text-gray-800">
                                  {result.structuredData?.personalInfo?.phone && result.structuredData?.personalInfo?.phone !== 'null'
                                    ? result.structuredData.personalInfo.phone 
                                    : 'N/A'}
                                </div>
                              </div>
                              
                              <div className="bg-white p-3 rounded-md shadow-sm">
                                <div className="text-xs text-gray-500">Location</div>
                                <div className="text-sm text-gray-800">{result.structuredData?.personalInfo?.location || 'N/A'}</div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-700">Skills</h4>                              <div className="bg-white p-3 rounded-md shadow-sm">
                                {result.structuredData?.skills && 
                                 (result.structuredData.skills.technical?.length > 0 || 
                                  result.structuredData.skills.soft?.length > 0 || 
                                  result.structuredData.skills.other?.length > 0) ? (
                                  <div className="flex flex-wrap gap-1">
                                    {result.structuredData.skills.technical?.map((skill: string, idx: number) => (
                                      <span key={`tech-${idx}`} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        {skill}
                                      </span>
                                    ))}
                                    {result.structuredData.skills.soft?.map((skill: string, idx: number) => (
                                      <span key={`soft-${idx}`} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                        {skill}
                                      </span>
                                    ))}
                                    {result.structuredData.skills.other?.map((skill: string, idx: number) => (
                                      <span key={`other-${idx}`} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500">No skills detected</div>
                                )}
                              </div>
                              
                              <h4 className="text-sm font-medium text-gray-700 mt-4">Experience</h4>
                              <div className="max-h-48 overflow-y-auto space-y-2">
                                {result.structuredData?.workExperience?.length > 0 ? (
                                  result.structuredData.workExperience.map((exp: any, idx: number) => (
                                    <div key={idx} className="bg-white p-3 rounded-md shadow-sm">
                                      <div className="font-medium text-sm">{exp.position || 'Position'}</div>
                                      <div className="text-sm">{exp.company || 'Company'}</div>
                                      <div className="text-xs text-gray-500">
                                        {exp.startDate || 'Start'} - {exp.endDate || 'Present'}
                                      </div>
                                      {exp.duration && <div className="text-xs text-gray-500">{exp.duration}</div>}
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-sm text-gray-500">No experience details detected</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {expandedResults[index.toString()] && !result.success && (
                        <div className="px-4 py-3 bg-red-50">
                          <div className="text-sm text-red-700">
                            Error: {result.error || 'Unknown processing error'}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="flex gap-3 justify-between">
              <button
                type="button"
                onClick={() => setProcessingStep('upload')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
              
              <div className="flex gap-3">
                {processedResults.some(result => result.success && !result.candidateCreated) && (
                  <button
                    type="button"
                    onClick={handleCreateAllCandidates}
                    disabled={isCreatingAll}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      isCreatingAll
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isCreatingAll ? (
                      <>
                        <span className="animate-spin mr-2">⌛</span>
                        Creating All...
                      </>
                    ) : (
                      <>
                        Create All Candidates ({processedResults.filter(r => r.success && !r.candidateCreated).length})
                      </>
                    )}
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => window.location.href = '/candidates'}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                >
                  View All Candidates
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Create All */}
      <ConfirmationDialog
        isOpen={showCreateAllConfirm}
        onClose={() => setShowCreateAllConfirm(false)}
        onConfirm={handleConfirmCreateAll}
        title="Create All Candidates"
        message={`This will create ${processedResults?.filter(r => r.success && !r.candidateCreated).length || 0} candidates from the processed CVs. Are you sure you want to continue?`}
        confirmText="Create All"
        cancelText="Cancel"
        loading={isCreatingAll}
        variant="info"
      />
    </div>
  );
};

export default BulkCVProcessing;
