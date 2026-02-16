// pages/CompletionPage.js
import React, { useEffect, useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { configAPI } from '../services/api';
import { CheckCircleIcon, CalendarIcon } from '@heroicons/react/24/solid';

// Confetti particle component
const ConfettiParticle = ({ delay, left, color, size }) => (
  <div
    className="fixed pointer-events-none z-50"
    style={{
      left: `${left}%`,
      top: '-10px',
      animation: `confetti-fall ${3 + Math.random() * 2}s ease-in ${delay}s forwards`,
    }}
  >
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
    />
  </div>
);

// Generate confetti particles
const generateConfetti = () => {
  const colors = ['#8B5CF6', '#A78BFA', '#C4B5FD', '#7C3AED', '#6D28D9', '#34D399', '#60A5FA', '#FBBF24', '#F472B6'];
  const particles = [];
  for (let i = 0; i < 50; i++) {
    particles.push({
      id: i,
      delay: Math.random() * 1.5,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
    });
  }
  return particles;
};

const CompletionPage = () => {
  const { companyName, completeWizard } = useWizard();
  const [concierge, setConcierge] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [confettiParticles] = useState(generateConfetti);

  useEffect(() => {
    const loadConcierge = async () => {
      try {
        const response = await configAPI.getConcierges();
        if (response.data && response.data.length > 0) {
          setConcierge(response.data[0]);
        }
      } catch (error) {
        console.error('Error loading concierge:', error);
      }
    };
    loadConcierge();
  }, []);

  useEffect(() => {
    // Mark wizard as complete
    completeWizard();
  }, []);

  // Stagger the reveal animations
  useEffect(() => {
    const contentTimer = setTimeout(() => setShowContent(true), 400);
    const stepsTimer = setTimeout(() => setShowSteps(true), 900);
    const confettiTimer = setTimeout(() => setShowConfetti(false), 5000);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(stepsTimer);
      clearTimeout(confettiTimer);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && confettiParticles.map((p) => (
        <ConfettiParticle key={p.id} {...p} />
      ))}

      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-green-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl w-full text-center space-y-8 relative z-10">
        {/* Success icon with animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-green-600/20 flex items-center justify-center animate-scale-in">
              <CheckCircleIcon className="w-18 h-18 text-green-500" style={{ width: '72px', height: '72px' }} />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full border-2 border-green-500/30 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
        </div>

        {/* Title with staggered reveal */}
        <div className={`transition-all duration-700 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h1 className="text-5xl font-bold mb-4">
            Welcome aboard, <span className="text-primary-400">{companyName}</span>!
          </h1>
          <p className="text-xl text-dark-300">
            Your flowCUSTODIAN journey is officially underway.
          </p>
        </div>

        {/* Next steps card with staggered reveal */}
        <div className={`transition-all duration-700 ease-out delay-200 ${showSteps ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="card text-left space-y-0 max-w-2xl mx-auto overflow-hidden">
            {[
              {
                num: 1,
                text: (
                  <>Your concierge <span className="text-primary-400">{concierge?.name || 'our team'}</span> will reach out within 24 hours to schedule your kickoff call.</>
                ),
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                ),
              },
              {
                num: 2,
                text: 'Employee access provisioning begins today. Expect the first batch confirmations tomorrow morning.',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                num: 3,
                text: 'Welcome gift package ordered — arriving at your primary office in 5-7 days.',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                ),
              },
            ].map((step, index) => (
              <div
                key={step.num}
                className={`flex items-start gap-4 p-5 transition-all duration-500 ${
                  index < 2 ? 'border-b border-dark-700' : ''
                } hover:bg-dark-700/30`}
                style={{
                  transitionDelay: showSteps ? `${index * 150}ms` : '0ms',
                  opacity: showSteps ? 1 : 0,
                  transform: showSteps ? 'translateX(0)' : 'translateX(-20px)',
                }}
              >
                <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  {step.icon}
                </div>
                <div className="pt-1">
                  <p className="font-medium leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className={`flex flex-col sm:flex-row justify-center gap-4 pt-4 transition-all duration-700 ${showSteps ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ transitionDelay: '600ms' }}
        >
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="btn-primary text-lg"
          >
            View Your Concierge Dashboard
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <button
            onClick={() => {
              const event = {
                title: `flowCUSTODIAN Kickoff Call with ${concierge?.name || 'Team'}`,
                description: 'Kickoff call to discuss your flowCUSTODIAN implementation',
                start: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                duration: 60
              };
              const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&description=${encodeURIComponent(event.description)}&dates=${event.start.replace(/-/g, '')}/${event.start.replace(/-/g, '')}`;
              window.open(googleCalendarUrl, '_blank');
            }}
            className="btn-secondary text-lg flex items-center justify-center gap-2"
          >
            <CalendarIcon className="w-5 h-5" />
            Add to Calendar
          </button>
        </div>

        <p className="text-sm text-dark-400 pt-8">
          Need anything at all? We're here around the clock.{' '}
          <a href="mailto:info@m-theorygrp.com" className="text-primary-400 hover:underline">
            Connect with Concierge
          </a>
        </p>

        <div className="pt-12 border-t border-dark-800">
          <p className="text-xs text-dark-500">
            &copy; 2026 M-Theory. All rights reserved. | mtheorygroup.com | info@m-theorygrp.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompletionPage;
