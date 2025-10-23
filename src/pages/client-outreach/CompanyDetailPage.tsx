import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  MapPin,
  Users,
  Globe,
  ExternalLink,
  Linkedin,
  Calendar,
  DollarSign,
  Target,
  Code,
  Award,
  Mail,
  Phone,
  Copy,
  Download,
  Plus,
  MessageSquare,
  Facebook,
  Instagram,
  Youtube,
  Github,
  Twitter
} from 'lucide-react';
import AddToProspectsModal from '../../components/AddToProspectsModal';
import CommunicationsModal from '../../components/CommunicationsModal';

interface CompanyResult {
  id: number;
  name: string;
  domain?: string;
  industry?: string;
  sizeRange?: string;
  employeeCount?: number;
  location?: string;
  description?: string;
  specialties?: string[];
  technologies?: string[];
  founded?: string;
  linkedinUrl?: string;
  logo?: string;
  followers?: number;
  type?: string;
  score?: number;
  phoneNumbers?: string[];
  emails?: string[];
  fullAddress?: string;
  socialLinks?: {
    facebook?: string[];
    twitter?: string[];
    instagram?: string[];
    youtube?: string[];
    github?: string[];
  };
}

const CompanyDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: projectId, searchId } = useParams<{ id: string; searchId: string }>();
  const [showAddToProspectsModal, setShowAddToProspectsModal] = useState(false);
  const [showCommunicationsModal, setShowCommunicationsModal] = useState(false);
  
  // Get company data from navigation state
  const { company, searchContext } = location.state || {};
  
  // If no company data, redirect back
  if (!company) {
    const fallbackRoute = projectId && searchId
      ? `/client-outreach/projects/${projectId}/searches/${searchId}/results`
      : projectId 
      ? `/client-outreach/projects/${projectId}/search`
      : '/client-outreach';
    navigate(fallbackRoute);
    return null;
  }

  const companyData: CompanyResult = company;

  const handleBackToResults = () => {
    navigate(-1); // Go back to previous page
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleBackToResults}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Results
          </button>
          <div className="h-6 border-l border-gray-300"></div>
          <h1 className="text-2xl font-bold text-gray-900">Company Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start gap-6 mb-6">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                {companyData.logo ? (
                  <img
                    src={companyData.logo.startsWith('/9j/') || companyData.logo.startsWith('data:') ? 
                      `data:image/jpeg;base64,${companyData.logo.replace(/\r?\n/g, '')}` : 
                      companyData.logo
                    }
                    alt={`${companyData.name} logo`}
                    className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-24 h-24 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center ${companyData.logo ? 'hidden' : ''}`}>
                  <span className="text-white font-bold text-2xl">
                    {companyData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Company Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {companyData.name}
                    </h2>
                    <p className="text-lg text-purple-600 font-medium mb-3">{companyData.industry}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{companyData.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{companyData.sizeRange}</span>
                  </div>
                  {companyData.employeeCount && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{companyData.employeeCount.toLocaleString()} employees</span>
                    </div>
                  )}
                  {companyData.founded && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Founded {companyData.founded}</span>
                    </div>
                  )}
                </div>

                {/* Company Type and Followers */}
                <div className="flex items-center gap-4 mb-4">
                  {companyData.type && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                      {companyData.type}
                    </span>
                  )}
                  {companyData.followers !== undefined && (
                    <span className="text-sm text-gray-600 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {companyData.followers.toLocaleString()} LinkedIn followers
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {companyData.domain && (
                    <a
                      href={`https://${companyData.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      title="Visit Website"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                  {companyData.linkedinUrl && (
                    <a
                      href={companyData.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      title="LinkedIn Page"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  <button 
                    onClick={() => setShowAddToProspectsModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Prospects
                  </button>
                  <button 
                    onClick={() => setShowCommunicationsModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Communications
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">About</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {companyData.description}
            </p>
          </div>

          {/* Specialties */}
          {companyData.specialties && companyData.specialties.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-purple-600" />
                Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {companyData.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-purple-100 text-purple-800 text-sm rounded-lg"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Technologies */}
          {companyData.technologies && companyData.technologies.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Code className="w-5 h-5 mr-2 text-purple-600" />
                Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {companyData.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-purple-100 text-purple-800 text-sm rounded-lg"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Company ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-900">{companyData.id}</span>
                  <button
                    onClick={() => copyToClipboard(companyData.id.toString())}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {companyData.domain && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Domain</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-900">{companyData.domain}</span>
                    <button
                      onClick={() => copyToClipboard(companyData.domain!)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Industry</label>
                <p className="text-sm text-gray-900 mt-1">{companyData.industry}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Size</label>
                <p className="text-sm text-gray-900 mt-1">{companyData.sizeRange}</p>
              </div>

              {companyData.employeeCount && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Employee Count</label>
                  <p className="text-sm text-gray-900 mt-1">{companyData.employeeCount.toLocaleString()}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-sm text-gray-900 mt-1">{companyData.location}</p>
              </div>

              {companyData.founded && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Founded</label>
                  <p className="text-sm text-gray-900 mt-1">{companyData.founded}</p>
                </div>
              )}

              {companyData.type && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Company Type</label>
                  <p className="text-sm text-gray-900 mt-1">{companyData.type}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {(companyData.phoneNumbers?.length > 0 || companyData.emails?.length > 0 || companyData.fullAddress) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-purple-600" />
                Contact Information
              </h3>
              <div className="space-y-4">
                {companyData.phoneNumbers && companyData.phoneNumbers.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone Numbers</label>
                    <div className="space-y-2 mt-1">
                      {companyData.phoneNumbers.map((phone, index) => (
                        <a
                          key={index}
                          href={`tel:${phone}`}
                          className="flex items-center text-sm text-purple-600 hover:text-purple-800 hover:underline"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          {phone}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {companyData.emails && companyData.emails.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email Addresses</label>
                    <div className="space-y-2 mt-1">
                      {companyData.emails.map((email, index) => (
                        <a
                          key={index}
                          href={`mailto:${email}`}
                          className="flex items-center text-sm text-purple-600 hover:text-purple-800 hover:underline"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          {email}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {companyData.fullAddress && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Address</label>
                    <p className="text-sm text-gray-900 mt-1">{companyData.fullAddress}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Media */}
          {companyData.socialLinks && Object.values(companyData.socialLinks).some(links => links && links.length > 0) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-purple-600" />
                Social Media
              </h3>
              <div className="space-y-3">
                {companyData.socialLinks.facebook && companyData.socialLinks.facebook.length > 0 && (
                  companyData.socialLinks.facebook.map((url, index) => (
                    <a
                      key={`facebook-${index}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-purple-600 hover:text-purple-800 hover:underline"
                    >
                      <Facebook className="w-4 h-4" />
                      <span className="ml-2">Facebook</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  ))
                )}

                {companyData.socialLinks.twitter && companyData.socialLinks.twitter.length > 0 && (
                  companyData.socialLinks.twitter.map((url, index) => (
                    <a
                      key={`twitter-${index}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-purple-600 hover:text-purple-800 hover:underline"
                    >
                      <Twitter className="w-4 h-4" />
                      <span className="ml-2">Twitter</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  ))
                )}

                {companyData.socialLinks.instagram && companyData.socialLinks.instagram.length > 0 && (
                  companyData.socialLinks.instagram.map((url, index) => (
                    <a
                      key={`instagram-${index}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-purple-600 hover:text-purple-800 hover:underline"
                    >
                      <Instagram className="w-4 h-4" />
                      <span className="ml-2">Instagram</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  ))
                )}

                {companyData.socialLinks.youtube && companyData.socialLinks.youtube.length > 0 && (
                  companyData.socialLinks.youtube.map((url, index) => (
                    <a
                      key={`youtube-${index}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-purple-600 hover:text-purple-800 hover:underline"
                    >
                      <Youtube className="w-4 h-4" />
                      <span className="ml-2">YouTube</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  ))
                )}

                {companyData.socialLinks.github && companyData.socialLinks.github.length > 0 && (
                  companyData.socialLinks.github.map((url, index) => (
                    <a
                      key={`github-${index}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-purple-600 hover:text-purple-800 hover:underline"
                    >
                      <Github className="w-4 h-4" />
                      <span className="ml-2">GitHub</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Search Context */}
          {searchContext && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Context</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Original Query</label>
                  <p className="text-sm text-gray-700 mt-1 italic">"{searchContext.searchQuery}"</p>
                </div>
                
                {searchContext.extractedFilters && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Matched Filters</label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {searchContext.extractedFilters.industries?.map((industry: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                          {industry}
                        </span>
                      ))}
                      {searchContext.extractedFilters.locations?.map((location: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                          {location}
                        </span>
                      ))}
                      {searchContext.extractedFilters.technologies?.map((tech: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add to Prospects Modal */}
      <AddToProspectsModal
        isOpen={showAddToProspectsModal}
        onClose={() => setShowAddToProspectsModal(false)}
        company={companyData}
        projectId={projectId}
        searchContext={searchContext}
      />

      {/* Communications Modal */}
      <CommunicationsModal
        key={`communications-${companyData.id}-${showCommunicationsModal}`}
        isOpen={showCommunicationsModal}
        onClose={() => setShowCommunicationsModal(false)}
        company={companyData}
        projectId={projectId}
      />
    </div>
  );
};

export default CompanyDetailPage;
