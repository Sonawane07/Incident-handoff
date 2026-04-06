import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
};
