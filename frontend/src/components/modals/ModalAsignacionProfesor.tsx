'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, UserGroupIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { 
  ProfesorAsignacionFormData,
  SalonParaAsignacion,
  ProfesorParaAsignacion,
  EstadoFormularioAsignacion
} from '@/types/profesor-asignacion';

interface ModalAsignacionProfesorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProfesorAsignacionFormData) => Promise<void>;
  loading?: boolean;
}

export default function ModalAsignacionProfesor({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading = false 
}: ModalAsignacionProfesorProps) {
  const [estado, setEstado] = useState<EstadoFormularioAsignacion>({
    salonSeleccionado: null,
    cursoSeleccionado: null,
    profesorSeleccionado: null,
    paso: 'salon'
  });

  const [salones, setSalones] = useState<SalonParaAsignacion[]>([]);
  const [profesores, setProfesores] = useState<ProfesorParaAsignacion[]>([]);
  const [loadingSalones, setLoadingSalones] = useState(false);
  const [loadingProfesores, setLoadingProfesores] = useState(false);
  const [filtroSalon, setFiltroSalon] = useState('');

  // Cargar salones al abrir modal
  useEffect(() => {
    if (isOpen) {
      cargarSalones();
      cargarProfesores();
    }
  }, [isOpen]);

  const cargarSalones = async () => {
    setLoadingSalones(true);
    try {
      const response = await fetch('/api/salones', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Respuesta salones:', data); // Debug
        
        // Verificar estructura de respuesta
        const salonesList = data.data?.salones || data.salones || data || [];
        
        // Cargar cursos para cada salón
        const salonesConCursos = await Promise.all(
          salonesList.map(async (salon: any) => {
            const cursosResponse = await fetch(`/api/salones/${salon.id}/cursos`, {
              credentials: 'include'
            });
            if (cursosResponse.ok) {
              const cursosData = await cursosResponse.json();
              console.log('Respuesta cursos:', cursosData); // Debug
              
              // Extraer los cursos de SalonCurso y mapear a formato esperado
              const cursosDelSalon = cursosData.cursos || [];
              const cursosFormateados = cursosDelSalon.map((salonCurso: any) => ({
                id: salonCurso.curso?.id || salonCurso.cursoId,
                nombre: salonCurso.curso?.nombre || 'Curso sin nombre',
                descripcion: salonCurso.curso?.descripcion,
                color: salonCurso.curso?.color
              }));
              
              return {
                ...salon,
                cursos: cursosFormateados
              };
            }
            return { ...salon, cursos: [] };
          })
        );
        setSalones(salonesConCursos);
      }
    } catch (error) {
      console.error('Error al cargar salones:', error);
    } finally {
      setLoadingSalones(false);
    }
  };

  const cargarProfesores = async () => {
    setLoadingProfesores(true);
    try {
      const response = await fetch('/api/profesores', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Respuesta profesores:', data); // Debug
        
        // Verificar estructura de respuesta
        const profesoresList = data.data?.profesores || data.profesores || data || [];
        setProfesores(profesoresList);
      }
    } catch (error) {
      console.error('Error al cargar profesores:', error);
    } finally {
      setLoadingProfesores(false);
    }
  };

  const handleSubmit = async () => {
    if (!estado.salonSeleccionado || !estado.cursoSeleccionado || !estado.profesorSeleccionado) {
      return;
    }

    const formData: ProfesorAsignacionFormData = {
      profesorId: estado.profesorSeleccionado.id,
      salonId: estado.salonSeleccionado.id,
      cursoId: estado.cursoSeleccionado.id,
      activo: true
    };

    await onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    if (!loading) {
      setEstado({
        salonSeleccionado: null,
        cursoSeleccionado: null,
        profesorSeleccionado: null,
        paso: 'salon'
      });
      setFiltroSalon('');
      onClose();
    }
  };

  const saloneFiltrados = salones.filter(salon =>
    salon.grado.toLowerCase().includes(filtroSalon.toLowerCase()) ||
    salon.seccion.toLowerCase().includes(filtroSalon.toLowerCase()) ||
    salon.colegioNivel.nivel.nombre.toLowerCase().includes(filtroSalon.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/25" />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <UserGroupIcon className="h-6 w-6 text-teal-600 mr-2" />
                <Dialog.Title className="text-lg font-medium text-gray-900">
                  Asignar Profesor
                </Dialog.Title>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className={`flex items-center ${estado.paso === 'salon' ? 'text-teal-600' : estado.salonSeleccionado ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    estado.paso === 'salon' ? 'bg-teal-100' : estado.salonSeleccionado ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Salón</span>
                </div>
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                <div className={`flex items-center ${estado.paso === 'curso' ? 'text-teal-600' : estado.cursoSeleccionado ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    estado.paso === 'curso' ? 'bg-teal-100' : estado.cursoSeleccionado ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Curso</span>
                </div>
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                <div className={`flex items-center ${estado.paso === 'profesor' ? 'text-teal-600' : estado.profesorSeleccionado ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    estado.paso === 'profesor' ? 'bg-teal-100' : estado.profesorSeleccionado ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium">Profesor</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
              
              {/* Paso 1: Seleccionar Salón */}
              {estado.paso === 'salon' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Seleccionar Salón</h3>
                  
                  {/* Filtro */}
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Buscar salón por grado, sección o nivel..."
                      value={filtroSalon}
                      onChange={(e) => setFiltroSalon(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {loadingSalones ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Cargando salones...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                      {saloneFiltrados.map((salon) => (
                        <button
                          key={salon.id}
                          onClick={() => {
                            setEstado(prev => ({ ...prev, salonSeleccionado: salon, paso: 'curso' }));
                          }}
                          className="p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors text-left"
                        >
                          <div className="font-medium text-gray-900">
                            {salon.grado} {salon.seccion}
                          </div>
                          <div className="text-sm text-gray-500">
                            {salon.colegioNivel.nivel.nombre}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {salon.cursos.length} curso(s) disponible(s)
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Paso 2: Seleccionar Curso */}
              {estado.paso === 'curso' && estado.salonSeleccionado && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Seleccionar Curso - {estado.salonSeleccionado.grado} {estado.salonSeleccionado.seccion}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                    {estado.salonSeleccionado.cursos.map((curso) => (
                      <button
                        key={curso.id}
                        onClick={() => {
                          setEstado(prev => ({ 
                            ...prev, 
                            cursoSeleccionado: curso, 
                            paso: 'profesor' 
                          }));
                        }}
                        className="p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors text-left"
                      >
                        <div className="flex items-center">
                          {curso.color && (
                            <div 
                              className="w-4 h-4 rounded-full mr-3"
                              style={{ backgroundColor: curso.color }}
                            ></div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{curso.nombre}</div>
                            {curso.descripcion && (
                              <div className="text-sm text-gray-500">{curso.descripcion}</div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Paso 3: Seleccionar Profesor */}
              {estado.paso === 'profesor' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Seleccionar Profesor - {estado.cursoSeleccionado?.nombre}
                  </h3>
                  
                  {loadingProfesores ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Cargando profesores...</p>
                    </div>
                  ) : profesores.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay profesores disponibles</h3>
                      <p className="text-gray-500 text-sm">
                        Necesitas registrar profesores antes de poder asignarlos a cursos.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                      {profesores.map((profesor) => (
                        <button
                          key={profesor.id}
                          onClick={() => {
                            setEstado(prev => ({ ...prev, profesorSeleccionado: profesor }));
                          }}
                          className={`p-4 border rounded-lg transition-colors text-left ${
                            estado.profesorSeleccionado?.id === profesor.id
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-teal-500 hover:bg-teal-50'
                          }`}
                        >
                          <div className="font-medium text-gray-900">
                            {profesor.usuarioRol.usuario.nombres} {profesor.usuarioRol.usuario.apellidos}
                          </div>
                          <div className="text-sm text-gray-500">
                            {profesor.usuarioRol.usuario.email}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-6">
              <div>
                {estado.paso !== 'salon' && (
                  <button
                    onClick={() => {
                      if (estado.paso === 'curso') {
                        setEstado(prev => ({ ...prev, paso: 'salon', cursoSeleccionado: null }));
                      } else if (estado.paso === 'profesor') {
                        setEstado(prev => ({ ...prev, paso: 'curso', profesorSeleccionado: null }));
                      }
                    }}
                    disabled={loading}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeftIcon className="h-4 w-4 mr-1" />
                    Anterior
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                
                {estado.paso === 'profesor' && estado.profesorSeleccionado && (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 disabled:opacity-50 flex items-center"
                  >
                    {loading && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {loading ? 'Asignando...' : 'Asignar Profesor'}
                  </button>
                )}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
