// components/PageTransition.js
import React, { useState, useEffect } from 'react';

const PageTransition = ({ children, stepKey }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    });
    return () => cancelAnimationFrame(timer);
  }, [stepKey]);

  return (
    <div
      className={`transition-all duration-400 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDuration: '400ms' }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
