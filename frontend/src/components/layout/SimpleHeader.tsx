'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SimpleHeaderProps {
  title: string;
  showBackButton?: boolean;
  showForwardButton?: boolean;
  dashboardPath: string;
}

export default function SimpleHeader({ 
  title, 
  showBackButton = true,
  showForwardButton = true,
  dashboardPath 
}: SimpleHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleGoHome = () => {
    router.push(dashboardPath);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleGoForward = () => {
    router.forward();
  };

  return (
    <header className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] shadow-lg backdrop-blur-sm border-b border-white/10">
      <div className="px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Navegación Izquierda */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Botón Home */}
            <button
              onClick={handleGoHome}
              className="group flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
              title="Ir al Dashboard"
            >
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-white/90 transition-colors duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
            </button>

            {/* Botones de Navegación */}
            {/* Botón Atrás */}
            {showBackButton && (
              <button
                onClick={handleGoBack}
                className="group flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                title="Página anterior"
              >
                <svg 
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-white/90 transition-colors duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 19l-7-7 7-7" 
                  />
                </svg>
              </button>
            )}

            {/* Botón Avanzar */}
            {showForwardButton && (
              <button
                onClick={handleGoForward}
                className="group flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                title="Página siguiente"
              >
                <svg 
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-white/90 transition-colors duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </button>
            )}

            {/* Separador Visual */}
            <div className="hidden sm:block w-px h-6 bg-white/20"></div>

            {/* Título */}
            <h1 
              className="text-sm sm:text-lg md:text-xl font-semibold text-white truncate max-w-[160px] sm:max-w-xs md:max-w-md lg:max-w-lg"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              {title}
            </h1>
          </div>

          {/* Usuario y Logout */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Información del Usuario */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Avatar */}
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
                <span className="text-sm font-medium text-white">
                  {user?.nombres?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              
              {/* Nombre - Responsive */}
              <div className="text-right">
                <p className="text-xs sm:text-sm font-medium text-white truncate max-w-[80px] sm:max-w-32">
                  {user?.nombres || 'Usuario'}
                </p>
                <p className="hidden sm:block text-xs text-white/80 truncate max-w-32">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Botón Logout */}
            <button
              onClick={handleLogout}
              className="group flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-red-500/20 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 hover:border-red-300/50"
              title="Cerrar sesión"
            >
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-red-200 transition-colors duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
