import React, { useState, useEffect } from 'react';

type TipoNota = 'letras' | 'numeros';

interface ConfiguracionLetras {
  AD: number;
  A: number;
  B: number;
  C: number;
}

interface ConfiguracionNumeros {
  AD: { min: number; max: number };
  A: { min: number; max: number };
  B: { min: number; max: number };
  C: { min: number; max: number };
}

interface ModalCalculadoraNotasProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'calculadora_notas_config';

export default function ModalCalculadoraNotas({ isOpen, onClose }: ModalCalculadoraNotasProps) {
  const [tipoNota, setTipoNota] = useState<TipoNota>('letras');
  const [configLetras, setConfigLetras] = useState<ConfiguracionLetras>({
    AD: 4,
    A: 3,
    B: 2,
    C: 1
  });
  const [configNumeros, setConfigNumeros] = useState<ConfiguracionNumeros>({
    AD: { min: 18, max: 20 },
    A: { min: 14, max: 17 },
    B: { min: 11, max: 13 },
    C: { min: 0, max: 10 }
  });
  const [notasIngresadas, setNotasIngresadas] = useState<string[]>(['']);
  const [resultado, setResultado] = useState<{ promedio: number; letra: string } | null>(null);

  // Cargar configuración desde localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.tipoNota) setTipoNota(config.tipoNota);
        if (config.configLetras) setConfigLetras(config.configLetras);
        if (config.configNumeros) setConfigNumeros(config.configNumeros);
      } catch (error) {
        console.error('Error cargando configuración:', error);
      }
    }
  }, [isOpen]);

  // Guardar configuración en localStorage
  const guardarConfiguracion = () => {
    const config = {
      tipoNota,
      configLetras,
      configNumeros
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    alert('✅ Configuración guardada exitosamente');
  };

  // Agregar nueva nota
  const agregarNota = () => {
    setNotasIngresadas([...notasIngresadas, '']);
  };

  // Eliminar nota
  const eliminarNota = (index: number) => {
    if (notasIngresadas.length > 1) {
      const nuevasNotas = notasIngresadas.filter((_, i) => i !== index);
      setNotasIngresadas(nuevasNotas);
    }
  };

  // Actualizar nota
  const actualizarNota = (index: number, valor: string) => {
    const nuevasNotas = [...notasIngresadas];
    nuevasNotas[index] = valor;
    setNotasIngresadas(nuevasNotas);
  };

  // Convertir letra a número según configuración
  const letraANumero = (letra: string): number => {
    const letraUpper = letra.toUpperCase() as keyof ConfiguracionLetras;
    return configLetras[letraUpper] || 0;
  };

  // Convertir número a letra según configuración
  const numeroALetra = (numero: number): string => {
    if (numero >= configNumeros.AD.min && numero <= configNumeros.AD.max) return 'AD';
    if (numero >= configNumeros.A.min && numero <= configNumeros.A.max) return 'A';
    if (numero >= configNumeros.B.min && numero <= configNumeros.B.max) return 'B';
    return 'C';
  };

  // Calcular promedio
  const calcularPromedio = () => {
    const notasValidas = notasIngresadas.filter(nota => nota.trim() !== '');
    if (notasValidas.length === 0) {
      setResultado(null);
      return;
    }

    let suma = 0;
    let contador = 0;

    notasValidas.forEach(nota => {
      const notaTrim = nota.trim();
      if (tipoNota === 'letras') {
        if (['AD', 'A', 'B', 'C'].includes(notaTrim.toUpperCase())) {
          suma += letraANumero(notaTrim);
          contador++;
        }
      } else {
        const numero = parseFloat(notaTrim);
        if (!isNaN(numero)) {
          suma += numero;
          contador++;
        }
      }
    });

    if (contador > 0) {
      const promedio = suma / contador;
      const letra = tipoNota === 'letras' 
        ? numeroALetra(promedio) 
        : numeroALetra(promedio);
      
      setResultado({ promedio: Math.round(promedio * 100) / 100, letra });
    } else {
      setResultado(null);
    }
  };

  // Limpiar calculadora
  const limpiarCalculadora = () => {
    setNotasIngresadas(['']);
    setResultado(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              🧮 Calculadora de Notas Personalizada
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Selector de tipo de nota */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              ⚙️ Configuración del Sistema
            </h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="letras"
                  checked={tipoNota === 'letras'}
                  onChange={(e) => setTipoNota(e.target.value as TipoNota)}
                  className="w-4 h-4 text-purple-600"
                />
                <span>📝 Trabajar con Letras (AD, A, B, C)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="numeros"
                  checked={tipoNota === 'numeros'}
                  onChange={(e) => setTipoNota(e.target.value as TipoNota)}
                  className="w-4 h-4 text-purple-600"
                />
                <span>🔢 Trabajar con Números (0-20)</span>
              </label>
            </div>
          </div>

          {/* Configuración de escalas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuración para letras */}
            {tipoNota === 'letras' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-blue-800">📊 Valores de las Letras</h3>
                <div className="space-y-3">
                  {Object.entries(configLetras).map(([letra, valor]) => (
                    <div key={letra} className="flex items-center gap-3">
                      <span className="w-8 text-center font-bold">{letra}:</span>
                      <input
                        type="number"
                        value={valor}
                        onChange={(e) => setConfigLetras({
                          ...configLetras,
                          [letra]: parseFloat(e.target.value) || 0
                        })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        step="0.1"
                        min="0"
                      />
                      <span className="text-sm text-gray-600">puntos</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Configuración para números */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-green-800">🎯 Rangos para Letras</h3>
              <div className="space-y-3">
                {Object.entries(configNumeros).map(([letra, rango]) => (
                  <div key={letra} className="flex items-center gap-2">
                    <span className="w-8 text-center font-bold">{letra}:</span>
                    <input
                      type="number"
                      value={rango.min}
                      onChange={(e) => setConfigNumeros({
                        ...configNumeros,
                        [letra]: { ...rango, min: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      min="0"
                      max="20"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={rango.max}
                      onChange={(e) => setConfigNumeros({
                        ...configNumeros,
                        [letra]: { ...rango, max: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      min="0"
                      max="20"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calculadora */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
                🧮 Calculadora de Promedio
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={agregarNota}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                >
                  ➕ Agregar
                </button>
                <button
                  onClick={limpiarCalculadora}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  🗑️ Limpiar
                </button>
              </div>
            </div>

            {/* Inputs de notas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {notasIngresadas.map((nota, index) => (
                <div key={index} className="flex gap-1">
                  <input
                    type="text"
                    value={nota}
                    onChange={(e) => actualizarNota(index, e.target.value)}
                    placeholder={tipoNota === 'letras' ? 'AD, A, B, C' : '0-20'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
                  />
                  {notasIngresadas.length > 1 && (
                    <button
                      onClick={() => eliminarNota(index)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={calcularPromedio}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              🎯 Calcular Promedio
            </button>

            {/* Resultado */}
            {resultado && (
              <div className="mt-4 p-4 bg-white rounded-lg border-2 border-purple-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {resultado.letra}
                  </div>
                  <div className="text-lg text-gray-600">
                    Promedio: {resultado.promedio}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {tipoNota === 'letras' 
                      ? `Calculado con valores: AD=${configLetras.AD}, A=${configLetras.A}, B=${configLetras.B}, C=${configLetras.C}`
                      : `Según rangos configurados`
                    }
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between pt-4 border-t">
            <button
              onClick={guardarConfiguracion}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              💾 Guardar Configuración
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
