import React from 'react';

export default function GlassIcon({
  icon: Icon,
  variant = 'cyan',
  size = 'md',
  className = '',
  iconClassName = '',
}) {
  const variantStyles = {
    cyan: 'glass-icon-cyan text-sky-400',
    purple: 'glass-icon-purple text-purple-400',
    emerald: 'glass-icon-emerald text-emerald-400',
    amber: 'glass-icon-amber text-amber-400',
    rose: 'glass-icon-rose text-rose-400',
    neutral: 'glass-icon-box text-slate-300',
  };

  const sizeStyles = {
    xs: { box: 'w-7 h-7 rounded-lg', icon: 'w-3.5 h-3.5' },
    sm: { box: 'w-9 h-9 rounded-xl', icon: 'w-4 h-4' },
    md: { box: 'w-11 h-11 rounded-2xl', icon: 'w-5 h-5' },
    lg: { box: 'w-14 h-14 rounded-2xl sm:rounded-3xl', icon: 'w-7 h-7' },
    xl: { box: 'w-18 h-18 rounded-3xl', icon: 'w-9 h-9' },
  };

  const selectedVariant = variantStyles[variant] || variantStyles.cyan;
  const selectedSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      className={`${selectedSize.box} ${selectedVariant} flex items-center justify-center shrink-0 shadow-glass-sm transition-transform duration-300 group-hover:scale-105 ${className}`}
    >
      {Icon && <Icon className={`${selectedSize.icon} ${iconClassName}`} />}
    </div>
  );
}
