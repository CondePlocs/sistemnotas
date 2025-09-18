"use client";

import Link from "next/link";
import RegistroUsuarioForm from "@/components/RegistroUsuarioForm";
import ProtectedRoute from "@/components/ProtectedRoute";

interface RegistroUsuarioData {
  email: string;
  password: string;
  dni?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
}

function RegistroOwnerContent() {
  const handleRegistroOwner = async (data: RegistroUsuarioData) => {
    try {
      console.log("Registrando Owner:", data);
      
      const response = await fetch('http://localhost:3001/owner/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para cookies httpOnly
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ ${result.message}`);
        console.log("Owner registrado:", result.data);
        
        // Opcional: Redirigir al dashboard después del registro
        // window.location.href = "/owner/dashboard";
      } else {
        alert(`❌ Error: ${result.message || 'Error al registrar Owner'}`);
        console.error("Error:", result);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("❌ Error de conexión con el servidor");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link 
                href="/owner/dashboard"
                className="text-blue-600 hover:text-blue-800 mr-4"
              >
                ← Volver al Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Registrar Nuevo Owner</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Información del Owner
            </h2>
            <p className="text-gray-600">
              Complete los datos para registrar un nuevo usuario con rol de Owner. 
              Este usuario tendrá permisos para crear directores y colegios.
            </p>
          </div>

          {/* Usar el componente reutilizable */}
          <RegistroUsuarioForm onSubmit={handleRegistroOwner} />
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Información sobre el rol Owner:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Puede crear y gestionar directores</li>
              <li>• Puede crear y aprobar colegios</li>
              <li>• Tiene acceso completo al sistema</li>
              <li>• No está vinculado a un colegio específico</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RegistroOwner() {
  return (
    <ProtectedRoute requiredRole="OWNER">
      <RegistroOwnerContent />
    </ProtectedRoute>
  );
}
