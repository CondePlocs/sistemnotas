import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-[#333333] mb-2 transition-colors"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 
            bg-white
            border-2 border-[#E9E1C9]
            rounded-lg
            text-[#333333]
            placeholder-[#999999]
            transition-all duration-300 ease-in-out
            focus:outline-none 
            focus:border-[#8D2C1D] 
            focus:ring-2 
            focus:ring-[#8D2C1D]/20
            hover:border-[#D96924]
            disabled:bg-[#F6CBA3] 
            disabled:cursor-not-allowed
            disabled:opacity-60
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
