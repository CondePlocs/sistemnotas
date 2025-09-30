"use client";

export default function LoadingCard() {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden animate-pulse">
      {/* Barra de color superior */}
      <div className="h-2 w-full bg-gray-300"></div>

      <div className="p-6">
        {/* Header del curso */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="p-2 bg-gray-300 rounded-lg ml-3 w-9 h-9"></div>
        </div>

        {/* Información del salón */}
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="h-4 w-4 bg-gray-300 rounded mr-2"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>

          <div className="flex items-center">
            <div className="h-4 w-4 bg-gray-300 rounded mr-2"></div>
            <div className="h-4 bg-gray-300 rounded w-20"></div>
          </div>

          <div className="flex items-center">
            <div className="h-4 w-4 bg-gray-300 rounded mr-2"></div>
            <div className="h-4 bg-gray-300 rounded w-28"></div>
          </div>
        </div>

        {/* Badge de estado */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-300 rounded-full w-16"></div>
            <div className="h-4 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
