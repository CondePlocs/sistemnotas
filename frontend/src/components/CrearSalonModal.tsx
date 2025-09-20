'use client';

import { useState, useEffect } from 'react';
import { NivelEducativo } from '@/types/colegio';

interface CrearSalonModalProps {
  nivel: NivelEducativo;
  onClose: () => void;
  onSubmit: (salonData: SalonFormData) => void;
}

interface SalonFormData {
  nivel: NivelEducativo;
  grado: string;
  seccion: string;
}

// Sugerencias por nivel
const SUGERENCIAS_GRADOS = {
  [NivelEducativo.INICIAL]: [
    '3 años', '4 años', '5 años'
  ],
  [NivelEducativo.PRIMARIA]: [
    '1° Primaria', '2° Primaria', '3° Primaria', 
    '4° Primaria', '5° Primaria', '6° Primaria'
  ],
  [NivelEducativo.SECUNDARIA]: [
    '1° Secundaria', '2° Secundaria', '3° Secundaria',
    '4° Secundaria', '5° Secundaria'
  ]
};

const SUGERENCIAS_SECCIONES = {
  [NivelEducativo.INICIAL]: [
    'Único', 'Los Leones', 'Los Tigres', 'Las Águilas', 
    'Rojo', 'Azul', 'Verde', 'Amarillo',
    'A', 'B', 'C'
  ],
  [NivelEducativo.PRIMARIA]: [
    'Único', 'A', 'B', 'C', 'D', 'E'
  ],
  [NivelEducativo.SECUNDARIA]: [
    'Único', 'A', 'B', 'C', 'D', 'E'
  ]
};

export default function CrearSalonModal({ nivel, onClose, onSubmit }: CrearSalonModalProps) {
  const [formData, setFormData] = useState<SalonFormData>({
    nivel,
    grado: '',
    seccion: 'Único' // Por defecto
  });

  const [gradoPersonalizado, setGradoPersonalizado] = useState(false);
  const [seccionPersonalizada, setSeccionPersonalizada] = useState(false);

  const sugerenciasGrados = SUGERENCIAS_GRADOS[nivel];
  const sugerenciasSecciones = SUGERENCIAS_SECCIONES[nivel];

  const getNivelInfo = (nivel: NivelEducativo) => {
    switch (nivel) {
      case NivelEducativo.INICIAL:
        return { titulo: 'Inicial', icon: '👶', color: 'pink' };
      case NivelEducativo.PRIMARIA:
        return { titulo: 'Primaria', icon: '📚', color: 'blue' };
      case NivelEducativo.SECUNDARIA:
        return { titulo: 'Secundaria', icon: '🎓', color: 'green' };
    }
  };

  const info = getNivelInfo(nivel);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.grado.trim()) {
      alert('Por favor ingresa el grado/año');
      return;
    }
    if (!formData.seccion.trim()) {
      alert('Por favor ingresa la sección');
      return;
    }
    onSubmit(formData);
  };

  const handleGradoChange = (valor: string) => {
    setFormData(prev => ({ ...prev, grado: valor }));
  };

  const handleSeccionChange = (valor: string) => {
    setFormData(prev => ({ ...prev, seccion: valor }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-${info.color}-600 text-white p-4 rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{info.icon}</span>
              <h2 className="text-xl font-bold">Crear Salón - {info.titulo}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Grado/Año */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {nivel === NivelEducativo.INICIAL ? 'Edad/Año' : 'Grado'}
            </label>
            
            <div className="space-y-3">
              {/* Toggle personalizado */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="grado-personalizado"
                  checked={gradoPersonalizado}
                  onChange={(e) => setGradoPersonalizado(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="grado-personalizado" className="text-sm text-gray-600">
                  Escribir manualmente
                </label>
              </div>

              {gradoPersonalizado ? (
                // Input manual
                <input
                  type="text"
                  value={formData.grado}
                  onChange={(e) => handleGradoChange(e.target.value)}
                  placeholder={nivel === NivelEducativo.INICIAL ? 'Ej: 3 años' : 'Ej: 1° Primaria'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                // Dropdown con sugerencias
                <select
                  value={formData.grado}
                  onChange={(e) => handleGradoChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar {nivel === NivelEducativo.INICIAL ? 'edad' : 'grado'}</option>
                  {sugerenciasGrados.map((grado) => (
                    <option key={grado} value={grado}>
                      {grado}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Sección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sección
            </label>
            
            <div className="space-y-3">
              {/* Toggle personalizado */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="seccion-personalizada"
                  checked={seccionPersonalizada}
                  onChange={(e) => setSeccionPersonalizada(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="seccion-personalizada" className="text-sm text-gray-600">
                  Escribir manualmente
                </label>
              </div>

              {seccionPersonalizada ? (
                // Input manual
                <input
                  type="text"
                  value={formData.seccion}
                  onChange={(e) => handleSeccionChange(e.target.value)}
                  placeholder="Ej: Los Leones, Rojo, A, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                // Dropdown con sugerencias
                <select
                  value={formData.seccion}
                  onChange={(e) => handleSeccionChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sugerenciasSecciones.map((seccion) => (
                    <option key={seccion} value={seccion}>
                      {seccion}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Ayuda contextual */}
            <div className="mt-2 text-xs text-gray-500">
              {nivel === NivelEducativo.INICIAL && (
                <p>💡 En inicial puedes usar nombres creativos como "Los Leones", "Rojo", etc.</p>
              )}
              {nivel !== NivelEducativo.INICIAL && (
                <p>💡 Usa "Único" si solo hay una sección por grado, o letras A, B, C, etc.</p>
              )}
            </div>
          </div>

          {/* Preview */}
          {formData.grado && formData.seccion && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Vista previa:</div>
              <div className="font-semibold text-gray-800">
                {formData.grado} - {formData.seccion}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formData.grado.trim() || !formData.seccion.trim()}
              className={`flex-1 px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed bg-${info.color}-600 hover:bg-${info.color}-700`}
            >
              Crear Salón
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
