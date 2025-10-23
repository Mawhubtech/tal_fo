import React from 'react';
import DashboardHeader from './DashboardHeader';

interface OnboardingHeaderProps {
  title?: string;
  subtitle?: string;
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  title = "Welcome to TAL",
  subtitle,
  showProgress = false,
  currentStep = 0,
  totalSteps = 6
}) => {
  return (
    <>
      <DashboardHeader 
        title={title}
        subtitle={subtitle}
        variant="onboarding"
      />
      {showProgress && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium">Progress</span>
              <span className="text-gray-500">
                Step {currentStep + 1} of {totalSteps}
              </span>
            </div>
            <div className="mt-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OnboardingHeader;
