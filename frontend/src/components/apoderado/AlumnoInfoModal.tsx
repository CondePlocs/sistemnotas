"use client";

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlumnoApoderado } from '@/types/apoderado';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AlumnoInfoModalProps {
    alumno: AlumnoApoderado;
    isOpen: boolean;
    onClose: () => void;
}

export default function AlumnoInfoModal({ alumno, isOpen, onClose }: AlumnoInfoModalProps) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No especificada';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateAge = (dateString?: string) => {
        if (!dateString) return null;
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    // Render modal using portal to ensure it appears at document.body level (full screen)
    return createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
            {/* Backdrop oscuro */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Modal centrado */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] p-6 rounded-t-2xl z-10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Información del Estudiante</h2>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-white/10"
                                aria-label="Cerrar modal"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Información Personal */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-[#8D2C1D] border-b-2 border-[#E9E1C9] pb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Información Personal
                                </h3>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-semibold text-[#666666] uppercase tracking-wide">DNI</label>
                                        <p className="text-lg text-[#333333] font-medium">
                                            {alumno.dni || 'No registrado'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-[#666666] uppercase tracking-wide">Fecha de Nacimiento</label>
                                        <p className="text-lg text-[#333333] font-medium">
                                            {formatDate(alumno.fechaNacimiento)}
                                        </p>
                                        {calculateAge(alumno.fechaNacimiento) && (
                                            <p className="text-sm text-[#666666]">
                                                {calculateAge(alumno.fechaNacimiento)} años
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-[#666666] uppercase tracking-wide">Colegio</label>
                                        <p className="text-lg text-[#333333] font-medium">
                                            {alumno.colegio.nombre}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Información Académica */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-[#8D2C1D] border-b-2 border-[#E9E1C9] pb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                    Información Académica
                                </h3>

                                {alumno.salon ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-semibold text-[#666666] uppercase tracking-wide">Grado y Sección</label>
                                            <p className="text-lg text-[#333333] font-medium">
                                                {alumno.salon.grado} - Sección {alumno.salon.seccion}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-semibold text-[#666666] uppercase tracking-wide">Nivel Educativo</label>
                                            <p className="text-lg text-[#333333] font-medium">
                                                {alumno.salon.colegioNivel?.nivel?.nombre || 'No especificado'}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-semibold text-[#666666] uppercase tracking-wide">Parentesco</label>
                                            <p className="text-lg text-[#333333] font-medium capitalize">
                                                {alumno.parentesco}
                                                {alumno.esPrincipal && (
                                                    <span className="ml-2 px-2 py-1 bg-[#8D2C1D] text-white text-xs rounded-full">
                                                        Principal
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-[#666666]">
                                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <p>Sin salón asignado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="w-full bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#7A2518] hover:to-[#C55A1F] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
