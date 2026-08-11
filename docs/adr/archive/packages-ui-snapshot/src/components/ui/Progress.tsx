import * as React from 'react';
import { cn } from '../../lib/utils';

function Progress({
  className,
  value = 0,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value?: number }) {
  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]', className)} {...props}>
      <div
        className="h-full w-full flex-1 bg-[var(--color-primary)] transition-all duration-300"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
}

Progress.displayName = 'Progress';

export { Progress };
