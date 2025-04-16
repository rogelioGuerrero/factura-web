import { useInvoices } from '../hooks/useInvoices';
import { InvoiceData } from '../../../types/invoice';
import { useEffect, useState } from 'react';

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

  // Configuración de vista de tarjetas (persistente en localStorage)
  type CardViewConfig = {
    showCheckbox: boolean;
    showAvatar: boolean;
    showActions: boolean;
    showMenu: boolean;
    compact: boolean;
    theme: 'light' | 'dark';
    accent: string;
    cardSize: 'compact' | 'normal' | 'large';
    showReceptor: boolean;
    showMonto: boolean;
    showFecha: boolean;
    showCodigo: boolean;
  };
  const defaultConfig: CardViewConfig = {
    showCheckbox: true,
    showAvatar: true,
    showActions: true,
    showMenu: true,
    compact: false,
    theme: 'light',
    accent: '#2563eb', // azul
    cardSize: 'normal',
    showReceptor: true,
    showMonto: true,
    showFecha: true,
    showCodigo: true
  };
  const [config, setConfig] = useState<CardViewConfig>(() => {
    const stored = localStorage.getItem('cardViewConfig');
    return stored ? JSON.parse(stored) : defaultConfig;
  });
  const [configOpen, setConfigOpen] = useState(false);

  // Ordenamiento
  const [sortField, setSortField] = useState<string>('emisor.nombre');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Preview y eliminar
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Selección múltiple
  const [selected, setSelected] = useState<string[]>([]);

  // Toast feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Tema dinámico
  const themeClass = config.theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900';
  const accentClass = `ring-[${config.accent}] focus:ring-[${config.accent}]`;
  const cardPadding = config.cardSize === 'compact' ? 'p-2' : config.cardSize === 'large' ? 'p-8' : 'p-4';
  const cardText = config.cardSize === 'compact' ? 'text-sm' : config.cardSize === 'large' ? 'text-lg' : '';

  // Limpia toast automáticamente
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    localStorage.setItem('cardViewConfig', JSON.stringify(config));
  }, [config]);

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Toast feedback */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg font-semibold ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{toast.message}</div>
      )}

      {/* Barra de selección múltiple */}
      {selected.length > 0 && (
        <div className="flex items-center gap-2 mb-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded shadow text-blue-700">
          <span>{selected.length} seleccionada{selected.length > 1 ? 's' : ''}</span>
          <button className="ml-2 px-2 py-1 bg-blue-500 text-white rounded" onClick={() => setSelected([])}>Limpiar selección</button>
        </div>
      )}

      <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="font-medium text-sm">Ordenar por:</label>
          <select
            className="border rounded px-2 py-1"
            onChange={e => setSortField(e.target.value)}
            value={sortField}
          >
            <option value="emisor.nombre">Emisor</option>
            <option value="receptor.nombre">Receptor</option>
            <option value="resumen.montoTotalOperacion">Monto</option>
            <option value="identificacion.fecEmi">Fecha</option>
          </select>
          <select
            className="border rounded px-2 py-1"
            onChange={e => setSortDir(e.target.value as 'asc' | 'desc')}
            value={sortDir}
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded"
            onClick={() => actions.handleSort(sortField, sortDir)}
            title="Aplicar orden"
          >Aplicar</button>
        </div>
        <button
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-600 shadow transition flex items-center justify-center"
          title="Configurar vista de tarjetas"
          onClick={() => setConfigOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
            <path d="M4 12a8 8 0 1116 0 8 8 0 01-16 0z" />
          </svg>
        </button>
      </div>
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
            <h2 className="text-lg font-bold mb-4">Configuración de tarjetas</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.showCheckbox} onChange={e => setConfig((c: CardViewConfig) => ({ ...c, showCheckbox: e.target.checked }))} /> Checkbox de selección
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.showAvatar} onChange={e => setConfig((c: CardViewConfig) => ({ ...c, showAvatar: e.target.checked }))} /> Avatar del emisor
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.showActions} onChange={e => setConfig((c: CardViewConfig) => ({ ...c, showActions: e.target.checked }))} /> Acciones rápidas (hover)
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.showMenu} onChange={e => setConfig((c: CardViewConfig) => ({ ...c, showMenu: e.target.checked }))} /> Menú contextual
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.compact} onChange={e => setConfig((c: CardViewConfig) => ({ ...c, compact: e.target.checked }))} /> Vista compacta (modo rápido)
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.showReceptor} onChange={e => setConfig((c: CardViewConfig) => ({ ...c, showReceptor: e.target.checked }))} /> Mostrar receptor
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.showMonto} onChange={e => setConfig((c: CardViewConfig) => ({ ...c, showMonto: e.target.checked }))} /> Mostrar monto
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.showFecha} onChange={e => setConfig((c: CardViewConfig) => ({ ...c, showFecha: e.target.checked }))} /> Mostrar fecha
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.showCodigo} onChange={e => setConfig((c: CardViewConfig) => ({ ...c, showCodigo: e.target.checked }))} /> Mostrar código
              </label>
              <div className="flex items-center gap-2 mt-2">
                <label className="font-medium">Tamaño:</label>
                <select value={config.cardSize} onChange={e => setConfig((c: CardViewConfig) => ({ ...c, cardSize: e.target.value as any }))} className="border rounded px-2 py-1">
                  <option value="compact">Compacta</option>
                  <option value="normal">Normal</option>
                  <option value="large">Grande</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <label className="font-medium">Tema:</label>
                <select value={config.theme} onChange={e => setConfig((c: CardViewConfig) => ({ ...c, theme: e.target.value as any }))} className="border rounded px-2 py-1">
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <label className="font-medium">Color de acento:</label>
                <input type="color" value={config.accent} onChange={e => setConfig((c: CardViewConfig) => ({ ...c, accent: e.target.value }))} className="w-8 h-8 border rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`flex flex-wrap gap-4 mb-4`}>
        {/* Tema claro/oscuro */}
        <style>{`
          body { background: ${config.theme === 'dark' ? '#18181b' : '#f9fafb'}; }
        `}</style>
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
              className={`bg-white ${config.compact ? 'p-2' : 'p-4'} rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer h-full group flex flex-col ${config.compact ? 'text-sm' : ''}`}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {config.showCheckbox && (
                      <input type="checkbox" className="accent-blue-500" onClick={e => e.stopPropagation()} />
                    )}
                    {config.showAvatar && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-base" title={invoice.emisor.nombre}>
                        {invoice.emisor.nombre.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg truncate" title={invoice.emisor.nombre}>
                        {invoice.emisor.nombre}
                      </h3>
                      <p className="text-gray-600 truncate" title={invoice.receptor.nombre}>
                        {invoice.receptor.nombre}
                      </p>
                    </div>
                  </div>
                  {/* Acciones rápidas (hover) */}
                  {config.showActions && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded-full hover:bg-blue-100" title="Ver"
                        onClick={e => { e.stopPropagation(); setPreviewInvoice(invoice); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M2.05 12a9.94 9.94 0 0 1 19.9 0 9.94 9.94 0 0 1-19.9 0Z" />
                        </svg>
                      </button>
                      <button className="p-1 rounded-full hover:bg-red-100 disabled:opacity-60" title="Eliminar"
                        disabled={deletingId === invoice.identificacion.codigoGeneracion}
                        onClick={async e => {
                          e.stopPropagation();
                          setDeletingId(invoice.identificacion.codigoGeneracion);
                          try {
                            await actions.deleteInvoice(invoice.identificacion.codigoGeneracion);
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                      >
                        {deletingId === invoice.identificacion.codigoGeneracion ? (
                          <svg className="animate-spin w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M6 6L18 18M6 18L18 6" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}

      {/* Modal de preview */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 min-w-[350px] max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setPreviewInvoice(null)}
              title="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold mb-2">Factura</h2>
            <div className="mb-2">
              <span className="font-semibold">Emisor: </span>{previewInvoice.emisor.nombre}<br/>
              <span className="font-semibold">Receptor: </span>{previewInvoice.receptor.nombre}<br/>
              <span className="font-semibold">Monto: </span>${previewInvoice.resumen.montoTotalOperacion.toFixed(2)}<br/>
              <span className="font-semibold">Fecha: </span>{new Date(previewInvoice.identificacion.fecEmi).toLocaleDateString()}<br/>
              <span className="font-semibold">Código: </span>{previewInvoice.identificacion.codigoGeneracion}
            </div>
            <div className="text-right">
              <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setPreviewInvoice(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
                  {/* Menú contextual (tres puntos) */}
                  {config.showMenu && (
                    <button className="p-1 rounded-full hover:bg-gray-200 ml-2" title="Más opciones">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="5" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="19" cy="12" r="2" />
                      </svg>
                    </button>
                  )}
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
