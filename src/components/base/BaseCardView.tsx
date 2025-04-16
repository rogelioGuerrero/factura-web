import React from 'react';

export interface BaseCardField<T> {
  label: string;
  field?: string;
  render?: (row: T, index: number) => React.ReactNode;
  visible?: boolean;
}

export interface BaseCardAction<T> {
  icon: React.ReactNode;
  tooltip: string;
  onClick: (row: T, index: number) => void;
}

export interface BaseCardViewProps<T> {
  data: T[];
  fields: BaseCardField<T>[];
  actions?: BaseCardAction<T>[];
  selectable?: boolean;
  selectedCards?: string[];
  onSelectionChange?: (selected: string[]) => void;
  config?: Record<string, any>;
  onConfigChange?: (config: Record<string, any>) => void;
  theme?: 'light' | 'dark';
  accentColor?: string;
  cardSize?: 'compact' | 'normal' | 'large';
  renderHeader?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  groupBy?: string[];
  renderGroupHeader?: (groupKeys: string[], rows: T[]) => React.ReactNode;
}

/**
 * BaseCardView: componente base ultra flexible para vista de tarjetas.
 * Permite campos, acciones, selección, slots, agrupación multinivel, tema, personalización visual.
 * Extiende y personaliza según tus necesidades.
 */
export function BaseCardView<T extends { [key: string]: any }>({
  data,
  fields,
  actions,
  selectable,
  selectedCards = [],
  onSelectionChange,
  config,
  onConfigChange,
  theme = 'light',
  accentColor = '#2563eb',
  cardSize = 'normal',
  renderHeader,
  renderFooter,
  groupBy = [],
  renderGroupHeader,
}: BaseCardViewProps<T>) {
  // Aquí va la lógica de renderizado, agrupación, slots, etc.
  // Por simplicidad, solo el esqueleto. Implementa según tus necesidades.
  return (
    <div className={`base-cardview ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      {renderHeader?.()}
      {/* Render de tarjetas, agrupación, acciones, etc. */}
      <div className="text-gray-400 italic p-8 text-center">[BaseCardView] Aquí va tu vista de tarjetas personalizada</div>
      {renderFooter?.()}
    </div>
  );
}

// Puedes extender este componente para lógica avanzada, o usarlo como base para tus vistas.
