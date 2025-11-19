'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLogout } from '@/hooks/useLogout';
import SimpleHeader from './SimpleHeader';

interface DirectorSidebarProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

export default function DirectorSidebar({ children }: DirectorSidebarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { handleLogout } = useLogout();

  // Inicializar estados correctamente para evitar parpadeo
  const [isCollapsed, setIsCollapsed] = useState(true); // Iniciar colapsado para evitar flash
  const [isMobile, setIsMobile] = useState(true); // Asumir móvil inicialmente
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicialización inmediata para evitar parpadeo
  useLayoutEffect(() => {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    setIsCollapsed(mobile);
    setIsInitialized(true);
  }, []);

  // Escuchar cambios de tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true); // Colapsado en móvil
      } else {
        setIsCollapsed(false); // Abierto en desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Verificar si el usuario es administrativo
  const isAdministrativo = user?.roles?.some(role => role.rol === 'ADMINISTRATIVO');

  // Si es administrativo, no mostrar sidebar pero aplicar fondo y SimpleHeader
  if (isAdministrativo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9]">
        <SimpleHeader 
          title="Gestión Administrativa"
          showBackButton={true}
          showForwardButton={true}
          dashboardPath="/administrativo/dashboard"
        />
        <div className="flex-1">
          {children}
        </div>
      </div>
    );
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/director/dashboard',
      description: 'Panel principal del sistema',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    {
      id: 'profesores',
      label: 'Profesores',
      href: '/director/profesores',
      description: 'Gestionar profesores del colegio',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'apoderados',
      label: 'Apoderados',
      href: '/director/apoderados',
      description: 'Gestionar padres de familia',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'administrativos',
      label: 'Personal Administrativo',
      href: '/director/administrativos',
      description: 'Gestionar personal administrativo',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'alumnos',
      label: 'Alumnos',
      href: '/director/alumnos',
      description: 'Gestionar estudiantes del colegio',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      id: 'salones',
      label: 'Salones',
      href: '/director/salones',
      description: 'Gestionar salones y aulas',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'periodos',
      label: 'Períodos Académicos',
      href: '/director/periodos-academicos',
      description: 'Gestionar períodos académicos',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'asignaciones',
      label: 'Asignación de Profesores',
      href: '/director/asignaciones-profesor',
      description: 'Asignar profesores a cursos',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    }
  ];

  const isActiveRoute = (href: string) => {
    // Caso especial: /director/permisos debe marcar como activo "Personal Administrativo"
    if (href === '/director/administrativos' && pathname === '/director/permisos') {
      return true;
    }
    
    // Caso especial: rutas de salones con ID y /gestion deben marcar como activo "Salones"
    if (href === '/director/salones' && (
      pathname.match(/^\/director\/salones\/\d+/) || 
      pathname === '/director/salones/gestion'
    )) {
      return true;
    }
    
    return pathname === href || (href !== '/director/dashboard' && pathname.startsWith(href));
  };

  return (
    <>
      {/* Overlay para móvil */}
      {!isCollapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <div className="flex h-screen bg-gradient-to-br from-[#FCE0C1] via-[#F6CBA3] to-[#E9E1C9]">
        {/* Botón hamburger para móvil */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="fixed top-4 left-4 z-50 lg:hidden p-3 bg-[#8D2C1D] hover:bg-[#7A2518] text-white rounded-lg shadow-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
        </button>

        {/* Sidebar */}
        <div className={`${
          isCollapsed ? 'w-16' : 'w-64'
        } ${
          isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
        } ${
          !isInitialized ? 'opacity-0' : 'opacity-100'
        } fixed lg:relative z-50 bg-gradient-to-b from-[#8D2C1D] to-[#D96924] text-white transition-all duration-300 ease-in-out flex flex-col shadow-2xl h-full`}>
          {/* Header del Sidebar */}
          <div className="p-4 border-b border-white/20 flex-shrink-0">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.84l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">Sistema Notas</h1>
                    <p className="text-xs text-white/70">Panel Director</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors hidden lg:block"
              >
                <svg 
                  className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-hide">
            {navItems.map((item) => (
              <div key={item.id} className="relative">
                {/* Marco externo cuando está colapsado y activo */}
                {isActiveRoute(item.href) && isCollapsed && (
                  <div className="absolute -inset-1 border-2 border-white/80 rounded-xl" />
                )}
                <button
                onClick={() => {
                  router.push(item.href);
                  // Cerrar sidebar en móvil después de navegar
                  if (isMobile) {
                    setIsCollapsed(true);
                  }
                }}
                className={`
                  w-full text-left rounded-lg transition-all duration-300
                  flex items-center group relative overflow-hidden
                  ${isCollapsed ? 'p-2 justify-center' : 'p-3 gap-3'}
                  ${isActiveRoute(item.href)
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-[#FCE0C1] hover:bg-white/10 hover:text-white'
                  }
                  hover:scale-105 hover:shadow-lg active:scale-95
                `}
              >
                {/* Indicador activo - solo barra cuando está expandido */}
                {isActiveRoute(item.href) && !isCollapsed && (
                  <div className="absolute left-1 w-1 h-6 bg-white rounded-full" />
                )}
                
                {/* Icono */}
                <div className={`
                  flex-shrink-0 transition-all duration-300 
                  ${isActiveRoute(item.href) && !isCollapsed ? 'ml-2' : ''}
                  ${isActiveRoute(item.href) ? 'text-white' : 'text-[#FCE0C1] group-hover:text-white'}
                  ${isCollapsed ? 'w-8 h-8 flex items-center justify-center' : ''}
                `}>
                  <div className={`${isCollapsed ? 'scale-125' : ''} transition-transform duration-300`}>
                    {item.icon}
                  </div>
                </div>
                
                {/* Texto */}
                {!isCollapsed && (
                  <div className="flex-1 animate-fade-in">
                    <div className="font-semibold text-sm leading-tight">
                      {item.label}
                    </div>
                    <div className="text-xs opacity-75 mt-0.5 leading-tight">
                      {item.description}
                    </div>
                  </div>
                )}
              </button>
              </div>
            ))}
          </nav>

          {/* Usuario y Logout - Fijo en la parte inferior */}
          <div className="p-3 border-t border-white/20 flex-shrink-0">
            {/* Info del Usuario */}
            {!isCollapsed && (
              <div className="mb-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg animate-fade-in">
                <div className="flex items-center gap-2">
                  {/* Avatar */}
                  <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full flex-shrink-0">
                    <svg 
                      className="w-6 h-6 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                      />
                    </svg>
                  </div>
                  
                  {/* Datos */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate leading-tight">
                      {user?.nombres || 'Usuario'}
                    </p>
                    <p className="text-[#FCE0C1] text-xs truncate leading-tight">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botón Logout */}
            <button
              onClick={handleLogout}
              className={`
                w-full bg-white/10 hover:bg-white/20 
                backdrop-blur-sm text-white 
                ${isCollapsed ? 'p-2' : 'px-3 py-2'}
                rounded-lg text-sm font-medium
                transition-all duration-300
                border border-white/20 hover:border-white/40
                hover:shadow-lg active:scale-95
                flex items-center justify-center gap-2
                group
              `}
            >
              <div className={`${isCollapsed ? 'scale-110' : ''} transition-transform duration-300`}>
                <svg 
                  className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" 
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
              </div>
              {!isCollapsed && <span>Cerrar Sesión</span>}
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
          {children}
        </div>
      </div>
    </>
  );
}
