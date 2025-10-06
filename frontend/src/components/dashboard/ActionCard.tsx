import Link from 'next/link';
import { ReactNode } from 'react';

interface ActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  buttonText: string;
  color: 'primary' | 'secondary' | 'info' | 'warning';
  secondaryAction?: {
    href: string;
    text: string;
  };
}

export default function ActionCard({ 
  title, 
  description, 
  icon, 
  href, 
  buttonText, 
  color,
  secondaryAction 
}: ActionCardProps) {
  
  const colorClasses = {
    primary: {
      iconBg: 'bg-[#8D2C1D]/10',
      iconText: 'text-[#8D2C1D]',
      button: 'bg-[#8D2C1D] hover:bg-[#84261A] text-white',
      secondaryButton: 'bg-[#8D2C1D]/10 hover:bg-[#8D2C1D]/20 text-[#8D2C1D] border-[#8D2C1D]/30',
    },
    secondary: {
      iconBg: 'bg-[#D96924]/10',
      iconText: 'text-[#D96924]',
      button: 'bg-[#D96924] hover:bg-[#C64925] text-white',
      secondaryButton: 'bg-[#D96924]/10 hover:bg-[#D96924]/20 text-[#D96924] border-[#D96924]/30',
    },
    info: {
      iconBg: 'bg-[#3D73B9]/10',
      iconText: 'text-[#3D73B9]',
      button: 'bg-[#3D73B9] hover:bg-[#2d5a94] text-white',
      secondaryButton: 'bg-[#3D73B9]/10 hover:bg-[#3D73B9]/20 text-[#3D73B9] border-[#3D73B9]/30',
    },
    warning: {
      iconBg: 'bg-[#FDD762]/10',
      iconText: 'text-[#FCC44F]',
      button: 'bg-[#FDD762] hover:bg-[#FCC44F] text-[#333333]',
      secondaryButton: 'bg-[#FDD762]/10 hover:bg-[#FDD762]/20 text-[#FCC44F] border-[#FCC44F]/30',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className="
      bg-white 
      rounded-2xl 
      shadow-md 
      hover:shadow-xl 
      p-6 
      transition-all 
      duration-300 
      border-2 
      border-[#E9E1C9]
      hover:border-[#D96924]/30
      hover:-translate-y-1
      group
      animate-fade-in-up
    ">
      {/* Icono y Título */}
      <div className="flex items-center mb-4">
        <div className={`${colors.iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
          <div className={colors.iconText}>
            {icon}
          </div>
        </div>
        <h3 
          className="ml-3 text-lg font-bold text-[#333333]" 
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          {title}
        </h3>
      </div>

      {/* Descripción */}
      <p className="text-[#666666] text-sm mb-6 leading-relaxed">
        {description}
      </p>

      {/* Botones */}
      <div className="space-y-2">
        <Link 
          href={href}
          className={`
            w-full 
            ${colors.button}
            font-medium 
            py-3 
            px-4 
            rounded-lg 
            transition-all 
            duration-300
            inline-block 
            text-center
            shadow-sm
            hover:shadow-md
            active:scale-95
          `}
        >
          {buttonText}
        </Link>

        {secondaryAction && (
          <Link 
            href={secondaryAction.href}
            className={`
              w-full 
              ${colors.secondaryButton}
              font-medium 
              py-3 
              px-4 
              rounded-lg 
              transition-all 
              duration-300
              inline-block 
              text-center
              border
              hover:shadow-sm
              active:scale-95
            `}
          >
            {secondaryAction.text}
          </Link>
        )}
      </div>
    </div>
  );
}
