import { ChangeEvent, DragEvent, useState } from 'react';
import { InvoiceController } from '@/modules/shared/controllers';
import { InvoiceData, ProcessResult } from '@/types/invoice';

interface FileUploadStepProps {
  onFilesProcessed: (invoices: InvoiceData[]) => void;
  onError: (message: string) => void;
  isProcessing?: boolean;
  setIsProcessing?: React.Dispatch<React.SetStateAction<boolean>>;
}

const FileUploadStep = ({ onFilesProcessed, onError, isProcessing, setIsProcessing }: FileUploadStepProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'info' | 'warning' | 'error', message: string } | null>(null);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [mainFolderFiles, setMainFolderFiles] = useState<File[]>([]);
  const [ignoredFiles, setIgnoredFiles] = useState<number>(0);
  const [duplicateFiles, setDuplicateFiles] = useState<{name: string, code: string}[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const clearFeedback = () => {
    setFeedback(null);
  };

  const showFeedback = (type: 'info' | 'warning' | 'error', message: string) => {
    setFeedback({ type, message });
    // Auto-clear info and warning messages after 5 seconds
    if (type !== 'error') {
      setTimeout(clearFeedback, 5000);
    }
  };

  const handleProcessResult = (result: ProcessResult) => {
    // Check for duplicate warnings specifically
    const duplicateWarnings = result.warnings?.filter(warning => 
      warning.includes('duplicado') || warning.includes('ya existe')
    ) || [];
    
    const otherWarnings = result.warnings?.filter(warning => 
      !warning.includes('duplicado') && !warning.includes('ya existe')
    ) || [];
    
    // Display duplicate warnings with a different style if present
    if (duplicateWarnings.length > 0) {
      setFeedback({
        type: 'warning',
        message: `⚠️ ARCHIVOS DUPLICADOS: ${duplicateWarnings.join('\n')}`,
      });
      
      // Don't auto-clear duplicate warnings
      setTimeout(() => {
        // After showing duplicates, show other warnings if any
        if (otherWarnings.length > 0) {
          showFeedback('warning', otherWarnings.join('\n'));
        }
      }, 1000); // Show other warnings after a delay
    } 
    // Display other warnings if no duplicates
    else if (otherWarnings.length > 0) {
      showFeedback('warning', otherWarnings.join('\n'));
    }
    
    // Process data
    if (!result.data || result.data.length === 0) {
      // Only show this if we didn't show duplicate warnings
      if (duplicateWarnings.length === 0) {
        showFeedback('warning', 'No se pudieron procesar archivos válidos');
      }
    } else {
      // If we have both duplicates and valid files
      if (duplicateWarnings.length > 0) {
        showFeedback('info', `Se procesaron ${result.data.length} facturas correctamente. Algunas facturas fueron omitidas por ser duplicadas.`);
      } else {
        showFeedback('info', `Se procesaron ${result.data.length} facturas correctamente`);
      }
      onFilesProcessed(result.data);
    }
  };

  const processFiles = async (files: FileList) => {
    if (files.length === 0) {
      showFeedback('warning', 'No se seleccionaron archivos');
      return;
    }

    setIsProcessing?.(true);
    clearFeedback();
    
    try {
      // Check if there are any non-JSON files
      const nonJsonFiles = Array.from(files).filter(file => !file.name.toLowerCase().endsWith('.json'));
      if (nonJsonFiles.length > 0) {
        showFeedback('warning', `Se ignorarán ${nonJsonFiles.length} archivo(s) que no son JSON`);
      }
      
      const controller = new InvoiceController();
      const result = await controller.processFiles(Array.from(files));
      handleProcessResult(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al procesar los archivos';
      onError(errorMsg);
    } finally {
      setIsProcessing?.(false);
    }
  };

  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
  };

  const handleFolderInput = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing?.(true);
      clearFeedback();
      
      try {
        // Analizar los archivos de la carpeta antes de procesar
        const filesArray = Array.from(e.target.files);
        
        // Obtener la ruta de la carpeta principal
        const mainFolderPath = filesArray[0].webkitRelativePath.split('/')[0];
        
        // Filtrar solo los archivos que están directamente en la carpeta principal
        const mainFolderFilesArray = filesArray.filter(file => {
          const pathParts = file.webkitRelativePath.split('/');
          return pathParts.length === 2 && pathParts[0] === mainFolderPath && file.name.toLowerCase().endsWith('.json');
        });
        
        // Calcular archivos ignorados
        const ignoredCount = filesArray.length - mainFolderFilesArray.length;
        
        // Guardar información para el diálogo
        setMainFolderFiles(mainFolderFilesArray);
        setIgnoredFiles(ignoredCount);
        
        // Verificar duplicados antes de mostrar el diálogo
        if (mainFolderFilesArray.length > 0) {
          setIsCheckingDuplicates(true);
          const duplicates: {name: string, code: string}[] = [];
          
          const controller = new InvoiceController();
          
          // Verificar cada archivo para detectar duplicados
          for (const file of mainFolderFilesArray) {
            try {
              const content = await readFileContent(file);
              const data = JSON.parse(content);
              
              if (data.identificacion?.codigoGeneracion) {
                // Usar el método público checkDuplicateInvoice en lugar de acceder directamente a invoiceService
                const isDuplicate = await controller.checkDuplicateInvoice(data.identificacion.codigoGeneracion);
                
                if (isDuplicate) {
                  duplicates.push({
                    name: file.name,
                    code: data.identificacion.codigoGeneracion
                  });
                }
              }
            } catch (error) {
              console.error(`Error al verificar duplicado para ${file.name}:`, error);
            }
          }
          
          setDuplicateFiles(duplicates);
          setIsCheckingDuplicates(false);
        }
        
        // Mostrar diálogo de confirmación solo si hay archivos JSON para procesar
        if (mainFolderFilesArray.length > 0) {
          setFolderDialogOpen(true);
        } else {
          showFeedback('warning', 'La carpeta seleccionada no contiene archivos JSON en el nivel principal');
        }
      } catch (error) {
        console.error('Error al analizar carpeta:', error);
        showFeedback('error', 'Error al analizar la carpeta seleccionada');
      } finally {
        setIsProcessing?.(false);
      }
    }
  };

  // Función auxiliar para leer el contenido de un archivo
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Error al leer el archivo'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  };

  const cancelFolderUpload = () => {
    // Limpiar estados y cerrar diálogo
    setMainFolderFiles([]);
    setIgnoredFiles(0);
    setDuplicateFiles([]);
    setFolderDialogOpen(false);
  };

  const confirmFolderUpload = async () => {
    // Cerrar el diálogo
    setFolderDialogOpen(false);
    
    // Filtrar archivos duplicados
    const filesToProcess = mainFolderFiles.filter(file => 
      !duplicateFiles.some(dup => dup.name === file.name)
    );
    
    // Procesar los archivos no duplicados
    if (filesToProcess.length > 0) {
      await processFolder(filesToProcess);
    } else if (duplicateFiles.length > 0) {
      // Si todos los archivos son duplicados, mostrar mensaje
      showFeedback('warning', 'Todos los archivos seleccionados ya existen en la base de datos');
    }
  };

  const processFolder = async (files: File[]) => {
    if (files.length === 0) {
      showFeedback('warning', 'La carpeta seleccionada no contiene archivos JSON válidos');
      return;
    }

    setIsProcessing?.(true);
    clearFeedback();
    
    try {
      // Display info about total files found
      showFeedback('info', `Procesando ${files.length} archivos JSON de la carpeta...`);
      
      const controller = new InvoiceController();
      const result = await controller.processFiles(files);
      handleProcessResult(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al procesar los archivos de la carpeta';
      onError(errorMsg);
    } finally {
      setIsProcessing?.(false);
    }
  };

  const processUrl = async () => {
    if (!urlInput.trim()) {
      showFeedback('warning', 'Por favor ingrese una URL válida');
      return;
    }

    setIsProcessing?.(true);
    clearFeedback();
    
    try {
      showFeedback('info', `Procesando URL: ${urlInput}`);
      
      const controller = new InvoiceController();
      const result = await controller.processUrl(urlInput);
      handleProcessResult(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al procesar la URL';
      onError(errorMsg);
    } finally {
      setIsProcessing?.(false);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Importación de Facturas Electrónicas</h2>
      <p className="text-gray-600 mb-6">Seleccione archivos JSON para cargarlos al sistema</p>
      
      {feedback && (
        <div 
          className={`mb-4 p-3 rounded flex justify-between items-start ${
            feedback.type === 'error' ? 'bg-red-100 text-red-700 border border-red-400' :
            feedback.type === 'warning' && feedback.message.includes('DUPLICADOS') ? 'bg-amber-100 text-amber-800 border-2 border-amber-500' :
            feedback.type === 'warning' && feedback.message.includes('duplicados') ? 'bg-amber-100 text-amber-800 border-2 border-amber-500' :
            feedback.type === 'warning' ? 'bg-yellow-100 text-yellow-700 border border-yellow-400' :
            'bg-blue-100 text-blue-700 border border-blue-400'
          }`}
        >
          <div className="flex-1">
            <div className="font-bold mb-1">
              {feedback.type === 'error' ? 'Error:' : 
               feedback.type === 'warning' && (feedback.message.includes('DUPLICADOS') || feedback.message.includes('duplicados')) ? 'Atención:' :
               feedback.type === 'warning' ? 'Advertencia:' : 
               'Información:'}
            </div>
            <div 
              className="whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: feedback.message
                  // Convert bullet points to HTML
                  .replace(/• (.*?)(?=\n•|\n\n|$)/gs, '<li>$1</li>')
                  // Wrap lists in ul tags
                  .replace(/(<li>.*?)(?=<\/li>)/gs, (match) => {
                    return match;
                  })
                  // Add ul tags around consecutive li elements
                  .replace(/(<li>.*?<\/li>)+/gs, '<ul class="list-disc pl-5 mb-2">$&</ul>')
                  // Convert line breaks to <br> tags
                  .replace(/\n(?!<\/li>|<li>|<\/ul>|<ul>)/g, '<br>')
              }}
            />
          </div>
          <button
            onClick={clearFeedback}
            className="text-xl font-bold ml-2 flex-shrink-0"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      )}
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <img 
              src="/upload-icon.svg" 
              alt="Upload" 
              className="w-16 h-16 text-gray-400"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>';
                e.currentTarget.style.filter = 'invert(60%)';
              }}
            />
          </div>
          <h3 className="text-lg font-medium">
            {isProcessing ? 'Procesando...' : 'Arrastre archivos aquí o haga clic para seleccionar'}
          </h3>
          <p className="text-sm text-gray-500">
            Formatos aceptados: JSON
          </p>
          
          <div className="flex justify-center space-x-4">
            <div>
              <label 
                htmlFor="file-upload" 
                className={`cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Seleccionar Archivos
              </label>
              <input 
                id="file-upload" 
                type="file" 
                multiple 
                accept=".json" 
                className="hidden" 
                onChange={handleFileInput}
                disabled={isProcessing}
              />
            </div>
            
            <div>
              <label 
                htmlFor="folder-upload" 
                className={`cursor-pointer px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Seleccionar Carpeta
              </label>
              <input 
                id="folder-upload" 
                type="file" 
                webkitdirectory="true" 
                directory="true"
                multiple
                className="hidden" 
                onChange={handleFolderInput}
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">O procesar desde URL</h3>
        <div className="flex">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://ejemplo.com/facturas.json"
            className="flex-1 border border-gray-300 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <button
            onClick={processUrl}
            disabled={isProcessing || !urlInput.trim()}
            className={`px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 ${(isProcessing || !urlInput.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? 'Procesando...' : 'Procesar URL'}
          </button>
        </div>
      </div>
      
      {/* Diálogo de confirmación para carga de carpeta */}
      {folderDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Confirmar importación</h3>
              <button 
                onClick={cancelFolderUpload}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4 text-center">
                <div className="bg-green-100 text-green-800 p-3 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-lg font-medium">
                  Se encontraron <span className="font-bold text-green-600">{mainFolderFiles.length}</span> archivos JSON válidos
                </p>
              </div>
              
              {ignoredFiles > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-amber-700">
                        Se ignorarán <span className="font-medium">{ignoredFiles}</span> archivos que están en subcarpetas o no son JSON.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {mainFolderFiles.length > 0 && (
                <div className="border border-gray-200 rounded p-3 max-h-40 overflow-y-auto bg-gray-50">
                  <p className="font-medium text-gray-700 mb-2">Archivos a procesar:</p>
                  {isCheckingDuplicates ? (
                    <div className="flex justify-center items-center py-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700"></div>
                      <span className="ml-2 text-sm text-gray-600">Verificando duplicados...</span>
                    </div>
                  ) : (
                    <ul className="text-sm space-y-1">
                      {mainFolderFiles.map((file, index) => {
                        const isDuplicate = duplicateFiles.some(dup => dup.name === file.name);
                        return (
                          <li key={index} className={`flex items-center ${isDuplicate ? 'text-amber-600' : ''}`}>
                            {isDuplicate ? (
                              <svg className="h-4 w-4 text-amber-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4 text-blue-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span className="truncate">{file.name}</span>
                            {isDuplicate && <span className="ml-1 text-xs">(duplicado)</span>}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={cancelFolderUpload}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmFolderUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                disabled={mainFolderFiles.length === 0 || isCheckingDuplicates}
              >
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Importar {mainFolderFiles.length - duplicateFiles.length} archivo{mainFolderFiles.length - duplicateFiles.length !== 1 ? 's' : ''}
                {duplicateFiles.length > 0 && ` (${duplicateFiles.length} duplicado${duplicateFiles.length !== 1 ? 's' : ''})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadStep;
