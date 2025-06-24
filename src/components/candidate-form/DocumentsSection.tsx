import React, { useState, useRef } from 'react';
import { Upload, File, X, FileText, Image, Award, Briefcase, Download } from 'lucide-react';
import { CandidateFileUpload, CandidateDocument, CandidateExistingDocument, DocumentType } from '../../types/candidate.types';

interface DocumentsSectionProps {
  documents: CandidateDocument[];
  onChange: (documents: CandidateDocument[]) => void;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ documents, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const documentTypeOptions = [
    { value: DocumentType.RESUME, label: 'Resume', icon: FileText },
    { value: DocumentType.CV, label: 'CV', icon: FileText },
    { value: DocumentType.COVER_LETTER, label: 'Cover Letter', icon: FileText },
    { value: DocumentType.PORTFOLIO, label: 'Portfolio', icon: Briefcase },
    { value: DocumentType.CERTIFICATE, label: 'Certificate', icon: Award },
    { value: DocumentType.OTHER, label: 'Other', icon: File }
  ];

  const getDocumentTypeIcon = (type: DocumentType) => {
    const option = documentTypeOptions.find(opt => opt.value === type);
    return option ? option.icon : File;
  };
  const getDocumentTypeLabel = (type: DocumentType) => {
    const option = documentTypeOptions.find(opt => opt.value === type);
    return option ? option.label : 'Other';
  };

  // Helper function to check if document is a file upload
  const isFileUpload = (doc: CandidateDocument): doc is CandidateFileUpload => {
    return 'file' in doc;
  };

  // Helper function to get document name
  const getDocumentName = (doc: CandidateDocument): string => {
    if (isFileUpload(doc)) {
      return doc.file.name;
    } else {
      return doc.originalName || doc.fileName;
    }
  };

  // Helper function to get document size
  const getDocumentSize = (doc: CandidateDocument): number => {
    if (isFileUpload(doc)) {
      return doc.file.size;
    } else {
      return doc.fileSize;
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newDocuments: CandidateFileUpload[] = [];
    Array.from(files).forEach(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} has an unsupported format. Please upload PDF, Word, text, or image files.`);
        return;
      }

      // Determine document type based on file name/type
      let documentType = DocumentType.OTHER;
      const fileName = file.name.toLowerCase();
      if (fileName.includes('resume') || fileName.includes('cv')) {
        documentType = fileName.includes('cv') ? DocumentType.CV : DocumentType.RESUME;
      } else if (fileName.includes('cover') || fileName.includes('letter')) {
        documentType = DocumentType.COVER_LETTER;
      } else if (fileName.includes('portfolio')) {
        documentType = DocumentType.PORTFOLIO;
      } else if (fileName.includes('certificate') || fileName.includes('cert')) {
        documentType = DocumentType.CERTIFICATE;
      }

      newDocuments.push({
        file,
        documentType,
        isPrimary: documents.length === 0 && newDocuments.length === 0 // First document is primary by default
      });
    });

    onChange([...documents, ...newDocuments]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input value to allow uploading the same file again
    e.target.value = '';
  };

  const removeDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    // If we removed the primary document, make the first remaining document primary
    if (documents[index].isPrimary && newDocuments.length > 0) {
      newDocuments[0].isPrimary = true;
    }
    onChange(newDocuments);
  };

  const updateDocumentType = (index: number, documentType: DocumentType) => {
    const newDocuments = [...documents];
    newDocuments[index].documentType = documentType;
    onChange(newDocuments);
  };

  const togglePrimary = (index: number) => {
    const newDocuments = [...documents];
    // Remove primary from all documents
    newDocuments.forEach(doc => doc.isPrimary = false);
    // Set this document as primary
    newDocuments[index].isPrimary = true;
    onChange(newDocuments);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2 text-purple-600" />
          Documents
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload candidate documents such as resume, CV, cover letter, certificates, etc. Maximum file size: 10MB.
        </p>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-purple-600 hover:text-purple-500 cursor-pointer">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, Word, Text, or Image files up to 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Documents List */}
        {documents.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-md font-medium text-gray-900">Uploaded Documents</h4>
            {documents.map((doc, index) => {
              const IconComponent = getDocumentTypeIcon(doc.documentType);
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    doc.isPrimary ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <IconComponent className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getDocumentName(doc)}
                        {doc.isPrimary && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Primary
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(getDocumentSize(doc))} • {getDocumentTypeLabel(doc.documentType)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {/* Document Type Selector */}
                    <select
                      value={doc.documentType}
                      onChange={(e) => updateDocumentType(index, e.target.value as DocumentType)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    >
                      {documentTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {/* Primary Toggle */}
                    {!doc.isPrimary && (
                      <button
                        type="button"
                        onClick={() => togglePrimary(index)}
                        className="text-xs text-purple-600 hover:text-purple-800 px-2 py-1 border border-purple-300 rounded hover:bg-purple-50"
                      >
                        Set Primary
                      </button>
                    )}

                    {/* Download Button for existing documents */}
                    {!isFileUpload(doc) && (
                      <a
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${doc.filePath}`}
                        download={doc.originalName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-purple-600 hover:text-purple-800 transition-colors"
                        title="Download document"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove document"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Upload Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {documentTypeOptions.slice(0, 4).map(option => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <IconComponent className="w-3 h-3 mr-1" />
                Add {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DocumentsSection;
