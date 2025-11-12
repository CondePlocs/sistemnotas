// CORAZÓN DEL SISTEMA DE REGISTRO DE NOTAS
// Diagrama Entidad-Relación (ERD) - Solo entidades core

Table registro_nota {
  id int [pk, increment]
  alumno_id int [not null]
  evaluacion_id int [not null]
  nota varchar(10) [not null, note: 'AD,A,B,C o 0-20']
  nota_escala_calculo decimal(3,2) [not null, note: 'Escala 1.0-4.0']
  registrado_por int [not null]
  creado_en timestamp [not null, default: `now()`]
  actualizado_en timestamp [not null, default: `now()`]
  
  indexes {
    (alumno_id, evaluacion_id) [unique, name: 'unique_alumno_evaluacion']
    alumno_id [name: 'idx_alumno']
    evaluacion_id [name: 'idx_evaluacion']
  }
  
  note: 'CORAZÓN DEL SISTEMA - Almacena notas con conversión automática'
}

Table alumno {
  id int [pk, increment]
  nombres varchar(100) [not null]
  apellidos varchar(100) [not null]
  dni varchar(20) [unique, not null]
  fecha_nacimiento date
  sexo varchar(10)
  colegio_id int [not null]
  activo boolean [default: true]
  creado_en timestamp [not null, default: `now()`]
  
  note: 'Estudiantes del sistema'
}

Table evaluacion {
  id int [pk, increment]
  nombre varchar(200) [not null]
  descripcion text
  fecha_evaluacion date [not null]
  competencia_id int [not null]
  profesor_asignacion_id int [not null]
  periodo_id int [not null]
  creado_por int [not null]
  creado_en timestamp [not null, default: `now()`]
  
  note: 'Evaluaciones creadas por profesores'
}

Table competencia {
  id int [pk, increment]
  nombre varchar(200) [not null]
  descripcion text
  orden int [not null]
  activo boolean [default: true]
  curso_id int [not null]
  creado_en timestamp [not null, default: `now()`]
  
  note: 'Habilidades/conocimientos a evaluar'
}

Table curso {
  id int [pk, increment]
  nombre varchar(100) [not null]
  descripcion text
  color varchar(7) [note: 'Color hex para UI']
  nivel_id int [not null]
  creado_en timestamp [not null, default: `now()`]
  
  note: 'Materias/asignaturas del colegio'
}

Table profesor_asignacion {
  id int [pk, increment]
  profesor_id int [not null]
  salon_id int [not null]
  curso_id int [not null]
  activo boolean [default: true]
  asignado_en timestamp [not null, default: `now()`]
  
  indexes {
    (profesor_id, salon_id, curso_id) [unique, name: 'unique_asignacion']
  }
  
  note: 'Asignación profesor-salón-curso'
}

Table periodo_academico {
  id int [pk, increment]
  nombre varchar(100) [not null]
  tipo varchar(50) [not null, note: 'BIMESTRE, TRIMESTRE, etc']
  orden int [not null]
  anio_academico int [not null]
  fecha_inicio date [not null]
  fecha_fin date [not null]
  activo boolean [default: true]
  colegio_id int [not null]
  creado_en timestamp [not null, default: `now()`]
  
  note: 'Períodos académicos del colegio'
}

// RELACIONES PRINCIPALES - SIN DUPLICADOS
Ref: registro_nota.alumno_id > alumno.id
Ref: registro_nota.evaluacion_id > evaluacion.id
Ref: evaluacion.competencia_id > competencia.id
Ref: evaluacion.profesor_asignacion_id > profesor_asignacion.id
Ref: evaluacion.periodo_id > periodo_academico.id
Ref: competencia.curso_id > curso.id
Ref: profesor_asignacion.curso_id > curso.id