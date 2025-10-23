import React from 'react';
import { 
  Chrome, Download, Link, Upload, CheckCircle, 
  AlertTriangle, Play, Settings, Shield, Zap
} from 'lucide-react';

export const ChromeExtensionGuide = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Chrome className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">TAL Chrome Extension Guide</h1>
            <p className="text-gray-600">Extract LinkedIn profiles and import candidates seamlessly</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Chrome className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">What You'll Learn</h3>
          </div>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Install and configure the TAL Chrome extension</li>
            <li>• Extract LinkedIn profiles with one click</li>
            <li>• Import candidates directly to your projects</li>
            <li>• Optimize data extraction settings</li>
            <li>• Troubleshoot common issues</li>
          </ul>
        </div>
      </div>

      {/* Installation */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Installation & Setup</h2>
        
        <div className="space-y-6">
          {/* Step 1: Download */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <h3 className="text-xl font-semibold text-gray-900">Download the Extension</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Get the TAL Chrome extension from the Chrome Web Store or download it directly from your TAL dashboard.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Chrome Web Store
                  </h4>
                  <p className="text-blue-800 text-sm mb-3">
                    Search for "TAL Recruitment" in the Chrome Web Store and click "Add to Chrome"
                  </p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                    Visit Chrome Store
                  </button>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    TAL Dashboard
                  </h4>
                  <p className="text-green-800 text-sm mb-3">
                    Download directly from your TAL account for the latest version with enhanced security
                  </p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors">
                    Download from TAL
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Authentication */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <h3 className="text-xl font-semibold text-gray-900">Connect to Your TAL Account</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                After installation, you'll need to authenticate the extension with your TAL account.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Authentication Steps:</h4>
                <ol className="text-gray-700 space-y-1 text-sm list-decimal list-inside">
                  <li>Click the TAL extension icon in your browser toolbar</li>
                  <li>Click "Connect to TAL Account"</li>
                  <li>Enter your TAL login credentials</li>
                  <li>Grant necessary permissions for LinkedIn access</li>
                  <li>Confirm the connection is successful</li>
                </ol>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-900">Security Note</h4>
                </div>
                <p className="text-yellow-800 text-sm">
                  The extension uses secure OAuth authentication and never stores your LinkedIn password. 
                  All data is encrypted and transmitted securely to your TAL account.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Configuration */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <h3 className="text-xl font-semibold text-gray-900">Configure Extension Settings</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Customize the extension settings to match your workflow preferences.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Data Extraction
                  </h4>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• Auto-fill candidate information</li>
                    <li>• Extract profile photos</li>
                    <li>• Include work experience details</li>
                    <li>• Parse skills and endorsements</li>
                    <li>• Extract education information</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Workflow Options
                  </h4>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Default project assignment</li>
                    <li>• Auto-tag imported candidates</li>
                    <li>• Set default pipeline stage</li>
                    <li>• Enable batch processing</li>
                    <li>• Notification preferences</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Using the Extension */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Using the Extension</h2>
        
        <div className="space-y-6">
          {/* Single Profile Extraction */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Play className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Single Profile Extraction</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Extract individual LinkedIn profiles with one click.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Step-by-Step Process:</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="font-medium text-gray-900">Navigate to LinkedIn Profile</p>
                      <p className="text-sm text-gray-600">Visit the LinkedIn profile page of the candidate you want to extract</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</div>
                    <div>
                      <p className="font-medium text-gray-900">Click TAL Extension Icon</p>
                      <p className="text-sm text-gray-600">The extension will automatically detect the profile and start extracting data</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</div>
                    <div>
                      <p className="font-medium text-gray-900">Review Extracted Data</p>
                      <p className="text-sm text-gray-600">Verify the accuracy of extracted information and make any necessary edits</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</div>
                    <div>
                      <p className="font-medium text-gray-900">Select Destination</p>
                      <p className="text-sm text-gray-600">Choose the project and pipeline stage for the new candidate</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">5</div>
                    <div>
                      <p className="font-medium text-gray-900">Import to TAL</p>
                      <p className="text-sm text-gray-600">Click "Import" to add the candidate to your TAL database</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Processing */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Upload className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Bulk Profile Processing</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Process multiple LinkedIn profiles efficiently for large-scale sourcing.
              </p>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Bulk Processing Tips:</h4>
                <ul className="text-purple-800 space-y-1 text-sm">
                  <li>• Open multiple profile tabs before starting extraction</li>
                  <li>• Use the "Queue for Processing" feature</li>
                  <li>• Set consistent project and stage defaults</li>
                  <li>• Review and deduplicate after bulk import</li>
                  <li>• Monitor rate limits to avoid LinkedIn restrictions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Fields */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Extracted Data Fields</h2>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            The TAL Chrome extension automatically extracts comprehensive profile information from LinkedIn.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Full name</li>
                <li>• Profile photo</li>
                <li>• Current location</li>
                <li>• Contact information (if available)</li>
                <li>• LinkedIn profile URL</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Professional Details</h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Current position and company</li>
                <li>• Work experience history</li>
                <li>• Job descriptions and achievements</li>
                <li>• Employment dates</li>
                <li>• Industry classification</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Skills & Education</h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Skills and endorsements</li>
                <li>• Education background</li>
                <li>• Certifications</li>
                <li>• Languages</li>
                <li>• Volunteer experience</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Troubleshooting</h2>
        
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Extension Not Working?</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• Refresh the LinkedIn page and try again</p>
              <p>• Check if you're logged into LinkedIn</p>
              <p>• Verify TAL account connection in extension settings</p>
              <p>• Clear browser cache and cookies</p>
              <p>• Update to the latest extension version</p>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Data Extraction Issues?</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• Ensure the profile is fully loaded before extraction</p>
              <p>• Check LinkedIn privacy settings that may limit data access</p>
              <p>• Verify you have a LinkedIn connection with the profile owner</p>
              <p>• Some fields may be restricted based on LinkedIn's privacy policies</p>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Rate Limiting Warnings?</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• LinkedIn has viewing limits to prevent spam</p>
              <p>• Take breaks between bulk extractions</p>
              <p>• Consider upgrading your LinkedIn account for higher limits</p>
              <p>• Spread extraction activities across multiple days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Recommended Practices
            </h3>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• Always verify extracted data before importing</li>
              <li>• Use consistent tagging for better organization</li>
              <li>• Set up default projects for common roles</li>
              <li>• Regularly update extension to latest version</li>
              <li>• Respect LinkedIn's terms of service</li>
              <li>• Add personal notes during extraction</li>
            </ul>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Avoid These Mistakes
            </h3>
            <ul className="text-red-800 space-y-1 text-sm">
              <li>• Don't extract profiles without permission</li>
              <li>• Avoid bulk processing too quickly</li>
              <li>• Don't ignore duplicate candidate warnings</li>
              <li>• Don't extract incomplete or private profiles</li>
              <li>• Avoid using the extension on unsupported pages</li>
              <li>• Don't neglect data verification</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Need help?</span>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
