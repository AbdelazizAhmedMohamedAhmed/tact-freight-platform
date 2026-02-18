import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Button } from "@/components/ui/button";
import { AlertCircle, Building2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompanySetupBanner({ user, onDismiss }) {
  const [dismissed, setDismissed] = React.useState(false);

  // Don't show if user has company_id or banner was dismissed
  if (user?.company_id || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Complete Your Company Profile</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Help us serve you better by providing your company details. This enables better tracking and management of your shipments.
                  </p>
                  <Link to={createPageUrl('Register')}>
                    <Button size="sm" className="bg-[#D50000] hover:bg-[#B00000]">
                      Complete Setup
                    </Button>
                  </Link>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}