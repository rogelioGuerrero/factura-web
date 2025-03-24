import React, { useState, useEffect, useCallback } from 'react';
import { InvoiceController } from '../controllers/InvoiceController';
import { InvoiceData } from '../types/invoice';
import InvoiceImporter from './InvoiceImporter';

// Obtener la instancia del controlador FUERA del componente React
// siguiendo el patrón para evitar actualizaciones infinitas
const invoiceController = InvoiceController.getInstance();

interface InvoiceManagerProps {
  showUploadOnly?: boolean;
}

const InvoiceManager: React.FC<InvoiceManagerProps> = ({ showUploadOnly = false }) => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Cargar facturas desde Firebase - solo para la vista de consulta
  useEffect(() => {
    if (!initialized && !showUploadOnly) {
      const loadInvoices = async () => {
        try {
          setLoading(true);
          console.log("Iniciando carga de facturas desde Firebase...");
          
          const firebaseInvoices = await invoiceController.getAllInvoicesFromFirebase();
          console.log(`Se encontraron ${firebaseInvoices.length} facturas en Firebase`);
          setDebugInfo(`Se encontraron ${firebaseInvoices.length} facturas en Firebase`);
          
          setInvoices(firebaseInvoices);
          setError(null);
        } catch (err) {
          console.error('Error al cargar facturas:', err);
          setError('Error al cargar facturas. Usando datos locales.');
          setDebugInfo(`Error al conectar con Firebase: ${err instanceof Error ? err.message : 'Error desconocido'}`);
          
          // Usar datos locales como fallback
          const localInvoices = invoiceController.getAllInvoices();
          console.log(`Usando ${localInvoices.length} facturas locales como fallback`);
          setInvoices(localInvoices);
        } finally {
          setLoading(false);
          setInitialized(true);
        }
      };

      loadInvoices();
    }
  }, [initialized, showUploadOnly]);

  // Manejar la importación completa
  const handleImportComplete = useCallback(async (importedInvoices: InvoiceData[]) => {
    try {
      console.log(`Importación completada: ${importedInvoices.length} facturas`);
      
      if (!showUploadOnly) {
        // Solo actualizar la lista si estamos en la vista de consulta
        setLoading(true);
        const updatedInvoices = await invoiceController.getAllInvoicesFromFirebase();
        setInvoices(updatedInvoices);
        setError(null);
      }
    } catch (err) {
      console.error('Error al actualizar la lista de facturas:', err);
      setError('Error al actualizar la lista de facturas');
    } finally {
      setLoading(false);
    }
  }, [showUploadOnly]);

  // Manejar la eliminación de una factura
  const handleDelete = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await invoiceController.deleteInvoiceFromFirebase(id);
      // Actualizar la lista de facturas
      const updatedInvoices = await invoiceController.getAllInvoicesFromFirebase();
      setInvoices(updatedInvoices);
      if (selectedInvoice && 'identificacion' in selectedInvoice && 
          selectedInvoice.identificacion.codigoGeneracion === id) {
        setSelectedInvoice(null);
      }
    } catch (err) {
      console.error('Error al eliminar factura:', err);
      setError('Error al eliminar factura');
    } finally {
      setLoading(false);
    }
  }, [selectedInvoice]);

  // Manejar la selección de una factura para ver detalles
  const handleSelectInvoice = useCallback((invoice: InvoiceData) => {
    setSelectedInvoice(invoice);
  }, []);

  // Renderizar la lista de facturas
  const renderInvoices = () => {
    if (invoices.length === 0) {
      return <p>No hay facturas disponibles. Carga algunos archivos JSON.</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Emisor</th>
              <th className="px-4 py-2 border">Receptor</th>
              <th className="px-4 py-2 border">Fecha</th>
              <th className="px-4 py-2 border">Total</th>
              <th className="px-4 py-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{invoice.emisor?.nombre || 'N/A'}</td>
                <td className="px-4 py-2 border">{invoice.receptor?.nombre || 'N/A'}</td>
                <td className="px-4 py-2 border">{invoice.identificacion?.fecEmi || 'N/A'}</td>
                <td className="px-4 py-2 border">{invoice.resumen?.totalPagar ? `$${invoice.resumen.totalPagar.toFixed(2)}` : 'N/A'}</td>
                <td className="px-4 py-2 border">
                  <button 
                    onClick={() => handleSelectInvoice(invoice)}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded mr-2"
                  >
                    Ver
                  </button>
                  <button 
                    onClick={() => handleDelete(invoice.identificacion.codigoGeneracion)}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Renderizar detalles de la factura seleccionada
  const renderInvoiceDetails = () => {
    if (!selectedInvoice) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Detalles de Factura</h2>
            <button 
              onClick={() => setSelectedInvoice(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold mb-2">Información General</h3>
              <p><span className="font-medium">Fecha:</span> {selectedInvoice.identificacion.fecEmi || 'N/A'}</p>
              <p><span className="font-medium">Folio:</span> {selectedInvoice.identificacion.codigoGeneracion || 'N/A'}</p>
              <p><span className="font-medium">Serie:</span> {selectedInvoice.identificacion.tipoDte || 'N/A'}</p>
              <p><span className="font-medium">Subtotal:</span> ${selectedInvoice.resumen.subTotal?.toFixed(2) || 'N/A'}</p>
              <p><span className="font-medium">Total:</span> ${selectedInvoice.resumen.totalPagar?.toFixed(2) || 'N/A'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Emisor</h3>
              <p><span className="font-medium">Nombre:</span> {selectedInvoice.emisor.nombre || 'N/A'}</p>
              <p><span className="font-medium">NIT:</span> {selectedInvoice.emisor.nit || 'N/A'}</p>
              <p><span className="font-medium">Correo:</span> {selectedInvoice.emisor.correo || 'N/A'}</p>
              
              <h3 className="font-semibold mt-4 mb-2">Receptor</h3>
              <p><span className="font-medium">Nombre:</span> {selectedInvoice.receptor.nombre || 'N/A'}</p>
              <p><span className="font-medium">NIT:</span> {selectedInvoice.receptor.nit || 'N/A'}</p>
              <p><span className="font-medium">Correo:</span> {selectedInvoice.receptor.correo || 'N/A'}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Detalle de Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Descripción</th>
                    <th className="px-4 py-2 border">Cantidad</th>
                    <th className="px-4 py-2 border">Precio Unitario</th>
                    <th className="px-4 py-2 border">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.cuerpoDocumento.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{item.descripcion || 'N/A'}</td>
                      <td className="px-4 py-2 border">{item.cantidad || 'N/A'}</td>
                      <td className="px-4 py-2 border">${typeof item.precioUni === 'number' ? item.precioUni.toFixed(2) : item.precioUni}</td>
                      <td className="px-4 py-2 border">${typeof item.ventaGravada === 'number' ? item.ventaGravada.toFixed(2) : '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={() => setSelectedInvoice(null)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar componente según el modo
  if (showUploadOnly) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Importación de Facturas</h1>
        
        {/* Componente de importación */}
        <InvoiceImporter 
          onImportStart={() => {
            setLoading(true);
            setError(null);
          }}
          onImportComplete={handleImportComplete}
          onImportError={(errorMsg) => {
            setError(errorMsg);
            setLoading(false);
          }}
        />
        
        {/* Mensajes de error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {/* Indicador de carga solo cuando se está importando */}
        {loading && (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    );
  }
  
  // Modo de visualización de facturas
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Consulta de Facturas</h1>
      
      {/* Mensajes de error y carga */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Información de depuración */}
      {debugInfo && (
        <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Información de conexión:</p>
          <p>{debugInfo}</p>
        </div>
      )}
      
      {loading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Lista de facturas */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Facturas Disponibles</h2>
        {invoices.length === 0 ? (
          <p className="text-gray-500">No hay facturas disponibles. Importe algunas utilizando la opción "Importar Facturas".</p>
        ) : (
          renderInvoices()
        )}
      </div>
      
      {/* Detalles de la factura seleccionada */}
      {renderInvoiceDetails()}
    </div>
  );
};

export default InvoiceManager;
