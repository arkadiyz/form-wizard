'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
}

export const Portal: React.FC<PortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // יוצר portal container אם לא קיים
    let portalRoot = document.getElementById('portal-root');
    if (!portalRoot) {
      portalRoot = document.createElement('div');
      portalRoot.id = 'portal-root';
      portalRoot.style.position = 'relative';
      portalRoot.style.zIndex = '9999';
      document.body.appendChild(portalRoot);
    }

    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) {
    return null;
  }

  return createPortal(children, portalRoot);
};
