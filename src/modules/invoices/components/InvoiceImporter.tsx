import React, { useState, useCallback, useRef, DragEvent } from 'react';
import { InvoiceController } from '../models/InvoiceController';
import { InvoiceData } from '../../../types/invoice';

interface InvoiceImporterProps {
  onImportComplete: (invoices: InvoiceData[]) => void;
  onImportError: (error: string) => void;
  onImportStart: () => void;
}

// Extender la interfaz InputHTMLAttributes para incluir los atributos directory y webkitdirectory
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
    mozdirectory?: string;
  }
}

const InvoiceImporter: React.FC<InvoiceImporterProps> = ({
  onImportComplete,
  onImportError,
  onImportStart,
}) => {
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  
  const invoiceController = InvoiceController.getInstance();

  // Manejar la carga de archivos individuales
  const handleFileUpload = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) return;
    
    try {
      onImportStart();
      setIsImporting(true);
      
      const jsonFiles = Array.from(files).filter(file => file.name.endsWith('.json'));
      
      if (jsonFiles.length === 0) {
        onImportError('No se encontraron archivos JSON válidos');
        setIsImporting(false);
        return;
      }
      
      const result = await invoiceController.handleFileUpload(jsonFiles);
      
      if (result.success && result.data) {
        onImportComplete(result.data);
      } else {
        onImportError(result.error || 'Error al procesar los archivos');
      }
    } catch (err) {
      console.error('Error al cargar archivos:', err);
      onImportError('Error al cargar archivos');
    } finally {
      setIsImporting(false);
      // Limpiar el input de archivos
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [onImportComplete, onImportError, onImportStart, invoiceController]);

  // Manejar el cambio en el input de archivos
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    handleFileUpload(Array.from(event.target.files));
  }, [handleFileUpload]);

  // Manejar la carga de carpetas
  const handleFolderUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      // Si no hay archivos seleccionados (canceló la selección), simplemente retornar
      console.log('No se seleccionaron archivos o se canceló la selección');
      return;
    }
    
    try {
      onImportStart();
      setIsImporting(true);
      
      const files = Array.from(event.target.files);
      console.log(`Se seleccionaron ${files.length} archivos en total`);
      
      // Filtrar solo archivos JSON
      const jsonFiles = files.filter(file => file.name.toLowerCase().endsWith('.json'));
      console.log(`De los cuales ${jsonFiles.length} son archivos JSON`);
      
      if (jsonFiles.length === 0) {
        onImportError('No se encontraron archivos JSON en la carpeta seleccionada');
        setIsImporting(false);
        return;
      }
      
      // Mostrar los nombres de los archivos JSON encontrados (para depuración)
      jsonFiles.forEach((file, index) => {
        console.log(`Archivo JSON ${index + 1}: ${file.name}`);
      });
      
      const result = await invoiceController.handleFileUpload(jsonFiles);
      
      if (result.success && result.data) {
        onImportComplete(result.data);
      } else {
        onImportError(result.error || 'Error al procesar los archivos de la carpeta');
      }
    } catch (err) {
      console.error('Error al cargar carpeta:', err);
      onImportError('Error al cargar carpeta');
    } finally {
      setIsImporting(false);
      // Limpiar el input de carpetas
      if (folderInputRef.current) {
        folderInputRef.current.value = '';
      }
    }
  }, [onImportComplete, onImportError, onImportStart, invoiceController]);

  // Manejar la carga desde URL
  const handleUrlImport = useCallback(async () => {
    if (!url.trim()) {
      onImportError('Por favor, ingrese una URL válida');
      return;
    }
    
    try {
      onImportStart();
      setIsImporting(true);
      
      const result = await invoiceController.handleUrlImport(url);
      
      if (result.success && result.data) {
        onImportComplete(result.data);
      } else {
        onImportError(result.error || 'Error al procesar los archivos desde la URL');
      }
    } catch (err) {
      console.error('Error al cargar desde URL:', err);
      onImportError('Error al cargar desde URL');
    } finally {
      setIsImporting(false);
      setUrl('');
      setShowUrlInput(false);
    }
  }, [url, onImportComplete, onImportError, onImportStart, invoiceController]);

  // Manejar eventos de arrastrar y soltar
  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(Array.from(e.dataTransfer.files));
    }
  }, [handleFileUpload]);

  // Simular clic en el input de archivos
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Simular clic en el input de carpetas
  const handleSelectFolder = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  };

  return (
    <div className="text-center py-4">
      <h2 className="text-2xl font-bold mb-2">Importación de Facturas Electrónicas</h2>
      <p className="text-gray-600 mb-6">Seleccione archivos JSON para cargarlos al sistema</p>
      
      {/* Área de arrastrar y soltar */}
      <div 
        className={`max-w-2xl mx-auto mb-6 border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <div className="flex flex-col items-center justify-center">
          {/* Icono de nube */}
          <svg 
            className="w-24 h-24 mb-4 text-gray-800" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"></path>
          </svg>
          
          <p className="mb-2 text-lg font-semibold">
            {isImporting ? 'Procesando archivos...' : 'Arrastre y suelte sus archivos JSON aquí, o'}
          </p>
          
          <div className="flex space-x-3 mb-2">
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => {
                e.stopPropagation();
                triggerFileInput();
              }}
              disabled={isImporting}
            >
              Elegir archivos
            </button>
            
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectFolder();
              }}
              disabled={isImporting}
            >
              Seleccionar carpeta
            </button>
            
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={(e) => {
                e.stopPropagation();
                setShowUrlInput(!showUrlInput);
              }}
              disabled={isImporting}
            >
              Desde URL
            </button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".json"
            multiple
            className="hidden"
            onClick={(e) => e.stopPropagation()}
          />
          
          <input
            type="file"
            ref={folderInputRef}
            onChange={handleFolderUpload}
            accept=".json"
            multiple
            directory=""
            webkitdirectory=""
            mozdirectory=""
            className="hidden"
            onClick={(e) => e.stopPropagation()}
          />
          
          {!isImporting && (
            <p className="text-xs text-gray-500">
              Solo se aceptan archivos JSON
            </p>
          )}
        </div>
      </div>
      
      {/* Input de URL */}
      {showUrlInput && (
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ejemplo.com/facturas.json"
              className="flex-1 border rounded-md px-3 py-2"
              disabled={isImporting}
            />
            <button
              onClick={handleUrlImport}
              disabled={isImporting || !url.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md disabled:bg-gray-400"
            >
              {isImporting ? 'Importando...' : 'Importar'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Ingrese la URL de un archivo JSON o un directorio que contenga archivos JSON
          </p>
        </div>
      )}
    </div>
  );
};

export default InvoiceImporter;
