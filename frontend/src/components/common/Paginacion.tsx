'use client';

import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';

interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  elementosPorPagina: number;
  onCambioPagina: (pagina: number) => void;
}

export default function Paginacion({
  paginaActual,
  totalPaginas,
  totalElementos,
  elementosPorPagina,
  onCambioPagina
}: PaginacionProps) {
  
  if (totalPaginas <= 1) return null;

  const inicio = (paginaActual - 1) * elementosPorPagina + 1;
  const fin = Math.min(paginaActual * elementosPorPagina, totalElementos);

  // Generar números de página a mostrar
  const generarNumerosPagina = () => {
    const numeros: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPaginas <= maxVisible) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      // Lógica para mostrar páginas con elipsis
      if (paginaActual <= 3) {
        // Inicio: 1, 2, 3, 4, ..., última
        for (let i = 1; i <= 4; i++) {
          numeros.push(i);
        }
        if (totalPaginas > 5) numeros.push('...');
        numeros.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 2) {
        // Final: 1, ..., antepenúltima, penúltima, última
        numeros.push(1);
        if (totalPaginas > 5) numeros.push('...');
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) {
          numeros.push(i);
        }
      } else {
        // Medio: 1, ..., actual-1, actual, actual+1, ..., última
        numeros.push(1);
        numeros.push('...');
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) {
          numeros.push(i);
        }
        numeros.push('...');
        numeros.push(totalPaginas);
      }
    }
    
    return numeros;
  };

  const numerosPagina = generarNumerosPagina();

  return (
    <div className="bg-white/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-t border-[#E9E1C9] sm:px-6 rounded-b-xl">
      
      {/* Información de elementos (móvil y desktop) */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onCambioPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="relative inline-flex items-center px-4 py-2 border border-[#E9E1C9] text-sm font-medium rounded-lg text-[#666666] bg-white hover:bg-[#FCE0C1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>
        <span className="text-sm text-gray-700 self-center">
          Página {paginaActual} de {totalPaginas}
        </span>
        <button
          onClick={() => onCambioPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-[#E9E1C9] text-sm font-medium rounded-lg text-[#666666] bg-white hover:bg-[#FCE0C1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
        </button>
      </div>

      {/* Versión desktop */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{inicio}</span> a{' '}
            <span className="font-medium">{fin}</span> de{' '}
            <span className="font-medium">{totalElementos}</span> resultados
          </p>
        </div>
        
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Paginación">
            
            {/* Botón primera página */}
            <button
              onClick={() => onCambioPagina(1)}
              disabled={paginaActual === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-[#E9E1C9] bg-white text-sm font-medium text-[#666666] hover:bg-[#FCE0C1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Primera página"
            >
              <ChevronDoubleLeftIcon className="h-5 w-5" />
            </button>
            
            {/* Botón página anterior */}
            <button
              onClick={() => onCambioPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="relative inline-flex items-center px-2 py-2 border border-[#E9E1C9] bg-white text-sm font-medium text-[#666666] hover:bg-[#FCE0C1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Página anterior"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>

            {/* Números de página */}
            {numerosPagina.map((numero, index) => (
              numero === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 border border-[#E9E1C9] bg-white text-sm font-medium text-[#666666]"
                >
                  ...
                </span>
              ) : (
                <button
                  key={numero}
                  onClick={() => onCambioPagina(numero as number)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                    numero === paginaActual
                      ? 'z-10 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] border-[#8D2C1D] text-white shadow-sm'
                      : 'bg-white border-[#E9E1C9] text-[#666666] hover:bg-[#FCE0C1]'
                  }`}
                >
                  {numero}
                </button>
              )
            ))}

            {/* Botón página siguiente */}
            <button
              onClick={() => onCambioPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="relative inline-flex items-center px-2 py-2 border border-[#E9E1C9] bg-white text-sm font-medium text-[#666666] hover:bg-[#FCE0C1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Página siguiente"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            
            {/* Botón última página */}
            <button
              onClick={() => onCambioPagina(totalPaginas)}
              disabled={paginaActual === totalPaginas}
              className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-[#E9E1C9] bg-white text-sm font-medium text-[#666666] hover:bg-[#FCE0C1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Última página"
            >
              <ChevronDoubleRightIcon className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
