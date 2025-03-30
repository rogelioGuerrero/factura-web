import React, { useState, useRef } from 'react';

interface JsonFieldDetectorProps {
  onFieldsDetected: (data: any) => void;
}

export const JsonFieldDetector: React.FC<JsonFieldDetectorProps> = ({ onFieldsDetected }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        
        // Pasar los datos JSON completos al componente padre
        onFieldsDetected(parsedData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error al parsear el archivo JSON:', err);
        setError('El archivo seleccionado no es un JSON válido');
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Error al leer el archivo');
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleReset = () => {
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Detector de Campos en JSON</h2>
      <p className="text-gray-600 mb-4">
        Suba un archivo JSON para detectar automáticamente campos nuevos que no estén en su configuración actual.
      </p>

      <div className="mb-4">
        <label 
          htmlFor="jsonFile" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Archivo JSON
        </label>
        <input
          type="file"
          id="jsonFile"
          ref={fileInputRef}
          accept=".json"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
          <span className="ml-2 text-sm text-gray-600">Analizando archivo...</span>
        </div>
      )}

      {fileName && !isLoading && !error && (
        <div className="flex justify-between items-center">
          <p className="text-green-600 font-medium">
            Archivo <span className="font-mono">{fileName}</span> cargado correctamente
          </p>
          <button
            onClick={handleReset}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
          >
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
};
