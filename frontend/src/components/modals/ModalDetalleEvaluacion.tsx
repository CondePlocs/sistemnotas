'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Evaluacion, UpdateEvaluacionDto } from '@/types/evaluaciones';
import { XMarkIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import ModalConfirmarPassword from './ModalConfirmarPassword';

interface ModalDetalleEvaluacionProps {
    isOpen: boolean;
    onClose: () => void;
    evaluacion: Evaluacion | null;
    onUpdate: (evaluacion: Evaluacion) => void;
}

export default function ModalDetalleEvaluacion({
    isOpen,
    onClose,
    evaluacion,
    onUpdate
}: ModalDetalleEvaluacionProps) {
    const [modoEdicion, setModoEdicion] = useState(false);
    const [nombre, setNombre] = useState('');
    const [fechaRevision, setFechaRevision] = useState('');
    const [cambiosPendientes, setCambiosPendientes] = useState(false);
    const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    // Cargar datos cuando se abre el modal
    useEffect(() => {
        if (evaluacion) {
            setNombre(evaluacion.nombre);
            setFechaRevision(evaluacion.fechaRevision || '');
            setModoEdicion(false);
            setCambiosPendientes(false);
            setError('');
        }
    }, [evaluacion]);

    // Detectar cambios
    useEffect(() => {
        if (evaluacion) {
            const hayCambios =
                nombre !== evaluacion.nombre ||
                fechaRevision !== (evaluacion.fechaRevision || '');
            setCambiosPendientes(hayCambios);
        }
    }, [nombre, fechaRevision, evaluacion]);

    const handleCancelar = () => {
        if (evaluacion) {
            setNombre(evaluacion.nombre);
            setFechaRevision(evaluacion.fechaRevision || '');
            setModoEdicion(false);
            setCambiosPendientes(false);
            setError('');
        }
    };

    const handleGuardar = () => {
        if (!cambiosPendientes) return;
        setModalPasswordAbierto(true);
    };

    const handleConfirmarPassword = async (password: string) => {
        if (!evaluacion) return;

        setGuardando(true);
        setError('');

        try {
            const updateDto: UpdateEvaluacionDto = {
                nombre: nombre !== evaluacion.nombre ? nombre : undefined,
                fechaRevision: fechaRevision !== (evaluacion.fechaRevision || '') ? (fechaRevision || undefined) : undefined,
                password
            };

            const response = await fetch(`/api/evaluaciones/${evaluacion.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateDto)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar la evaluación');
            }

            const evaluacionActualizada = await response.json();

            setModalPasswordAbierto(false);
            setModoEdicion(false);
            setCambiosPendientes(false);
            onUpdate(evaluacionActualizada);

        } catch (err: any) {
            setError(err.message || 'Error al actualizar la evaluación');
            setModalPasswordAbierto(false);
        } finally {
            setGuardando(false);
        }
    };

    const formatearFecha = (fecha: string | null) => {
        if (!fecha) return 'No especificada';
        return new Date(fecha).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!evaluacion) return null;

    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={onClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <Dialog.Title className="text-xl font-bold text-white">
                                                Detalles de Evaluación
                                            </Dialog.Title>
                                            <button
                                                onClick={onClose}
                                                className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/20"
                                            >
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-4">
                                        {error && (
                                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                                <p className="text-red-700 text-sm">{error}</p>
                                            </div>
                                        )}

                                        {/* Nombre de la Evaluación */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nombre de la Evaluación
                                            </label>
                                            {modoEdicion ? (
                                                <input
                                                    type="text"
                                                    value={nombre}
                                                    onChange={(e) => setNombre(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all"
                                                    placeholder="Nombre de la evaluación"
                                                />
                                            ) : (
                                                <div className="px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                                                    <p className="text-gray-900 font-medium">{nombre}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Fecha de Creación y Fecha de Revisión en la misma fila */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Fecha de Creación (Solo lectura) */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Fecha de Creación
                                                </label>
                                                <div className="px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                                                    <p className="text-gray-900">{formatearFecha(evaluacion.creadoEn)}</p>
                                                </div>
                                            </div>

                                            {/* Fecha de Revisión (Editable) */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Fecha de Revisión
                                                </label>
                                                {modoEdicion ? (
                                                    <input
                                                        type="date"
                                                        value={fechaRevision}
                                                        onChange={(e) => setFechaRevision(e.target.value)}
                                                        className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all"
                                                    />
                                                ) : (
                                                    <div className="px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                                                        <p className="text-gray-900">{formatearFecha(evaluacion.fechaRevision || null)}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Competencia */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Competencia
                                            </label>
                                            <div className="px-4 py-3 bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9] rounded-lg border-2 border-[#8D2C1D]/20">
                                                <p className="text-[#8D2C1D] font-medium">{evaluacion.competencia.nombre}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="px-6 py-4 bg-gradient-to-br from-[#FCE0C1] to-[#E9E1C9] border-t-2 border-[#8D2C1D]/20 flex justify-end gap-3">
                                        {!modoEdicion ? (
                                            <>
                                                <button
                                                    onClick={onClose}
                                                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#8D2C1D] hover:text-[#8D2C1D] transition-all font-medium"
                                                >
                                                    Cerrar
                                                </button>
                                                <button
                                                    onClick={() => setModoEdicion(true)}
                                                    className="px-6 py-2 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white rounded-lg hover:from-[#7A2518] hover:to-[#C85A1F] transition-all font-medium flex items-center gap-2"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                    Editar
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={handleCancelar}
                                                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-red-500 hover:text-red-600 transition-all font-medium"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={handleGuardar}
                                                    disabled={!cambiosPendientes || guardando}
                                                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <CheckIcon className="h-5 w-5" />
                                                    {guardando ? 'Guardando...' : 'Guardar Cambios'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Modal de Confirmación de Contraseña */}
            <ModalConfirmarPassword
                isOpen={modalPasswordAbierto}
                onClose={() => setModalPasswordAbierto(false)}
                onConfirm={handleConfirmarPassword}
                title="Confirmar Cambios"
                message="Por seguridad, ingresa tu contraseña para confirmar los cambios en la evaluación."
            />
        </>
    );
}
