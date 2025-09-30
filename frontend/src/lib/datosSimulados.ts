import { DatosEvaluacion } from '@/types/evaluaciones';

// Datos simulados para el sistema de evaluaciones
export const datosSimulados: DatosEvaluacion = {
  curso: {
    nombre: "Matemática",
    salon: "1° A",
    nivel: "PRIMARIA",
    periodo: "Primer Semestre 2024"
  },
  
  competencias: [
    { id: 1, nombre: "Números y Operaciones", color: "bg-blue-500" },
    { id: 2, nombre: "Geometría", color: "bg-green-500" },
    { id: 3, nombre: "Álgebra", color: "bg-purple-500" },
    { id: 4, nombre: "Estadística", color: "bg-orange-500" }
  ],
  
  tareas: [
    // Competencia 1: Números y Operaciones
    { id: 1, nombre: "Examen", competenciaId: 1 },
    { id: 2, nombre: "Tarea 1", competenciaId: 1 },
    { id: 3, nombre: "Quiz", competenciaId: 1 },
    { id: 4, nombre: "Proyecto", competenciaId: 1 },
    
    // Competencia 2: Geometría
    { id: 5, nombre: "Examen", competenciaId: 2 },
    { id: 6, nombre: "Tarea 1", competenciaId: 2 },
    { id: 7, nombre: "Quiz", competenciaId: 2 },
    { id: 8, nombre: "Práctica", competenciaId: 2 },
    
    // Competencia 3: Álgebra
    { id: 9, nombre: "Examen", competenciaId: 3 },
    { id: 10, nombre: "Tarea 1", competenciaId: 3 },
    { id: 11, nombre: "Quiz", competenciaId: 3 },
    { id: 12, nombre: "Laboratorio", competenciaId: 3 },
    
    // Competencia 4: Estadística
    { id: 13, nombre: "Examen", competenciaId: 4 },
    { id: 14, nombre: "Tarea 1", competenciaId: 4 },
    { id: 15, nombre: "Quiz", competenciaId: 4 },
    { id: 16, nombre: "Informe", competenciaId: 4 }
  ],
  
  alumnos: [
    { id: 1, nombres: "Ana María", apellidos: "López García" },
    { id: 2, nombres: "Juan Carlos", apellidos: "Pérez Silva" },
    { id: 3, nombres: "María José", apellidos: "Rodríguez Torres" },
    { id: 4, nombres: "Luis Alberto", apellidos: "Martínez Ruiz" }
  ],
  
  notas: [
    // Ana María López García
    { alumnoId: 1, tareaId: 1, valor: 18 }, { alumnoId: 1, tareaId: 2, valor: 16 },
    { alumnoId: 1, tareaId: 3, valor: 20 }, { alumnoId: 1, tareaId: 4, valor: 17 },
    { alumnoId: 1, tareaId: 5, valor: 19 }, { alumnoId: 1, tareaId: 6, valor: 15 },
    { alumnoId: 1, tareaId: 7, valor: 18 }, { alumnoId: 1, tareaId: 8, valor: 16 },
    { alumnoId: 1, tareaId: 9, valor: 17 }, { alumnoId: 1, tareaId: 10, valor: 19 },
    { alumnoId: 1, tareaId: 11, valor: 20 }, { alumnoId: 1, tareaId: 12, valor: 18 },
    { alumnoId: 1, tareaId: 13, valor: 16 }, { alumnoId: 1, tareaId: 14, valor: 17 },
    { alumnoId: 1, tareaId: 15, valor: 19 }, { alumnoId: 1, tareaId: 16, valor: 18 },
    
    // Juan Carlos Pérez Silva
    { alumnoId: 2, tareaId: 1, valor: 15 }, { alumnoId: 2, tareaId: 2, valor: 18 },
    { alumnoId: 2, tareaId: 3, valor: 17 }, { alumnoId: 2, tareaId: 4, valor: 16 },
    { alumnoId: 2, tareaId: 5, valor: 14 }, { alumnoId: 2, tareaId: 6, valor: 16 },
    { alumnoId: 2, tareaId: 7, valor: 15 }, { alumnoId: 2, tareaId: 8, valor: 17 },
    { alumnoId: 2, tareaId: 9, valor: 16 }, { alumnoId: 2, tareaId: 10, valor: 15 },
    { alumnoId: 2, tareaId: 11, valor: 18 }, { alumnoId: 2, tareaId: 12, valor: 17 },
    { alumnoId: 2, tareaId: 13, valor: 15 }, { alumnoId: 2, tareaId: 14, valor: 16 },
    { alumnoId: 2, tareaId: 15, valor: 14 }, { alumnoId: 2, tareaId: 16, valor: 17 },
    
    // María José Rodríguez Torres
    { alumnoId: 3, tareaId: 1, valor: 19 }, { alumnoId: 3, tareaId: 2, valor: 20 },
    { alumnoId: 3, tareaId: 3, valor: 18 }, { alumnoId: 3, tareaId: 4, valor: 19 },
    { alumnoId: 3, tareaId: 5, valor: 20 }, { alumnoId: 3, tareaId: 6, valor: 17 },
    { alumnoId: 3, tareaId: 7, valor: 19 }, { alumnoId: 3, tareaId: 8, valor: 18 },
    { alumnoId: 3, tareaId: 9, valor: 20 }, { alumnoId: 3, tareaId: 10, valor: 18 },
    { alumnoId: 3, tareaId: 11, valor: 19 }, { alumnoId: 3, tareaId: 12, valor: 20 },
    { alumnoId: 3, tareaId: 13, valor: 18 }, { alumnoId: 3, tareaId: 14, valor: 19 },
    { alumnoId: 3, tareaId: 15, valor: 17 }, { alumnoId: 3, tareaId: 16, valor: 20 },
    
    // Luis Alberto Martínez Ruiz
    { alumnoId: 4, tareaId: 1, valor: 13 }, { alumnoId: 4, tareaId: 2, valor: 15 },
    { alumnoId: 4, tareaId: 3, valor: 14 }, { alumnoId: 4, tareaId: 4, valor: 16 },
    { alumnoId: 4, tareaId: 5, valor: 12 }, { alumnoId: 4, tareaId: 6, valor: 14 },
    { alumnoId: 4, tareaId: 7, valor: 13 }, { alumnoId: 4, tareaId: 8, valor: 15 },
    { alumnoId: 4, tareaId: 9, valor: 14 }, { alumnoId: 4, tareaId: 10, valor: 13 },
    { alumnoId: 4, tareaId: 11, valor: 16 }, { alumnoId: 4, tareaId: 12, valor: 15 },
    { alumnoId: 4, tareaId: 13, valor: 13 }, { alumnoId: 4, tareaId: 14, valor: 14 },
    { alumnoId: 4, tareaId: 15, valor: 12 }, { alumnoId: 4, tareaId: 16, valor: 15 }
  ]
};
