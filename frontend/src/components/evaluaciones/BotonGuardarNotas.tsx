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
    <div className="bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9] border-2 border-[#8D2C1D] rounded-xl p-4 mb-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-[#8D2C1D] p-2 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#8D2C1D]">
              ⚠️ Tienes {cantidadPendientes} nota{cantidadPendientes !== 1 ? 's' : ''} sin guardar
            </p>
            <p className="text-xs text-[#666666] font-medium">
              🚨 Los cambios se perderán si sales sin guardar
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {onDescartar && (
            <button
              onClick={handleDescartar}
              disabled={guardando}
              className="px-4 py-2 text-sm font-semibold text-[#8D2C1D] bg-white/80 border-2 border-[#E9E1C9] rounded-xl hover:bg-white hover:border-[#8D2C1D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
            >
              🗑️ Descartar
            </button>
          )}
          
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#7A2518] hover:to-[#C55A1F] border border-transparent rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
          >
            {guardando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                <span>💾 Guardar Notas</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mensaje de resultado */}
      {mensaje && (
        <div className={`mt-4 p-3 rounded-xl text-sm font-medium shadow-sm ${
          mensaje.tipo === 'success' 
            ? 'bg-green-100/95 backdrop-blur-sm text-green-800 border-2 border-green-300' 
            : 'bg-red-100/95 backdrop-blur-sm text-red-800 border-2 border-red-300'
        }`}>
          {mensaje.tipo === 'success' ? '✅' : '❌'} {mensaje.texto}
        </div>
      )}
    </div>
  );
}
