import { useState, useEffect, useCallback } from 'react';
import { InvoiceData } from '../../types/invoice';
import { FieldConfig } from '../../models/FieldSelectionModel';
import FieldSelector from '../FieldSelector';
import { flattenInvoiceData, formatFieldValue } from '../../utils/fieldExtractor';
import { FieldSelectionController } from '../../controllers/FieldSelectionController';

// Obtener el controlador fuera del componente para evitar recreaciones
const fieldSelectionController = FieldSelectionController.getInstance();

interface DataTableStepProps {
  data: InvoiceData[];
  onPrev: () => void;
}

const DataTableStep = ({ data, onPrev }: DataTableStepProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFields, setSelectedFields] = useState<FieldConfig[]>([]);
  const [flattenedData, setFlattenedData] = useState<Record<string, unknown>[]>([]);
  const [filteredData, setFilteredData] = useState<Record<string, unknown>[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Inicialización - se ejecuta una sola vez
  useEffect(() => {
    if (!initialized) {
      // Cargar campos seleccionados inicialmente
      const initialFields = fieldSelectionController.getSelectedFields();
      setSelectedFields(initialFields);
      
      // Procesar datos iniciales si están disponibles
      if (initialFields.length > 0 && data.length > 0) {
        const flattened = flattenInvoiceData(data, initialFields);
        setFlattenedData(flattened);
        setFilteredData(flattened);
      }
      
      setInitialized(true);
    }
  }, [initialized, data]);

  // Procesar datos cuando cambian los campos seleccionados o los datos
  useEffect(() => {
    if (initialized && selectedFields.length > 0 && data.length > 0) {
      const flattened = flattenInvoiceData(data, selectedFields);
      setFlattenedData(flattened);
      setFilteredData(flattened);
    }
  }, [initialized, selectedFields, data]);

  // Filtrar datos cuando cambie el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(flattenedData);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = flattenedData.filter(item => {
      // Buscar en todos los campos de texto
      return Object.entries(item).some(([, value]) => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerSearchTerm);
        }
        if (value !== null && value !== undefined) {
          return value.toString().toLowerCase().includes(lowerSearchTerm);
        }
        return false;
      });
    });
    
    setFilteredData(filtered);
  }, [searchTerm, flattenedData]);

  // Manejar cambios en los campos seleccionados
  const handleFieldsChange = useCallback((fields: FieldConfig[]) => {
    setSelectedFields(fields);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Tabla de Datos</h2>
        <div className="flex space-x-4">
          <FieldSelector onFieldsChange={handleFieldsChange} />
          <button
            onClick={onPrev}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 flex items-center"
            title="Volver a la pantalla de carga de archivos"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{data.length}</span> facturas cargadas con <span className="font-medium">{flattenedData.length}</span> items en total
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              title="Buscar en cualquier campo visible"
            />
          </div>
        </div>
        {searchTerm && (
          <div className="text-sm text-gray-600 text-right">
            {filteredData.length} resultados encontrados
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectedFields.map(field => (
                <th 
                  key={field.id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {selectedFields.map(field => (
                    <td key={field.id} className="px-4 py-3 text-sm text-gray-900">
                      {formatFieldValue(item[field.id], field.id)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={selectedFields.length} className="px-4 py-4 text-center text-sm text-gray-500">
                  {searchTerm 
                    ? 'No se encontraron resultados para la búsqueda.' 
                    : 'No hay datos disponibles.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTableStep;
