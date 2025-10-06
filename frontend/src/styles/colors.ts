/**
 * Paleta de Colores de Arequipa
 * Inspirada en los colores característicos de la Ciudad Blanca
 */

export const arequipaColors = {
  // Colores Principales
  primary: {
    main: '#8D2C1D',      // Rojo Colonial (Pantone 1807)
    light: '#993318',     // Pantone 1675
    dark: '#84261A',      // Pantone 484
  },
  
  // Colores Secundarios/Acento
  secondary: {
    main: '#D96924',      // Ocre Intenso (Pantone 145)
    light: '#E88C31',     // Pantone 138
    dark: '#C64925',      // Pantone 159
  },
  
  // Fondos
  background: {
    main: '#FCE0C1',      // Rosa Sillar (Pantone 475)
    card: '#E9E1C9',      // Gris Sillar (Pantone 5807)
    light: '#F6CBA3',     // Pantone 488
  },
  
  // Azules (para información)
  info: {
    main: '#3D73B9',      // Pantone 2718
    light: '#89B0D9',     // Pantone 2717
    lighter: '#ADC8E6',   // Pantone 2708
  },
  
  // Amarillos (para advertencias)
  warning: {
    main: '#FDD762',      // Pantone 156
    light: '#FDE699',     // Pantone 155
    dark: '#FCC44F',      // Pantone 1355
  },
  
  // Grises
  gray: {
    main: '#C7C9C7',      // Pantone 420
    light: '#E9E1C9',     // Pantone 5807
    medium: '#CAD1C9',    // Pantone 5455
  },
  
  // Texto
  text: {
    primary: '#333333',   // Gris Oscuro
    secondary: '#666666',
    light: '#999999',
  },
};

// Clases de Tailwind personalizadas (para usar en className)
export const tailwindColors = {
  // Primarios
  'bg-arequipa-primary': 'bg-[#8D2C1D]',
  'text-arequipa-primary': 'text-[#8D2C1D]',
  'border-arequipa-primary': 'border-[#8D2C1D]',
  'hover:bg-arequipa-primary-dark': 'hover:bg-[#84261A]',
  
  // Secundarios
  'bg-arequipa-secondary': 'bg-[#D96924]',
  'text-arequipa-secondary': 'text-[#D96924]',
  'hover:bg-arequipa-secondary-dark': 'hover:bg-[#C64925]',
  
  // Fondos
  'bg-arequipa-main': 'bg-[#FCE0C1]',
  'bg-arequipa-card': 'bg-[#E9E1C9]',
};
