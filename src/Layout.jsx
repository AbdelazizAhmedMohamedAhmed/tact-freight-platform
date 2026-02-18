import React, { useState, useEffect } from 'react';
import PublicNav from './components/shared/PublicNav';
import Footer from './components/shared/Footer';
import PortalSidebar from './components/portal/PortalSidebar';
import { RoleProvider } from './components/utils/roleContext';
import { base44 } from '@/api/base44Client';

const publicPages = [
    'Home', 'About', 'Services', 'Industries', 'WhyChooseUs', 'GlobalNetwork', 'Contact', 'Portal',
    'TrackShipment', 'RequestQuote', 'CompanyRegistration',
    'SeaFreight', 'AirFreight', 'InlandTransport', 'CustomsClearance',
    'Warehousing', 'ProjectLogistics', 'RoRoServices', 'Consultancy',
    'PrivacyPolicy', 'TermsOfService'
  ];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!publicPages.includes(currentPageName)) {
      base44.auth.me().then((userData) => {
        setUser(userData);
      }).catch(() => {});
    }
  }, [currentPageName]);

  const isPublic = publicPages.includes(currentPageName);

  if (isPublic) {
    return (
      <div className="min-h-screen bg-white">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          * { font-family: 'Inter', sans-serif; }
          :root {
            --red-primary: #D50000;
            --dark: #1A1A1A;
            --light: #F2F2F2;
          }
        `}</style>
        <PublicNav />
        <main className="pt-16 md:pt-20">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // Portal pages
  const userRole = user?.department || user?.role || 'user';
  
  return (
    <RoleProvider userRole={userRole}>
      <div className="min-h-screen bg-[#F2F2F2] flex">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          * { font-family: 'Inter', sans-serif; }
        `}</style>
        <PortalSidebar userRole={userRole} currentPage={currentPageName} userName={user?.full_name} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </RoleProvider>
  );
}