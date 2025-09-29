-- Migración para eliminar tabla alumno_curso y limpiar redundancia
-- Fecha: 2025-09-28
-- Motivo: Refactorización para eliminar redundancia de datos

-- 1. Eliminar constraints de foreign keys primero
ALTER TABLE "public"."alumno_curso" DROP CONSTRAINT IF EXISTS "alumno_curso_alumnoId_fkey";
ALTER TABLE "public"."alumno_curso" DROP CONSTRAINT IF EXISTS "alumno_curso_cursoId_fkey";
ALTER TABLE "public"."alumno_curso" DROP CONSTRAINT IF EXISTS "alumno_curso_salonId_fkey";
ALTER TABLE "public"."alumno_curso" DROP CONSTRAINT IF EXISTS "alumno_curso_asignadoPor_fkey";

-- 2. Eliminar índices
DROP INDEX IF EXISTS "public"."alumno_curso_alumnoId_idx";
DROP INDEX IF EXISTS "public"."alumno_curso_cursoId_idx";
DROP INDEX IF EXISTS "public"."alumno_curso_salonId_idx";
DROP INDEX IF EXISTS "public"."alumno_curso_alumnoId_activo_idx";
DROP INDEX IF EXISTS "public"."alumno_curso_cursoId_activo_idx";
DROP INDEX IF EXISTS "public"."alumno_curso_salonId_activo_idx";
DROP INDEX IF EXISTS "public"."alumno_curso_alumnoId_cursoId_key";

-- 3. Eliminar tabla completa
DROP TABLE IF EXISTS "public"."alumno_curso";

-- Comentario: 
-- Esta tabla generaba redundancia ya que la información de cursos por alumno
-- se puede derivar de las tablas alumno_salon + salon_curso
-- Fuentes de verdad únicas:
-- - alumno_salon: "Alumno X está en Salón A"  
-- - salon_curso: "Salón A tiene Cursos Y, Z, W"
-- Por tanto: "Alumno X tiene Cursos Y, Z, W" (derivado automáticamente)
