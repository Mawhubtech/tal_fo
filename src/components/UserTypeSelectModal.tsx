import React from 'react';
import { X, Briefcase, User, Building } from 'lucide-react';

interface UserTypeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecruiter: () => void;
  onSelectJobSeeker: () => void;
  onSelectOrganization: () => void;
}

const UserTypeSelectModal: React.FC<UserTypeSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectRecruiter,
  onSelectJobSeeker,
  onSelectOrganization
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal content */}
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-center mb-6">Choose an account type</h2>
            <div className="space-y-4">
              <button
                onClick={onSelectRecruiter}
                className="w-full flex items-center justify-between p-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="bg-primary-100 p-3 rounded-lg mr-4">
                    <Briefcase className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Recruiter</h3>
                    <p className="text-sm text-gray-500">I want to source and hire talent</p>
                  </div>
                </div>
                <div className="w-6 h-6 border border-gray-300 rounded-full"></div>
              </button>
              
              <button
                onClick={onSelectJobSeeker}
                className="w-full flex items-center justify-between p-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Job Seeker</h3>
                    <p className="text-sm text-gray-500">I want to find job opportunities</p>
                  </div>
                </div>
                <div className="w-6 h-6 border border-gray-300 rounded-full"></div>
              </button>

              <button
                onClick={onSelectOrganization}
                className="w-full flex items-center justify-between p-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <Building className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Organization / Internal HR</h3>
                    <p className="text-sm text-gray-500">I represent a company or internal HR team</p>
                  </div>
                </div>
                <div className="w-6 h-6 border border-gray-300 rounded-full"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelectModal;
