import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface RentalLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export default function RentalLayout({ children, hideFooter = false }: RentalLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
