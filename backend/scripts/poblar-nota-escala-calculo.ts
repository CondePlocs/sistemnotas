import { PrismaClient } from '@prisma/client';
import { NotaCalculoService } from '../src/modules/registro-nota/services/nota-calculo.service';

const prisma = new PrismaClient();
const notaCalculoService = new NotaCalculoService();

async function poblarNotaEscalaCalculo() {
  console.log('🚀 Iniciando población de nota_escala_calculo...');

  try {
    // Obtener todos los registros de notas que no tienen nota_escala_calculo
    const registrosNotas = await prisma.registroNota.findMany({
      where: {
        notaEscalaCalculo: null
      },
      select: {
        id: true,
        nota: true
      }
    });

    console.log(`📊 Encontrados ${registrosNotas.length} registros para procesar`);

    let procesados = 0;
    let errores = 0;

    // Procesar en lotes de 100 para evitar sobrecarga
    const BATCH_SIZE = 100;
    for (let i = 0; i < registrosNotas.length; i += BATCH_SIZE) {
      const lote = registrosNotas.slice(i, i + BATCH_SIZE);
      
      console.log(`⚡ Procesando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(registrosNotas.length / BATCH_SIZE)}`);

      await prisma.$transaction(async (tx) => {
        for (const registro of lote) {
          try {
            // Convertir la nota a escala de cálculo
            const notaEscalaCalculo = notaCalculoService.convertirAEscalaCalculo(registro.nota);

            // Actualizar el registro
            await tx.registroNota.update({
              where: { id: registro.id },
              data: { notaEscalaCalculo }
            });

            procesados++;
          } catch (error: any) {
            console.error(`❌ Error procesando registro ID ${registro.id} con nota "${registro.nota}": ${error.message}`);
            errores++;
          }
        }
      });

      // Mostrar progreso cada 5 lotes
      if ((Math.floor(i / BATCH_SIZE) + 1) % 5 === 0) {
        console.log(`📈 Progreso: ${procesados}/${registrosNotas.length} procesados, ${errores} errores`);
      }
    }

    console.log('✅ Población completada!');
    console.log(`📊 Resumen:`);
    console.log(`   - Total registros: ${registrosNotas.length}`);
    console.log(`   - Procesados exitosamente: ${procesados}`);
    console.log(`   - Errores: ${errores}`);

    // Verificar el resultado
    const registrosActualizados = await prisma.registroNota.count({
      where: {
        notaEscalaCalculo: { not: null }
      }
    });

    console.log(`🔍 Verificación: ${registrosActualizados} registros tienen nota_escala_calculo`);

  } catch (error: any) {
    console.error('💥 Error durante la población:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
poblarNotaEscalaCalculo()
  .then(() => {
    console.log('🎉 Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
