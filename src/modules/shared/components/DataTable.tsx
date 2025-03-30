import React, { useState, useEffect } from 'react';
import { useFields } from '@/modules/fields/contexts/FieldsContext';

interface DataTableProps {
  data: any[];
  onRowSelect?: (selectedRows: any[]) => void;
  showCheckboxes?: boolean;
  emptyMessage?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  onRowSelect,
  showCheckboxes = true,
  emptyMessage = 'No hay datos disponibles'
}) => {
  const { selectedFields, loading } = useFields();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Manejar la selección de todas las filas
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows([...data]);
    }
    setSelectAll(!selectAll);
    
    if (onRowSelect) {
      onRowSelect(selectAll ? [] : [...data]);
    }
  };

  // Manejar la selección de una fila individual
  const handleSelectRow = (row: any) => {
    const isSelected = selectedRows.some(r => r === row);
    let newSelectedRows: any[];
    
    if (isSelected) {
      newSelectedRows = selectedRows.filter(r => r !== row);
    } else {
      newSelectedRows = [...selectedRows, row];
    }
    
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === data.length);
    
    if (onRowSelect) {
      onRowSelect(newSelectedRows);
    }
  };

  // Función para obtener el valor de un campo anidado (por ejemplo: "emisor.nombre")
  const getNestedValue = (obj: any, path: string) => {
    if (!obj) return null;
    
    try {
      const keys = path.split('.');
      let value = obj;
      
      for (const key of keys) {
        // Manejar arrays con índices numéricos (por ejemplo: cuerpoDocumento.0.descripcion)
        if (!isNaN(Number(key)) && Array.isArray(value)) {
          const index = Number(key);
          value = value[index];
        } else {
          value = value[key];
        }
        
        // Si el valor es undefined o null, detenemos la búsqueda
        if (value === undefined || value === null) {
          return null;
        }
      }
      
      // Si el valor es un objeto, lo convertimos a string
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      
      return value;
    } catch (error) {
      console.error(`Error al obtener el valor para la ruta ${path}:`, error);
      return null;
    }
  };

  // Formatear el valor para mostrarlo en la tabla
  const formatValue = (value: any) => {
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    
    if (typeof value === 'number') {
      // Formatear números con 2 decimales si es necesario
      return value.toLocaleString('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    
    if (typeof value === 'string') {
      // Si es una fecha en formato ISO, formatearla
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        try {
          const date = new Date(value);
          return date.toLocaleDateString('es-SV');
        } catch {
          return value;
        }
      }
      
      return value;
    }
    
    return String(value);
  };

  useEffect(() => {
    // Reiniciar selección cuando cambian los datos
    setSelectedRows([]);
    setSelectAll(false);
  }, [data]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="border rounded p-6 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="border rounded overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50">
              {showCheckboxes && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </th>
              )}
              
              {selectedFields.map((field) => (
                <th
                  key={field.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className={`${
                  selectedRows.includes(row) ? 'bg-blue-50' : ''
                } hover:bg-gray-50 cursor-pointer`}
                onClick={() => showCheckboxes && handleSelectRow(row)}
              >
                {showCheckboxes && (
                  <td className="px-6 py-4 whitespace-nowrap w-1/12">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectRow(row);
                      }}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </td>
                )}
                
                {selectedFields.map((field) => (
                  <td 
                    key={field.id} 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                  >
                    {formatValue(getNestedValue(row, field.id))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
