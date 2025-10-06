"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoginHeader from "@/components/auth/LoginHeader";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login({ email, password });
      
      // El AuthContext ya maneja la redirección según el rol
      // Pero podemos hacer una redirección manual aquí también
      router.push("/owner/dashboard"); // Temporal, después será dinámico
      
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FCE0C1] via-[#F6CBA3] to-[#E9E1C9] p-4">
      {/* Patrón decorativo de fondo */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20px 20px, #8D2C1D 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Card del Login */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border-2 border-[#E9E1C9] animate-fade-in-up">
          
          {/* Header con Logo */}
          <LoginHeader />

          {/* Mensaje de Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg animate-slide-in-right">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <Input
              id="password"
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="mt-6"
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[#666666]">
              © 2025 Sistema de Notas - Arequipa
            </p>
          </div>
        </div>

        {/* Decoración inferior */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#D96924] to-[#8D2C1D] rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-[#8D2C1D] to-[#D96924] rounded-full opacity-20 blur-2xl"></div>
      </div>
    </div>
  );
}
