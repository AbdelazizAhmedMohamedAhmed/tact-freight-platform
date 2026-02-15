import React, { useState, useEffect } from 'react';
import PublicNav from './components/shared/PublicNav';
import Footer from './components/shared/Footer';
import PortalSidebar from './components/shared/PortalSidebar';
import { base44 } from '@/api/base44Client';

const publicPages = ['Home', 'About', 'Services', 'Industries', 'WhyChooseUs', 'GlobalNetwork', 'Clients', 'Contact', 'RequestQuote', 'TrackShipment', 'Portal'];
const clientPages = ['ClientDashboard', 'ClientRFQs', 'ClientShipments'];
const salesPages = ['SalesDashboard', 'SalesRFQQueue'];
const pricingPages = ['PricingDashboard', 'PricingQueue'];
const operationsPages = ['OperationsDashboard', 'OperationsShipments', 'CreateShipment'];
const adminPages = ['AdminDashboard', 'AdminUsers', 'AdminRFQs', 'AdminShipments', 'AdminActivity', 'AdminAnalytics'];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!publicPages.includes(currentPageName)) {
      base44.auth.me().then(setUser).catch(() => {});
    }
  }, [currentPageName]);

  const isPublic = publicPages.includes(currentPageName);
  
  const getDepartment = () => {
    if (adminPages.includes(currentPageName)) return 'admin';
    if (salesPages.includes(currentPageName)) return 'sales';
    if (pricingPages.includes(currentPageName)) return 'pricing';
    if (operationsPages.includes(currentPageName)) return 'operations';
    if (clientPages.includes(currentPageName)) return 'client';
    return user?.department || 'client';
  };

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
  const department = getDepartment();

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
      `}</style>
      <PortalSidebar department={department} currentPage={currentPageName} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}