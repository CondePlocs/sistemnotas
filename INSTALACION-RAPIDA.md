# 🚀 Instalación Rápida - Sistema de Notas

## ⚡ Opción 1: Script Automático (Windows)

### 1. Ejecutar Setup
```bash
# Doble clic en el archivo o desde terminal:
setup.bat
```

### 2. Configurar Variables de Entorno
Editar `backend/.env` con tus datos:
```env
DATABASE_URL="postgresql://tu_usuario:tu_password@localhost:5432/sistemnotas"
JWT_SECRET="tu_clave_secreta_muy_larga_y_segura"
```

### 3. Iniciar Sistema
```bash
# Doble clic en el archivo o desde terminal:
start.bat
```

¡Listo! El sistema se abrirá automáticamente en http://localhost:3000

---

## 🛠️ Opción 2: Instalación Manual

### 1. Instalar Dependencias
```bash
# Instalar concurrently globalmente (opcional)
npm install -g concurrently

# Instalar dependencias del proyecto
npm install

# Setup completo
npm run setup
```

### 2. Configurar Base de Datos
```sql
-- Crear base de datos en PostgreSQL
CREATE DATABASE sistemnotas;
CREATE USER sistemnotas_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE sistemnotas TO sistemnotas_user;
```

### 3. Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp backend/.env.example backend/.env

# Editar con tus configuraciones
# DATABASE_URL, JWT_SECRET, etc.
```

### 4. Ejecutar Sistema
```bash
# Opción A: Con concurrently (ambos servicios juntos)
npm run dev

# Opción B: En terminales separadas
# Terminal 1:
npm run dev:backend

# Terminal 2:
npm run dev:frontend
```

---

## 🔧 Comandos Útiles

### Desarrollo:
```bash
npm run dev              # Iniciar backend + frontend
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend
```

### Base de Datos:
```bash
npm run prisma:studio    # Abrir Prisma Studio
npm run prisma:migrate   # Crear nueva migración
npm run prisma:reset     # Resetear base de datos
```

### Producción:
```bash
npm run build           # Construir ambos proyectos
npm run start           # Iniciar en producción
```

---

## 🚨 Solución Rápida de Problemas

### Error: "Cannot connect to database"
```bash
# Verificar PostgreSQL
services.msc  # Windows
# Buscar PostgreSQL y verificar que esté ejecutándose
```

### Error: "Port already in use"
```bash
# Cambiar puertos en:
# backend/.env: PORT=3002
# frontend/package.json: "dev": "next dev -p 3001"
```

### Error: "Prisma Client not found"
```bash
cd backend
npx prisma generate
```

---

## 📱 Acceso al Sistema

Una vez instalado:

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:3001
3. **Prisma Studio**: http://localhost:5555 (ejecutar `npm run prisma:studio`)

### Usuarios de Prueba:
- **Owner**: `owner@sistema.com` / `123456`
- **Director**: `director@colegio.com` / `123456`

---

## 📞 ¿Necesitas Ayuda?

1. Revisa el archivo `README.md` completo
2. Verifica que PostgreSQL esté ejecutándose
3. Confirma que los puertos 3000 y 3001 estén libres
4. Revisa las variables de entorno en `backend/.env`

¡El sistema debería funcionar perfectamente siguiendo estos pasos! 🎉
