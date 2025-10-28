'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, UsersIcon } from '@heroicons/react/24/outline';

interface Alumno {
  id: number;
  nombres: string;
  apellidos: string;
  dni?: string;
}

interface FiltroAlumnosProps {
  alumnos: Alumno[];
  onFiltroChange: (alumnosFiltrados: Alumno[]) => void;
  className?: string;
}

const FiltroAlumnos: React.FC<FiltroAlumnosProps> = ({
  alumnos,
  onFiltroChange,
  className = ''
}) => {
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [alumnosFiltrados, setAlumnosFiltrados] = useState<Alumno[]>(alumnos);

  // Función para normalizar texto (quitar acentos y convertir a minúsculas)
  const normalizarTexto = (texto: string): string => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  // Efecto para filtrar alumnos cuando cambia el texto de búsqueda
  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setAlumnosFiltrados(alumnos);
      onFiltroChange(alumnos);
      return;
    }

    const textoBusquedaNormalizado = normalizarTexto(textoBusqueda);
    
    const filtrados = alumnos.filter(alumno => {
      const nombreCompleto = normalizarTexto(`${alumno.nombres} ${alumno.apellidos}`);
      const apellidoNombre = normalizarTexto(`${alumno.apellidos} ${alumno.nombres}`);
      const dni = (alumno.dni || '').toLowerCase();
      
      return (
        nombreCompleto.includes(textoBusquedaNormalizado) ||
        apellidoNombre.includes(textoBusquedaNormalizado) ||
        dni.includes(textoBusquedaNormalizado) ||
        normalizarTexto(alumno.nombres).includes(textoBusquedaNormalizado) ||
        normalizarTexto(alumno.apellidos).includes(textoBusquedaNormalizado)
      );
    });

    setAlumnosFiltrados(filtrados);
    onFiltroChange(filtrados);
  }, [textoBusqueda, alumnos, onFiltroChange]);

  // Función para limpiar el filtro
  const limpiarFiltro = () => {
    setTextoBusqueda('');
  };

  return (
    <div className={`bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9] rounded-lg border-2 border-[#8D2C1D]/30 shadow-lg p-4 ${className}`}>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2 text-[#8D2C1D]">
          <UsersIcon className="w-5 h-5" />
          <span className="font-bold">Filtrar Alumnos</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#8D2C1D]/70">
          <span className="font-medium">{alumnosFiltrados.length} de {alumnos.length} alumnos</span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-4 w-4 text-[#8D2C1D]/60" />
        </div>
        
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o DNI..."
          value={textoBusqueda}
          onChange={(e) => setTextoBusqueda(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border-2 border-[#8D2C1D]/30 rounded-md focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-colors bg-white/80 backdrop-blur-sm"
        />
        
        {textoBusqueda && (
          <button
            onClick={limpiarFiltro}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8D2C1D]/60 hover:text-[#8D2C1D] transition-colors"
            title="Limpiar búsqueda"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {textoBusqueda && alumnosFiltrados.length === 0 && (
        <div className="mt-3 p-3 bg-[#D96924]/10 border-2 border-[#D96924]/30 rounded-md">
          <div className="flex items-center gap-2 text-[#8D2C1D]">
            <MagnifyingGlassIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              No se encontraron alumnos que coincidan con "{textoBusqueda}"
            </span>
          </div>
        </div>
      )}

      {textoBusqueda && alumnosFiltrados.length > 0 && (
        <div className="mt-3 p-2 bg-white/60 border-2 border-[#8D2C1D]/30 rounded-md backdrop-blur-sm">
          <div className="text-sm text-[#8D2C1D]">
            <span className="font-bold">{alumnosFiltrados.length}</span> alumno(s) encontrado(s)
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltroAlumnos;
