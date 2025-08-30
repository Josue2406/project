'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

type ProgressProps = {
  value?: number; // 0..100
  max?: number;   // por defecto 100
  className?: string;
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    // evita NaN y limita el rango
    const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
    const raw = Number.isFinite(value) ? value : 0;
    const pct = Math.min(100, Math.max(0, (raw / safeMax) * 100));

    return (
      <div
        ref={ref}
        className={cn(
          'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
        {...props}
      >
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
