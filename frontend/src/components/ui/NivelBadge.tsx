import { getNivelLabel } from '@/types/nivel';

interface NivelBadgeProps {
  nivel: string;
  className?: string;
}

export default function NivelBadge({ nivel, className = '' }: NivelBadgeProps) {
  const getColorClasses = (nivel: string) => {
    switch (nivel.toUpperCase()) {
      case 'INICIAL':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PRIMARIA':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SECUNDARIA':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorClasses(nivel)} ${className}`}
    >
      {getNivelLabel(nivel)}
    </span>
  );
}
