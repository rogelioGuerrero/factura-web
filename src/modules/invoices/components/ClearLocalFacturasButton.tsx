import React, { useState } from 'react';

const ClearLocalFacturasButton: React.FC = () => {
  const [showMsg, setShowMsg] = useState(false);
  const handleClear = () => {
    localStorage.removeItem('facturas-importadas');
    setShowMsg(true);
    setTimeout(() => setShowMsg(false), 2000);
  };

  // Detecta si existen facturas en localStorage
  const hasFacturas = Boolean(localStorage.getItem('facturas-importadas'));

  if (!hasFacturas && !showMsg) return null;

  return (
    <div className="my-4">
      <button
        className="btn btn-outline btn-error"
        onClick={handleClear}
      >
        Limpiar facturas importadas del navegador
      </button>
      {showMsg && (
        <div className="mt-2 text-green-700 bg-green-100 px-4 py-2 rounded">
          ¡Facturas eliminadas del almacenamiento local!
        </div>
      )}
    </div>
  );
};

export default ClearLocalFacturasButton;
