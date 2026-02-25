'use client';

import { useState, useEffect } from 'react';

interface ClientDateProps {
  format?: Intl.DateTimeFormatOptions;
  locale?: string;
  className?: string;
}

/**
 * Client-only Date Component
 *
 * Prevents hydration errors by only rendering the date on the client side.
 * Server renders a placeholder, then client hydrates with actual date.
 */
export function ClientDate({
  format = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  },
  locale = 'th-TH',
  className = '',
}: ClientDateProps) {
  const [date, setDate] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDate(new Date().toLocaleDateString(locale, format));
  }, [locale, format]);

  // Render placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return <span className={className}>&nbsp;</span>;
  }

  return <span className={className}>{date}</span>;
}
