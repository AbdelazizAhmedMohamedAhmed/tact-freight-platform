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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to={createPageUrl('Home')} className="flex-shrink-0">
              <Logo size="md" />
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  className="text-sm font-medium text-[#1A1A1A] hover:text-[#D50000] transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D50000] group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <Link to={createPageUrl('TrackShipment')}>
                <Button variant="outline" size="sm" className="border border-gray-300 text-[#1A1A1A] hover:bg-gray-50 font-medium">
                  <Search className="w-4 h-4 mr-2" />
                  Track
                </Button>
              </Link>
              <Link to={createPageUrl('RequestQuote')}>
                <Button size="sm" className="bg-[#D50000] hover:bg-[#B00000] text-white font-medium">
                  Request Quote
                </Button>
              </Link>
              <Link to={createPageUrl('Portal')}>
                <Button variant="ghost" size="sm" className="text-[#1A1A1A] hover:bg-gray-100 font-medium">
                  <User className="w-4 h-4 mr-2" />
                  Portal
                </Button>
              </Link>
            </div>

            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-[#1A1A1A]"
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-20 lg:hidden overflow-y-auto"
          >
            <div className="px-6 py-6 space-y-2">
              {navLinks.map(link => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-[#1A1A1A] hover:text-[#D50000] hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-6 border-t border-gray-200 space-y-3">
                <Link to={createPageUrl('TrackShipment')} onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full border border-gray-300 text-[#1A1A1A] hover:bg-gray-50 font-medium h-11">
                    <Search className="w-4 h-4 mr-2" />
                    Track Shipment
                  </Button>
                </Link>
                <Link to={createPageUrl('RequestQuote')} onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-[#D50000] hover:bg-[#B00000] text-white font-medium h-11">
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