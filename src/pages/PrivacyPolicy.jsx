import React from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 bg-[#1A1A1A]">
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <span className="text-[#D50000] text-sm font-semibold uppercase tracking-widest">Legal</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mt-4">Privacy Policy</h1>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8 text-gray-700"
          >
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                Tact Freight ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and otherwise process information about you in connection with our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">2. Information We Collect</h2>
              <p className="leading-relaxed mb-3">We collect information in the following ways:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Direct Submission:</strong> Information you provide through our contact forms, RFQ submissions, and service requests.</li>
                <li><strong>Automatic Collection:</strong> We use cookies and similar technologies to collect information about your browsing behavior and device.</li>
                <li><strong>Third-Party Sources:</strong> Information obtained from business partners and service providers.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">3. Use of Information</h2>
              <p className="leading-relaxed mb-3">We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and improve our services</li>
                <li>Process your requests and inquiries</li>
                <li>Send you notifications and updates</li>
                <li>Comply with legal obligations</li>
                <li>Conduct analytics and business operations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">4. Data Security</h2>
              <p className="leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">5. Your Rights</h2>
              <p className="leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">6. Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions about this Privacy Policy or our privacy practices, please contact us at operation@tactfreight.com or call (202) 4042643.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
              <p className="text-sm text-gray-600">
                Last updated: February 2026. We reserve the right to update this Privacy Policy at any time. Your continued use of our services following the posting of changes constitutes your acceptance of those changes.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}