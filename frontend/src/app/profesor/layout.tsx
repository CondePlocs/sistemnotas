"use client";

import { useAuth } from '@/context/AuthContext';
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProfesorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/profesor/dashboard',
      icon: AcademicCapIcon,
      current: pathname === '/profesor/dashboard'
    },
    {
      name: 'Mis Cursos',
      href: '/profesor/cursos',
      icon: BookOpenIcon,
      current: pathname.startsWith('/profesor/cursos')
    },
    {
      name: 'Mis Alumnos',
      href: '/profesor/alumnos',
      icon: UserGroupIcon,
      current: pathname.startsWith('/profesor/alumnos')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <AcademicCapIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Portal del Profesor
                </h1>
                <p className="text-sm text-gray-500">
                  {user?.nombres} {user?.apellidos}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  // TODO: Implementar configuración
                  console.log('Abrir configuración');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                    item.current
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>
        {children}
      </main>
    </div>
  );
}
