'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  container?: Element | null;
}

export const Portal: React.FC<PortalProps> = ({ children, container }) => {
  const [mounted, setMounted] = useState(false);
  const [portalContainer, setPortalContainer] = useState<Element | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Use provided container or create/find default portal container
    if (container) {
      setPortalContainer(container);
    } else {
      let portalRoot = document.getElementById('portal-root');
      
      if (!portalRoot) {
        portalRoot = document.createElement('div');
        portalRoot.id = 'portal-root';
        portalRoot.style.position = 'absolute';
        portalRoot.style.top = '0';
        portalRoot.style.left = '0';
        portalRoot.style.width = '100%';
        portalRoot.style.height = '100%';
        portalRoot.style.pointerEvents = 'none';
        portalRoot.style.zIndex = '1000';
        document.body.appendChild(portalRoot);
      }
      
      setPortalContainer(portalRoot);
    }

    return () => {
      setMounted(false);
    };
  }, [container]);

  if (!mounted || !portalContainer) {
    return null;
  }

  return createPortal(children, portalContainer);
};