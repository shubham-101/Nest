import React from 'react';
import { cn } from '../../lib/cn';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}
export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all rounded-xl disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
    const v = {
      primary: 'bg-accent text-white hover:opacity-90 shadow-sm',
      secondary: 'bg-surface-2 text-text hover:bg-border',
      ghost: 'text-text-muted hover:text-text hover:bg-surface-2',
      danger: 'bg-danger text-white hover:opacity-90',
      outline: 'border border-border text-text hover:bg-surface-2',
    }[variant];
    const s = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base', icon: 'h-9 w-9' }[size];
    return <button ref={ref} className={cn(base, v, s, className)} {...props}>{children}</button>;
  }
);
Button.displayName = 'Button';