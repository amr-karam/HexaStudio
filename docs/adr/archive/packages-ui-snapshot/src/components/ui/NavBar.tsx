import * as React from 'react';
import { cn } from '../../lib/utils';

const Navbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(
        'sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/50',
        className
      )}
      {...props}
    />
  )
);
Navbar.displayName = 'Navbar';

export { Navbar };
