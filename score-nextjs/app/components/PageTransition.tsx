'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Cancel any in-progress animation before starting a new one
    el.getAnimations().forEach(a => a.cancel());
    el.animate(
      [
        { opacity: 0, transform: 'translateY(4px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 300, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fill: 'both' }
    );
  }, [pathname]);

  return (
    <div ref={ref} style={{ flex: 1, display: 'flex', flexDirection: 'column', opacity: 0 }}>
      {children}
    </div>
  );
}
