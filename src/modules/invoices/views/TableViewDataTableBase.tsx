import React from 'react';
import { useInvoices } from '../hooks/useInvoices';
import { BaseDataTable, BaseDataTableColumn, BaseDataTableAction } from '../../../components/base/BaseDataTable';
import { InvoiceData } from '../../../types/invoice';

export default function TableViewDataTableBase() {
  const { invoices, error, actions } = useInvoices();

  // Definición de columnas
  const columns: BaseDataTableColumn<InvoiceData>[] = [
    { header: 'Emisor', field: 'emisor.nombre', render: row => row.emisor.nombre, sortable: true, filterable: true },
    { header: 'Receptor', field: 'receptor.nombre', render: row => row.receptor.nombre, sortable: true, filterable: true },
    { header: 'Código', field: 'identificacion.codigoGeneracion', render: row => row.identificacion.codigoGeneracion, sortable: true },
    { header: 'Monto', field: 'resumen.montoTotalOperacion', render: row => `$${row.resumen.montoTotalOperacion.toFixed(2)}`, sortable: true },
    { header: 'Fecha', field: 'identificacion.fecEmi', render: row => new Date(row.identificacion.fecEmi).toLocaleDateString(), sortable: true },
  ];

  // Acciones rápidas
  const actions: BaseDataTableAction<InvoiceData>[] = [
    { icon: <span>👁️</span>, tooltip: 'Ver', onClick: row => alert('Preview: ' + row.identificacion.codigoGeneracion) },
    { icon: <span>🗑️</span>, tooltip: 'Eliminar', onClick: row => actions.deleteInvoice(row.identificacion.codigoGeneracion) },
  ];

  // Agrupación multinivel: por emisor, receptor y fecha
  const groupBy = ['emisor.nombre', 'receptor.nombre', 'identificacion.fecEmi'];

  return (
    <BaseDataTable
      data={invoices}
      columns={columns}
      actions={actions}
      groupBy={groupBy}
      renderGroupHeader={(keys, rows) => (
        <tr className="bg-blue-100 text-blue-800 font-bold">
          <td colSpan={columns.length + 1} className="px-2 py-1">Grupo: {keys.join(' / ')} ({rows.length} factura{rows.length > 1 ? 's' : ''})</td>
        </tr>
      )}
      theme="light"
    />
  );
}
