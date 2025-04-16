import React from 'react';

// Componente de mapa simplificado (versión estática)
const MapComponent = () => {
  return (
    <div className="h-full w-full bg-slate-200 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🗺️</div>
        <p className="text-lg font-medium">Visualización de Mapa</p>
        <p className="text-sm text-slate-600 mt-2">
          (Mapa estático para demostración)
        </p>
      </div>
    </div>
  );
};

export default MapComponent;