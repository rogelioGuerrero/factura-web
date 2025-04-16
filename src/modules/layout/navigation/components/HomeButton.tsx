import React from 'react';
import { Link } from 'react-router-dom';
import { HiHome } from 'react-icons/hi';

/**
 * Botón para regresar a la página principal desde cualquier módulo
 */
const HomeButton: React.FC = () => {
  return (
    <Link 
      to="/" 
      className="home-button fixed bottom-4 right-4 z-50 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all"
      title="Volver al inicio"
    >
      
      <svg 
        className="w-6 h-6 text-blue-600" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    </Link>
  );
};

export default HomeButton;
