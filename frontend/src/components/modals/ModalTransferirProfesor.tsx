'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, UserIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ModalTransferirProfesorProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (nuevoProfesorId: number) => void;
    asignacionActual: {
        id: number;
        profesorActual: string;
        curso: string;
        salon: string;
    } | null;
}

export default function ModalTransferirProfesor({
    isOpen,
    onClose,
    onConfirm,
    asignacionActual
}: ModalTransferirProfesorProps) {
    const [todosLosProfesores, setTodosLosProfesores] = useState<any[]>([]);
    const [profesorSeleccionado, setProfesorSeleccionado] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        if (isOpen) {
            cargarProfesores();
            setProfesorSeleccionado(null);
            setBusqueda('');
        }
    }, [isOpen]);

    const cargarProfesores = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/profesores', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📦 Respuesta completa:', data);
                console.log('📦 Tipo de data:', typeof data);
                console.log('📦 Es array?:', Array.isArray(data));

                // El endpoint devuelve DIRECTAMENTE el array, no { success: true, data: [...] }
                const profesores = Array.isArray(data) ? data : (data.data || []);
                console.log('👥 Total profesores:', profesores.length);

                if (profesores.length > 0) {
                    console.log('👤 Estructura primer profesor:', profesores[0]);
                    console.log('👤 Usuario del primer profesor:', profesores[0]?.usuarioRol?.usuario);
                }

                // Ordenar por ID descendente y tomar los primeros 20
                const profesoresOrdenados = profesores
                    .sort((a: any, b: any) => b.id - a.id)
                    .slice(0, 20);

                console.log('✅ Profesores a mostrar:', profesoresOrdenados.length);
                setTodosLosProfesores(profesoresOrdenados);
            } else {
                console.error('❌ Error al cargar profesores:', response.status);
            }
        } catch (error) {
            console.error('❌ Error al cargar profesores:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar profesores solo cuando hay búsqueda
    const profesoresMostrados = busqueda.trim() === ''
        ? todosLosProfesores // Mostrar los 20 primeros si no hay búsqueda
        : todosLosProfesores.filter(p => {
            // Acceso seguro a propiedades anidadas
            const usuario = p?.usuarioRol?.usuario;
            if (!usuario) return false;

            const termino = busqueda.toLowerCase();
            const nombres = (usuario.nombres || '').toLowerCase();
            const apellidos = (usuario.apellidos || '').toLowerCase();
            const email = (usuario.email || '').toLowerCase();
            const nombreCompleto = `${nombres} ${apellidos}`;
            const apellidoNombre = `${apellidos} ${nombres}`;

            return nombres.includes(termino) ||
                apellidos.includes(termino) ||
                email.includes(termino) ||
                nombreCompleto.includes(termino) ||
                apellidoNombre.includes(termino);
        });

    const handleConfirmar = () => {
        if (profesorSeleccionado) {
            onConfirm(profesorSeleccionado);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] p-6 rounded-t-2xl flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Transferir Asignación</h2>
                            <p className="text-white/90 mt-1">Selecciona el nuevo profesor para este grupo</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 overflow-y-auto">
                        {/* Información actual */}
                        {asignacionActual && (
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                                    <UserIcon className="h-5 w-5 mr-2" />
                                    Asignación Actual
                                </h3>
                                <div className="text-sm text-blue-800 space-y-2">
                                    <div className="flex items-start">
                                        <span className="font-semibold min-w-[100px]">Profesor:</span>
                                        <span className="flex-1">{asignacionActual.profesorActual}</span>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="font-semibold min-w-[100px]">Curso:</span>
                                        <span className="flex-1">{asignacionActual.curso}</span>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="font-semibold min-w-[100px]">Salón:</span>
                                        <span className="flex-1">{asignacionActual.salon}</span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-blue-300">
                                    <p className="text-xs text-blue-700">
                                        ℹ️ Todas las evaluaciones y notas registradas se transferirán al nuevo profesor
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Búsqueda */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Buscar Profesor
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, apellido o email..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all"
                                />
                            </div>
                            {busqueda.trim() === '' && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Mostrando los últimos 20 profesores registrados
                                </p>
                            )}
                        </div>

                        {/* Grid de profesores - 2 columnas */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Profesores Disponibles ({profesoresMostrados.length})
                            </label>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto"></div>
                                    <p className="text-gray-500 mt-4">Cargando profesores...</p>
                                </div>
                            ) : profesoresMostrados.length === 0 ? (
                                <div className="text-center py-12">
                                    <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500">
                                        {busqueda.trim() === ''
                                            ? 'No hay profesores registrados'
                                            : 'No se encontraron profesores'}
                                    </p>
                                    {busqueda && (
                                        <p className="text-sm text-gray-400 mt-1">Intenta con otros términos de búsqueda</p>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                                    {profesoresMostrados.map((profesor) => {
                                        // Acceso seguro a datos anidados
                                        const usuario = profesor?.usuarioRol?.usuario;
                                        if (!usuario) {
                                            console.warn('⚠️ Profesor sin datos de usuario:', profesor);
                                            return null;
                                        }

                                        const isSelected = profesorSeleccionado === profesor.id;
                                        const nombres = usuario.nombres || '';
                                        const apellidos = usuario.apellidos || '';
                                        const email = usuario.email || '';
                                        const iniciales = `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();

                                        return (
                                            <button
                                                key={profesor.id}
                                                onClick={() => setProfesorSeleccionado(profesor.id)}
                                                className={`text-left p-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                                                    ? 'border-[#8D2C1D] bg-[#8D2C1D]/10 shadow-md'
                                                    : 'border-gray-200 hover:border-[#8D2C1D]/50 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Avatar */}
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${isSelected ? 'bg-[#8D2C1D]' : 'bg-gray-400'
                                                        }`}>
                                                        {iniciales}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm text-gray-900 truncate">
                                                            {nombres} {apellidos}
                                                        </p>
                                                        <p className="text-xs text-gray-600 truncate">{email}</p>
                                                    </div>

                                                    {/* Check icon */}
                                                    {isSelected && (
                                                        <CheckCircleIcon className="h-5 w-5 text-[#8D2C1D] flex-shrink-0" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-colors font-medium text-gray-700"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirmar}
                            disabled={!profesorSeleccionado}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white rounded-xl hover:from-[#7A2518] hover:to-[#C55A1F] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl disabled:shadow-none"
                        >
                            Confirmar Transferencia
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
}
