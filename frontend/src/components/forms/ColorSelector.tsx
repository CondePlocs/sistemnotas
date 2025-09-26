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
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Selector Principal */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400'}
          `}
        >
          <div className="flex items-center space-x-3">
            {/* Preview del color */}
            <div 
              className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
              style={{ backgroundColor: getColorPreview() }}
            />
            
            {/* Texto */}
            <span className="block truncate text-gray-900">
              {value && isValidHexColor(value) ? value.toUpperCase() : placeholder}
            </span>

            {/* Advertencia de contraste */}
            {hasContrastWarning && (
              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
            )}
          </div>

          {/* Icono dropdown */}
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          </span>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            
            {/* Tabs */}
            {showPresets && (
              <div className="px-3 py-2 border-b border-gray-200">
                <div className="flex flex-wrap gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`
                        px-2 py-1 text-xs rounded-md transition-colors
                        ${activeTab === tab.key 
                          ? 'bg-blue-100 text-blue-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'
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
                        px-2 py-1 text-xs rounded-md transition-colors flex items-center space-x-1
                        ${activeTab === 'custom' 
                          ? 'bg-purple-100 text-purple-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'
                        }
                      `}
                    >
                      <SwatchIcon className="w-3 h-3" />
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
              <div className="p-3">
                <div className="grid grid-cols-4 gap-2">
                  {PALETA_COLORES_CURSO[activeTab].map((color) => (
                    <button
                      key={color.valor}
                      type="button"
                      onClick={() => handleColorSelect(color.valor)}
                      className={`
                        group relative p-2 rounded-md border-2 transition-all hover:scale-105
                        ${value === color.valor 
                          ? 'border-gray-900 ring-2 ring-blue-500' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      title={color.nombre}
                    >
                      <div 
                        className="w-full h-8 rounded"
                        style={{ backgroundColor: color.valor }}
                      />
                      <div className="mt-1 text-xs text-center text-gray-600 truncate">
                        {color.nombre}
                      </div>
                      
                      {/* Checkmark para color seleccionado */}
                      {value === color.valor && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
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
