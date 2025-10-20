# 📊 Diagramas UML - Sistema de Gestión Educativa

Esta carpeta contiene los diagramas UML del Sistema de Gestión Educativa en formato PlantUML.

## 📁 Archivos Disponibles

### 1. `diagrama-clases.puml`
**Diagrama de Clases del Sistema**
- Muestra todas las entidades principales del sistema
- Incluye atributos y métodos principales
- Representa las relaciones entre clases
- Incluye enumeraciones y tipos de datos

### 2. `diagrama-casos-uso.puml`
**Diagrama de Casos de Uso del Sistema**
- Define todos los actores del sistema (Owner, Director, Administrativo, Profesor, Apoderado)
- Muestra los casos de uso organizados por módulos funcionales
- Incluye relaciones de include y extend
- Documenta restricciones y reglas de negocio

## 🚀 Cómo Visualizar los Diagramas

### Opción 1: PlantUML Online
1. Ve a [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
2. Copia el contenido del archivo `.puml` que quieras visualizar
3. Pégalo en el editor online
4. Haz clic en "Submit" para generar el diagrama

### Opción 2: PlantText (Recomendado)
1. Ve a [PlantText](https://www.planttext.com/)
2. Copia el contenido del archivo `.puml`
3. Pégalo en el editor
4. El diagrama se genera automáticamente
5. Puedes descargar como PNG, SVG o PDF

### Opción 3: Visual Studio Code
1. Instala la extensión "PlantUML"
2. Abre el archivo `.puml` en VS Code
3. Presiona `Alt + D` para previsualizar
4. Usa `Ctrl + Shift + P` > "PlantUML: Export Current Diagram" para exportar

### Opción 4: IntelliJ IDEA / WebStorm
1. Instala el plugin "PlantUML Integration"
2. Abre el archivo `.puml`
3. Verás una vista previa automática
4. Click derecho > "Show PlantUML Diagram"

## 📋 Descripción de los Diagramas

### Diagrama de Clases
**Entidades Principales:**
- **Usuario**: Entidad base para todos los usuarios del sistema
- **Rol**: Define los tipos de usuario (OWNER, DIRECTOR, etc.)
- **UsuarioRol**: Relación usuario-rol con scope por colegio
- **Colegio**: Institución educativa principal
- **Alumno**: Estudiantes del sistema
- **Profesor**: Docentes con asignaciones
- **Apoderado**: Padres/tutores de los alumnos
- **Evaluacion**: Sistema de calificaciones
- **RegistroNota**: Notas individuales de los alumnos

**Módulos Organizados:**
- Gestión de Usuarios y Autenticación
- Estructura Geográfica (DRE, UGEL, Colegio)
- Sistema Académico (Cursos, Competencias, Evaluaciones)
- Gestión de Personal (Director, Administrativo, Profesor)
- Gestión de Estudiantes (Alumno, Apoderado)

### Diagrama de Casos de Uso
**Actores del Sistema:**
- **Owner**: Super administrador con acceso global
- **Director**: Administra un colegio específico
- **Administrativo**: Personal con permisos delegados
- **Profesor**: Docente que registra evaluaciones
- **Apoderado**: Padre/tutor que consulta información

**Módulos Funcionales:**
- **Gestión Institucional**: Creación y administración de colegios
- **Gestión Académica**: Períodos, salones, cursos
- **Gestión de Personal**: Registro y asignación de usuarios
- **Sistema de Evaluaciones**: Creación y registro de notas
- **Seguimiento Académico**: Consulta de información por apoderados

## 🔧 Personalización

Para modificar los diagramas:

1. **Colores**: Modifica las variables `!define` al inicio de cada archivo
2. **Entidades**: Agrega nuevas clases o casos de uso según necesites
3. **Relaciones**: Usa las sintaxis de PlantUML para nuevas conexiones
4. **Notas**: Agrega `note` para documentar restricciones específicas

## 📚 Sintaxis PlantUML Útil

```plantuml
' Comentarios
class NuevaClase {
    +atributoPublico: Tipo
    -atributoPrivado: Tipo
    #atributoProtegido: Tipo
    +metodo(): TipoRetorno
}

' Relaciones
ClaseA ||--o{ ClaseB : "relación uno a muchos"
ClaseC ..> ClaseD : <<include>>
ClaseE ..> ClaseF : <<extend>>

' Casos de uso
actor "Nuevo Actor" as Actor
usecase "Nuevo Caso de Uso" as UC100
Actor --> UC100

' Notas
note right of ClaseA
    Información adicional
    sobre la clase
end note
```

## 🎯 Uso Recomendado

1. **Para Documentación**: Incluye estos diagramas en la documentación técnica
2. **Para Desarrollo**: Usa como referencia durante el desarrollo
3. **Para Presentaciones**: Exporta como imágenes para presentaciones
4. **Para Análisis**: Identifica patrones y posibles mejoras en el diseño

## 📝 Notas Importantes

- Los diagramas reflejan el estado actual del sistema (Octubre 2025)
- Están basados en el schema de Prisma y la estructura de módulos NestJS
- Incluyen las funcionalidades implementadas hasta la fecha
- Se pueden actualizar conforme evolucione el sistema

---

**Generado para**: Sistema de Gestión Educativa  
**Fecha**: Octubre 2025  
**Formato**: PlantUML (.puml)  
**Compatibilidad**: PlantUML v1.2023+
