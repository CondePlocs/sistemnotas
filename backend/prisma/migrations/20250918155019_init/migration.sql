-- CreateEnum
CREATE TYPE "public"."EstadoUsuario" AS ENUM ('activo', 'inactivo', 'suspendido');

-- CreateTable
CREATE TABLE "public"."usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "dni" TEXT,
    "nombres" TEXT,
    "apellidos" TEXT,
    "telefono" TEXT,
    "estado" "public"."EstadoUsuario" NOT NULL DEFAULT 'activo',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usuario_rol" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "colegio_id" INTEGER,
    "aprobado_por" INTEGER,
    "aprobado_en" TIMESTAMP(3),

    CONSTRAINT "usuario_rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."colegio" (
    "id" SERIAL NOT NULL,
    "ugelId" INTEGER,
    "nombre" TEXT NOT NULL,
    "codigoModular" TEXT,
    "distrito" TEXT,
    "direccion" TEXT,
    "nivel" TEXT,
    "provisional" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colegio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profesor" (
    "id" SERIAL NOT NULL,
    "usuarioRolId" INTEGER NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "sexo" TEXT,
    "estadoCivil" TEXT,
    "nacionalidad" TEXT,
    "direccion" TEXT,
    "celular" TEXT,
    "correoInstitucional" TEXT,
    "gradoAcademico" TEXT,
    "especialidad" TEXT,
    "institucionEgreso" TEXT,
    "fechaIngreso" TIMESTAMP(3),
    "condicionLaboral" TEXT,
    "cargaHoraria" INTEGER,
    "experienciaDocente" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profesor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."apoderado" (
    "id" SERIAL NOT NULL,
    "usuarioRolId" INTEGER NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "sexo" TEXT,
    "estadoCivil" TEXT,
    "nacionalidad" TEXT,
    "parentesco" TEXT NOT NULL,
    "direccion" TEXT,
    "celular" TEXT,
    "correo" TEXT,
    "ocupacion" TEXT,
    "centroTrabajo" TEXT,
    "telefonoTrabajo" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apoderado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."administrativo" (
    "id" SERIAL NOT NULL,
    "usuarioRolId" INTEGER NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "sexo" TEXT,
    "estadoCivil" TEXT,
    "nacionalidad" TEXT,
    "direccion" TEXT,
    "celular" TEXT,
    "correo" TEXT,
    "cargo" TEXT NOT NULL,
    "fechaIngreso" TIMESTAMP(3),
    "condicionLaboral" TEXT,
    "turno" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administrativo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."director" (
    "id" SERIAL NOT NULL,
    "usuarioRolId" INTEGER NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "sexo" TEXT,
    "estadoCivil" TEXT,
    "nacionalidad" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "celular" TEXT,
    "correoInstitucional" TEXT,
    "gradoAcademico" TEXT,
    "carrera" TEXT,
    "especializacion" TEXT,
    "institucionEgreso" TEXT,
    "fechaInicio" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "director_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "public"."usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_dni_key" ON "public"."usuario"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombre_key" ON "public"."rol"("nombre");

-- CreateIndex
CREATE INDEX "usuario_rol_usuario_id_idx" ON "public"."usuario_rol"("usuario_id");

-- CreateIndex
CREATE INDEX "usuario_rol_colegio_id_idx" ON "public"."usuario_rol"("colegio_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_rol_usuario_id_rol_id_colegio_id_key" ON "public"."usuario_rol"("usuario_id", "rol_id", "colegio_id");

-- CreateIndex
CREATE UNIQUE INDEX "colegio_codigoModular_key" ON "public"."colegio"("codigoModular");

-- CreateIndex
CREATE UNIQUE INDEX "profesor_usuarioRolId_key" ON "public"."profesor"("usuarioRolId");

-- CreateIndex
CREATE UNIQUE INDEX "apoderado_usuarioRolId_key" ON "public"."apoderado"("usuarioRolId");

-- CreateIndex
CREATE UNIQUE INDEX "administrativo_usuarioRolId_key" ON "public"."administrativo"("usuarioRolId");

-- CreateIndex
CREATE UNIQUE INDEX "director_usuarioRolId_key" ON "public"."director"("usuarioRolId");

-- AddForeignKey
ALTER TABLE "public"."usuario_rol" ADD CONSTRAINT "usuario_rol_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuario_rol" ADD CONSTRAINT "usuario_rol_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "public"."rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuario_rol" ADD CONSTRAINT "usuario_rol_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "public"."colegio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuario_rol" ADD CONSTRAINT "usuario_rol_aprobado_por_fkey" FOREIGN KEY ("aprobado_por") REFERENCES "public"."usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profesor" ADD CONSTRAINT "profesor_usuarioRolId_fkey" FOREIGN KEY ("usuarioRolId") REFERENCES "public"."usuario_rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."apoderado" ADD CONSTRAINT "apoderado_usuarioRolId_fkey" FOREIGN KEY ("usuarioRolId") REFERENCES "public"."usuario_rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."administrativo" ADD CONSTRAINT "administrativo_usuarioRolId_fkey" FOREIGN KEY ("usuarioRolId") REFERENCES "public"."usuario_rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."director" ADD CONSTRAINT "director_usuarioRolId_fkey" FOREIGN KEY ("usuarioRolId") REFERENCES "public"."usuario_rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;
