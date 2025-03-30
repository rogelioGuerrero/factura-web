import { useInvoices } from '../hooks/useInvoices';
import { InvoiceData } from '../../../types/invoice';

interface TableViewProps {
  onRowClick?: (invoice: InvoiceData) => void;
}

export const TableView = ({ onRowClick }: TableViewProps) => {
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
    <div className="overflow-x-auto">
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Filtrar por emisor..."
          onChange={(e) => actions.handleFilter('emisor.nombre', e.target.value)}
          className="px-3 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="Filtrar por receptor..."
          onChange={(e) => actions.handleFilter('receptor.nombre', e.target.value)}
          className="px-3 py-2 border rounded"
        />
        <select
          value={pagination.pageSize}
          onChange={(e) => actions.setPageSize(Number(e.target.value))}
          className="px-3 py-2 border rounded"
        >
          <option value="5">5 por página</option>
          <option value="10">10 por página</option>
          <option value="20">20 por página</option>
          <option value="50">50 por página</option>
        </select>
      </div>

      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th 
              onClick={() => actions.handleSort('emisor.nombre')}
              className="px-6 py-3 cursor-pointer hover:bg-gray-200"
            >
              Emisor
            </th>
            <th 
              onClick={() => actions.handleSort('receptor.nombre')}
              className="px-6 py-3 cursor-pointer hover:bg-gray-200"
            >
              Receptor
            </th>
            <th 
              onClick={() => actions.handleSort('identificacion.codigoGeneracion')}
              className="px-6 py-3 cursor-pointer hover:bg-gray-200"
            >
              Código
            </th>
            <th 
              onClick={() => actions.handleSort('resumen.montoTotalOperacion')}
              className="px-6 py-3 cursor-pointer hover:bg-gray-200"
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="text-center py-4">
                Cargando...
              </td>
            </tr>
          ) : (
            invoices.map((invoice, index) => (
              <tr
                key={`${invoice.identificacion.codigoGeneracion}-${index}`}
                onClick={() => onRowClick?.(invoice)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4">{invoice.emisor.nombre}</td>
                <td className="px-6 py-4">{invoice.receptor.nombre}</td>
                <td className="px-6 py-4">{invoice.identificacion.codigoGeneracion}</td>
                <td className="px-6 py-4">${invoice.resumen.montoTotalOperacion.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between items-center">
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
