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

  // Cargar configuración desde localStorage con expiración de 30 días
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        const now = new Date().getTime();
        
        // Verificar si la configuración ha expirado (30 días = 30 * 24 * 60 * 60 * 1000 ms)
        if (config.timestamp && (now - config.timestamp) > (30 * 24 * 60 * 60 * 1000)) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        
        if (config.tipoNota) setTipoNota(config.tipoNota);
        if (config.configLetras) setConfigLetras(config.configLetras);
        if (config.configNumeros) setConfigNumeros(config.configNumeros);
      } catch (error) {
        console.error('Error cargando configuración:', error);
      }
    }
  }, [isOpen]);

  // Guardar configuración en localStorage con timestamp
  const guardarConfiguracion = () => {
    const config = {
      tipoNota,
      configLetras,
      configNumeros,
      timestamp: new Date().getTime() // Agregar timestamp para expiración
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    alert('✅ Configuración guardada exitosamente (válida por 30 días)');
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-[#E9E1C9]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              🧮 Calculadora de Notas Personalizada
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-white/80 transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Selector de tipo de nota */}
          <div className="bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9] p-6 rounded-lg mb-6 border border-[#D4C5A9]">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-[#8D2C1D]">
              ⚙️ Configuración del Sistema
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-3 cursor-pointer bg-white/70 p-3 rounded-lg hover:bg-white/90 transition-all duration-200 border border-[#D4C5A9]">
                <input
                  type="radio"
                  value="letras"
                  checked={tipoNota === 'letras'}
                  onChange={(e) => setTipoNota(e.target.value as TipoNota)}
                  className="w-4 h-4 text-[#8D2C1D] focus:ring-[#8D2C1D]"
                />
                <span className="font-medium text-[#8D2C1D]">📝 Trabajar con Letras (AD, A, B, C)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer bg-white/70 p-3 rounded-lg hover:bg-white/90 transition-all duration-200 border border-[#D4C5A9]">
                <input
                  type="radio"
                  value="numeros"
                  checked={tipoNota === 'numeros'}
                  onChange={(e) => setTipoNota(e.target.value as TipoNota)}
                  className="w-4 h-4 text-[#8D2C1D] focus:ring-[#8D2C1D]"
                />
                <span className="font-medium text-[#8D2C1D]">🔢 Trabajar con Números (0-20)</span>
              </label>
            </div>
          </div>

          {/* Configuración de escalas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuración para letras */}
            {tipoNota === 'letras' && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-200 shadow-sm">
                <h3 className="font-semibold mb-4 text-[#8D2C1D] flex items-center gap-2">
                  📊 Valores de las Letras
                  <span className="text-sm font-normal text-gray-600">(Puntos por letra)</span>
                </h3>
                <div className="space-y-4">
                  {Object.entries(configLetras).map(([letra, valor]) => (
                    <div key={letra} className="flex items-center gap-3 bg-white/70 p-3 rounded-lg">
                      <span className="w-8 text-center font-bold text-[#8D2C1D] text-lg">{letra}:</span>
                      <input
                        type="number"
                        value={valor}
                        onChange={(e) => setConfigLetras({
                          ...configLetras,
                          [letra]: parseFloat(e.target.value) || 0
                        })}
                        className="w-20 px-3 py-2 border-2 border-[#E9E1C9] rounded-lg focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 text-center font-medium"
                        step="0.1"
                        min="0"
                      />
                      <span className="text-sm text-gray-600 font-medium">puntos</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Configuración para números */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-200 shadow-sm">
              <h3 className="font-semibold mb-4 text-[#8D2C1D] flex items-center gap-2">
                🎯 Rangos para Letras
                <span className="text-sm font-normal text-gray-600">(Puntos mínimos y máximos)</span>
              </h3>
              <div className="space-y-4">
                {Object.entries(configNumeros).map(([letra, rango]) => (
                  <div key={letra} className="flex items-center gap-3 bg-white/70 p-3 rounded-lg">
                    <span className="w-8 text-center font-bold text-[#8D2C1D] text-lg">{letra}:</span>
                    <input
                      type="number"
                      value={rango.min}
                      onChange={(e) => setConfigNumeros({
                        ...configNumeros,
                        [letra]: { ...rango, min: parseInt(e.target.value) || 0 }
                      })}
                      className="w-16 px-3 py-2 border-2 border-[#E9E1C9] rounded-lg focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 text-center font-medium"
                      min="0"
                      max="20"
                    />
                    <span className="text-[#8D2C1D] font-semibold">-</span>
                    <input
                      type="number"
                      value={rango.max}
                      onChange={(e) => setConfigNumeros({
                        ...configNumeros,
                        [letra]: { ...rango, max: parseInt(e.target.value) || 0 }
                      })}
                      className="w-16 px-3 py-2 border-2 border-[#E9E1C9] rounded-lg focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 text-center font-medium"
                      min="0"
                      max="20"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calculadora */}
          <div className="bg-gradient-to-br from-[#FCE0C1] to-[#F6CBA3] p-6 rounded-lg border-2 border-[#E9E1C9] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h3 className="font-bold text-[#8D2C1D] flex items-center gap-2 text-lg">
                🧮 Calculadora de Promedio
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={agregarNota}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar
                </button>
                <button
                  onClick={limpiarCalculadora}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Limpiar
                </button>
              </div>
            </div>

            {/* Inputs de notas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {notasIngresadas.map((nota, index) => (
                <div key={index} className="flex gap-2 bg-white/70 p-2 rounded-lg">
                  <input
                    type="text"
                    value={nota}
                    onChange={(e) => actualizarNota(index, e.target.value)}
                    placeholder={tipoNota === 'letras' ? 'AD, A, B, C' : '0-20'}
                    className="flex-1 px-3 py-2 border-2 border-[#E9E1C9] rounded-lg focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 text-center font-medium"
                  />
                  {notasIngresadas.length > 1 && (
                    <button
                      onClick={() => eliminarNota(index)}
                      className="px-2 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                      disabled={notasIngresadas.length <= 1}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={calcularPromedio}
              className="w-full bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white py-3 rounded-lg font-bold hover:from-[#7A2518] hover:to-[#C85A1F] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calcular Promedio
            </button>

            {/* Resultado */}
            {resultado && (
              <div className="mt-6 p-6 bg-gradient-to-br from-white to-[#FCE0C1] rounded-lg border-2 border-[#8D2C1D] shadow-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#8D2C1D] mb-3 animate-pulse">
                    {resultado.letra}
                  </div>
                  <div className="text-xl font-semibold text-[#666666] mb-2">
                    Promedio: {resultado.promedio}
                  </div>
                  <div className="text-sm text-gray-600 bg-white/70 p-3 rounded-lg">
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
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t-2 border-[#E9E1C9]">
            <button
              onClick={guardarConfiguracion}
              className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white px-6 py-3 rounded-lg font-semibold hover:from-[#7A2518] hover:to-[#C85A1F] transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Guardar Configuración
            </button>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
