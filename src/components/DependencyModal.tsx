// src/components/DependencyModal.tsx
import React from 'react';

interface DependencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  componentName: string;
  dotContent?: string;
}

const DependencyModal: React.FC<DependencyModalProps> = ({ 
  isOpen, 
  onClose, 
  componentName,
  dotContent 
}) => {
  if (!isOpen) return null;

  const downloadDotFile = () => {
    if (!dotContent) return;
    
    const blob = new Blob([dotContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${componentName}_dependencies.dot`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-3/4 max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Dependencias de {componentName}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="border rounded p-4 bg-gray-50 overflow-auto">
          {dotContent ? (
            <>
              <div className="mb-4">
                <p className="text-sm mb-2">Para visualizar el gráfico con Graphviz Interactive Preview:</p>
                <ol className="list-decimal pl-5 text-sm">
                  <li className="mb-1">Descarga el archivo DOT</li>
                  <li className="mb-1">Abre el archivo en VS Code</li>
                  <li className="mb-1">Usa la extensión "Graphviz Interactive Preview" para visualizarlo</li>
                </ol>
                <div className="flex space-x-2 mt-2">
                  <button 
                    onClick={downloadDotFile}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Descargar archivo DOT
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(dotContent);
                      alert('Contenido DOT copiado al portapapeles');
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Copiar al portapapeles
                  </button>
                </div>
              </div>
              <pre className="text-sm font-mono whitespace-pre-wrap border p-2 bg-gray-100">{dotContent}</pre>
            </>
          ) : (
            <p className="text-gray-500">No se encontraron dependencias para este componente.</p>
          )}
        </div>
        
        <div className="mt-4 text-right">
          <button 
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DependencyModal;