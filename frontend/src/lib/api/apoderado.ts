import { AlumnoApoderado, CursoAlumno, CursoDetalle } from '@/types/apoderado';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApoderadoAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Usar cookies en lugar de localStorage
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtener los alumnos a cargo del apoderado autenticado
   */
  async obtenerMisAlumnos(): Promise<AlumnoApoderado[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>('/api/apoderados/mis-alumnos');
      
      return response.data.map(relacion => ({
        id: relacion.alumno.id,
        dni: relacion.alumno.dni,
        nombres: relacion.alumno.nombres,
        apellidos: relacion.alumno.apellidos,
        fechaNacimiento: relacion.alumno.fechaNacimiento,
        sexo: relacion.alumno.sexo,
        activo: relacion.alumno.activo,
        salon: relacion.alumno.salon?.salon ? {
          id: relacion.alumno.salon.salon.id,
          grado: relacion.alumno.salon.salon.grado,
          seccion: relacion.alumno.salon.salon.seccion,
          colegioNivel: relacion.alumno.salon.salon.colegioNivel?.nivel ? {
            nivel: {
              id: relacion.alumno.salon.salon.colegioNivel.nivel.id,
              nombre: relacion.alumno.salon.salon.colegioNivel.nivel.nombre
            }
          } : undefined
        } : undefined,
        colegio: {
          id: relacion.alumno.colegio.id,
          nombre: relacion.alumno.colegio.nombre
        },
        parentesco: relacion.parentesco,
        esPrincipal: relacion.esPrincipal
      }));
    } catch (error) {
      console.error('Error obteniendo alumnos del apoderado:', error);
      throw error;
    }
  }

  /**
   * Obtener los cursos de un alumno específico
   */
  async obtenerCursosAlumno(alumnoId: number): Promise<CursoAlumno[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/api/apoderados/alumno/${alumnoId}/cursos`);
      
      return response.data.map(curso => ({
        id: curso.id,
        nombre: curso.nombre,
        descripcion: curso.descripcion,
        color: curso.color,
        profesor: {
          id: curso.profesor.id,
          nombres: curso.profesor.nombres,
          apellidos: curso.profesor.apellidos
        },
        promedioFinal: curso.promedioFinal,
        competencias: curso.competencias || []
      }));
    } catch (error) {
      console.error('Error obteniendo cursos del alumno:', error);
      throw error;
    }
  }


  /**
   * Obtener profesores de un alumno específico
   */
  async obtenerProfesoresAlumno(alumnoId: number): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/api/apoderados/alumno/${alumnoId}/profesores`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo profesores del alumno:', error);
      throw error;
    }
  }

  /**
   * Obtener el detalle completo de un curso específico de un alumno
   */
  async obtenerDetalleCursoAlumno(alumnoId: number, cursoId: number): Promise<CursoDetalle> {
    try {
      const response = await this.request<{ success: boolean; data: CursoDetalle }>(`/api/apoderados/alumno/${alumnoId}/curso/${cursoId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo detalle del curso:', error);
      throw error;
    }
  }
}

export const apoderadoAPI = new ApoderadoAPI();
