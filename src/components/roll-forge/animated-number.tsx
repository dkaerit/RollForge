'use client';

import { useEffect, useState } from 'react';

export function AnimatedNumber({ value }: { value: number | null }) {
  const [displayValue, setDisplayValue] = useState<number | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (value === null) {
      setDisplayValue(null);
      return;
    }
    // Change key to re-trigger animation
    setKey((prev) => prev + 1);
    setDisplayValue(value);
  }, [value]);

  if (displayValue === null) {
    return (
      <span className="text-5xl font-bold w-16 h-16 flex items-center justify-center font-mono text-muted-foreground">
        ?
      </span>
    );
  }

  return (
    <span
      key={key}
      className="text-5xl font-bold font-mono animate-in fade-in-0 zoom-in-50 duration-300"
    >
      {displayValue}
    </span>
  );
}
