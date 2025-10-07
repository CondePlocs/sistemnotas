export default function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t-2 border-[#E9E1C9] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo y Copyright */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#8D2C1D] to-[#D96924] p-2 rounded-lg">
              <svg 
                className="w-5 h-5 text-white" 
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
              <p className="text-[#333333] font-semibold text-sm">
                Sistema de Notas
              </p>
              <p className="text-[#666666] text-xs">
                © {currentYear} Todos los derechos reservados
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a 
              href="#" 
              className="text-[#666666] hover:text-[#8D2C1D] text-sm transition-colors duration-300"
            >
              Ayuda
            </a>
            <a 
              href="#" 
              className="text-[#666666] hover:text-[#8D2C1D] text-sm transition-colors duration-300"
            >
              Documentación
            </a>
            <a 
              href="#" 
              className="text-[#666666] hover:text-[#8D2C1D] text-sm transition-colors duration-300"
            >
              Soporte
            </a>
          </div>

          {/* Versión */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#999999]">Versión</span>
            <span className="bg-[#E9E1C9] text-[#8D2C1D] px-2 py-1 rounded text-xs font-semibold">
              1.0.0
            </span>
          </div>
        </div>

        {/* Línea decorativa */}
        <div className="mt-4 pt-4 border-t border-[#E9E1C9]">
          <p className="text-center text-xs text-[#999999]">
            Hecho con ❤️ en Arequipa, Perú
          </p>
        </div>
      </div>
    </footer>
  );
}
