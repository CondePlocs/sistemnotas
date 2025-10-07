"use client";

import { useState } from 'react';
import { 
  CompetenciaFormData, 
  validarCompetenciaFormData 
} from '@/types/curso';

interface SelectorCompetenciasProps {
  competencias: CompetenciaFormData[];
  onChange: (competencias: CompetenciaFormData[]) => void;
  disabled?: boolean;
  maxCompetencias?: number;
}

export default function SelectorCompetencias({ 
  competencias, 
  onChange, 
  disabled = false,
  maxCompetencias = 10 
}: SelectorCompetenciasProps) {
  const [modoEdicion, setModoEdicion] = useState<number | null>(null);
  const [competenciaTemp, setCompetenciaTemp] = useState<CompetenciaFormData>({
    nombre: ''
  });
  const [erroresTemp, setErroresTemp] = useState<string[]>([]);

  const iniciarNuevaCompetencia = () => {
    setCompetenciaTemp({
      nombre: ''
    });
    setModoEdicion(-1); // -1 indica nueva competencia
    setErroresTemp([]);
  };

  const iniciarEdicionCompetencia = (index: number) => {
    setCompetenciaTemp({ ...competencias[index] });
    setModoEdicion(index);
    setErroresTemp([]);
  };

  const cancelarEdicion = () => {
    setModoEdicion(null);
    setCompetenciaTemp({
      nombre: ''
    });
    setErroresTemp([]);
  };

  const guardarCompetencia = () => {
    // Validar competencia
    const errores = validarCompetenciaFormData(competenciaTemp);
    if (errores.length > 0) {
      setErroresTemp(errores);
      return;
    }

    const nuevasCompetencias = [...competencias];
    
    if (modoEdicion === -1) {
      // Nueva competencia
      nuevasCompetencias.push({ ...competenciaTemp });
    } else if (modoEdicion !== null) {
      // Editar competencia existente
      nuevasCompetencias[modoEdicion] = { ...competenciaTemp };
    }

    onChange(nuevasCompetencias);
    cancelarEdicion();
  };

  const eliminarCompetencia = (index: number) => {
    const nuevasCompetencias = competencias.filter((_, i) => i !== index);
    onChange(nuevasCompetencias);
    
    // Si estamos editando la competencia que se va a eliminar, cancelar edición
    if (modoEdicion === index) {
      cancelarEdicion();
    }
  };

  const moverCompetencia = (index: number, direccion: 'arriba' | 'abajo') => {
    const nuevasCompetencias = [...competencias];
    const nuevoIndex = direccion === 'arriba' ? index - 1 : index + 1;
    
    if (nuevoIndex >= 0 && nuevoIndex < competencias.length) {
      [nuevasCompetencias[index], nuevasCompetencias[nuevoIndex]] = 
      [nuevasCompetencias[nuevoIndex], nuevasCompetencias[index]];
      
      onChange(nuevasCompetencias);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setCompetenciaTemp(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a corregir
    if (erroresTemp.length > 0) {
      setErroresTemp([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Lista de Competencias Existentes */}
      {competencias.length > 0 && (
        <div className="space-y-3">
          {competencias.map((competencia, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
              {modoEdicion === index ? (
                // Modo Edición
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      Editando Competencia {index + 1}
                    </h4>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={guardarCompetencia}
                        disabled={disabled}
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={cancelarEdicion}
                        disabled={disabled}
                        className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                  
                  {/* Formulario de Edición */}
                  <FormularioCompetencia
                    competencia={competenciaTemp}
                    onChange={handleInputChange}
                    errores={erroresTemp}
                    disabled={disabled}
                  />
                </div>
              ) : (
                // Modo Vista
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {index + 1}
                      </span>
                      <h4 className="font-medium text-gray-900">{competencia.nombre}</h4>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-4">
                    {/* Botones de Orden */}
                    <button
                      type="button"
                      onClick={() => moverCompetencia(index, 'arriba')}
                      disabled={disabled || index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Mover arriba"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => moverCompetencia(index, 'abajo')}
                      disabled={disabled || index === competencias.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Mover abajo"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Botón Editar */}
                    <button
                      type="button"
                      onClick={() => iniciarEdicionCompetencia(index)}
                      disabled={disabled || modoEdicion !== null}
                      className="p-1 text-blue-500 hover:text-blue-700 disabled:opacity-30"
                      title="Editar competencia"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    
                    {/* Botón Eliminar */}
                    <button
                      type="button"
                      onClick={() => eliminarCompetencia(index)}
                      disabled={disabled}
                      className="p-1 text-red-500 hover:text-red-700 disabled:opacity-30"
                      title="Eliminar competencia"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formulario para Nueva Competencia */}
      {modoEdicion === -1 && (
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-blue-900">
              Nueva Competencia
            </h4>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={guardarCompetencia}
                disabled={disabled}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Agregar
              </button>
              <button
                type="button"
                onClick={cancelarEdicion}
                disabled={disabled}
                className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
          
          <FormularioCompetencia
            competencia={competenciaTemp}
            onChange={handleInputChange}
            errores={erroresTemp}
            disabled={disabled}
          />
        </div>
      )}

      {/* Botón Agregar Competencia */}
      {modoEdicion === null && (
        <button
          type="button"
          onClick={iniciarNuevaCompetencia}
          disabled={disabled || competencias.length >= maxCompetencias}
          className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">
              Agregar Competencia {competencias.length > 0 ? `(${competencias.length}/${maxCompetencias})` : ''}
            </span>
          </div>
        </button>
      )}

      {/* Mensaje de ayuda */}
      {competencias.length === 0 && modoEdicion === null && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm">
            Aún no has agregado competencias para este curso.
            <br />
            Haz clic en "Agregar Competencia" para comenzar.
          </p>
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para el formulario de competencia (simplificado)
interface FormularioCompetenciaProps {
  competencia: CompetenciaFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errores: string[];
  disabled: boolean;
}

function FormularioCompetencia({ competencia, onChange, errores, disabled }: FormularioCompetenciaProps) {
  return (
    <div className="space-y-3">
      {/* Errores */}
      {errores.length > 0 && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">
          <ul className="list-disc list-inside text-red-700">
            {errores.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Nombre */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Nombre de la Competencia *
        </label>
        <input
          type="text"
          name="nombre"
          value={competencia.nombre}
          onChange={onChange}
          placeholder="Ej: Domina números y operaciones matemáticas"
          disabled={disabled}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-[#333333] placeholder:text-[#999999]"
        />
      </div>
    </div>
  );
}
