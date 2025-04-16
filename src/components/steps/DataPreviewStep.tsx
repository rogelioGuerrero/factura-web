import { InvoiceData } from '../../types/invoice';

interface DataPreviewStepProps {
  data: InvoiceData[];
  selectedIndex: number;
  onSelectInvoice: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

const DataPreviewStep = ({ data, selectedIndex, onSelectInvoice, onNext, onPrev }: DataPreviewStepProps) => {
  if (!data || data.length === 0) return null;

  const selectedInvoice = data[selectedIndex];

  return (
    <div className="max-w-4xl mx-auto">
      {data.length > 1 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Facturas cargadas ({data.length})</h3>
          <div className="flex flex-wrap gap-2">
            {data.map((invoice, index) => (
              <button
                key={index}
                onClick={() => onSelectInvoice(index)}
                className={`px-3 py-2 text-sm rounded-lg ${
                  index === selectedIndex
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {invoice.identificacion.numeroControl || `Factura ${index + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Vista Previa de Datos</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Identificación</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Número Control:</span> {selectedInvoice.identificacion.numeroControl}</p>
              <p><span className="font-medium">Código Generación:</span> {selectedInvoice.identificacion.codigoGeneracion}</p>
              <p><span className="font-medium">Fecha Emisión:</span> {selectedInvoice.identificacion.fecEmi}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Emisor</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Nombre:</span> {selectedInvoice.emisor.nombre}</p>
              <p><span className="font-medium">NIT:</span> {selectedInvoice.emisor.nit}</p>
              <p><span className="font-medium">NRC:</span> {selectedInvoice.emisor.nrc}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Receptor</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Nombre:</span> {selectedInvoice.receptor.nombre}</p>
              <p><span className="font-medium">NIT:</span> {selectedInvoice.receptor.nit}</p>
              <p><span className="font-medium">NRC:</span> {selectedInvoice.receptor.nrc}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Cuerpo Documento</h3>
            <p className="text-sm text-gray-600">
              {selectedInvoice.cuerpoDocumento?.length || 0} items encontrados
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={onPrev}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Anterior
          </button>
          <button
            onClick={onNext}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataPreviewStep;