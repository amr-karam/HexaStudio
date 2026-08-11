import * as React from 'react';
import { cn } from '../../lib/utils';

function Spinner({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('h-4 w-4 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin', className)} {...props} />
  );
}

Spinner.displayName = 'Spinner';

export { Spinner };
