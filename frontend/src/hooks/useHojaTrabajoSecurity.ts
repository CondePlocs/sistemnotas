"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ContextoTrabajo } from '@/types/evaluaciones';

interface SecurityValidation {
  canAccess: boolean;
  isReadonly: boolean;
  isValidating: boolean;  // NUEVO: indica si aún está validando
  reason?: string;
  redirectTo?: string;
}

export const useHojaTrabajoSecurity = (
  contexto: ContextoTrabajo | null,
  asignacionId: string | null,
  periodoId: string | null
): SecurityValidation => {
  const { user } = useAuth();
  const [validation, setValidation] = useState<SecurityValidation>({
    canAccess: false,
    isReadonly: true,
    isValidating: true,  // Inicia validando
    reason: 'Validando acceso...'
  });

  useEffect(() => {
    // Log para debugging
    console.log('[Security] Iniciando validación:', {
      hasUser: !!user,
      hasContexto: !!contexto,
      asignacionId,
      periodoId,
      userColegioId: user?.roles?.find(r => r.colegio_id)?.colegio_id,
      contextoColegioId: contexto?.asignacion?.colegioId
    });

    if (!user || !contexto || !asignacionId || !periodoId) {
      setValidation({
        canAccess: false,
        isReadonly: true,
        isValidating: true,  // Aún esperando datos
        reason: 'Cargando datos...'
      });
      return;
    }

    // 1. Verificar que el usuario sea profesor
    const esProfesor = user.roles?.some(r => r.rol === 'PROFESOR');
    if (!esProfesor) {
      console.warn('[Security] Acceso denegado: Usuario no es profesor');
      setValidation({
        canAccess: false,
        isReadonly: true,
        isValidating: false,  // Validación completa - denegado
        reason: 'Solo los profesores pueden acceder a hojas de trabajo',
        redirectTo: '/profesor/dashboard'
      });
      return;
    }

    // 2. Verificar que el colegio coincida (si ambos datos están disponibles)
    const userColegioId = user.roles?.find(r => r.colegio_id)?.colegio_id;
    const contextoColegioId = contexto.asignacion.colegioId;

    if (userColegioId && contextoColegioId && userColegioId !== contextoColegioId) {
      console.warn('[Security] Acceso denegado: Colegio no coincide', {
        userColegioId,
        contextoColegioId
      });
      setValidation({
        canAccess: false,
        isReadonly: true,
        isValidating: false,  // Validación completa - denegado
        reason: 'No puedes acceder a hojas de trabajo de otros colegios',
        redirectTo: '/profesor/dashboard'
      });
      return;
    }

    // 3. Si llegamos aquí, el acceso es válido
    // El backend ya validó que tienes acceso a esta asignación
    console.log('[Security] Acceso autorizado');
    setValidation({
      canAccess: true,
      isReadonly: false,
      isValidating: false,  // Validación completa - autorizado
      reason: 'Acceso autorizado'
    });

  }, [user, contexto, asignacionId, periodoId]);

  return validation;
};

export default useHojaTrabajoSecurity;
