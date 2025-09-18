"use client";

import { useAuth as useAuthContext } from '@/context/AuthContext';

// Re-exportar el hook para facilitar el uso
export const useAuth = useAuthContext;
