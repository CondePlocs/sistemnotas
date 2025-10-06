export default function LoginHeader() {
  return (
    <div className="text-center mb-8 animate-fade-in-down">
      {/* Logo/Icono */}
      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#8D2C1D] to-[#D96924] rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
        <svg 
          className="w-12 h-12 text-white" 
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

      {/* Título */}
      <h1 className="text-3xl font-bold text-[#8D2C1D] mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>
        Sistema de Notas
      </h1>
      
      {/* Subtítulo */}
      <p className="text-[#666666] text-sm font-medium">
        Gestión Educativa Arequipa
      </p>
    </div>
  );
}
