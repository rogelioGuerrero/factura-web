import { useState, ReactNode } from 'react';

export interface DataTableColumn<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T, rowIndex: number) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey?: (row: T, index: number) => string | number;
  filterable?: boolean;
  sortable?: boolean;
  paginable?: boolean;
  pageSizeOptions?: number[];
  className?: string;
  rowEvents?: {
    onMouseEnter?: (row: T, rowIndex: number) => void;
    onMouseLeave?: (row: T, rowIndex: number) => void;
  };
}

export function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  filterable = false,

  paginable = false,
  pageSizeOptions = [10, 25, 50],
  className = '',
}: DataTableProps<T>) {
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Simple filter (global)
  const filteredData = filterable && filter
    ? data.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(filter.toLowerCase())
        )
      )
    : data;

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = paginable
    ? filteredData.slice((page - 1) * pageSize, page * pageSize)
    : filteredData;

  // Render
  return (
    <div className={`w-full ${className}`}>
      {filterable && (
        <div className="mb-3 flex justify-between items-center gap-2">
          <input
            type="text"
            placeholder="Filtrar..."
            value={filter}
            onChange={e => {
              setPage(1);
              setFilter(e.target.value);
            }}
            className="px-3 py-2 border rounded w-full max-w-xs"
          />
          {paginable && (
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 border rounded"
            >
              {pageSizeOptions.map(opt => (
                <option key={opt} value={opt}>{opt} por página</option>
              ))}
            </select>
          )}
        </div>
      )}
      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.header + idx}
                  className={`px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-6 text-gray-400">Sin datos</td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowKey ? rowKey(row, rowIndex) : rowIndex}
                  className={`transition-colors cursor-pointer ${hoveredRow === rowIndex ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  onMouseEnter={() => setHoveredRow(rowIndex)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {columns.map((col, colIndex) => (
                    <td key={col.header + colIndex} className={`px-4 py-3 ${col.className || ''}`}>
                      {col.render ? col.render(row, rowIndex) : col.accessor ? (row as any)[col.accessor] : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {paginable && totalPages > 1 && (
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-500">Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >Anterior</button>
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}
