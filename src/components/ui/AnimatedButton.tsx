import { ReactNode, MouseEventHandler } from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function AnimatedButton({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
}: AnimatedButtonProps) {
  const baseStyles = 'relative overflow-hidden font-bold tracking-wide transition-all duration-300 rounded-2xl';
  const variants = {
    primary: `bg-gradient-to-r from-white/20 to-white/10 text-white
      hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-[1.02]
      active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
      border border-white/10 hover:border-white/20`,
    secondary: `glass text-white hover:bg-white/10
      hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:scale-[1.02]
      active:scale-[0.98]`,
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      type={type}
      onClick={onClick}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
    </motion.button>
  );
}
