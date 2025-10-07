'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ModalConfirmarPasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title?: string;
  message?: string;
}

export default function ModalConfirmarPassword({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Cambios',
  message = 'Por seguridad, ingresa tu contraseña para confirmar los cambios.'
}: ModalConfirmarPasswordProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('La contraseña es obligatoria');
      return;
    }

    onConfirm(password);
    setPassword('');
    setError('');
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[70]" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/65 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all">
                {/* Icono de seguridad */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#8D2C1D]/10 mb-4">
                  <svg
                    className="h-8 w-8 text-[#8D2C1D]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>

                {/* Título */}
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold text-center text-[#333333] mb-2"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  {title}
                </Dialog.Title>

                {/* Mensaje */}
                <p className="text-sm text-center text-[#666666] mb-6">
                  {message}
                </p>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-[#333333] mb-2">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        error
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-[#E9E1C9] focus:border-[#8D2C1D] focus:ring-[#8D2C1D]/20'
                      }`}
                      placeholder="Ingresa tu contraseña"
                      autoFocus
                    />
                    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 px-4 py-3 border-2 border-[#E9E1C9] text-[#333333] rounded-lg hover:border-[#8D2C1D] transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-[#8D2C1D] hover:bg-[#84261A] text-white rounded-lg transition-colors font-medium"
                    >
                      Confirmar
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
