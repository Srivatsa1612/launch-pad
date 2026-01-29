// components/SplashScreen.js
import React from 'react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-50">
      <div className="text-center animate-fade-in">
        <img 
          src="/images/MTG-Splash.png" 
          alt="M-Theory Group" 
          className="w-96 h-auto mx-auto mb-8 animate-pulse-slow"
        />
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="text-slate-400 mt-4 text-sm">Loading flowCUSTODIAN Wizard...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
