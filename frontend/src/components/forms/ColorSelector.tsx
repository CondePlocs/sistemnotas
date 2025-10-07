'use client';

import { useState, useRef, useEffect } from 'react';
import { ChromePicker } from 'react-color';
import { 
  ColorSelectorProps, 
  PALETA_COLORES_CURSO, 
  isValidHexColor, 
  tieneContrasteAdecuado 
} from '@/types/curso';
import { 
  ChevronDownIcon, 
  SwatchIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

export default function ColorSelector({
  value,
  onChange,
  disabled = false,
  showPresets = true,
  showCustomPicker = true,
  label = "Color del curso",
  placeholder = "Seleccionar color"
}: ColorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'basicos' | 'vibrantes' | 'pasteles' | 'oscuros' | 'materias' | 'custom'>('basicos');
  const [showPicker, setShowPicker] = useState(false);
  const [customColor, setCustomColor] = useState(value || '#3B82F6');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
    setShowPicker(false);
  };

  const handleCustomColorChange = (color: any) => {
    const hexColor = color.hex;
    setCustomColor(hexColor);
    onChange(hexColor);
  };

  const getColorPreview = () => {
    if (!value || !isValidHexColor(value)) {
      return '#D1D5DB'; // Gris por defecto
    }
    return value;
  };

  const hasContrastWarning = value && isValidHexColor(value) && !tieneContrasteAdecuado(value);

  const tabs = [
    { key: 'basicos' as const, label: 'Básicos', count: PALETA_COLORES_CURSO.basicos.length },
    { key: 'vibrantes' as const, label: 'Vibrantes', count: PALETA_COLORES_CURSO.vibrantes.length },
    { key: 'pasteles' as const, label: 'Pasteles', count: PALETA_COLORES_CURSO.pasteles.length },
    { key: 'oscuros' as const, label: 'Oscuros', count: PALETA_COLORES_CURSO.oscuros.length },
    { key: 'materias' as const, label: 'Materias', count: PALETA_COLORES_CURSO.materias.length },
  ];

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-[#8D2C1D]">
        {label}
      </label>

      {/* Selector Principal */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            relative w-full bg-white border-2 border-[#E9E1C9] rounded-xl shadow-md pl-4 pr-10 py-3 text-left cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-[#8D2C1D]/20 focus:border-[#8D2C1D] transition-all duration-200
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-[#D96924] hover:shadow-lg'}
          `}
        >
          <div className="flex items-center space-x-3">
            {/* Preview del color */}
            <div 
              className="w-8 h-8 rounded-lg border-2 border-white shadow-md flex-shrink-0 ring-2 ring-[#E9E1C9]"
              style={{ backgroundColor: getColorPreview() }}
            />
            
            {/* Texto */}
            <span className="block truncate text-[#333333] font-medium">
              {value && isValidHexColor(value) ? value.toUpperCase() : placeholder}
            </span>

            {/* Advertencia de contraste */}
            {hasContrastWarning && (
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
            )}
          </div>

          {/* Icono dropdown */}
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDownIcon className={`w-5 h-5 text-[#8D2C1D] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>

        {/* Dropdown - ABRE HACIA ARRIBA */}
        {isOpen && (
          <div className="absolute z-50 bottom-full mb-2 w-full bg-white shadow-2xl max-h-[450px] rounded-2xl py-2 text-base ring-2 ring-[#E9E1C9] overflow-auto focus:outline-none">
            
            {/* Tabs */}
            {showPresets && (
              <div className="px-4 py-3 border-b-2 border-[#E9E1C9] bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9]">
                <div className="flex flex-wrap gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`
                        px-3 py-1.5 text-xs rounded-lg transition-all duration-200 font-medium
                        ${activeTab === tab.key 
                          ? 'bg-[#8D2C1D] text-white shadow-md transform scale-105' 
                          : 'bg-white text-[#666666] hover:bg-[#FCE0C1] hover:text-[#8D2C1D] border border-[#E9E1C9]'
                        }
                      `}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                  {showCustomPicker && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('custom');
                        setShowPicker(true);
                      }}
                      className={`
                        px-3 py-1.5 text-xs rounded-lg transition-all duration-200 flex items-center gap-1.5 font-medium
                        ${activeTab === 'custom' 
                          ? 'bg-[#D96924] text-white shadow-md transform scale-105' 
                          : 'bg-white text-[#666666] hover:bg-[#FCE0C1] hover:text-[#D96924] border border-[#E9E1C9]'
                        }
                      `}
                    >
                      <SwatchIcon className="w-3.5 h-3.5" />
                      <span>Personalizado</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Color Picker Personalizado */}
            {showPicker && activeTab === 'custom' && (
              <div className="p-3">
                <ChromePicker
                  color={customColor}
                  onChange={handleCustomColorChange}
                  disableAlpha={true}
                />
              </div>
            )}

            {/* Paleta de Colores */}
            {!showPicker && activeTab !== 'custom' && (
              <div className="p-4">
                <div className="grid grid-cols-4 gap-3">
                  {PALETA_COLORES_CURSO[activeTab].map((color) => (
                    <button
                      key={color.valor}
                      type="button"
                      onClick={() => handleColorSelect(color.valor)}
                      className={`
                        group relative p-2.5 rounded-xl border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg
                        ${value === color.valor 
                          ? 'border-[#8D2C1D] ring-2 ring-[#8D2C1D]/30 shadow-md' 
                          : 'border-[#E9E1C9] hover:border-[#D96924]'
                        }
                      `}
                      title={color.nombre}
                    >
                      <div 
                        className="w-full h-10 rounded-lg shadow-sm"
                        style={{ backgroundColor: color.valor }}
                      />
                      <div className="mt-2 text-xs text-center text-[#333333] font-medium truncate">
                        {color.nombre}
                      </div>
                      
                      {/* Checkmark para color seleccionado */}
                      {value === color.valor && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#8D2C1D] rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advertencia de contraste */}
      {hasContrastWarning && (
        <div className="flex items-center space-x-2 text-sm text-yellow-600">
          <ExclamationTriangleIcon className="w-4 h-4" />
          <span>Este color podría tener problemas de legibilidad</span>
        </div>
      )}

      {/* Información del color seleccionado */}
      {value && isValidHexColor(value) && (
        <div className="text-xs text-gray-500">
          Color seleccionado: <span className="font-mono">{value.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}
