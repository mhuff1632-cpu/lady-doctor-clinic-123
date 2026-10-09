import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatbotWidget } from '../ui/ChatbotWidget';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFB] text-slate-800">
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};
