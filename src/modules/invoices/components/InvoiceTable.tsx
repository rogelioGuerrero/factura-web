import { useState, useEffect } from 'react';
import { InvoiceData } from '../../../types/invoice';
import { InvoiceService, PaginationOptions } from '../models/InvoiceService';
import { FilterCondition, SortCondition } from '../../../shared/utils/FirestoreService';

interface InvoiceTableProps {
  onRowClick?: (invoice: InvoiceData) => void;
}

const InvoiceTable = ({ onRowClick }: InvoiceTableProps) => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<SortCondition[]>([]);
  const [filters, setFilters] = useState<FilterCondition[]>([]);

  const invoiceService = InvoiceService.getInstance();

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const result = await invoiceService.getInvoices(pagination, sortBy, filters);
      setInvoices(result.data);
      //setTotalPages(result.totalPages);
      
    } catch (error) {
      console.error('Error al cargar facturas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [pagination.page, pagination.pageSize, sortBy, filters]);

  const handleSort = (field: string) => {
    const currentDirection = sortBy.find(s => s.field === field)?.direction;
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    
    setSortBy([{ field, direction: newDirection }]);
  };

  const handleFilter = (field: string, value: string) => {
    if (!value) {
      setFilters(filters.filter(f => f.field !== field));
      return;
    }

    const newFilter: FilterCondition = {
      field,
      operator: '==',
      value
    };

    setFilters([...filters.filter(f => f.field !== field), newFilter]);
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Filtrar por emisor..."
          onChange={(e) => handleFilter('emisor.nombre', e.target.value)}
          className="px-3 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="Filtrar por receptor..."
          onChange={(e) => handleFilter('receptor.nombre', e.target.value)}
          className="px-3 py-2 border rounded"
        />
      </div>

      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th 
              onClick={() => handleSort('emisor.nombre')}
              className="px-6 py-3 cursor-pointer hover:bg-gray-200"
            >
              Emisor
            </th>
            <th 
              onClick={() => handleSort('receptor.nombre')}
              className="px-6 py-3 cursor-pointer hover:bg-gray-200"
            >
              Receptor
            </th>
            <th 
              onClick={() => handleSort('identificacion.codigoGeneracion')}
              className="px-6 py-3 cursor-pointer hover:bg-gray-200"
            >
              Código
            </th>
            <th 
              onClick={() => handleSort('resumen.totalVenta')}
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
            invoices.map((invoice) => (
              <tr
                key={invoice.identificacion.codigoGeneracion}
                onClick={() => onRowClick?.(invoice)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4">{invoice.emisor.nombre}</td>
                <td className="px-6 py-4">{invoice.receptor.nombre}</td>
                <td className="px-6 py-4">{invoice.identificacion.codigoGeneracion}</td>
                <td className="px-6 py-4">${invoice.resumen.totalVenta.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Anterior
        </button>
        <span>
          Página {pagination.page} de {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default InvoiceTable;

export type PaginationOptions = {
  page: number;
  pageSize: number;
};