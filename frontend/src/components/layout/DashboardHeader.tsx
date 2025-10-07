interface DashboardHeaderProps {
  title: string;
  userName?: string;
  userEmail?: string;
  onLogout: () => void;
}

export default function DashboardHeader({ title, userName, userEmail, onLogout }: DashboardHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          
          {/* Logo y Título */}
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                />
              </svg>
            </div>
            <div>
              <h1 
                className="text-2xl font-bold text-white" 
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {title}
              </h1>
              <p className="text-[#FCE0C1] text-sm">Sistema de Gestión Educativa</p>
            </div>
          </div>

          {/* Usuario y Logout */}
          <div className="flex items-center gap-4 animate-fade-in">
            {/* Info del Usuario */}
            <div className="hidden md:block text-right">
              <p className="text-white font-medium text-sm">
                {userName || 'Usuario'}
              </p>
              <p className="text-[#FCE0C1] text-xs">
                {userEmail}
              </p>
            </div>

            {/* Avatar */}
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
              <svg 
                className="w-8 h-8 text-white" 
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

            {/* Botón Logout */}
            <button
              onClick={onLogout}
              className="
                bg-white/10 hover:bg-white/20 
                backdrop-blur-sm
                text-white 
                px-4 py-2 
                rounded-lg 
                text-sm font-medium
                transition-all duration-300
                border border-white/20
                hover:border-white/40
                hover:shadow-lg
                active:scale-95
                flex items-center gap-2
              "
            >
              <svg 
                className="w-4 h-4" 
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
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
