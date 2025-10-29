# Diagramas UML: Sistema de Registro de Notas

## 1. Diagrama de Clases

El diagrama de clases representa la estructura fundamental del sistema, mostrando las principales entidades y sus relaciones:

### Core del Sistema
- `RegistroNotaService`: Servicio central que maneja la lógica de negocio para el registro y gestión de notas.
- `NotaCalculoService`: Servicio especializado en la conversión y cálculo de notas entre diferentes escalas.

### Entidades Principales
- `RegistroNota`: Almacena la nota original, la escala de cálculo (1.0-4.0) y campos de auditoría.
- `Evaluacion`: Define los criterios y parámetros de evaluación.
- `Competencia`: Agrupa evaluaciones relacionadas a una misma habilidad o conocimiento.
- `Curso`: Contiene múltiples competencias y define el contexto académico.

### Relaciones Clave
- Cada RegistroNota pertenece a una Evaluación específica
- Las Evaluaciones están asociadas a una Competencia
- Las Competencias forman parte de un Curso
- Los Alumnos se relacionan con las notas a través de SalonCurso

## 2. Diagrama de Actividades

Representa el flujo detallado del proceso de registro de notas:

### Flujo Principal
1. El profesor selecciona alumno y evaluación
2. Ingresa la nota (alfabética o numérica)
3. El sistema realiza validaciones automáticas:
   - Detección del tipo de nota
   - Validación del formato
   - Conversión a escala de cálculo

### Validaciones Críticas
- Verificación de nota existente
- Validación de formato según tipo (AD,A,B,C o 0-20)
- Conversión automática a escala unificada (1.0-4.0)

### Cálculos Automáticos
- Actualización de promedios por competencia
- Actualización de promedios por curso
- Registro con campos de auditoría

## 3. Diagrama de Componentes

Muestra la arquitectura del sistema y cómo interactúan sus partes:

### Frontend (Next.js)
- Componentes React para la interfaz de usuario
- Manejo de estado local y global
- API Routes para comunicación con el backend

### Backend (NestJS)
- Controladores REST para las operaciones principales
- Servicios especializados para lógica de negocio
- Integración con Prisma ORM

### Base de Datos
- PostgreSQL como motor principal
- Prisma para el mapeo objeto-relacional
- Esquemas optimizados para consultas frecuentes

## 4. Diagrama de Casos de Uso

Define las interacciones principales entre usuarios y sistema:

### Actores
- Profesor: Principal usuario del sistema de registro
- Director: Supervisión y acceso a reportes
- Administrativo: Gestión de configuraciones
- Apoderado: Consulta de notas

### Funcionalidades Core
- Registro individual de notas
- Registro masivo por evaluación
- Consulta de promedios
- Generación de reportes

## 5. Diagrama de Despliegue

Describe la infraestructura técnica del sistema:

### Entorno de Desarrollo
- Servidor Frontend: Next.js en puerto 3000
- Servidor Backend: NestJS en puerto 3001
- Base de Datos: PostgreSQL en puerto 5432

### Características Técnicas
- Hot Reload para desarrollo
- JWT para autenticación
- Campos de auditoría automáticos
- Constraints e índices optimizados

### Comunicación
- HTTP/3000 para acceso al frontend
- HTTP/3001 para API REST
- TCP/5432 para conexión a base de datos

## Notas Importantes
- El sistema utiliza una escala de cálculo unificada (1.0-4.0)
- Implementa validaciones estrictas de pertenencia a colegio
- Mantiene un registro detallado de cambios
- Optimizado para operaciones frecuentes de registro y consulta
