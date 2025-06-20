"use client";

import React from 'react';

interface LoadingIndicatorProps {
  isVisible: boolean;
  message: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isVisible, message }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[20000] flex items-center justify-center">
      <div className="text-center text-foreground">
        <div className="loading-spinner mx-auto mb-6"></div>
        <p className="text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
