const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createYolyApoderado() {
  try {
    console.log('🔍 Verificando usuario yoly@gmail.com...');

    // 1. Buscar el usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email: 'yoly@gmail.com' }
    });

    if (!usuario) {
      console.error('❌ Usuario no encontrado');
      return;
    }

    console.log('✅ Usuario encontrado:', {
      id: usuario.id,
      email: usuario.email,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos
    });

    // 2. Verificar si ya existe en apoderado
    const apoderadoExiste = await prisma.apoderado.findFirst({
      where: { usuarioId: usuario.id }
    });

    if (apoderadoExiste) {
      console.log('ℹ️ El usuario ya tiene registro de apoderado');
      return;
    }

    // 3. Crear el registro de apoderado
    console.log('📝 Creando registro de apoderado...');
    const nuevoApoderado = await prisma.apoderado.create({
      data: {
        usuarioId: usuario.id,
        dni: '87654321',
        nombres: usuario.nombres || 'Yoly',
        apellidos: usuario.apellidos || 'García',
        telefono: '999888777',
        direccion: 'Av. Principal 123',
        activo: true,
        creadoPor: usuario.id
      }
    });

    console.log('✅ Apoderado creado exitosamente:', {
      id: nuevoApoderado.id,
      usuarioId: nuevoApoderado.usuarioId,
      nombres: nuevoApoderado.nombres,
      apellidos: nuevoApoderado.apellidos
    });

    console.log('🎉 ¡Ahora yoly@gmail.com puede acceder al dashboard de apoderado!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createYolyApoderado();
