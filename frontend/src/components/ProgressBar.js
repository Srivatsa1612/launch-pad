// components/ProgressBar.js
import React from 'react';

const ProgressBar = ({ currentStep, totalSteps = 7 }) => {
  // For review page (step 8), show it as step 1 of review
  const displayStep = currentStep === 8 ? 1 : currentStep;
  const progress = currentStep === 8 ? 100 : (currentStep / totalSteps) * 100;
  const title = currentStep === 8 ? 'REVIEW & CONFIRM' : 'SETUP PROGRESS';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-dark-900 border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
              <span className="text-xl font-bold italic">FLOWCUSTODIAN</span>
            </div>
          </div>
          
          <div className="text-sm font-medium text-dark-400">
            {title} <span className="text-white ml-2">{displayStep}/7</span>
          </div>
        </div>
        
        <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
          <div 
            className="progress-bar h-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
