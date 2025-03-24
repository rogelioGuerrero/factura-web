import { ChangeEvent, DragEvent, useState, useEffect, useRef, useCallback } from 'react';
import { InvoiceData } from '../../types/invoice';

interface FileUploadStepProps {
  onFileUpload: (data: InvoiceData[]) => void;
  onPreview: (invoice: InvoiceData) => void;
  onViewData: () => void;
  data: InvoiceData[];
}

const FileUploadStep = ({ onFileUpload, onPreview, onViewData, data }: FileUploadStepProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<InvoiceData[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [invoiceType, setInvoiceType] = useState<'unknown' | 'sales' | 'purchases'>('unknown');
  const itemsPerPage = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Función para determinar si las facturas son de compra o venta
  const determineInvoiceType = useCallback((invoices: InvoiceData[]) => {
    if (invoices.length <= 1) {
      setInvoiceType('unknown');
      return;
    }

    // Contar ocurrencias de NIT de emisores y receptores
    const emitterNITs = new Map<string, number>();
    const receiverNITs = new Map<string, number>();

    invoices.forEach(invoice => {
      const emitterNIT = invoice.emisor.nit;
      const receiverNIT = invoice.receptor.nit;

      emitterNITs.set(emitterNIT, (emitterNITs.get(emitterNIT) || 0) + 1);
      receiverNITs.set(receiverNIT, (receiverNITs.get(receiverNIT) || 0) + 1);
    });

    // Encontrar el NIT más común para emisores y receptores
    let maxEmitterCount = 0;
    let maxReceiverCount = 0;

    emitterNITs.forEach((count) => {
      if (count > maxEmitterCount) {
        maxEmitterCount = count;
      }
    });

    receiverNITs.forEach((count) => {
      if (count > maxReceiverCount) {
        maxReceiverCount = count;
      }
    });

    // Determinar si son facturas de compra o venta
    const emitterPercentage = maxEmitterCount / invoices.length;
    const receiverPercentage = maxReceiverCount / invoices.length;

    if (emitterPercentage > 0.7 && emitterPercentage >= receiverPercentage) {
      // Si más del 70% de las facturas tienen el mismo emisor, son facturas de venta
      setInvoiceType('sales');
    } else if (receiverPercentage > 0.7 && receiverPercentage > emitterPercentage) {
      // Si más del 70% de las facturas tienen el mismo receptor, son facturas de compra
      setInvoiceType('purchases');
    } else {
      // Si no hay un patrón claro, mantener como desconocido
      setInvoiceType('unknown');
    }

    console.log(`Tipo de facturas determinado: ${invoiceType === 'sales' ? 'Ventas' : invoiceType === 'purchases' ? 'Compras' : 'Desconocido'}`);
  }, [setInvoiceType, invoiceType]);

  // Sincronizar estado local con props
  useEffect(() => {
    console.log("FileUploadStep - data prop actualizada:", data);
    setUploadedFiles(data);
    // Actualizar los nombres de archivo basados en los datos
    const names = data.map(invoice => 
      `Factura ${invoice.identificacion.numeroControl || invoice.identificacion.codigoGeneracion}`
    );
    setFileNames(names);
    
    // Determinar el tipo de facturas (compra o venta)
    determineInvoiceType(data);
  }, [data, determineInvoiceType]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Función para verificar si una factura ya existe
  const invoiceExists = (newInvoice: InvoiceData, currentBatch: InvoiceData[] = []): boolean => {
    const newInvoiceCode = newInvoice.identificacion.codigoGeneracion;
    
    // Verificar en las facturas ya subidas
    const existsInUploaded = uploadedFiles.some(
      existingInvoice => existingInvoice.identificacion.codigoGeneracion === newInvoiceCode
    );
    
    // Verificar en el lote actual de facturas que se están procesando
    const existsInCurrentBatch = currentBatch.some(
      batchInvoice => batchInvoice.identificacion.codigoGeneracion === newInvoiceCode
    );
    
    return existsInUploaded || existsInCurrentBatch;
  };

  const processFile = async (file: File, currentBatch: InvoiceData[] = []): Promise<{ success: boolean; isDuplicate: boolean; invoice: InvoiceData | null }> => {
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      if (!jsonData.identificacion || !jsonData.emisor || !jsonData.receptor) {
        throw new Error('Archivo JSON inválido: falta información requerida');
      }
      
      // Verificar si la factura ya existe
      if (invoiceExists(jsonData, currentBatch)) {
        console.warn(`Factura duplicada: ${jsonData.identificacion.codigoGeneracion}`);
        return { 
          success: false, 
          isDuplicate: true, 
          invoice: jsonData 
        };
      }
      
      return { 
        success: true, 
        isDuplicate: false, 
        invoice: jsonData 
      };
    } catch (error) {
      console.error("Error al procesar archivo:", error);
      return { 
        success: false, 
        isDuplicate: false, 
        invoice: null 
      };
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const jsonFiles = files.filter(file => file.type === 'application/json' || file.name.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      setError('Por favor, suba archivos JSON válidos');
      return;
    }
    
    setError(null);
    setSuccessMessage(null);
    
    // Procesar cada archivo
    let successCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    const validInvoices: InvoiceData[] = [];
    const duplicateInvoices: string[] = [];
    
    for (const file of jsonFiles) {
      const result = await processFile(file, validInvoices);
      
      if (result.success && result.invoice) {
        validInvoices.push(result.invoice);
        successCount++;
      } else if (result.isDuplicate && result.invoice) {
        duplicateCount++;
        duplicateInvoices.push(result.invoice.identificacion.codigoGeneracion);
      } else {
        errorCount++;
      }
    }
    
    // Solo actualizar el estado si hay facturas válidas
    if (validInvoices.length > 0) {
      onFileUpload(validInvoices);
    }
    
    // Mostrar resumen si se procesaron múltiples archivos
    if (jsonFiles.length > 1) {
      if (duplicateCount > 0) {
        setError(`Procesamiento completado: ${successCount} archivos cargados, ${duplicateCount} duplicados (${duplicateInvoices.join(', ')}), ${errorCount} con errores.`);
      } else if (errorCount > 0) {
        setError(`Procesamiento completado: ${successCount} archivos cargados, ${errorCount} con errores.`);
      } else {
        setSuccessMessage(`Procesamiento completado: ${successCount} archivos cargados correctamente.`);
      }
    } else if (jsonFiles.length === 1) {
      if (duplicateCount === 1) {
        setError(`La factura con código ${duplicateInvoices[0]} ya ha sido cargada.`);
      } else if (errorCount === 1) {
        setError('Error al procesar el archivo. Asegúrese de que sea un JSON válido.');
      } else if (successCount === 1) {
        setSuccessMessage('Archivo cargado correctamente.');
      }
    }
  };

  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      let successCount = 0;
      let duplicateCount = 0;
      let errorCount = 0;
      const validInvoices: InvoiceData[] = [];
      const duplicateInvoices: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const result = await processFile(files[i], validInvoices);
        
        if (result.success && result.invoice) {
          validInvoices.push(result.invoice);
          successCount++;
        } else if (result.isDuplicate && result.invoice) {
          duplicateCount++;
          duplicateInvoices.push(result.invoice.identificacion.codigoGeneracion);
        } else {
          errorCount++;
        }
      }
      
      // Solo actualizar el estado si hay facturas válidas
      if (validInvoices.length > 0) {
        onFileUpload(validInvoices);
      }
      
      // Mostrar resumen si se procesaron múltiples archivos
      if (files.length > 1) {
        if (duplicateCount > 0) {
          setError(`Procesamiento completado: ${successCount} archivos cargados, ${duplicateCount} duplicados (${duplicateInvoices.join(', ')}), ${errorCount} con errores.`);
        } else if (errorCount > 0) {
          setError(`Procesamiento completado: ${successCount} archivos cargados, ${errorCount} con errores.`);
        } else {
          setSuccessMessage(`Procesamiento completado: ${successCount} archivos cargados correctamente.`);
        }
      } else if (files.length === 1) {
        if (duplicateCount === 1) {
          setError(`La factura con código ${duplicateInvoices[0]} ya ha sido cargada.`);
        } else if (errorCount === 1) {
          setError('Error al procesar el archivo. Asegúrese de que sea un JSON válido.');
        } else if (successCount === 1) {
          setSuccessMessage('Archivo cargado correctamente.');
        }
      }
      
      // Limpiar el input para permitir cargar el mismo archivo nuevamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    console.log("Eliminando archivo en índice:", index);
    
    // Crear nuevas referencias para asegurar actualización de estado
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    
    const newFileNames = [...fileNames];
    newFileNames.splice(index, 1);
    
    console.log("Archivos después de eliminar:", newFiles.length);
    
    setUploadedFiles(newFiles);
    setFileNames(newFileNames);
    onFileUpload(newFiles);
    
    // Reevaluar el tipo de facturas después de eliminar
    determineInvoiceType(newFiles);
  };

  const handlePreview = (index: number) => {
    console.log("Vista previa de archivo en índice:", index);
    onPreview(uploadedFiles[index]);
  };

  // Filtrar archivos según término de búsqueda
  const filteredFiles = uploadedFiles.filter((invoice, index) => {
    if (!searchTerm) return true;
    
    const fileName = fileNames[index] || '';
    const invoiceId = invoice.identificacion.numeroControl || invoice.identificacion.codigoGeneracion || '';
    const emisor = invoice.emisor.nombre || '';
    const receptor = invoice.receptor.nombre || '';
    
    const searchLower = searchTerm.toLowerCase();
    return (
      fileName.toLowerCase().includes(searchLower) ||
      invoiceId.toLowerCase().includes(searchLower) ||
      emisor.toLowerCase().includes(searchLower) ||
      receptor.toLowerCase().includes(searchLower)
    );
  });

  // Paginación
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    setPage(pageNumber);
  };

  // Obtener el tipo de factura como texto
  const getInvoiceTypeText = () => {
    switch (invoiceType) {
      case 'sales':
        return 'Facturas de Venta';
      case 'purchases':
        return 'Facturas de Compra';
      default:
        return 'Facturas';
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <p className="mb-2 text-sm text-gray-600">
          Arrastre y suelte sus archivos JSON aquí, o
        </p>
        <label className="cursor-pointer text-blue-500 hover:text-blue-600">
          <span>seleccione archivos</span>
          <input
            type="file"
            className="hidden"
            accept="application/json,.json"
            onChange={handleFileInput}
            multiple
            ref={fileInputRef}
          />
        </label>
        {error && (
          <p className="mt-4 text-red-500 text-sm">{error}</p>
        )}
        {successMessage && (
          <p className="mt-4 text-green-500 text-sm">{successMessage}</p>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {getInvoiceTypeText()} ({uploadedFiles.length})
            </h3>
            
            <div className="flex items-center">
              <div className="relative mr-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar archivos..."
                  className="pl-10 pr-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1); // Resetear a primera página al buscar
                  }}
                  title="Buscar por nombre de archivo, ID de factura, emisor o receptor"
                />
              </div>
              
              <button
                onClick={onViewData}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center text-sm"
                disabled={uploadedFiles.length === 0}
                title="Ver todos los datos en formato de tabla"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Ver Tabla
              </button>
            </div>
          </div>
          
          {filteredFiles.length > 0 ? (
            <>
              <ul className="bg-gray-50 rounded-lg divide-y max-h-96 overflow-y-auto">
                {paginatedFiles.map((invoice, paginatedIndex) => {
                  const index = startIndex + paginatedIndex;
                  return (
                    <li key={index} className="px-4 py-3 flex justify-between items-center hover:bg-gray-100">
                      <div className="flex items-center flex-1 min-w-0">
                        <svg className="h-5 w-5 text-blue-500 flex-shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {fileNames[index] || `Factura ${index + 1}`}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {invoice.identificacion.numeroControl || invoice.identificacion.codigoGeneracion}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            Emisor: {invoice.emisor.nombre}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button 
                          onClick={() => handlePreview(index)}
                          className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                          title="Ver detalles de la factura"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                          title="Eliminar archivo"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              
              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 text-sm">
                  <div className="text-gray-600">
                    Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredFiles.length)} de {filteredFiles.length}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={prevPage}
                      disabled={page === 1}
                      className={`px-2 py-1 rounded ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-50'}`}
                      title="Página anterior"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {/* Mostrar números de página */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        // Si hay 5 o menos páginas, mostrar todas
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        // Si estamos en las primeras páginas
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        // Si estamos en las últimas páginas
                        pageNum = totalPages - 4 + i;
                      } else {
                        // Si estamos en el medio
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={i}
                          onClick={() => goToPage(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded ${
                            page === pageNum ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={nextPage}
                      disabled={page === totalPages}
                      className={`px-2 py-1 rounded ${page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-50'}`}
                      title="Página siguiente"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
              No se encontraron archivos {searchTerm ? "que coincidan con la búsqueda" : ""}
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onViewData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
              disabled={uploadedFiles.length === 0}
              title="Ver todos los datos en formato de tabla"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Ver Tabla de Datos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadStep;
