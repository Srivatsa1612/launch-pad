// components/ProgressBar.js
import React from 'react';

const steps = [
  { num: 1, label: 'Welcome', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
    </svg>
  )},
  { num: 2, label: 'Contacts', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )},
  { num: 3, label: 'Service', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )},
  { num: 4, label: 'HR Setup', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )},
  { num: 5, label: 'Hardware', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )},
  { num: 6, label: 'Support', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )},
  { num: 7, label: 'Complete', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )},
];

const ProgressBar = ({ currentStep }) => {
  const isReview = currentStep === 8;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-dark-900/95 backdrop-blur-sm border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Top row: logo + status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-7 h-7 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
            <span className="text-lg font-bold italic">FLOWCUSTODIAN</span>
          </div>

          <div className="text-xs font-medium text-dark-400 uppercase tracking-wider">
            {isReview ? 'Review & Confirm' : `Step ${currentStep} of 7`}
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-1">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.num || isReview;
            const isCurrent = currentStep === step.num;
            const isUpcoming = currentStep < step.num && !isReview;

            return (
              <React.Fragment key={step.num}>
                {/* Step dot */}
                <div className="flex flex-col items-center" style={{ flex: '0 0 auto' }}>
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                      ${isCompleted
                        ? 'bg-primary-600 text-white'
                        : isCurrent
                          ? 'bg-primary-600 text-white ring-2 ring-primary-400 ring-offset-2 ring-offset-dark-900'
                          : 'bg-dark-800 text-dark-500 border border-dark-700'
                      }
                    `}
                  >
                    {isCompleted && !isCurrent ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.icon
                    )}
                  </div>
                  {/* Label - only show for current and completed on larger screens */}
                  <span
                    className={`
                      text-[10px] mt-1 font-medium hidden sm:block transition-colors
                      ${isCurrent ? 'text-primary-400' : isCompleted ? 'text-dark-400' : 'text-dark-600'}
                    `}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1 rounded-full transition-all duration-500" style={{ minWidth: '12px' }}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        currentStep > step.num || isReview ? 'bg-primary-600' : 'bg-dark-700'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
