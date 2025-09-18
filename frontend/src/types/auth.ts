export interface User {
  id: number;
  email: string;
  nombres?: string;
  apellidos?: string;
  dni?: string;
  telefono?: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
  roles: UserRole[];
}

export interface UserRole {
  rol: string;
  colegio_id?: number;
  colegio_nombre?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
}
