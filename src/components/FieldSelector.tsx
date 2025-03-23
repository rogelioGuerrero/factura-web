import { useState, useEffect, useCallback } from 'react';
import { FieldSelectionController } from '../controllers/FieldSelectionController';
import { FieldConfig } from '../models/FieldSelectionModel';

// Obtener el controlador fuera del componente para evitar recreaciones
const fieldSelectionController = FieldSelectionController.getInstance();

interface FieldSelectorProps {
  onFieldsChange: (selectedFields: FieldConfig[]) => void;
}

const FieldSelector = ({ onFieldsChange }: FieldSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fieldsByCategory, setFieldsByCategory] = useState<Record<string, FieldConfig[]>>({});
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  
  // Cargar datos iniciales solo una vez
  useEffect(() => {
    if (!initialized) {
      // Cargar campos disponibles agrupados por categoría
      const availableFieldsByCategory = fieldSelectionController.getFieldsByCategory();
      setFieldsByCategory(availableFieldsByCategory);
      
      // Cargar campos seleccionados inicialmente
      const initialSelectedFields = fieldSelectionController.getSelectedFields();
      const initialIds = initialSelectedFields.map(field => field.id);
      setSelectedFieldIds(initialIds);
      
      // Notificar al componente padre sobre los campos iniciales
      onFieldsChange(initialSelectedFields);
      
      setInitialized(true);
    }
  }, [initialized, onFieldsChange]);
  
  // Función para actualizar los campos seleccionados
  const updateSelectedFields = useCallback((ids: string[]) => {
    // Actualizar el controlador
    fieldSelectionController.setSelectedFields(ids);
    
    // Obtener los objetos FieldConfig completos
    const selectedFields = fieldSelectionController.getSelectedFields();
    
    // Notificar al componente padre
    onFieldsChange(selectedFields);
  }, [onFieldsChange]);
  
  // Manejar la selección/deselección de un campo
  const handleToggleField = useCallback((fieldId: string) => {
    setSelectedFieldIds(prev => {
      const newIds = prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId];
      
      // Actualizar el controlador y notificar al padre
      updateSelectedFields(newIds);
      
      return newIds;
    });
  }, [updateSelectedFields]);
  
  // Manejar el restablecimiento a valores predeterminados
  const handleResetToDefaults = useCallback(() => {
    fieldSelectionController.resetToDefaults();
    const defaultFields = fieldSelectionController.getSelectedFields();
    const defaultIds = defaultFields.map(field => field.id);
    
    setSelectedFieldIds(defaultIds);
    onFieldsChange(defaultFields);
  }, [onFieldsChange]);
  
  const categoryLabels: Record<string, string> = {
    identificacion: 'Identificación',
    emisor: 'Emisor',
    receptor: 'Receptor',
    item: 'Detalles del Item',
    resumen: 'Resumen'
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 flex items-center"
        title="Configurar campos visibles"
      >
        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Configurar Campos
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Configurar Campos Visibles</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Selecciona los campos que deseas mostrar en la tabla.
              </p>
              <button
                onClick={handleResetToDefaults}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Restaurar valores predeterminados
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {Object.entries(fieldsByCategory).map(([category, fields]) => (
                <div key={category} className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">{categoryLabels[category] || category}</h4>
                  <div className="space-y-2">
                    {fields.map(field => (
                      <div key={field.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`field-${field.id}`}
                          checked={selectedFieldIds.includes(field.id)}
                          onChange={() => handleToggleField(field.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`field-${field.id}`} className="ml-2 block text-sm text-gray-900">
                          {field.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-3 border-t border-gray-200 mt-4 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldSelector;
