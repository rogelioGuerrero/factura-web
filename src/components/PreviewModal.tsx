import { InvoiceData } from '../types/invoice';

interface PreviewModalProps {
  data: InvoiceData;
  onClose: () => void;
}

const PreviewModal = ({ data, onClose }: PreviewModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Vista Previa de Factura</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Identificación</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Número Control:</span> {data.identificacion.numeroControl}</p>
                <p><span className="font-medium">Código Generación:</span> {data.identificacion.codigoGeneracion}</p>
                <p><span className="font-medium">Fecha Emisión:</span> {data.identificacion.fecEmi}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Emisor</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Nombre:</span> {data.emisor.nombre}</p>
                <p><span className="font-medium">NIT:</span> {data.emisor.nit}</p>
                <p><span className="font-medium">NRC:</span> {data.emisor.nrc}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Receptor</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Nombre:</span> {data.receptor.nombre}</p>
                <p><span className="font-medium">NIT:</span> {data.receptor.nit}</p>
                <p><span className="font-medium">NRC:</span> {data.receptor.nrc}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Resumen</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Total Gravada:</span> ${data.resumen?.totalGravada.toFixed(2) || '0.00'}</p>
                <p><span className="font-medium">Total a Pagar:</span> ${data.resumen?.totalPagar.toFixed(2) || '0.00'}</p>
                <p><span className="font-medium">Items:</span> {data.cuerpoDocumento?.length || 0}</p>
              </div>
            </div>
          </div>

          {data.cuerpoDocumento && data.cuerpoDocumento.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.cuerpoDocumento.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{item.codigo}</td>
                        <td className="px-4 py-2 text-sm">{item.descripcion}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{item.cantidad}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          ${typeof item.precioUni === 'string' 
                            ? parseFloat(item.precioUni).toFixed(2) 
                            : item.precioUni.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          ${typeof item.precioUni === 'string' && typeof item.cantidad === 'string'
                            ? (parseFloat(item.precioUni) * parseFloat(item.cantidad)).toFixed(2)
                            : (Number(item.precioUni) * Number(item.cantidad)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
