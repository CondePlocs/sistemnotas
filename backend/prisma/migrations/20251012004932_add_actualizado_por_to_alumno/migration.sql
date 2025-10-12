-- AlterTable
ALTER TABLE "public"."alumno" ADD COLUMN     "actualizadoPor" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."alumno" ADD CONSTRAINT "alumno_actualizadoPor_fkey" FOREIGN KEY ("actualizadoPor") REFERENCES "public"."usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
