import { useEffect } from 'react';
import { createPageUrl } from '../utils';

// This page redirects to the ClientRFQs page with the "new" action flag
export default function ClientCreateRFQ() {
  useEffect(() => {
    window.location.replace(createPageUrl('ClientRFQs') + '?action=new');
  }, []);
  return null;
}