# 📚 Diagramas del Sistema de Registro de Notas

## 🎯 Corazón del Sistema Educativo

Esta carpeta contiene los diagramas específicos del **núcleo principal** del sistema: el **Registro de Notas**. Este es el proceso más crítico y complejo de toda la aplicación, donde convergen todas las entidades del sistema.

## 📋 Diagramas Incluidos

### 1. 🔄 Diagrama de Flujo del Proceso de Registro de Notas
**Archivo:** `flujo-registro-notas.puml`

Muestra el flujo completo desde que un profesor accede al sistema hasta que las notas quedan registradas y los promedios calculados. Incluye:
- Validaciones de permisos
- Proceso de carga de datos
- Registro de notas individuales
- Cálculo automático de promedios
- Estimaciones de IA
- Notificaciones

### 2. 🏗️ Diagrama de Clases del Módulo de Registro de Notas
**Archivo:** `clases-registro-notas.puml`

Detalla las clases específicas involucradas en el registro de notas, incluyendo:
- Entidades principales (RegistroNota, Evaluacion, Competencia)
- Servicios de negocio (RegistroNotaService, NotaCalculoService, IaService)
- DTOs y tipos específicos
- Relaciones y dependencias

## 🎯 ¿Por qué es el Corazón del Sistema?

El registro de notas es donde **convergen todas las entidades**:
- **Usuarios:** Profesores registran, apoderados consultan
- **Estructura Académica:** Colegios, salones, cursos, competencias
- **Gestión Temporal:** Períodos académicos, evaluaciones
- **Estudiantes:** Alumnos y sus relaciones con apoderados
- **Inteligencia Artificial:** Estimaciones predictivas
- **Cálculos Complejos:** Promedios por competencia y curso

## 🚀 Tecnologías Involucradas

- **Backend:** NestJS con TypeScript
- **Base de Datos:** PostgreSQL con Prisma ORM
- **Frontend:** Next.js con React
- **IA:** Algoritmos de regresión lineal y análisis predictivo
- **Validaciones:** Múltiples capas de seguridad y permisos

## 📊 Métricas del Sistema

- **Entidades Involucradas:** +15 tablas de base de datos
- **Servicios:** 5+ servicios especializados
- **Validaciones:** 10+ tipos de validaciones diferentes
- **Cálculos:** Promedios en tiempo real con IA predictiva
