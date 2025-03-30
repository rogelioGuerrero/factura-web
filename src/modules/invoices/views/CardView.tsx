import { useInvoices } from '../hooks/useInvoices';
import { InvoiceData } from '../../../types/invoice';

interface CardViewProps {
  onCardClick?: (invoice: InvoiceData) => void;
}

export const CardView = ({ onCardClick }: CardViewProps) => {
  const {
    invoices,
    loading,
    error,
    pagination,
    actions
  } = useInvoices();

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Filtrar por emisor..."
          onChange={(e) => actions.handleFilter('emisor.nombre', e.target.value)}
          className="px-3 py-2 border rounded flex-1 min-w-[200px]"
        />
        <input
          type="text"
          placeholder="Filtrar por receptor..."
          onChange={(e) => actions.handleFilter('receptor.nombre', e.target.value)}
          className="px-3 py-2 border rounded flex-1 min-w-[200px]"
        />
        <select
          value={pagination.pageSize}
          onChange={(e) => actions.setPageSize(Number(e.target.value))}
          className="px-3 py-2 border rounded"
        >
          <option value="4">4 por página</option>
          <option value="8">8 por página</option>
          <option value="12">12 por página</option>
          <option value="20">20 por página</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-4">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.identificacion.codigoGeneracion}
              onClick={() => onCardClick?.(invoice)}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer h-full"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-lg truncate" title={invoice.emisor.nombre}>
                      {invoice.emisor.nombre}
                    </h3>
                    <p className="text-gray-600 truncate" title={invoice.receptor.nombre}>
                      {invoice.receptor.nombre}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-right">
                  <p className="text-lg font-bold">
                    ${invoice.resumen.montoTotalOperacion.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(invoice.identificacion.fecEmi).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-auto pt-2 border-t">
                  <p className="text-sm text-gray-500 truncate" title={invoice.identificacion.codigoGeneracion}>
                    Código: {invoice.identificacion.codigoGeneracion}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => actions.handlePageChange((pagination.currentPage || 1) - 1)}
          disabled={(pagination.currentPage || 1) === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Anterior
        </button>
        <span>
          Página {pagination.currentPage || 1} de {pagination.totalPages || 1}
        </span>
        <button
          onClick={() => actions.handlePageChange((pagination.currentPage || 1) + 1)}
          disabled={(pagination.currentPage || 1) === (pagination.totalPages || 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
