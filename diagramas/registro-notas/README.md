# 📊 DIAGRAMAS UML - SISTEMA DE REGISTRO DE NOTAS

## 🎯 **RESUMEN EJECUTIVO**

Este sistema permite a los profesores registrar notas en **formato dual** (alfabético: AD,A,B,C o numérico: 0-20) con **conversión automática** a escala unificada 1.0-4.0 y **estimaciones predictivas con IA**.

---

## 1️⃣ **DIAGRAMA DE CLASES** 📋

### **¿Qué representa?**
La **estructura del código** - clases, métodos y relaciones del sistema.

### **Componentes Principales:**

#### **🎯 Controladores (API Endpoints)**
- **`RegistroNotaController`**: Maneja todas las operaciones de notas
  - `crearNota()` - POST /api/registro-notas
  - `actualizarNota()` - PUT /api/registro-notas/:id
  - `guardarNotasLote()` - POST /api/registro-notas/lote
  - `obtenerNotasPorContexto()` - GET /api/registro-notas/contexto
  - `calcularPromedios()` - Promedios por competencia y curso

- **`IaController`**: Sistema de estimaciones predictivas
  - `estimarNota()` - POST /api/ia/estimar-nota

#### **⚙️ Servicios Core (Lógica de Negocio)**
- **`RegistroNotaService`**: Corazón del sistema
  - **Públicos (+)**: Métodos que usa el controlador
  - **Privados (-)**: Validaciones internas y dependencias
  - `verificarPertenenciaColegio()` - Seguridad por colegio

- **`NotaCalculoService`**: Motor de conversiones
  - Detecta automáticamente tipo de nota
  - Convierte entre escalas (alfabético ↔ numérico ↔ 1.0-4.0)

- **`IaService`**: Sistema inteligente
  - 8 algoritmos predictivos diferentes
  - Análisis de patrones de aprendizaje
  - Confianza variable 30%-100%

#### **📊 Entidades (Base de Datos)**
- **`RegistroNota`**: Corazón del sistema
  - `nota`: Valor original (AD, A, B, C o 0-20)
  - `notaEscalaCalculo`: Conversión automática 1.0-4.0
  - Constraint único: alumno-evaluación
  - Auditoría completa con timestamps

### **🔒 Seguridad del Encapsulamiento:**
- **🟢 Público (+)**: Métodos de API - seguros por JWT y Guards
- **🔴 Privado (-)**: Métodos internos - mayor seguridad
- **🔴 Protegido (#)**: Para herencia (no usado en este sistema)

---

## 2️⃣ **DIAGRAMA DE CASOS DE USO** 👤

### **¿Qué representa?**
Las **acciones que puede hacer el usuario** (profesor), NO los procesos internos del sistema.

### **Funcionalidades Reales Implementadas:**

#### **📝 Gestión de Evaluaciones**
- **Crear Evaluación**: El profesor crea nuevas evaluaciones
- **Consultar Notas del Contexto**: Carga la hoja de trabajo completa

#### **📊 Registro de Notas**
- **Registrar Nota Individual**: Ingresa una nota específica
- **Actualizar Nota**: Modifica una nota existente
- **Guardar Notas en Lote**: Guarda múltiples notas de una vez

#### **📈 Consultas y Cálculos**
- **Calcular Promedio Competencia**: Promedio por habilidad específica
- **Calcular Promedio Curso**: Promedio general del curso
- **Ver Estimaciones IA**: Predicciones del sistema inteligente

#### **📄 Reportes**
- **Descargar Hoja Excel**: Hoja de trabajo del profesor
- **Descargar Informe PDF**: Informe de intervención temprana

### **🔗 Relaciones Include/Extend:**
- **`<<extend>>`**: Funcionalidades **opcionales**
  - Al consultar notas → puede ver estimaciones IA
  - Al consultar notas → puede descargar reportes

### **✅ Basado en Endpoints Reales:**
- `/api/registro-notas` (POST, PUT)
- `/api/evaluaciones/contexto-trabajo`
- `/api/ia/estimar-nota`
- `/api/reportes/profesor/hoja-registro`
- `/api/reportes/profesor/intervencion-temprana`

---

## 3️⃣ **DIAGRAMA DE ACTIVIDADES** 🔄

### **¿Qué representa?**
El **flujo paso a paso** del proceso de registro de notas.

### **Flujo Principal:**

#### **👨‍🏫 Profesor (Inicio)**
1. Selecciona alumno y evaluación
2. Ingresa nota (AD,A,B,C o 0-20)

#### **⚙️ NotaCalculoService (Procesamiento)**
3. **Detecta tipo de nota** automáticamente
4. **Valida formato**:
   - Si es alfabética → valida AD,A,B,C
   - Si es numérica → valida rango 0-20
5. **Convierte a escala de cálculo** (1.0-4.0)

#### **🔒 RegistroNotaService (Validaciones)**
6. **Verifica pertenencia a colegio** (seguridad)
7. **Verifica nota existente** (no duplicados)
8. **Guarda nota** con auditoría completa

#### **📊 Cálculos Automáticos (Paralelos)**
9. Calcula promedio de competencia
10. Calcula promedio de curso

#### **✅ Confirmación**
11. Muestra confirmación al profesor
12. Opción de registrar otra nota

### **🎯 Características Clave:**
- **Detección automática** de tipo de nota
- **Validación dual** en tiempo real
- **Conversión automática** a escala unificada
- **Procesamiento paralelo** de promedios
- **Sin rombos innecesarios** - flujo limpio

---

## 4️⃣ **DIAGRAMA DE COMPONENTES** 🏗️

### **¿Qué representa?**
La **arquitectura del sistema** - cómo se conectan las partes.

### **Frontend (Next.js)**
- **`SistemaEvaluaciones`**: Componente principal
- **`TablaEvaluaciones`**: Vista de escritorio
- **`VistaMobile`**: Vista móvil responsive
- **`useNotasState`**: Hook para estado de notas
- **`useEstimacionesIA`**: Hook para estimaciones IA

### **Backend (NestJS)**
- **Módulo Registro de Notas**: Core del sistema
- **Módulo IA**: Sistema predictivo
- **Módulos de Apoyo**: Auth, Estadísticas, Reportes

### **Infraestructura**
- **PrismaService**: ORM para base de datos
- **JwtService**: Autenticación y seguridad

### **Base de Datos (PostgreSQL)**
- Tablas optimizadas con índices
- Constraints únicos y foreign keys
- Campos de auditoría automáticos

### **🔗 Flujo de Conexiones:**
1. Componentes React → Hooks personalizados
2. Hooks → Controladores NestJS
3. Controladores → Servicios de negocio
4. Servicios → Prisma ORM
5. Prisma → PostgreSQL

---

## 5️⃣ **DIAGRAMA DE DESPLIEGUE** 🚀

### **¿Qué representa?**
La **infraestructura técnica** donde funciona el sistema.

### **Entorno de Desarrollo**

#### **🖥️ Cliente**
- Navegador web (Chrome, Firefox, etc.)

#### **🖥️ Servidor de Desarrollo**
- **Frontend**: Next.js en puerto **3000**
  - Hot Reload para desarrollo
  - React Components
  - Static Files
- **Backend**: NestJS en puerto **3001**
  - Hot Reload para desarrollo
  - JWT Authentication
  - Prisma ORM

#### **🗄️ Base de Datos**
- **PostgreSQL** en puerto **5432**
- Pool de conexiones optimizado
- Esquemas: registro_nota, alumno, evaluacion, competencia, curso, salon

### **🌐 Comunicación**
- **HTTP/3000**: Cliente → Frontend
- **HTTP/3001**: Frontend → Backend API
- **TCP/5432**: Backend → PostgreSQL

### **🔧 Características Técnicas**
- **Escalabilidad**: Pool de conexiones
- **Seguridad**: JWT + Guards + Validación por colegio
- **Performance**: Índices optimizados + Transacciones
- **Auditoría**: Timestamps automáticos en todas las operaciones

---

## 🎯 **PUNTOS CLAVE PARA LA SUSTENTACIÓN**

### **💡 Innovaciones del Sistema:**
1. **Detección automática** de tipo de nota (alfabético/numérico)
2. **Conversión automática** a escala unificada 1.0-4.0
3. **Sistema IA** con 8 algoritmos predictivos
4. **Seguridad por colegio** en todas las operaciones
5. **UX responsive** (desktop + mobile)

### **🔒 Seguridad Implementada:**
- JWT Authentication obligatorio
- Guards de NestJS por roles
- Validación de pertenencia a colegio
- Constraint único alumno-evaluación
- Auditoría completa con timestamps

### **⚡ Performance Optimizada:**
- Índices en consultas frecuentes
- Pool de conexiones a base de datos
- Transacciones para operaciones en lote
- Hooks React para estado optimizado

### **🎨 Experiencia de Usuario:**
- Interfaz intuitiva y responsive
- Estimaciones IA como apoyo al profesor
- Reportes automáticos (Excel + PDF)
- Validación en tiempo real

---

## 📋 **CHECKLIST PARA MAÑANA**

### **✅ Preparación:**
1. **Diagrama de Clases**: Explicar encapsulamiento y métodos reales
2. **Casos de Uso**: Enfocarse en acciones del usuario, no procesos internos
3. **Actividades**: Mostrar flujo completo sin rombos innecesarios
4. **Componentes**: Arquitectura moderna Next.js + NestJS
5. **Despliegue**: Infraestructura de desarrollo clara

### **🎯 Mensajes Clave:**
- **"Sistema dual de notas con conversión automática"**
- **"IA predictiva con 8 algoritmos diferentes"**
- **"Seguridad por colegio en todas las operaciones"**
- **"Arquitectura moderna y escalable"**
- **"UX optimizada para profesores"**

**¡Éxito en tu sustentación! 🚀📊**