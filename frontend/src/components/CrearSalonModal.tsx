'use client';

import { useState, useEffect } from 'react';
import { NivelEducativo } from '@/types/colegio';
import { 
  ModoCreacion, 
  CreacionManualForm, 
  CreacionAutomaticaForm,
  RANGOS_PREDEFINIDOS,
  LETRAS_SECCIONES,
  generarRangoSecciones,
  validarRango,
  Turno
} from '@/types/salon';

interface CrearSalonModalProps {
  nivel: NivelEducativo;
  onClose: () => void;
  onSubmit: (salonData: any) => void;
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
  // Estado del modo de creación
  const [modo, setModo] = useState<ModoCreacion>('manual');
  
  // Estado para el turno (compartido entre ambos modos)
  const [turno, setTurno] = useState<Turno>(Turno.MAÑANA);
  
  // Estados para modo manual
  const [formDataManual, setFormDataManual] = useState<CreacionManualForm>({
    nivel,
    grado: '',
    seccion: 'Único',
    gradoPersonalizado: false,
    seccionPersonalizada: false
  });

  // Estados para modo automático
  const [formDataAutomatico, setFormDataAutomatico] = useState<CreacionAutomaticaForm>({
    nivel,
    grado: '',
    rango: { desde: 'A', hasta: 'C' }
  });

  // Preview de salones a crear (modo automático)
  const [previewSalones, setPreviewSalones] = useState<string[]>([]);

  const sugerenciasGrados = SUGERENCIAS_GRADOS[nivel];
  const sugerenciasSecciones = SUGERENCIAS_SECCIONES[nivel];

  // Información del nivel
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

  // Actualizar preview cuando cambian los datos del modo automático
  useEffect(() => {
    if (modo === 'automatico' && formDataAutomatico.grado && validarRango(formDataAutomatico.rango.desde, formDataAutomatico.rango.hasta)) {
      const secciones = generarRangoSecciones(formDataAutomatico.rango.desde, formDataAutomatico.rango.hasta);
      setPreviewSalones(secciones);
    } else {
      setPreviewSalones([]);
    }
  }, [modo, formDataAutomatico.grado, formDataAutomatico.rango.desde, formDataAutomatico.rango.hasta]);

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modo === 'manual') {
      // Validar modo manual
      if (!formDataManual.grado.trim() || !formDataManual.seccion.trim()) {
        alert('Por favor completa todos los campos');
        return;
      }
      
      // Enviar datos del modo manual
      onSubmit({
        tipo: 'manual',
        nivel: formDataManual.nivel,
        grado: formDataManual.grado,
        seccion: formDataManual.seccion,
        turno: turno
      });
    } else {
      // Validar modo automático
      if (!formDataAutomatico.grado.trim() || previewSalones.length === 0) {
        alert('Por favor completa la configuración automática');
        return;
      }
      
      // Enviar datos del modo automático
      onSubmit({
        tipo: 'automatico',
        nivel: formDataAutomatico.nivel,
        grado: formDataAutomatico.grado,
        secciones: previewSalones,
        turno: turno
      });
    }
  };

  // Handlers para modo manual
  const handleGradoManualChange = (valor: string) => {
    setFormDataManual(prev => ({ ...prev, grado: valor }));
  };

  const handleSeccionManualChange = (valor: string) => {
    setFormDataManual(prev => ({ ...prev, seccion: valor }));
  };

  // Handlers para modo automático
  const handleGradoAutomaticoChange = (valor: string) => {
    setFormDataAutomatico(prev => ({ ...prev, grado: valor }));
  };

  const handleRangoChange = (campo: 'desde' | 'hasta', valor: string) => {
    setFormDataAutomatico(prev => ({
      ...prev,
      rango: { ...prev.rango, [campo]: valor }
    }));
  };

  const aplicarRangoPredefinido = (rangoKey: string) => {
    const rango = RANGOS_PREDEFINIDOS[rangoKey];
    if (rango && rango.secciones.length > 0) {
      setFormDataAutomatico(prev => ({
        ...prev,
        rango: {
          desde: rango.secciones[0],
          hasta: rango.secciones[rango.secciones.length - 1]
        }
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
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
          {/* Selector de Modo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              🔄 Modo de Creación
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="modo"
                  value="manual"
                  checked={modo === 'manual'}
                  onChange={(e) => setModo(e.target.value as ModoCreacion)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Manual (personalizado)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="modo"
                  value="automatico"
                  checked={modo === 'automatico'}
                  onChange={(e) => setModo(e.target.value as ModoCreacion)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Automático (por rango) ✨</span>
              </label>
            </div>
          </div>

          {/* Selector de Turno */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              🕐 Turno del Salón
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex items-center justify-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="turno"
                  value={Turno.MAÑANA}
                  checked={turno === Turno.MAÑANA}
                  onChange={(e) => setTurno(e.target.value as Turno)}
                  className="sr-only"
                />
                <div className={`text-center ${turno === Turno.MAÑANA ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
                  <div className="text-2xl mb-1">🌅</div>
                  <div className="text-sm">Mañana</div>
                  <div className="text-xs text-gray-500">7:00 - 12:00</div>
                </div>
              </label>
              <label className="flex items-center justify-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="turno"
                  value={Turno.TARDE}
                  checked={turno === Turno.TARDE}
                  onChange={(e) => setTurno(e.target.value as Turno)}
                  className="sr-only"
                />
                <div className={`text-center ${turno === Turno.TARDE ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                  <div className="text-2xl mb-1">🌇</div>
                  <div className="text-sm">Tarde</div>
                  <div className="text-xs text-gray-500">13:00 - 18:00</div>
                </div>
              </label>
              <label className="flex items-center justify-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="turno"
                  value={Turno.NOCHE}
                  checked={turno === Turno.NOCHE}
                  onChange={(e) => setTurno(e.target.value as Turno)}
                  className="sr-only"
                />
                <div className={`text-center ${turno === Turno.NOCHE ? 'text-purple-600 font-semibold' : 'text-gray-600'}`}>
                  <div className="text-2xl mb-1">🌙</div>
                  <div className="text-sm">Noche</div>
                  <div className="text-xs text-gray-500">19:00 - 22:00</div>
                </div>
              </label>
            </div>
          </div>

          {/* Formulario Manual */}
          {modo === 'manual' && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-800 mb-4">📝 Creación Manual</h3>
              
              {/* Grado Manual */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {nivel === NivelEducativo.INICIAL ? 'Edad/Año' : 'Grado'}
                </label>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="grado-manual-personalizado"
                      checked={formDataManual.gradoPersonalizado}
                      onChange={(e) => setFormDataManual(prev => ({ ...prev, gradoPersonalizado: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="grado-manual-personalizado" className="text-sm text-gray-600">
                      Escribir manualmente
                    </label>
                  </div>

                  {formDataManual.gradoPersonalizado ? (
                    <input
                      type="text"
                      value={formDataManual.grado}
                      onChange={(e) => handleGradoManualChange(e.target.value)}
                      placeholder={nivel === NivelEducativo.INICIAL ? 'Ej: 3 años' : 'Ej: 1° Primaria'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <select
                      value={formDataManual.grado}
                      onChange={(e) => handleGradoManualChange(e.target.value)}
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

              {/* Sección Manual */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sección
                </label>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="seccion-manual-personalizada"
                      checked={formDataManual.seccionPersonalizada}
                      onChange={(e) => setFormDataManual(prev => ({ ...prev, seccionPersonalizada: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="seccion-manual-personalizada" className="text-sm text-gray-600">
                      Escribir manualmente
                    </label>
                  </div>

                  {formDataManual.seccionPersonalizada ? (
                    <input
                      type="text"
                      value={formDataManual.seccion}
                      onChange={(e) => handleSeccionManualChange(e.target.value)}
                      placeholder="Ej: Los Leones, Rojo, A, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <select
                      value={formDataManual.seccion}
                      onChange={(e) => handleSeccionManualChange(e.target.value)}
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
              </div>

              {/* Preview Manual */}
              {formDataManual.grado && formDataManual.seccion && (
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-sm text-gray-600">Vista previa:</div>
                  <div className="font-semibold text-gray-800">
                    {formDataManual.grado} - {formDataManual.seccion}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Turno: <span className="font-medium">{turno}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Formulario Automático */}
          {modo === 'automatico' && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold text-gray-800 mb-4">✨ Creación Automática</h3>
              
              {/* Grado Automático */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {nivel === NivelEducativo.INICIAL ? 'Edad/Año' : 'Grado'}
                </label>
                <select
                  value={formDataAutomatico.grado}
                  onChange={(e) => handleGradoAutomaticoChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar {nivel === NivelEducativo.INICIAL ? 'edad' : 'grado'}</option>
                  {sugerenciasGrados.map((grado) => (
                    <option key={grado} value={grado}>
                      {grado}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plantillas Rápidas */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🚀 Plantillas Rápidas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(RANGOS_PREDEFINIDOS).map(([key, rango]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => aplicarRangoPredefinido(key)}
                      className="p-2 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 text-left"
                    >
                      <div className="font-semibold">{rango.nombre}</div>
                      <div className="text-gray-500">{rango.descripcion}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rango Personalizado */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎯 Rango de Secciones
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Desde</label>
                    <select
                      value={formDataAutomatico.rango.desde}
                      onChange={(e) => handleRangoChange('desde', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {LETRAS_SECCIONES.map((letra) => (
                        <option key={letra} value={letra}>
                          {letra}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-gray-400 mt-6">→</div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                    <select
                      value={formDataAutomatico.rango.hasta}
                      onChange={(e) => handleRangoChange('hasta', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {LETRAS_SECCIONES.map((letra) => (
                        <option key={letra} value={letra}>
                          {letra}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Preview Automático */}
              {previewSalones.length > 0 && formDataAutomatico.grado && (
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-sm text-gray-600 mb-2">Vista previa:</div>
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>{formDataAutomatico.grado}</strong> - Secciones: {previewSalones.join(', ')}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Turno: <span className="font-medium">{turno}</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    Total: {previewSalones.length} salones
                  </div>
                </div>
              )}
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
              disabled={
                modo === 'manual' 
                  ? !formDataManual.grado.trim() || !formDataManual.seccion.trim()
                  : !formDataAutomatico.grado.trim() || previewSalones.length === 0
              }
              className={`flex-1 px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed bg-${info.color}-600 hover:bg-${info.color}-700`}
            >
              {modo === 'manual' 
                ? 'Crear Salón' 
                : `Crear ${previewSalones.length} Salones`
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
