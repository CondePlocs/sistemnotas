interface StatCardProps {
  label: string;
  value: number | string;
  color: 'primary' | 'secondary' | 'info' | 'warning' | 'gray';
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, color, icon }: StatCardProps) {
  const colorClasses = {
    primary: {
      bg: 'from-[#8D2C1D] to-[#993318]',
      text: 'text-[#8D2C1D]',
      iconBg: 'bg-[#8D2C1D]/10',
    },
    secondary: {
      bg: 'from-[#D96924] to-[#E88C31]',
      text: 'text-[#D96924]',
      iconBg: 'bg-[#D96924]/10',
    },
    info: {
      bg: 'from-[#3D73B9] to-[#89B0D9]',
      text: 'text-[#3D73B9]',
      iconBg: 'bg-[#3D73B9]/10',
    },
    warning: {
      bg: 'from-[#FDD762] to-[#FCC44F]',
      text: 'text-[#FCC44F]',
      iconBg: 'bg-[#FDD762]/10',
    },
    gray: {
      bg: 'from-[#666666] to-[#999999]',
      text: 'text-[#666666]',
      iconBg: 'bg-[#666666]/10',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className="
      bg-white 
      rounded-xl 
      shadow-md 
      hover:shadow-lg 
      p-6 
      transition-all 
      duration-300
      border-2 
      border-[#E9E1C9]
      hover:border-[#D96924]/30
      hover:-translate-y-1
      group
      animate-fade-in
    ">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className={`text-4xl font-bold ${colors.text} mb-2 group-hover:scale-110 transition-transform duration-300`}>
            {value}
          </div>
          <div className="text-sm text-[#666666] font-medium">
            {label}
          </div>
        </div>
        
        {icon && (
          <div className={`${colors.iconBg} p-3 rounded-xl`}>
            <div className={colors.text}>
              {icon}
            </div>
          </div>
        )}
      </div>

      {/* Barra decorativa */}
      <div className="mt-4 h-1 bg-gradient-to-r ${colors.bg} rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
    </div>
  );
}
