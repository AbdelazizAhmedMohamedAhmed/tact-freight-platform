import { useEffect } from 'react';
import { createPageUrl } from '../utils';

export default function SalesRFQs() {
  useEffect(() => {
    window.location.replace(createPageUrl('SalesRFQQueue'));
  }, []);
  return null;
}