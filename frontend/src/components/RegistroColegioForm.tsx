'use client';

import { useState, useEffect } from 'react';
import { ColegioFormData, OPCIONES_NIVELES_EDUCATIVOS, DRE, UGEL, NivelEducativo } from '@/types/colegio';
import { NIVELES_EDUCATIVOS } from '@/types/nivel';

interface RegistroColegioFormProps {
  onSubmit: (data: ColegioFormData) => void;
  loading?: boolean;
}

export default function RegistroColegioForm({ onSubmit, loading = false }: RegistroColegioFormProps) {
  const [formData, setFormData] = useState<ColegioFormData>({
    nombre: '',
    codigoModular: '',
    distrito: '',
    direccion: '',
    ugelId: undefined,
    nivelesPermitidos: [] // ← Niveles educativos autorizados
  });

  const [dres, setDres] = useState<DRE[]>([]);
  const [ugeles, setUgeles] = useState<UGEL[]>([]);
  const [selectedDre, setSelectedDre] = useState<number | null>(null);
  const [loadingDres, setLoadingDres] = useState(true);
  const [loadingUgeles, setLoadingUgeles] = useState(false);

  // Cargar DREs al montar el componente
  useEffect(() => {
    const cargarDres = async () => {
      try {
        const response = await fetch('/api/ubicacion/dres');
        if (!response.ok) throw new Error('Error al cargar DREs');
        
        const dresData = await response.json();
        setDres(dresData);
      } catch (error) {
        console.error('Error al cargar DREs:', error);
      } finally {
        setLoadingDres(false);
      }
    };

    cargarDres();
  }, []);

  // Cargar UGELs cuando cambia la DRE seleccionada
  const handleDreChange = async (dreId: number) => {
    setSelectedDre(dreId);
    setFormData(prev => ({ ...prev, ugelId: undefined }));
    setUgeles([]);
    
    if (!dreId) return;

    setLoadingUgeles(true);
    try {
      const response = await fetch(`/api/ubicacion/ugeles/by-dre/${dreId}`);
      if (!response.ok) throw new Error('Error al cargar UGELs');
      
      const ugelesData = await response.json();
      setUgeles(ugelesData);
    } catch (error) {
      console.error('Error al cargar UGELs:', error);
    } finally {
      setLoadingUgeles(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'dre') {
      handleDreChange(parseInt(value) || 0);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ugelId' ? (parseInt(value) || undefined) : value
    }));
  };

  // Manejar checkboxes de niveles educativos
  const handleNivelChange = (nivel: NivelEducativo, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      nivelesPermitidos: checked 
        ? [...prev.nivelesPermitidos, nivel]
        : prev.nivelesPermitidos.filter(n => n !== nivel)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Registrar Nuevo Colegio</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre del Colegio */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Colegio *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: I.E. San Martín de Porres"
          />
        </div>

        {/* Selección DRE y UGEL */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Ubicación Administrativa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DRE */}
            <div>
              <label htmlFor="dre" className="block text-sm font-medium text-gray-700 mb-1">
                DRE (Dirección Regional de Educación) *
              </label>
              {loadingDres ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  Cargando DREs...
                </div>
              ) : (
                <select
                  id="dre"
                  name="dre"
                  value={selectedDre || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar DRE</option>
                  {dres.map((dre) => (
                    <option key={dre.id} value={dre.id}>
                      {dre.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* UGEL */}
            <div>
              <label htmlFor="ugelId" className="block text-sm font-medium text-gray-700 mb-1">
                UGEL (Unidad de Gestión Educativa Local) *
              </label>
              {loadingUgeles ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  Cargando UGELs...
                </div>
              ) : (
                <select
                  id="ugelId"
                  name="ugelId"
                  value={formData.ugelId || ''}
                  onChange={handleChange}
                  required
                  disabled={!selectedDre}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedDre ? 'Seleccionar UGEL' : 'Primero selecciona una DRE'}
                  </option>
                  {ugeles.map((ugel) => (
                    <option key={ugel.id} value={ugel.id}>
                      {ugel.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Niveles Educativos Permitidos */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Niveles Educativos Autorizados</h3>
          <p className="text-sm text-gray-600 mb-4">
            Selecciona los niveles que podrá gestionar este colegio. Solo podrán crear salones de los niveles marcados.
          </p>
          
          <div className="space-y-3">
            {OPCIONES_NIVELES_EDUCATIVOS.map((opcion) => (
              <div key={opcion.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white transition-colors">
                <input
                  type="checkbox"
                  id={`nivel-${opcion.value}`}
                  checked={formData.nivelesPermitidos.includes(opcion.value)}
                  onChange={(e) => handleNivelChange(opcion.value, e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor={`nivel-${opcion.value}`} className="flex items-center cursor-pointer">
                    <span className="text-2xl mr-2">{opcion.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{opcion.label}</div>
                      <div className="text-sm text-gray-600">{opcion.descripcion}</div>
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
          
          {formData.nivelesPermitidos.length === 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ Debes seleccionar al menos un nivel educativo para el colegio.
              </p>
            </div>
          )}
        </div>

        {/* Código Modular */}
        <div>
          <label htmlFor="codigoModular" className="block text-sm font-medium text-gray-700 mb-1">
            Código Modular
          </label>
          <input
            type="text"
            id="codigoModular"
            name="codigoModular"
            value={formData.codigoModular}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: 0123456"
          />
        </div>


        {/* Distrito */}
        <div>
          <label htmlFor="distrito" className="block text-sm font-medium text-gray-700 mb-1">
            Distrito
          </label>
          <input
            type="text"
            id="distrito"
            name="distrito"
            value={formData.distrito}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: San Juan de Lurigancho"
          />
        </div>

        {/* Dirección */}
        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Av. Los Próceres 123"
          />
        </div>

        {/* Botón Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || !formData.nombre.trim() || !formData.ugelId || formData.nivelesPermitidos.length === 0}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Registrando...' : 'Registrar Colegio'}
          </button>
        </div>
      </form>
    </div>
  );
}
