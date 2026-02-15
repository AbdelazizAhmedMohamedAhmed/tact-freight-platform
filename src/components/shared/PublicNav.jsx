import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import Logo from './Logo';
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Search, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', page: 'Home' },
  { label: 'About', page: 'About' },
  { label: 'Services', page: 'Services' },
  { label: 'Industries', page: 'Industries' },
  { label: 'Why Us', page: 'WhyChooseUs' },
  { label: 'Network', page: 'GlobalNetwork' },
  { label: 'Contact', page: 'Contact' },
];

export default function PublicNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to={createPageUrl('Home')}>
              <Logo size="md" />
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  className="px-3 py-2 text-sm font-medium text-[#1A1A1A] hover:text-[#D50000] transition-colors rounded-lg hover:bg-red-50"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link to={createPageUrl('TrackShipment')}>
                <Button variant="outline" size="sm" className="border-[#D50000] text-[#D50000] hover:bg-[#D50000] hover:text-white">
                  <Search className="w-4 h-4 mr-1.5" />
                  Track
                </Button>
              </Link>
              <Link to={createPageUrl('RequestQuote')}>
                <Button size="sm" className="bg-[#D50000] hover:bg-[#B00000] text-white">
                  Request Quote
                </Button>
              </Link>
              <Link to={createPageUrl('ClientDashboard')}>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <User className="w-4 h-4 mr-1.5" />
                  Portal
                </Button>
              </Link>
            </div>

            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 bg-white pt-20 lg:hidden"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-lg font-medium text-[#1A1A1A] hover:text-[#D50000] hover:bg-red-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 space-y-3">
                <Link to={createPageUrl('TrackShipment')} onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full border-[#D50000] text-[#D50000]">
                    Track Shipment
                  </Button>
                </Link>
                <Link to={createPageUrl('RequestQuote')} onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-[#D50000] hover:bg-[#B00000] text-white">
                    Request Quote
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}