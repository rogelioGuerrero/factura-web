import { useState } from 'react';
import { useInvoices } from '../hooks/useInvoices';
import { InvoiceData } from '../../../types/invoice';
import { DataTable, DataTableColumn } from '../../../components/DataTable';

export default function TableViewDataTable() {
  const {
    invoices,
    error,
    actions
  } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Configuración de la tabla
  const [configOpen, setConfigOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(true);
  const [showPagination, setShowPagination] = useState(true);
  const [showActions, setShowActions] = useState(true);

  // Estado para hover de fila
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const handleDelete = async (codigoGeneracion: string | undefined) => {
    if (!codigoGeneracion) return;
    setDeletingId(codigoGeneracion);
    try {
      await actions.deleteInvoice(codigoGeneracion);
      if (selectedInvoice?.identificacion?.codigoGeneracion === codigoGeneracion) {
        setSelectedInvoice(null);
      }
    } catch (err) {
      alert('Error al eliminar factura');
    } finally {
      setDeletingId(null);
    }
  };

  const columns: DataTableColumn<InvoiceData>[] = [
    { header: 'Emisor', render: row => row.emisor.nombre },
    { header: 'Receptor', render: row => row.receptor.nombre },
    { header: 'Código', render: row => row.identificacion.codigoGeneracion },
    { header: 'Total', render: row => `$${row.resumen.montoTotalOperacion.toFixed(2)}` },
    { header: 'Ventas Exentas', render: row => `$${row.resumen.totalExenta?.toFixed(2) || '0.00'}` },
    { header: 'Ventas No Sujetas', render: row => `$${row.ventaNoSuj?.toFixed(2) || '0.00'}` },
    { header: 'Ventas Gravadas Locales', render: row => `$${row.resumen.totalGravada?.toFixed(2) || '0.00'}` },
    ...(showActions ? [{
      header: 'Acciones',
      render: (row: InvoiceData, rowIndex: number) => (
        <div
          className={`flex gap-2 justify-end transition-opacity duration-150 ${hoveredRow === rowIndex ? 'opacity-100' : 'opacity-0 pointer-events-none group-hover:opacity-100'}`}
        >
          <button
            className="bg-blue-500 text-white rounded-full p-2 flex items-center hover:bg-blue-600"
            title="Ver"
            onClick={() => setSelectedInvoice(row)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="3" />
              <path d="M2.05 12a9.94 9.94 0 0 1 19.9 0 9.94 9.94 0 0 1-19.9 0Z" />
            </svg>
          </button>
          <button
            className="bg-red-500 text-white rounded-full p-2 flex items-center hover:bg-red-600 disabled:opacity-60"
            title="Eliminar"
            disabled={deletingId === row.identificacion.codigoGeneracion}
            onClick={() => handleDelete(row.identificacion.codigoGeneracion)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 6L18 18M6 18L18 6" />
            </svg>
          </button>
        </div>
      ),
      className: 'text-right',
    }] : [])
  ];

  return (
    <div className="max-w-7xl mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
  <h1 className="text-2xl font-bold">Facturas</h1>
  <button
    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-600 shadow transition flex items-center justify-center"
    title="Configurar tabla"
    onClick={() => setConfigOpen(true)}
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
      <path d="M4 12a8 8 0 1116 0 8 8 0 01-16 0z" />
    </svg>
  </button>
</div>
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
      <DataTable
        columns={columns}
        data={invoices}
        filterable={showFilter}
        paginable={showPagination}
        className="shadow-lg"
        rowKey={(_, idx) => idx}
        rowEvents={{
          onMouseEnter: (_row: InvoiceData, idx: number) => setHoveredRow(idx),
          onMouseLeave: () => setHoveredRow(null)
        }}
      />
      {/* Modal de configuración */}
      {configOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 min-w-[300px] relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setConfigOpen(false)}
              title="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-bold mb-4">Configuración de tabla</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={showFilter} onChange={e => setShowFilter(e.target.checked)} /> Filtro
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={showPagination} onChange={e => setShowPagination(e.target.checked)} /> Paginación
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={showActions} onChange={e => setShowActions(e.target.checked)} /> Acciones
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
