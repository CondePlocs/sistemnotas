# 🎓 Sistema de Notas - Guía de Instalación

Sistema educativo completo con gestión de roles (Owner, Director, Administrativo, Profesor, Apoderado) desarrollado con NestJS + Next.js + PostgreSQL.

## 📋 Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instalado:

### 1. Node.js (v18 o superior)
```bash
# Verificar versión
node --version
npm --version
```
**Descargar desde:** https://nodejs.org/

### 2. PostgreSQL (v14 o superior)
```bash
# Verificar instalación
psql --version
```
**Descargar desde:** https://www.postgresql.org/download/

### 3. Git
```bash
# Verificar instalación
git --version
```
**Descargar desde:** https://git-scm.com/

## 🚀 Instalación Paso a Paso

### Paso 1: Clonar el Repositorio
```bash
# Clonar el proyecto
git clone <URL_DEL_REPOSITORIO>
cd sistemnotas
```

### Paso 2: Configurar Base de Datos

#### 2.1 Crear Base de Datos
```sql
-- Conectar a PostgreSQL como superusuario
psql -U postgres

-- Crear base de datos
CREATE DATABASE sistemnotas;

-- Crear usuario (opcional pero recomendado)
CREATE USER sistemnotas_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE sistemnotas TO sistemnotas_user;

-- Salir
\q
```

#### 2.2 Configurar Variables de Entorno
Crear archivo `.env` en la carpeta `backend/`:

```bash
# backend/.env
DATABASE_URL="postgresql://sistemnotas_user:tu_password_seguro@localhost:5432/sistemnotas"
JWT_SECRET="tu_jwt_secret_super_seguro_y_largo_minimo_32_caracteres"
NODE_ENV="development"
PORT=3001
```

### Paso 3: Instalar Dependencias Backend

```bash
# Ir a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# (Opcional) Poblar base de datos con datos de prueba
npx prisma db seed
```

### Paso 4: Instalar Dependencias Frontend

```bash
# Ir a la carpeta frontend (desde la raíz del proyecto)
cd ../frontend

# Instalar dependencias
npm install
```

## 🏃‍♂️ Ejecutar el Proyecto

### Opción 1: Ejecutar Manualmente (Recomendado para desarrollo)

#### Terminal 1 - Backend:
```bash
cd backend
npm run start:dev
```
El backend estará disponible en: http://localhost:3001

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
El frontend estará disponible en: http://localhost:3000

### Opción 2: Script Automático (Próximamente)
```bash
# Desde la raíz del proyecto
npm run dev
```

## 🔧 Configuración Adicional

### Variables de Entorno Importantes

#### Backend (.env)
```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/sistemnotas"

# JWT
JWT_SECRET="clave_secreta_muy_larga_y_segura_minimo_32_caracteres"

# Servidor
NODE_ENV="development"
PORT=3001

# CORS (opcional)
FRONTEND_URL="http://localhost:3000"
```

### Configuración de PostgreSQL

#### Windows:
1. Instalar PostgreSQL desde el sitio oficial
2. Durante la instalación, recordar la contraseña del usuario `postgres`
3. Agregar PostgreSQL al PATH del sistema
4. Reiniciar la terminal

#### Verificar Conexión:
```bash
# Probar conexión
psql -U postgres -h localhost -p 5432
```

## 🗄️ Base de Datos

### Estructura Principal:
- **Usuario**: Datos básicos (email, password, DNI, etc.)
- **Rol**: Tipos de usuario (OWNER, DIRECTOR, ADMINISTRATIVO, PROFESOR, APODERADO)
- **UsuarioRol**: Relación usuario-rol-colegio
- **Colegio**: Instituciones educativas
- **Perfiles específicos**: Director, Administrativo, Profesor, Apoderado

### Comandos Útiles Prisma:
```bash
# Ver base de datos en navegador
npx prisma studio

# Resetear base de datos (¡CUIDADO! Borra todos los datos)
npx prisma migrate reset

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Ver estado de migraciones
npx prisma migrate status
```

## 🔐 Seguridad

El sistema implementa:
- ✅ **JWT con cookies httpOnly**
- ✅ **Autenticación y autorización por roles**
- ✅ **Guards de seguridad en todas las rutas**
- ✅ **Validación de datos con DTOs**
- ✅ **Scope por colegio (usuarios solo ven datos de su institución)**

## 🌐 Endpoints Principales

### Autenticación:
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/me` - Obtener perfil del usuario

### Gestión de Usuarios:
- `POST /api/profesores` - Crear profesor
- `POST /api/apoderados` - Crear apoderado
- `POST /api/administrativos` - Crear administrativo

### Permisos:
- `GET /api/permisos/administrativo/:id` - Obtener permisos
- `GET /api/permisos/verificar/:administrativoId/:tipo` - Verificar permiso específico

## 🚨 Solución de Problemas Comunes

### Error: "Cannot connect to database"
```bash
# Verificar que PostgreSQL esté ejecutándose
# Windows:
services.msc # Buscar PostgreSQL

# Verificar variables de entorno
echo $DATABASE_URL
```

### Error: "Port 3000 already in use"
```bash
# Cambiar puerto del frontend
# En frontend/package.json:
"dev": "next dev -p 3002"
```

### Error: "Prisma Client not generated"
```bash
cd backend
npx prisma generate
```

### Error: "JWT Secret not defined"
```bash
# Verificar que el archivo .env existe y tiene JWT_SECRET
cat backend/.env
```

## 📱 Usuarios de Prueba

Después de ejecutar las migraciones, puedes crear usuarios de prueba:

### Owner (Superadministrador):
- Email: `owner@sistema.com`
- Password: `123456`

### Director:
- Email: `director@colegio.com`
- Password: `123456`

## 🔄 Actualizar el Proyecto

```bash
# Actualizar desde Git
git pull origin main

# Actualizar dependencias backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy

# Actualizar dependencias frontend
cd ../frontend
npm install
```

## 📞 Soporte

Si encuentras problemas durante la instalación:

1. Verifica que todos los requisitos previos estén instalados
2. Revisa los logs de error en la consola
3. Verifica la conexión a la base de datos
4. Asegúrate de que los puertos 3000 y 3001 estén libres

---

## 🎯 Próximos Pasos

Una vez que tengas el sistema funcionando:

1. **Crear un Owner** para comenzar a usar el sistema
2. **Configurar tu primer colegio**
3. **Crear directores** para cada institución
4. **Comenzar a registrar profesores y apoderados**

¡El sistema está listo para usar! 🚀
