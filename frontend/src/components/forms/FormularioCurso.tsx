"use client";

import { useState } from 'react';
import { 
  CursoFormData, 
  CompetenciaFormData, 
  NivelEducativo, 
  COLORES_CURSO, 
  NIVELES_EDUCATIVOS,
  validarCursoFormData 
} from '@/types/curso';
import SelectorCompetencias from './SelectorCompetencias';
import ColorSelector from './ColorSelector';

interface FormularioCursoProps {
  onSuccess?: (curso: any) => void;
  onCancel?: () => void;
  cursoInicial?: Partial<CursoFormData>;
  modo?: 'crear' | 'editar';
}

export default function FormularioCurso({ 
  onSuccess, 
  onCancel, 
  cursoInicial, 
  modo = 'crear' 
}: FormularioCursoProps) {
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [formData, setFormData] = useState<CursoFormData>({
    nombre: cursoInicial?.nombre || '',
    descripcion: cursoInicial?.descripcion || '',
    nivel: cursoInicial?.nivel || NivelEducativo.PRIMARIA,
    color: cursoInicial?.color || COLORES_CURSO[0].valor,
    competencias: cursoInicial?.competencias || []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a corregir
    if (errores.length > 0) {
      setErrores([]);
    }
  };

  const handleCompetenciasChange = (competencias: CompetenciaFormData[]) => {
    setFormData(prev => ({
      ...prev,
      competencias
    }));
    
    // Limpiar errores cuando se modifiquen las competencias
    if (errores.length > 0) {
      setErrores([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar datos
    const erroresValidacion = validarCursoFormData(formData);
    if (erroresValidacion.length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    setLoading(true);
    setErrores([]);

    try {
      const response = await fetch('/api/cursos', {
        method: modo === 'crear' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = 'Error al procesar la solicitud';
        
        try {
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage = errorData || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const resultado = await response.json();
      
      if (onSuccess) {
        onSuccess(resultado.curso);
      }
      
    } catch (error) {
      console.error('Error al guardar curso:', error);
      setErrores([error instanceof Error ? error.message : 'Error desconocido']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {modo === 'crear' ? 'Crear Nuevo Curso' : 'Editar Curso'}
        </h2>
        <p className="text-gray-600">
          {modo === 'crear' 
            ? 'Define un curso con sus competencias correspondientes' 
            : 'Modifica los datos del curso y sus competencias'
          }
        </p>
      </div>

      {/* Errores */}
      {errores.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="text-sm font-medium text-red-800">
              Se encontraron los siguientes errores:
            </h3>
          </div>
          <ul className="list-disc list-inside text-sm text-red-700">
            {errores.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre del Curso */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Curso *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Matemática, Comunicación, Personal Social"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Nivel Educativo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel Educativo *
              </label>
              <select
                name="nivel"
                value={formData.nivel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {NIVELES_EDUCATIVOS.map(nivel => (
                  <option key={nivel.valor} value={nivel.valor}>
                    {nivel.label} ({nivel.descripcion})
                  </option>
                ))}
              </select>
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (Opcional)
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={3}
                placeholder="Descripción del curso y sus objetivos..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sección de Color */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <ColorSelector
            value={formData.color || '#3B82F6'}
            onChange={(color) => setFormData(prev => ({ ...prev, color }))}
            disabled={loading}
            showPresets={true}
            showCustomPicker={true}
            label="Color del curso"
            placeholder="Seleccionar color para el curso"
          />
        </div>

        {/* Competencias */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Competencias del Curso *
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Define las competencias que los estudiantes deben desarrollar en este curso.
          </p>
          
          <SelectorCompetencias
            competencias={formData.competencias}
            onChange={handleCompetenciasChange}
            disabled={loading}
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading || formData.competencias.length === 0}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </div>
            ) : (
              modo === 'crear' ? 'Crear Curso' : 'Actualizar Curso'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
