const API_BASE_URL = 'http://localhost:3001';

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  nombres?: string;
  apellidos?: string;
  dni?: string;
  telefono?: string;
  roles: Array<{
    rol: string;
    colegio_id?: number;
    colegio_nombre?: string;
  }>;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
}

// API calls con cookies automáticas
export const authAPI = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Importante para cookies
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en login');
    }

    return response.json();
  },

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error en logout');
    }
  },

  async checkAuth(): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch {
      return null;
    }
  },
};
