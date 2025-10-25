// Script de prueba rápida para el sistema dual
console.log('🧪 Probando sistema dual de notas...');

// Simulamos las conversiones que debería hacer el sistema
function convertirAEscalaCalculo(nota) {
  const notaLimpia = nota.trim().toUpperCase();
  
  // Si es alfabético
  if (['AD', 'A', 'B', 'C'].includes(notaLimpia)) {
    const conversion = { 'AD': 4.0, 'A': 3.0, 'B': 2.0, 'C': 1.0 };
    return conversion[notaLimpia];
  }
  
  // Si es numérico
  const valor = parseFloat(notaLimpia);
  if (valor >= 18) return 4.0;  // AD
  if (valor >= 14) return 3.0;  // A
  if (valor >= 11) return 2.0;  // B
  return 1.0;                   // C
}

function calcularPromedio(valores) {
  const suma = valores.reduce((acc, val) => acc + val, 0);
  const promedio = suma / valores.length;
  
  // Convertir promedio a letra
  if (promedio >= 3.5) return { promedio, letra: 'AD' };
  if (promedio >= 2.5) return { promedio, letra: 'A' };
  if (promedio >= 1.5) return { promedio, letra: 'B' };
  return { promedio, letra: 'C' };
}

// Casos de prueba como los que están fallando
const casosTest = [
  ['18', '15', '12', '5'],  // Notas numéricas del log
  ['AD', 'A', 'B', 'C'],   // Notas alfabéticas
  ['18', 'A', '12', 'B']   // Mixto
];

casosTest.forEach((notas, i) => {
  console.log(`\n📝 Caso ${i + 1}: [${notas.join(', ')}]`);
  
  const valoresEscala = notas.map(convertirAEscalaCalculo);
  console.log(`   Escala: [${valoresEscala.join(', ')}]`);
  
  const resultado = calcularPromedio(valoresEscala);
  console.log(`   Promedio: ${resultado.promedio.toFixed(2)} → ${resultado.letra}`);
});

console.log('\n✅ El sistema dual debería funcionar así!');
