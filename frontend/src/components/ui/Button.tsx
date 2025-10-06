import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  children: ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  loading = false, 
  children, 
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  
  const baseStyles = `
    w-full px-6 py-3 
    rounded-lg 
    font-medium 
    text-sm
    transition-all duration-300 ease-in-out
    transform
    focus:outline-none 
    focus:ring-4
    disabled:cursor-not-allowed 
    disabled:opacity-60
    active:scale-[0.98]
  `;

  const variants = {
    primary: `
      bg-[#8D2C1D] 
      text-white 
      hover:bg-[#84261A] 
      hover:shadow-lg
      hover:-translate-y-0.5
      focus:ring-[#8D2C1D]/30
      disabled:hover:bg-[#8D2C1D]
      disabled:hover:translate-y-0
    `,
    secondary: `
      bg-[#D96924] 
      text-white 
      hover:bg-[#C64925]
      hover:shadow-lg
      hover:-translate-y-0.5
      focus:ring-[#D96924]/30
      disabled:hover:bg-[#D96924]
      disabled:hover:translate-y-0
    `,
    outline: `
      bg-transparent 
      text-[#8D2C1D] 
      border-2 
      border-[#8D2C1D]
      hover:bg-[#8D2C1D] 
      hover:text-white
      hover:shadow-lg
      hover:-translate-y-0.5
      focus:ring-[#8D2C1D]/30
      disabled:hover:bg-transparent
      disabled:hover:text-[#8D2C1D]
      disabled:hover:translate-y-0
    `,
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg 
            className="animate-spin h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Cargando...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
