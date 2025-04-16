import React from 'react';

export interface BaseDataTableColumn<T> {
  header: string;
  field?: string;
  render?: (row: T, rowIndex: number) => React.ReactNode;
  visible?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
  width?: string | number;
}

export interface BaseDataTableAction<T> {
  icon: React.ReactNode;
  tooltip: string;
  onClick: (row: T, rowIndex: number) => void;
}

export interface BaseDataTableProps<T> {
  data: T[];
  columns: BaseDataTableColumn<T>[];
  actions?: BaseDataTableAction<T>[];
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selected: string[]) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
    onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  };
  filter?: {
    filters: Record<string, string>;
    onFilterChange: (field: string, value: string) => void;
  };
  theme?: 'light' | 'dark';
  renderHeader?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  groupBy?: string[]; // Agrupación multinivel
  renderGroupHeader?: (groupKeys: string[], rows: T[]) => React.ReactNode;
}

/**
 * BaseDataTable: componente base ultra flexible para tablas.
 * Permite columnas, acciones, selección, paginación, orden, filtros, agrupación multinivel, slots y tema.
 * Extiende y personaliza según tus necesidades.
 */
export function BaseDataTable<T extends { [key: string]: any }>({
  data,
  columns,
  actions,
  selectable,
  selectedRows = [],
  onSelectionChange,
  pagination,
  sort,
  filter,
  theme = 'light',
  renderHeader,
  renderFooter,
  groupBy = [],
  renderGroupHeader,
}: BaseDataTableProps<T>) {
  // Aquí va la lógica de renderizado, agrupación, slots, etc.
  // Por simplicidad, solo el esqueleto. Implementa según tus necesidades.
  return (
    <div className={`base-table ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      {renderHeader?.()}
      {/* Render de tabla, agrupación, filas, acciones, etc. */}
      <div className="text-gray-400 italic p-8 text-center">[BaseDataTable] Aquí va tu tabla personalizada</div>
      {renderFooter?.()}
    </div>
  );
}

// Puedes extender este componente para lógica avanzada, o usarlo como base para tus vistas.
