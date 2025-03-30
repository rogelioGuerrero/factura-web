import { useState } from 'react';
import { TableView } from './TableView';
import { CardView } from './CardView';
import { DefaultLayout } from './layouts/DefaultLayout';
import { InvoiceData } from '../../../types/invoice';

interface ViewSelectorProps {
  onInvoiceSelect?: (invoice: InvoiceData) => void;
}

type ViewType = 'table' | 'cards';

export const ViewSelector = ({ onInvoiceSelect }: ViewSelectorProps) => {
  const [viewType, setViewType] = useState<ViewType>('table');

  const ViewActions = (
    <select
      value={viewType}
      onChange={(e) => setViewType(e.target.value as ViewType)}
      className="px-3 py-2 border rounded bg-white"
    >
      <option value="table">Vista de Tabla</option>
      <option value="cards">Vista de Tarjetas</option>
    </select>
  );

  return (
    <DefaultLayout actions={ViewActions}>
      {viewType === 'table' ? (
        <TableView onRowClick={onInvoiceSelect} />
      ) : (
        <CardView onCardClick={onInvoiceSelect} />
      )}
    </DefaultLayout>
  );
};
