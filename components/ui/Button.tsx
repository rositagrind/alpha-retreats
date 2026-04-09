import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  variant = 'primary',
  loading = false,
  size = 'md',
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-body font-semibold uppercase tracking-widest rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'px-5 py-2 text-xs',
    md: 'px-8 py-3 text-sm',
    lg: 'px-10 py-4 text-base',
  };
  const variants = {
    primary: 'bg-burnt-orange text-white hover:bg-orange-700',
    secondary: 'border border-off-white text-off-white hover:bg-off-white hover:text-dark-bg',
    ghost: 'text-off-white hover:text-burnt-orange underline underline-offset-4',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}
