'use client';

import { SalonConNivel } from '@/types/salon';
import { OPCIONES_NIVELES_EDUCATIVOS } from '@/types/colegio';
import SalonCardMejorado from './SalonCardMejorado';

interface SalonesPorNivelProps {
  salonesPorNivel: Record<string, SalonConNivel[]>;
  onAsignarAlumnos: (salon: SalonConNivel) => void;
  refreshTrigger: number;
}

export default function SalonesPorNivel({ 
  salonesPorNivel, 
  onAsignarAlumnos, 
  refreshTrigger 
}: SalonesPorNivelProps) {
  
  if (Object.keys(salonesPorNivel).length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 text-center border border-[#E9E1C9] shadow-lg">
        <div className="p-4 bg-[#8D2C1D]/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <svg className="h-10 w-10 text-[#8D2C1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#8D2C1D] mb-2">No hay salones disponibles</h3>
        <p className="text-[#666666] mb-4">
          No se encontraron salones con los filtros aplicados
        </p>
        <button
          onClick={() => window.location.href = '/director/salones'}
          className="px-6 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white font-semibold rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] transition-all duration-300 shadow-lg"
        >
          Crear Salones
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(salonesPorNivel).map(([nivel, salones]) => {
        const nivelInfo = OPCIONES_NIVELES_EDUCATIVOS.find(n => n.value === nivel);
        return (
          <div key={nivel}>
            <div className="flex items-center mb-6">
              <div className="p-3 bg-white/90 backdrop-blur-sm rounded-xl border border-[#E9E1C9] shadow-lg mr-4">
                <span className="text-2xl">{nivelInfo?.icon}</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#8D2C1D]">
                  {nivelInfo?.label}
                </h2>
                <p className="text-sm sm:text-base text-[#666666]">
                  {salones.length} salon{salones.length !== 1 ? 'es' : ''} disponible{salones.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {salones.map(salon => (
                <SalonCardMejorado
                  key={salon.id}
                  salon={salon}
                  onAsignarAlumnos={onAsignarAlumnos}
                  refreshTrigger={refreshTrigger}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
