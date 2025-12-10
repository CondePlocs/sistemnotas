import Image from "next/image";

export default function LoginLeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#8D2C1D] via-[#A0341F] to-[#D96924] relative overflow-hidden">
      {/* Patrón decorativo de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 30px 30px, #FCE0C1 2px, transparent 0)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Formas geométricas decorativas */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-32 right-16 w-24 h-24 bg-[#FCE0C1]/20 rounded-2xl rotate-45"></div>
      <div className="absolute top-1/2 left-8 w-16 h-16 bg-[#E9E1C9]/15 rounded-full"></div>

      {/* Contenido principal - Mucho más espaciado y expandido */}
      <div className="relative z-10 flex flex-col justify-center w-full pl-20 pr-4 py-12 text-white">

        {/* Logo/Icono principal - Alineado a la izquierda */}
        <div className="mb-10 relative">
          <div className="w-32 h-32 relative">
            {/* Aura/Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FCE0C1] to-[#F6CBA3] rounded-full blur-xl opacity-30 scale-110"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#D96924] to-[#8D2C1D] rounded-full blur-lg opacity-20 scale-125"></div>

            {/* Imagen redondeada */}
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
              <Image
                src="/Lucid_Origin_Ilustracin_3D_que_representa_un_sistema_de_gestin_1.jpg"
                alt="Sistema de Gestión Educativa"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Título principal - Mucho más espacio para el texto */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>
            ¡Bienvenido al Sistema!
          </h1>
          <div className="w-16 h-1 bg-[#FCE0C1] mb-4 rounded-full"></div>
          <p className="text-xl text-[#FCE0C1] font-medium leading-relaxed max-w-xl">
            Gestiona de manera eficiente y moderna toda la información educativa de tu institución
          </p>
        </div>

        {/* Descripción del sistema - Mucho más ancho */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-10 max-w-xl">
          <h3 className="text-lg font-semibold mb-3 text-[#FCE0C1]">
            Sistema de Gestión Educativa
          </h3>
          <p className="text-sm text-white/90 leading-relaxed">
            Plataforma integral para la administración de notas, estudiantes, profesores y apoderados.
            Optimiza los procesos educativos con tecnología moderna y segura.
          </p>
        </div>

        {/* Información de contacto - En una sola fila expandida */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-3xl">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <div>
              <p className="text-[#FCE0C1] font-medium">Correo Electrónico</p>
              <p className="text-white/80 text-xs">soportenotas@gmail.com</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <div>
              <p className="text-[#FCE0C1] font-medium">Teléfono de Soporte</p>
              <p className="text-white/80 text-xs">987 654 321</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white/60">
            © 2025 Sistema de Notas - Arequipa, Perú
          </p>
        </div>
      </div>
    </div>
  );
}
