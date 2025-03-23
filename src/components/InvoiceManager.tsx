import React, { useState, useEffect, useCallback } from 'react';
import { InvoiceController } from '../controllers/InvoiceController';
import { InvoiceData } from '../types/invoice';

// Obtener la instancia del controlador FUERA del componente React
// siguiendo el patrón para evitar actualizaciones infinitas
const invoiceController = InvoiceController.getInstance();

const InvoiceManager: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Cargar facturas desde Firebase
  useEffect(() => {
    if (!initialized) {
      const loadInvoices = async () => {
        try {
          setLoading(true);
          const firebaseInvoices = await invoiceController.getAllInvoicesFromFirebase();
          setInvoices(firebaseInvoices);
          setError(null);
        } catch (err) {
          console.error('Error al cargar facturas:', err);
          setError('Error al cargar facturas. Usando datos locales.');
          // Usar datos locales como fallback
          setInvoices(invoiceController.getAllInvoices());
        } finally {
          setLoading(false);
          setInitialized(true);
        }
      };

      loadInvoices();
    }
  }, [initialized]);

  // Manejar la carga de archivos
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    try {
      setLoading(true);
      const files = Array.from(event.target.files);
      const result = await invoiceController.handleFileUpload(files);
      
      if (result.success && result.data) {
        // Actualizar la lista de facturas
        const updatedInvoices = await invoiceController.getAllInvoicesFromFirebase();
        setInvoices(updatedInvoices);
        setError(null);
      } else {
        setError(result.error || 'Error al procesar los archivos');
      }
    } catch (err) {
      console.error('Error al cargar archivos:', err);
      setError('Error al cargar archivos');
    } finally {
      setLoading(false);
      // Limpiar el input de archivos
      if (event.target) {
        event.target.value = '';
      }
    }
  }, []);

  // Eliminar una factura
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

  // Seleccionar una factura para ver detalles
  const handleSelectInvoice = useCallback((invoice: InvoiceData) => {
    setSelectedInvoice(invoice);
  }, []);

  // Renderizar la lista de facturas
  const renderInvoices = () => {
    if (invoices.length === 0) {
      return <p>No hay facturas disponibles. Carga algunos archivos JSON.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {invoices.map((invoice, index) => (
          <div 
            key={invoice.identificacion.codigoGeneracion || index}
            className="border p-4 rounded-lg shadow hover:shadow-md cursor-pointer"
            onClick={() => handleSelectInvoice(invoice)}
          >
            <h3 className="font-bold">{invoice.emisor.nombre}</h3>
            <p>Código: {invoice.identificacion.codigoGeneracion}</p>
            <p>Fecha: {invoice.identificacion.fecEmi}</p>
            <p>Total: ${invoice.resumen.totalPagar.toFixed(2)}</p>
            <button 
              className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(invoice.identificacion.codigoGeneracion);
              }}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar detalles de la factura seleccionada
  const renderInvoiceDetails = () => {
    if (!selectedInvoice) return null;

    return (
      <div className="mt-8 border p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Detalles de la Factura</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Información General</h3>
            <p>Código: {selectedInvoice.identificacion.codigoGeneracion}</p>
            <p>Fecha: {selectedInvoice.identificacion.fecEmi}</p>
            <p>Tipo: {selectedInvoice.identificacion.tipoDte}</p>
          </div>
          <div>
            <h3 className="font-semibold">Emisor</h3>
            <p>Nombre: {selectedInvoice.emisor.nombre}</p>
            <p>NIT: {selectedInvoice.emisor.nit}</p>
            <p>Correo: {selectedInvoice.emisor.correo}</p>
          </div>
          <div>
            <h3 className="font-semibold">Receptor</h3>
            <p>Nombre: {selectedInvoice.receptor.nombre}</p>
            <p>NIT: {selectedInvoice.receptor.nit}</p>
            <p>Correo: {selectedInvoice.receptor.correo}</p>
          </div>
          <div>
            <h3 className="font-semibold">Resumen</h3>
            <p>Subtotal: ${selectedInvoice.resumen.subTotal.toFixed(2)}</p>
            <p>IVA: ${selectedInvoice.resumen.totalIva.toFixed(2)}</p>
            <p>Total: ${selectedInvoice.resumen.totalPagar.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold">Detalle de Items</h3>
          <table className="w-full mt-2 border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Descripción</th>
                <th className="border p-2 text-right">Cantidad</th>
                <th className="border p-2 text-right">Precio</th>
                <th className="border p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedInvoice.cuerpoDocumento.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="border p-2">{item.descripcion}</td>
                  <td className="border p-2 text-right">{item.cantidad}</td>
                  <td className="border p-2 text-right">${typeof item.precioUni === 'number' ? item.precioUni.toFixed(2) : item.precioUni}</td>
                  <td className="border p-2 text-right">${typeof item.ventaGravada === 'number' ? item.ventaGravada.toFixed(2) : '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <button 
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => setSelectedInvoice(null)}
        >
          Cerrar
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestor de Facturas Electrónicas</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <label className="block mb-2 font-semibold">
          Cargar Archivos JSON
          <input
            type="file"
            accept=".json"
            multiple
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mt-1"
          />
        </label>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-3">Facturas Disponibles</h2>
          {renderInvoices()}
          {renderInvoiceDetails()}
        </>
      )}
    </div>
  );
};

export default InvoiceManager;
