"use client";

import { AlumnoApoderado } from '@/types/apoderado';
import AlumnoCard from './AlumnoCard';

interface ListadoAlumnosProps {
  alumnos: AlumnoApoderado[];
  loading: boolean;
}

export default function ListadoAlumnos({ alumnos, loading }: ListadoAlumnosProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] p-6 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-[#E9E1C9] rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-[#E9E1C9] rounded mb-2"></div>
                <div className="h-3 bg-[#E9E1C9] rounded w-2/3"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-[#E9E1C9] rounded"></div>
              <div className="h-3 bg-[#E9E1C9] rounded w-3/4"></div>
              <div className="h-10 bg-[#E9E1C9] rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (alumnos.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border-2 border-[#E9E1C9] rounded-xl p-12 text-center shadow-lg">
        <div className="text-[#8D2C1D] mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-[#8D2C1D] mb-2">
          No tienes estudiantes asignados
        </h3>
        <p className="text-[#666666] font-medium">
          Contacta al director de tu colegio para que te asigne como apoderado de uno o más estudiantes.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Título de la sección */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#333333] mb-2 flex items-center gap-3">
          <svg className="w-7 h-7 text-[#8D2C1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Mis Estudiantes
        </h2>
        <p className="text-[#666666]">
          {alumnos.length === 1
            ? 'Aquí puedes ver la información de tu hijo/a'
            : `Aquí puedes ver la información de tus ${alumnos.length} hijos`
          }
        </p>
      </div>

      {/* Grid de cards de alumnos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumnos.map((alumno) => (
          <AlumnoCard
            key={alumno.id}
            alumno={alumno}
          />
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-8 bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9] rounded-xl p-6 border-2 border-[#E9E1C9]">
        <div className="flex items-start gap-4">
          <div className="bg-[#8D2C1D] p-2 rounded-lg flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[#8D2C1D] mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Información importante
            </h3>
            <ul className="text-[#666666] text-sm space-y-1">
              <li>• Haz clic en "Ver Alumno" para ver los cursos y notas de cada estudiante</li>
              <li>• Puedes filtrar por nombre, apellido, grado, sección o nivel educativo</li>
              <li>• La información se actualiza en tiempo real con los registros del profesor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
