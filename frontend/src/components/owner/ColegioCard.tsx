'use client';

import { useState } from 'react';
import { Colegio } from '@/types/colegio';

interface ColegioCardProps {
  colegio: Colegio;
  onUpdate: () => void;
  onVerDetalles: (id: number) => void;
  onEditar: (id: number) => void;
}

export default function ColegioCard({ colegio, onUpdate, onVerDetalles, onEditar }: ColegioCardProps) {
  const [loading, setLoading] = useState(false);

  // Obtener iniciales del nombre del colegio
  const getIniciales = (nombre: string) => {
    const palabras = nombre.split(' ').filter(p => p.length > 0);
    if (palabras.length === 1) return palabras[0].substring(0, 2).toUpperCase();
    return (palabras[0][0] + palabras[1][0]).toUpperCase();
  };

  // Obtener niveles educativos
  const getNiveles = () => {
    if (!colegio.nivelesPermitidos || colegio.nivelesPermitidos.length === 0) {
      return 'Sin niveles';
    }
    return colegio.nivelesPermitidos
      .filter(n => n.nivel)
      .map(n => n.nivel!.nombre)
      .join(', ');
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#E9E1C9] overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Header con avatar */}
      <div className="bg-gradient-to-br from-[#8D2C1D] to-[#D96924] p-6 text-center relative">
        <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 shadow-lg">
          <span className="text-3xl font-bold text-white">
            {getIniciales(colegio.nombre)}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Nombre del colegio */}
        <h3 className="text-lg font-bold text-[#333333] text-center mb-2 line-clamp-2 min-h-[3.5rem]">
          {colegio.nombre}
        </h3>

        {/* Información */}
        <div className="space-y-2 mb-4">
          {colegio.codigoModular && (
            <div className="text-sm text-[#666666] text-center">
              <span className="font-medium">Código:</span> {colegio.codigoModular}
            </div>
          )}
          
          {colegio.ugel && (
            <div className="text-sm text-[#666666] text-center">
              <span className="font-medium">UGEL:</span> {colegio.ugel.nombre}
            </div>
          )}

          {colegio.distrito && (
            <div className="text-sm text-[#666666] text-center">
              <span className="font-medium">Distrito:</span> {colegio.distrito}
            </div>
          )}

          {/* Niveles educativos */}
          <div className="bg-[#FCE0C1] rounded-lg p-3 mt-3">
            <div className="text-xs font-semibold text-[#8D2C1D] mb-1">Niveles Autorizados</div>
            <div className="text-sm text-[#333333] font-medium">{getNiveles()}</div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onVerDetalles(colegio.id)}
              className="flex-1 bg-[#4A90E2] hover:bg-[#357ABD] text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            >
              Ver Detalles
            </button>
            <button
              onClick={() => onEditar(colegio.id)}
              className="flex-1 bg-[#D96924] hover:bg-[#C64925] text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            >
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
