"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoginLeftPanel from "@/components/auth/LoginLeftPanel";
import LoginRightPanel from "@/components/auth/LoginRightPanel";

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
    <div className="min-h-screen flex">
      {/* Panel Izquierdo - Información y Branding */}
      <LoginLeftPanel />

      {/* Panel Derecho - Formulario de Login */}
      <LoginRightPanel 
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
