import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import Logo from './Logo';
import { Phone, Mail, MapPin, Linkedin, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Logo white size="md" />
            <p className="mt-4 text-white/60 text-sm leading-relaxed">
              A reputation-driven logistics & freight forwarding company headquartered in Cairo, Egypt. 
              Delivering reliable global shipping solutions since inception.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D50000] transition-colors" title="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D50000] transition-colors" title="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D50000] transition-colors" title="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-5">Services</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link to={createPageUrl('Services')} className="hover:text-[#D50000] transition-colors">Sea Freight</Link></li>
              <li><Link to={createPageUrl('Services')} className="hover:text-[#D50000] transition-colors">Air Freight</Link></li>
              <li><Link to={createPageUrl('Services')} className="hover:text-[#D50000] transition-colors">Inland Transportation</Link></li>
              <li><Link to={createPageUrl('Services')} className="hover:text-[#D50000] transition-colors">Customs Clearance</Link></li>
              <li><Link to={createPageUrl('Services')} className="hover:text-[#D50000] transition-colors">Warehousing</Link></li>
              <li><Link to={createPageUrl('Services')} className="hover:text-[#D50000] transition-colors">Project Logistics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-5">Company</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link to={createPageUrl('About')} className="hover:text-[#D50000] transition-colors">About Us</Link></li>
              <li><Link to={createPageUrl('WhyChooseUs')} className="hover:text-[#D50000] transition-colors">Why Choose Us</Link></li>
              <li><Link to={createPageUrl('GlobalNetwork')} className="hover:text-[#D50000] transition-colors">Global Network</Link></li>
              <li><Link to={createPageUrl('Industries')} className="hover:text-[#D50000] transition-colors">Industries</Link></li>
              <li><Link to={createPageUrl('Contact')} className="hover:text-[#D50000] transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-5">Contact Us</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-[#D50000] flex-shrink-0" />
                29 Ahmad Kassem Gouda St., Nasr City, Cairo 11371, Egypt
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#D50000] flex-shrink-0" />
                (202) 4042643
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#D50000] flex-shrink-0" />
                operation@tactfreight.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Tact Freight. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-white/40">
            <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to={createPageUrl('TermsOfService')} className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}