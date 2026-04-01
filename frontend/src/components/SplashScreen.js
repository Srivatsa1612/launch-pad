// components/SplashScreen.js
import React from 'react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-dark-950 flex items-center justify-center z-50 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="text-center animate-fade-in relative z-10">
        <img
          src="/images/MTG-Splash.png"
          alt="M-Theory Group"
          className="w-96 h-auto mx-auto mb-8 animate-pulse-slow"
        />

        {/* Loading dots */}
        <div className="flex justify-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        <p className="text-dark-400 text-sm">Loading <span className="text-primary-400">launch<span className="font-bold">PAD</span></span>...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
