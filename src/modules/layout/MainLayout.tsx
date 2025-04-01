import React, { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div 
      className="min-h-screen flex flex-col bg-gray-50"
      style={{ '--primary-color': '#1a365d', '--secondary-color': '#f7fafc' } as React.CSSProperties}
    >
      <header 
        className="sticky top-0 z-10 bg-[var(--primary-color)] shadow-lg"
        aria-label="Cabecera principal"
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-white tracking-wide">
              Sistema de Gestión de Facturas
            </h1>
            {/* Espacio opcional para elementos de navegación */}
            <nav aria-label="Navegación principal">
              {/* Aquí podrías añadir elementos de navegación */}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {children}
          </div>
        </div>
      </main>

      <footer 
        className="border-t border-gray-200 bg-white mt-auto"
        aria-label="Pie de página"
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Sistema de Facturación. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};