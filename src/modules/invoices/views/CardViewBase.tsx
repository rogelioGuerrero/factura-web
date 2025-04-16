import { useInvoices } from '../hooks/useInvoices';
import { BaseCardView, BaseCardField, BaseCardAction } from '../../../components/base/BaseCardView';
import { InvoiceData } from '../../../types/invoice';

export default function CardViewBase() {
  const { invoices, actions: invoiceActions } = useInvoices();

  // Definición de campos para la tarjeta
  const fields: BaseCardField<InvoiceData>[] = [
    { label: 'Emisor', field: 'emisor.nombre', render: row => row.emisor.nombre, visible: true },
    { label: 'Receptor', field: 'receptor.nombre', render: row => row.receptor.nombre, visible: true },
    { label: 'Código', field: 'identificacion.codigoGeneracion', render: row => row.identificacion.codigoGeneracion, visible: true },
    { label: 'Monto', field: 'resumen.montoTotalOperacion', render: row => `$${row.resumen.montoTotalOperacion.toFixed(2)}`, visible: true },
    { label: 'Fecha', field: 'identificacion.fecEmi', render: row => new Date(row.identificacion.fecEmi).toLocaleDateString(), visible: true },
  ];

  // Acciones rápidas
  const actions: BaseCardAction<InvoiceData>[] = [
    { icon: <span>👁️</span>, tooltip: 'Ver', onClick: row => alert('Preview: ' + row.identificacion.codigoGeneracion) },
    { icon: <span>🗑️</span>, tooltip: 'Eliminar', onClick: row => invoiceActions.deleteInvoice(row.identificacion.codigoGeneracion) },
  ];

  // Ejemplo de agrupación multinivel: por emisor, luego por receptor, luego por fecha
  const groupBy = ['emisor.nombre', 'receptor.nombre', 'identificacion.fecEmi'];

  return (
    <BaseCardView
      data={invoices}
      fields={fields}
      actions={actions}
      groupBy={groupBy}
      renderGroupHeader={(keys, rows) => (
        <div className="bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded mb-2">
          Grupo: {keys.join(' / ')} ({rows.length} factura{rows.length > 1 ? 's' : ''})
        </div>
      )}
      theme="light"
      cardSize="normal"
      accentColor="#2563eb"
    />
  );
}
