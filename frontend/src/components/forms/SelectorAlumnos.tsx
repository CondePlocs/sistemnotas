"use client";

import { useState } from 'react';
import { AlumnoConParentesco, Alumno, PARENTESCOS, Parentesco } from '@/types/apoderado';
import ModalSeleccionAlumnos from '@/components/modals/ModalSeleccionAlumnos';

interface SelectorAlumnosProps {
  alumnosSeleccionados: AlumnoConParentesco[];
  onAlumnosChange: (alumnos: AlumnoConParentesco[]) => void;
  disabled?: boolean;
}

export default function SelectorAlumnos({
  alumnosSeleccionados,
  onAlumnosChange,
  disabled = false
}: SelectorAlumnosProps) {
  const [modalAbierto, setModalAbierto] = useState(false);

  const handleSeleccionarAlumnos = (alumnos: Alumno[]) => {
    // Convertir alumnos seleccionados a AlumnoConParentesco
    const nuevosAlumnos: AlumnoConParentesco[] = alumnos.map(alumno => {
      // Buscar si ya existe para mantener el parentesco
      const existente = alumnosSeleccionados.find(a => a.alumno.id === alumno.id);
      return {
        alumno,
        parentesco: existente?.parentesco || 'padre',
        esPrincipal: existente?.esPrincipal || false
      };
    });

    onAlumnosChange(nuevosAlumnos);
  };

  const handleCambiarParentesco = (alumnoId: number, parentesco: Parentesco) => {
    const nuevosAlumnos = alumnosSeleccionados.map(item =>
      item.alumno.id === alumnoId
        ? { ...item, parentesco }
        : item
    );
    onAlumnosChange(nuevosAlumnos);
  };

  const handleCambiarPrincipal = (alumnoId: number, esPrincipal: boolean) => {
    const nuevosAlumnos = alumnosSeleccionados.map(item => ({
      ...item,
      esPrincipal: item.alumno.id === alumnoId ? esPrincipal : (esPrincipal ? false : item.esPrincipal)
    }));
    onAlumnosChange(nuevosAlumnos);
  };

  const handleEliminarAlumno = (alumnoId: number) => {
    const nuevosAlumnos = alumnosSeleccionados.filter(item => item.alumno.id !== alumnoId);
    onAlumnosChange(nuevosAlumnos);
  };

  const alumnosParaModal = alumnosSeleccionados.map(item => item.alumno);

  return (
    <div className="space-y-4">
      {/* Botón para abrir modal */}
      <div>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          disabled={disabled}
          className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {alumnosSeleccionados.length === 0 
            ? 'Seleccionar Alumnos' 
            : `${alumnosSeleccionados.length} alumno${alumnosSeleccionados.length !== 1 ? 's' : ''} seleccionado${alumnosSeleccionados.length !== 1 ? 's' : ''}`
          }
        </button>
      </div>

      {/* Lista de alumnos seleccionados */}
      {alumnosSeleccionados.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Alumnos Seleccionados:
          </h4>
          
          {alumnosSeleccionados.map((item, index) => (
            <div
              key={item.alumno.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Información del alumno */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {item.alumno.nombres.charAt(0)}{item.alumno.apellidos.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900">
                        {item.alumno.apellidos}, {item.alumno.nombres}
                      </h5>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        {item.alumno.dni && (
                          <span>DNI: {item.alumno.dni}</span>
                        )}
                        {item.alumno.fechaNacimiento && (
                          <span>
                            {new Date(item.alumno.fechaNacimiento).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Configuración de la relación */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Selector de parentesco */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Parentesco
                      </label>
                      <select
                        value={item.parentesco}
                        onChange={(e) => handleCambiarParentesco(item.alumno.id, e.target.value as Parentesco)}
                        disabled={disabled}
                        className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      >
                        {PARENTESCOS.map(parentesco => (
                          <option key={parentesco} value={parentesco}>
                            {parentesco.charAt(0).toUpperCase() + parentesco.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Checkbox apoderado principal */}
                    <div className="flex items-center">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={item.esPrincipal}
                          onChange={(e) => handleCambiarPrincipal(item.alumno.id, e.target.checked)}
                          disabled={disabled}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                        />
                      </div>
                      <div className="ml-2">
                        <label className="text-xs font-medium text-gray-700">
                          Apoderado Principal
                        </label>
                        <p className="text-xs text-gray-500">
                          Responsable principal del alumno
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón eliminar */}
                <button
                  type="button"
                  onClick={() => handleEliminarAlumno(item.alumno.id)}
                  disabled={disabled}
                  className="ml-4 text-red-400 hover:text-red-600 focus:outline-none disabled:opacity-50"
                  title="Eliminar alumno"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Importante:</strong> Al menos un apoderado debe ser marcado como "Principal" para cada alumno.
                  El apoderado principal será el contacto primario para comunicaciones oficiales.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de selección */}
      <ModalSeleccionAlumnos
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSelect={handleSeleccionarAlumnos}
        alumnosSeleccionados={alumnosParaModal}
        multiSelect={true}
      />
    </div>
  );
}
