import { InvoiceData } from '../../../types/invoice';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvoiceData | null;
}

export const PreviewModal = ({ isOpen, onClose, data }: PreviewModalProps) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Vista Previa de Factura</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          <section>
            <h3 className="font-semibold mb-2">Identificación</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Código de Generación</p>
                <p>{data.identificacion.codigoGeneracion}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de Emisión</p>
                <p>{new Date(data.identificacion.fecEmi).toLocaleDateString()}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Emisor</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p>{data.emisor.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">NIT</p>
                <p>{data.emisor.nit}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Receptor</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p>{data.receptor.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">NIT</p>
                <p>{data.receptor.nit}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Resumen</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Monto Total</p>
                <p className="text-lg font-semibold">
                  ${data.resumen.montoTotalOperacion.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total IVA</p>
                <p>${data.resumen.totalIva.toFixed(2)}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
