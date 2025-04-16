import React, { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fade-in">
        {children}
      </div>
    </div>
    
  );
};
