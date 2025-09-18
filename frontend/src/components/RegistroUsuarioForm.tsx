"use client";

import { useState } from "react";

interface RegistroUsuarioFormProps {
  onSubmit?: (data: RegistroUsuarioData) => void;
}

interface RegistroUsuarioData {
  email: string;
  password: string;
  dni?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
}

export default function RegistroUsuarioForm({ onSubmit }: RegistroUsuarioFormProps) {
  const [formData, setFormData] = useState<RegistroUsuarioData>({
    email: "",
    password: "",
    dni: "",
    nombres: "",
    apellidos: "",
    telefono: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    console.log("Registro Usuario:", formData);
  };

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
        Registrar Usuario
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
            DNI
          </label>
          <input
            id="dni"
            name="dni"
            type="text"
            value={formData.dni}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="nombres" className="block text-sm font-medium text-gray-700">
            Nombres
          </label>
          <input
            id="nombres"
            name="nombres"
            type="text"
            value={formData.nombres}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700">
            Apellidos
          </label>
          <input
            id="apellidos"
            name="apellidos"
            type="text"
            value={formData.apellidos}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            value={formData.telefono}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Registrar Usuario
        </button>
      </form>
    </div>
  );
}
