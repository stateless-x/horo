'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface OracleTextProps {
  text: string;
  className?: string;
  onComplete?: () => void;
  speed?: number; // milliseconds per character
}

/**
 * Oracle voice text that animates letter by letter
 * Uses Sarabun font with light weight (200) for mystical feel
 */
export function OracleText({
  text,
  className,
  onComplete,
  speed = 30,
}: OracleTextProps) {
  const [displayedText, setDisplayedText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'font-light text-ghostWhite/90 leading-relaxed',
        'font-oracle', // Sarabun weight 200
        className
      )}
    >
      {displayedText}
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-5 bg-amethyst ml-1"
        />
      )}
    </motion.p>
  );
}
