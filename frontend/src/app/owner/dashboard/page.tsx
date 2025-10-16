"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import OwnerSidebar from "@/components/layout/OwnerSidebar";
import DashboardFooter from "@/components/layout/DashboardFooter";
import ActionCard from "@/components/layout/ActionCard";
import StatCard from "@/components/layout/StatCard";

function OwnerDashboardContent() {
  return (
    <OwnerSidebar>
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header de la página */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold text-[#333333] mb-2" 
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Dashboard Owner
          </h1>
          <p className="text-[#666666]">Panel de control y gestión del sistema educativo</p>
        </div>
        
        {/* Sección de Acciones Principales */}
        <div className="mb-8">
          <h2 
            className="text-2xl font-bold text-[#333333] mb-6" 
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Gestión del Sistema
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card: Gestionar Administradores */}
            <ActionCard
              title="Administradores"
              description="Registrar nuevos usuarios con rol de Owner en el sistema."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              href="/owner/registro"
              buttonText="Registrar Owner"
              color="primary"
            />

            {/* Card: Gestionar Directores */}
            <ActionCard
              title="Directores"
              description="Registrar y gestionar directores para las instituciones educativas."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              href="/owner/directores"
              buttonText="Gestionar Directores"
              color="secondary"
            />

            {/* Card: Gestionar Colegios */}
            <ActionCard
              title="Colegios"
              description="Administrar instituciones educativas del sistema."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
              href="/owner/colegios"
              buttonText="Registrar Colegio"
              color="info"
            />

            {/* Card: Gestionar Cursos */}
            <ActionCard
              title="Cursos"
              description="Crear y gestionar cursos con sus competencias educativas."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              href="/owner/cursos/nuevo"
              buttonText="Crear Curso"
              color="warning"
              secondaryAction={{
                href: "/owner/cursos",
                text: "Ver Todos los Cursos"
              }}
            />

          </div>
        </div>

        {/* Sección de Estadísticas */}
        <div>
          <h2 
            className="text-2xl font-bold text-[#333333] mb-6" 
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Estadísticas del Sistema
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            <StatCard
              label="Owners"
              value={0}
              color="primary"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            <StatCard
              label="Directores"
              value={0}
              color="secondary"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />

            <StatCard
              label="Colegios"
              value={0}
              color="info"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />

            <StatCard
              label="Cursos"
              value={0}
              color="warning"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            />

            <StatCard
              label="Usuarios Total"
              value={0}
              color="gray"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />

          </div>
        </div>

        {/* Footer */}
        <DashboardFooter />
      </main>
    </OwnerSidebar>
  );
}

export default function OwnerDashboard() {
  return (
    <ProtectedRoute requiredRole="OWNER">
      <OwnerDashboardContent />
    </ProtectedRoute>
  );
}
