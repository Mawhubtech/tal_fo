import React, { useState, useRef } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle, FileText, Users, Loader2, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import * as ExcelJS from 'exceljs';

interface PreviewRow {
  row: number;
  data: {
    // Basic Information
    fullName: string;
    email: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    // Contact Information
    phone?: string;
    location?: string;
    linkedinurl?: string;
    githuburl?: string;
    personalwebsite?: string;
    // Professional Information
    currentPosition?: string;
    salaryExpectation?: string;
    summary?: string;
    status?: string;
    source?: string;
    rating?: number;
    notes?: string;
    // Skills and Arrays
    skills?: string[];
    languages?: string[];
    interests?: string[];
    // Experience (1 entry for preview)
    experience1Position?: string;
    experience1Company?: string;
    experience1StartDate?: string;
    experience1EndDate?: string;
    experience1Location?: string;
    experience1Description?: string;
    experience1Responsibilities?: string[];
    experience1Achievements?: string[];
    experience1Technologies?: string[];
    // Education (1 entry for preview)
    education1Degree?: string;
    education1Institution?: string;
    education1DegreeType?: string;
    education1Major?: string;
    education1Minor?: string;
    education1GraduationDate?: string;
    education1Location?: string;
    education1Gpa?: string;
    education1Description?: string;
    education1Courses?: string[];
    education1Honors?: string[];
    // Certification (1 entry for preview)
    certification1Name?: string;
    certification1Issuer?: string;
    certification1DateIssued?: string;
    certification1ExpirationDate?: string;
    certification1CredentialId?: string;
    certification1CredentialUrl?: string;
    certification1Description?: string;
    // Project (1 entry for preview)
    project1Name?: string;
    project1Description?: string;
    project1Technologies?: string[];
    project1Url?: string;
    project1RepositoryUrl?: string;
    project1StartDate?: string;
    project1EndDate?: string;
    project1Role?: string;
    // Award (1 entry for preview)
    award1Name?: string;
    award1Issuer?: string;
    award1Date?: string;
    award1Description?: string;
    award1Category?: string;
    award1RecognitionLevel?: string;
  };
  errors: string[];
  warnings: string[];
}

interface ImportResult {
  row: number;
  success: boolean;
  candidate?: any;
  error?: string;
  data?: any;
}

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (results: ImportResult[]) => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'results'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStatus = (status: string): boolean => {
    const validStatuses = ['active', 'inactive', 'hired', 'interviewing', 'rejected'];
    return validStatuses.includes(status.toLowerCase());
  };

  const validateSource = (source: string): boolean => {
    const validSources = ['linkedin', 'linkedin_chrome_extension', 'indeed', 'referral', 'direct_application', 'recruitment_agency', 'other'];
    return validSources.includes(source.toLowerCase());
  };

  const validateDegreeType = (degreeType: string): boolean => {
    const validDegreeTypes = ['high_school', 'associate', 'bachelor', 'master', 'doctorate', 'certificate', 'diploma', 'other'];
    return validDegreeTypes.includes(degreeType.toLowerCase());
  };

  const validateInterestCategory = (category: string): boolean => {
    const validCategories = ['hobby', 'sport', 'creative', 'technology', 'volunteer', 'travel', 'reading', 'music', 'gaming', 'fitness', 'cooking', 'outdoor', 'professional', 'other'];
    return validCategories.includes(category.toLowerCase());
  };

  const validateLanguageProficiency = (proficiency: string): boolean => {
    const validProficiencies = ['basic', 'conversational', 'fluent', 'native', 'professional'];
    return validProficiencies.includes(proficiency.toLowerCase());
  };

  const validateRating = (rating: string): boolean => {
    const num = parseFloat(rating);
    return !isNaN(num) && num >= 0 && num <= 5;
  };

  const validateDate = (dateStr: string): boolean => {
    if (!dateStr || dateStr.toLowerCase() === 'present') return true;
    // Accept YYYY, YYYY-MM, or YYYY-MM-DD formats
    const dateRegex = /^(\d{4}(-\d{2}(-\d{2})?)?|Present)$/i;
    return dateRegex.test(dateStr);
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const parseExcelFile = async (file: File): Promise<PreviewRow[]> => {
    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);
    
    const worksheet = workbook.getWorksheet('Candidates');
    if (!worksheet) {
      throw new Error('Candidates worksheet not found. Please use the provided template.');
    }

    const rows: PreviewRow[] = [];
    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];
    
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value?.toString().toLowerCase().replace(/[\*\s]/g, '') || '';
    });

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      if (!row.hasValues) continue;

      const rowData: any = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          rowData[header] = cell.value?.toString().trim() || '';
        }
      });

      // Skip completely empty rows
      if (Object.values(rowData).every(value => !value)) continue;

      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate required fields
      if (!rowData['fullname']) {
        errors.push('Full Name is required');
      }
      if (!rowData['email']) {
        errors.push('Email is required');
      } else if (!validateEmail(rowData['email'])) {
        errors.push('Invalid email format');
      }

      // Validate optional enum fields
      if (rowData['status'] && !validateStatus(rowData['status'])) {
        warnings.push('Invalid status - will default to "active"');
      }
      if (rowData['source'] && !validateSource(rowData['source'])) {
        warnings.push('Invalid source - will default to "other"');
      }
      if (rowData['rating00-50'] && !validateRating(rowData['rating00-50'])) {
        warnings.push('Invalid rating - must be between 0.0 and 5.0');
      }
      if (rowData['education1-degreetype'] && !validateDegreeType(rowData['education1-degreetype'])) {
        warnings.push('Invalid degree type - will default to "bachelor"');
      }

      // Validate URLs
      const urlFields = ['linkedinurl', 'githuburl', 'personalwebsite', 'certification1-credentialurl', 'project1-url', 'project1-repositoryurl'];
      urlFields.forEach(field => {
        if (rowData[field] && !validateUrl(rowData[field])) {
          warnings.push(`Invalid URL format in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        }
      });

      // Validate dates
      const dateFields = [
        'experience1-startdate', 'experience1-enddate',
        'education1-graduationdate',
        'certification1-dateissued', 'certification1-expirationdate',
        'project1-startdate', 'project1-enddate',
        'award1-date'
      ];
      dateFields.forEach(field => {
        if (rowData[field] && !validateDate(rowData[field])) {
          warnings.push(`Invalid date format in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} - use YYYY-MM-DD or "Present"`);
        }
      });

      // Parse arrays from semicolon-separated strings
      const parseArray = (str: string): string[] => {
        if (!str) return [];
        return str.split(';').map(s => s.trim()).filter(Boolean);
      };

      const previewRow: PreviewRow = {
        row: rowNumber,
        data: {
          // Basic Information
          fullName: rowData['fullname'] || '',
          email: rowData['email'] || '',
          firstName: rowData['firstname'] || '',
          lastName: rowData['lastname'] || '',
          middleName: rowData['middlename'] || '',
          // Contact Information
          phone: rowData['phone'] || '',
          location: rowData['location'] || '',
          linkedinurl: rowData['linkedinurl'] || '',
          githuburl: rowData['githuburl'] || '',
          personalwebsite: rowData['personalwebsite'] || '',
          // Professional Information
          currentPosition: rowData['currentposition'] || '',
          salaryExpectation: rowData['salaryexpectation'] || '',
          summary: rowData['summary'] || '',
          status: rowData['status'] || 'active',
          source: rowData['source'] || 'other',
          rating: parseFloat(rowData['rating00-50']) || 0,
          notes: rowData['notes'] || '',
          // Skills and Arrays
          skills: parseArray(rowData['skillsseparatedby']),
          languages: parseArray(rowData['languagessepby']),
          interests: parseArray(rowData['interestssepby']),
          // Experience (1 entry for preview)
          experience1Position: rowData['experience1-position'] || '',
          experience1Company: rowData['experience1-company'] || '',
          experience1StartDate: rowData['experience1-startdate'] || '',
          experience1EndDate: rowData['experience1-enddate'] || '',
          experience1Location: rowData['experience1-location'] || '',
          experience1Description: rowData['experience1-description'] || '',
          experience1Responsibilities: parseArray(rowData['experience1-responsibilitiessepby']),
          experience1Achievements: parseArray(rowData['experience1-achievementssepby']),
          experience1Technologies: parseArray(rowData['experience1-technologiessepby']),
          // Education (1 entry for preview)
          education1Degree: rowData['education1-degree'] || '',
          education1Institution: rowData['education1-institution'] || '',
          education1DegreeType: rowData['education1-degreetype'] || 'bachelor',
          education1Major: rowData['education1-major'] || '',
          education1Minor: rowData['education1-minor'] || '',
          education1GraduationDate: rowData['education1-graduationdate'] || '',
          education1Location: rowData['education1-location'] || '',
          education1Gpa: rowData['education1-gpa'] || '',
          education1Description: rowData['education1-description'] || '',
          education1Courses: parseArray(rowData['education1-coursessepby']),
          education1Honors: parseArray(rowData['education1-honorssepby']),
          // Certification (1 entry for preview)
          certification1Name: rowData['certification1-name'] || '',
          certification1Issuer: rowData['certification1-issuer'] || '',
          certification1DateIssued: rowData['certification1-dateissued'] || '',
          certification1ExpirationDate: rowData['certification1-expirationdate'] || '',
          certification1CredentialId: rowData['certification1-credentialid'] || '',
          certification1CredentialUrl: rowData['certification1-credentialurl'] || '',
          certification1Description: rowData['certification1-description'] || '',
          // Project (1 entry for preview)
          project1Name: rowData['project1-name'] || '',
          project1Description: rowData['project1-description'] || '',
          project1Technologies: parseArray(rowData['project1-technologiessepby']),
          project1Url: rowData['project1-url'] || '',
          project1RepositoryUrl: rowData['project1-repositoryurl'] || '',
          project1StartDate: rowData['project1-startdate'] || '',
          project1EndDate: rowData['project1-enddate'] || '',
          project1Role: rowData['project1-role'] || '',
          // Award (1 entry for preview)
          award1Name: rowData['award1-name'] || '',
          award1Issuer: rowData['award1-issuer'] || '',
          award1Date: rowData['award1-date'] || '',
          award1Description: rowData['award1-description'] || '',
          award1Category: rowData['award1-category'] || '',
          award1RecognitionLevel: rowData['award1-recognitionlevel'] || '',
        },
        errors,
        warnings
      };

      rows.push(previewRow);
    }

    return rows;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      alert('Please select an Excel file (.xlsx or .xls)');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
    setParsing(true);

    try {
      const parsed = await parseExcelFile(file);
      setPreviewData(parsed);
      setCurrentStep('preview');
    } catch (error) {
      console.error('Error parsing file:', error);
      alert(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSelectedFile(null);
    } finally {
      setParsing(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/v1/candidates/bulk-import/template', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download template');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'candidate-import-template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template. Please try again.');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setImporting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/v1/candidates/bulk-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Import failed');
      }
      
      const data = await response.json();
      setResults(data.results);
      setCurrentStep('results');
      onImportComplete(data.results);
      
    } catch (error) {
      console.error('Error importing candidates:', error);
      alert('Failed to import candidates. Please check your file and try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setResults(null);
    setCurrentStep('upload');
    onClose();
  };

  const validRows = previewData.filter(row => row.errors.length === 0);
  const errorRows = previewData.filter(row => row.errors.length > 0);
  const warningRows = previewData.filter(row => row.warnings.length > 0 && row.errors.length === 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Bulk Import Candidates</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {currentStep === 'upload' && (
            <div className="p-6">
              {/* Instructions */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">How to use bulk import:</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Download the Excel template below</li>
                  <li>2. Fill in candidate information (Full Name and Email are required)</li>
                  <li>3. Save the file and upload it here</li>
                  <li>4. Preview the data and fix any errors</li>
                  <li>5. Confirm the import</li>
                </ol>
              </div>

              {/* Download Template */}
              <div className="mb-6">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Excel Template
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  Download the template with sample data and instructions
                </p>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Upload your completed Excel file
                </h3>
                <p className="text-gray-500 mb-4">
                  Select the Excel file with candidate data to import
                </p>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".xlsx,.xls"
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={parsing}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {parsing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                      Parsing file...
                    </>
                  ) : (
                    'Select Excel File'
                  )}
                </button>
                
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: .xlsx, .xls (max 10MB)
                </p>
              </div>
            </div>
          )}

          {currentStep === 'preview' && (
            <div className="p-6">
              {/* File Info */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preview Import Data</h3>
                <div className="flex items-center p-4 bg-gray-50 rounded-lg mb-4">
                  <FileText className="w-8 h-8 text-purple-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{selectedFile?.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} MB • {previewData.length} rows found
                    </p>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{previewData.length}</p>
                    <p className="text-sm text-blue-800">Total Rows</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{validRows.length}</p>
                    <p className="text-sm text-green-800">Valid</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-yellow-600">{warningRows.length}</p>
                    <p className="text-sm text-yellow-800">Warnings</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-600">{errorRows.length}</p>
                    <p className="text-sm text-red-800">Errors</p>
                  </div>
                </div>

                {errorRows.length > 0 && (
                  <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">
                          {errorRows.length} row(s) have errors and will be skipped
                        </p>
                        <p className="text-sm text-red-700">
                          Please fix these issues in your Excel file and re-upload
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Education</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((row, index) => (
                        <tr key={index} className={`
                          ${row.errors.length > 0 ? 'bg-red-50' : 
                            row.warnings.length > 0 ? 'bg-yellow-50' : 'bg-white'}
                        `}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {row.row}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {row.data.fullName || <span className="text-red-600">Missing</span>}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {row.data.email || <span className="text-red-600">Missing</span>}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {row.data.phone || '-'}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {row.data.currentPosition || row.data.experience1Position || '-'}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {row.data.skills && row.data.skills.length > 0 
                              ? `${row.data.skills.slice(0, 2).join(', ')}${row.data.skills.length > 2 ? '...' : ''}`
                              : '-'
                            }
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {row.data.experience1Position && row.data.experience1Company
                              ? `${row.data.experience1Position} at ${row.data.experience1Company}`
                              : '-'
                            }
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {row.data.education1Degree && row.data.education1Institution
                              ? `${row.data.education1Degree} from ${row.data.education1Institution}`
                              : '-'
                            }
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              row.data.status === 'active' ? 'bg-green-100 text-green-800' :
                              row.data.status === 'interviewing' ? 'bg-yellow-100 text-yellow-800' :
                              row.data.status === 'hired' ? 'bg-blue-100 text-blue-800' :
                              row.data.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {(row.data.status || 'active').charAt(0).toUpperCase() + (row.data.status || 'active').slice(1)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {row.errors.length > 0 && (
                              <div className="text-red-600 text-xs">
                                {row.errors.slice(0, 2).join('; ')}
                                {row.errors.length > 2 && '...'}
                              </div>
                            )}
                            {row.warnings.length > 0 && row.errors.length === 0 && (
                              <div className="text-yellow-600 text-xs">
                                {row.warnings.slice(0, 2).join('; ')}
                                {row.warnings.length > 2 && '...'}
                              </div>
                            )}
                            {row.errors.length === 0 && row.warnings.length === 0 && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Choose Different File
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleImport}
                    disabled={importing || validRows.length === 0}
                    className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Import {validRows.length} Candidate{validRows.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'results' && results && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Import Results</h3>
                
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{results.length}</p>
                    <p className="text-sm text-blue-800">Total Processed</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {results.filter(r => r.success).length}
                    </p>
                    <p className="text-sm text-green-800">Successfully Imported</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {results.filter(r => !r.success).length}
                    </p>
                    <p className="text-sm text-red-800">Failed</p>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                        )}
                        <span className="font-medium">
                          Row {result.row}: {result.data?.fullname || result.data?.email || 'Unknown'}
                        </span>
                      </div>
                      <div className="text-sm">
                        {result.success ? (
                          <span className="text-green-600">Imported</span>
                        ) : (
                          <span className="text-red-600">{result.error}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center p-6 border-t bg-gray-50">
          {currentStep === 'results' ? (
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Done
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
