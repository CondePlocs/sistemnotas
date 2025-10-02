"use client";

import { useState } from 'react';
import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface BotonGuardarNotasProps {
  hayCambiosPendientes: boolean;
  cantidadPendientes: number;
  guardando: boolean;
  onGuardar: () => Promise<{ success: boolean; message: string }>;
  onDescartar?: () => void;
}

export default function BotonGuardarNotas({
  hayCambiosPendientes,
  cantidadPendientes,
  guardando,
  onGuardar,
  onDescartar
}: BotonGuardarNotasProps) {
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const handleGuardar = async () => {
    const resultado = await onGuardar();
    
    setMensaje({
      tipo: resultado.success ? 'success' : 'error',
      texto: resultado.message
    });

    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setMensaje(null), 3000);
  };

  const handleDescartar = () => {
    if (onDescartar) {
      onDescartar();
      setMensaje({
        tipo: 'success',
        texto: 'Cambios descartados'
      });
      setTimeout(() => setMensaje(null), 2000);
    }
  };

  if (!hayCambiosPendientes) {
    return null; // No mostrar botón si no hay cambios
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Tienes {cantidadPendientes} nota{cantidadPendientes !== 1 ? 's' : ''} sin guardar
            </p>
            <p className="text-xs text-yellow-600">
              Los cambios se perderán si sales sin guardar
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onDescartar && (
            <button
              onClick={handleDescartar}
              disabled={guardando}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Descartar
            </button>
          )}
          
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {guardando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                <span>Guardar Notas</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mensaje de resultado */}
      {mensaje && (
        <div className={`mt-3 p-2 rounded-md text-sm ${
          mensaje.tipo === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {mensaje.texto}
        </div>
      )}
    </div>
  );
}
