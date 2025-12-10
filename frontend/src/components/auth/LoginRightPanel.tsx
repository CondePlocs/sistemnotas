import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface LoginRightPanelProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

export default function LoginRightPanel({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  onSubmit
}: LoginRightPanelProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-[#FCE0C1] via-[#F6CBA3] to-[#E9E1C9] p-4 lg:p-8 relative overflow-hidden">

      {/* Patrón decorativo más visible */}
      <div className="absolute inset-0 opacity-12">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, #8D2C1D 1.5px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Segundo patrón decorativo */}
      <div className="absolute inset-0 opacity-6">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, #FCE0C1 1px, transparent 1px), linear-gradient(-45deg, #F6CBA3 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      {/* Más formas decorativas con animaciones */}
      <div className="absolute top-16 right-16 w-28 h-28 bg-gradient-to-br from-[#D96924] to-[#8D2C1D] rounded-full opacity-30 blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 left-16 w-24 h-24 bg-gradient-to-br from-[#8D2C1D] to-[#D96924] rounded-2xl opacity-25 blur-xl rotate-45 animate-bounce" style={{ animationDuration: '3s' }}></div>
      <div className="absolute top-1/3 right-8 w-16 h-16 bg-[#FCE0C1]/40 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/3 left-8 w-20 h-20 bg-[#E9E1C9]/35 rounded-2xl rotate-12 blur-md"></div>
      <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-[#D96924]/30 rounded-full blur-sm animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/4 left-1/3 w-10 h-10 bg-[#F6CBA3]/25 rounded-full blur-md"></div>
      <div className="absolute bottom-1/4 right-1/5 w-14 h-14 bg-[#FCE0C1]/20 rounded-2xl rotate-45 blur-lg"></div>

      {/* Líneas decorativas mejoradas */}
      <div className="absolute top-0 left-1/4 w-px h-40 bg-gradient-to-b from-transparent via-[#8D2C1D]/15 to-transparent"></div>
      <div className="absolute bottom-0 right-1/3 w-px h-32 bg-gradient-to-t from-transparent via-[#D96924]/15 to-transparent"></div>
      <div className="absolute left-0 top-1/3 h-px w-24 bg-gradient-to-r from-transparent via-[#FCE0C1]/10 to-transparent"></div>
      <div className="absolute right-0 bottom-1/3 h-px w-32 bg-gradient-to-l from-transparent via-[#F6CBA3]/10 to-transparent"></div>

      {/* Efectos de difuminado adicionales */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FCE0C1]/5 via-transparent to-[#E9E1C9]/5"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-[#F6CBA3]/3 via-transparent to-[#D4C5A9]/3"></div>

      {/* Contenedor del formulario */}
      <div className="relative z-10 w-full max-w-md">

        {/* Header móvil (solo visible en pantallas pequeñas) */}
        <div className="lg:hidden text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#8D2C1D] to-[#D96924] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#8D2C1D] mb-1" style={{ fontFamily: 'var(--font-poppins)' }}>
            Sistema de Notas
          </h2>
          <p className="text-[#666666] text-sm">Gestión Educativa</p>
        </div>

        {/* Card del formulario */}
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-[#E9E1C9]/50 relative overflow-hidden">
          {/* Elementos decorativos internos sutiles */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-[#FCE0C1]/20 to-[#F6CBA3]/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-[#E9E1C9]/30 to-[#D4C5A9]/30 rounded-2xl rotate-12 blur-lg"></div>

          {/* Contenido del formulario */}
          <div className="relative z-10">

            {/* Header del formulario mejorado */}
            <div className="text-center mb-8 relative">
              {/* Icono decorativo */}
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-[#8D2C1D] to-[#D96924] rounded-2xl flex items-center justify-center mb-4 shadow-lg relative">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                {/* Pequeño glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#8D2C1D] to-[#D96924] rounded-2xl blur-md opacity-30 scale-110"></div>
              </div>

              <h1 className="text-3xl font-bold text-[#333333] mb-2 relative" style={{ fontFamily: 'var(--font-poppins)' }}>
                Iniciar Sesión
                {/* Línea decorativa debajo del título */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] rounded-full"></div>
              </h1>
              <p className="text-[#666666] text-sm mt-3">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-5">
                <Input
                  id="email"
                  type="email"
                  label="Correo Electrónico"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    label="Contraseña"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[44px] text-gray-500 hover:text-gray-700 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full mt-8"
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-[#E9E1C9]/50 text-center">
              <p className="text-xs text-[#666666]">
                Sistema seguro con autenticación encriptada
              </p>
            </div>

          </div> {/* Cierre del div contenido del formulario */}
        </div> {/* Cierre del card del formulario */}

        {/* Información adicional móvil */}
        <div className="lg:hidden mt-6 text-center">
          <p className="text-xs text-[#666666]">
            © 2025 Sistema de Notas - Arequipa, Perú
          </p>
        </div>
      </div>
    </div>
  );
}
