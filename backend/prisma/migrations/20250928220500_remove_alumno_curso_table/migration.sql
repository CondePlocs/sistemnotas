-- DropForeignKey
ALTER TABLE "public"."alumno_curso" DROP CONSTRAINT "alumno_curso_alumnoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."alumno_curso" DROP CONSTRAINT "alumno_curso_cursoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."alumno_curso" DROP CONSTRAINT "alumno_curso_salonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."alumno_curso" DROP CONSTRAINT "alumno_curso_asignadoPor_fkey";

-- DropTable
DROP TABLE "public"."alumno_curso";
