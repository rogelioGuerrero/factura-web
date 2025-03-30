import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useFieldsManager } from '../hooks/useFieldsManager';
import { FieldConfig } from '../models/FieldsService';

interface CustomFieldFormData {
  id: string;
  label: string;
  category: string;
}

export const FieldsManager: React.FC<{ jsonSample?: any }> = ({ jsonSample }) => {
  const { 
    fields, 
    loading, 
    error, 
    toggleFieldSelection, 
    reorderFields, 
    saveFieldsConfig, 
    resetToDefaults,
    getSelectedFields,
    getFieldsByCategory,
    addCustomField,
    detectNewFields
  } = useFieldsManager();
  
  const [activeTab, setActiveTab] = useState('identificacion');
  const [showCustomFieldForm, setShowCustomFieldForm] = useState(false);
  const [customFieldData, setCustomFieldData] = useState<CustomFieldFormData>({
    id: '',
    label: '',
    category: 'otros'
  });
  const [newFieldsDetected, setNewFieldsDetected] = useState<FieldConfig[]>([]);
  const [showNewFieldsModal, setShowNewFieldsModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Detectar campos nuevos cuando se proporciona una muestra JSON
  useEffect(() => {
    if (jsonSample && fields.length > 0) {
      console.log('Procesando JSON para detectar campos:', jsonSample);
      const detected = detectNewFields(jsonSample);
      console.log('Campos detectados:', detected);
      if (detected.length > 0) {
        setNewFieldsDetected(detected);
        setShowNewFieldsModal(true);
      } else {
        setSuccessMessage('No se encontraron campos nuevos en el archivo JSON.');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  }, [jsonSample, fields, detectNewFields]);

  // Manejar el arrastre y soltar para reordenar
  const handleDragEnd = (result: DropResult) => {
    // Si se suelta fuera de un área válida
    if (!result.destination) return;
    
    // Si se suelta en la misma posición
    if (
      result.destination.droppableId === result.source.droppableId &&
      result.destination.index === result.source.index
    ) {
      return;
    }
    
    // Reordenar los campos
    const updatedFields = reorderFields(
      result.source.index,
      result.destination.index,
      activeTab
    );
    
    if (updatedFields) {
      // El hook ya actualiza el estado
    }
  };

  // Manejar cambios en el formulario de campo personalizado
  const handleCustomFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomFieldData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Añadir un campo personalizado
  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customFieldData.id || !customFieldData.label) {
      return;
    }
    
    addCustomField({
      id: customFieldData.id,
      label: customFieldData.label,
      category: customFieldData.category,
      selected: true,
      order: fields.length + 1,
      isCustom: true
    });
    
    // Resetear el formulario
    setCustomFieldData({
      id: '',
      label: '',
      category: 'otros'
    });
    
    setShowCustomFieldForm(false);
  };

  // Añadir campos detectados
  const handleAddDetectedFields = () => {
    // Añadir cada campo detectado
    newFieldsDetected.forEach(field => {
      addCustomField({
        ...field,
        selected: true,
        isCustom: true
      });
    });
    
    setNewFieldsDetected([]);
    setShowNewFieldsModal(false);
    setSuccessMessage('Campos nuevos añadidos correctamente.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Obtener los campos para la categoría activa
  const categoryFields = getFieldsByCategory(activeTab);

  // Categorías disponibles
  const categories = [
    { id: 'identificacion', label: 'Identificación' },
    { id: 'emisor', label: 'Emisor' },
    { id: 'receptor', label: 'Receptor' },
    { id: 'detalles', label: 'Detalles del Item' },
    { id: 'resumen', label: 'Resumen' },
    { id: 'otros', label: 'Otros' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
          {successMessage}
        </div>
      )}
      
      {/* Modal para mostrar campos detectados */}
      {showNewFieldsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Campos nuevos detectados</h2>
            <p className="mb-4">
              Se han detectado {newFieldsDetected.length} campos nuevos en el archivo JSON.
              ¿Desea añadirlos a su configuración?
            </p>
            
            <div className="max-h-[40vh] overflow-y-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Etiqueta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {newFieldsDetected.map((field, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {field.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {field.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {field.category}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNewFieldsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddDetectedFields}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Añadir campos
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Configurar Campos Visibles</h2>
            <p className="text-gray-600 mb-4">
              Seleccione los campos que desea mostrar y arrástrelos para cambiar su orden.
            </p>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-1 overflow-x-auto pb-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                      activeTab === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowCustomFieldForm(true)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Añadir Campo
                </button>
                <button
                  onClick={resetToDefaults}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Restaurar Predeterminados
                </button>
              </div>
            </div>
            
            {/* Formulario para añadir campo personalizado */}
            {showCustomFieldForm && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h3 className="text-lg font-medium mb-3">Añadir Campo Personalizado</h3>
                <form onSubmit={handleAddCustomField}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                        ID Técnico
                      </label>
                      <input
                        type="text"
                        id="id"
                        name="id"
                        value={customFieldData.id}
                        onChange={handleCustomFieldChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="ej: miCampo"
                      />
                    </div>
                    <div>
                      <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
                        Etiqueta
                      </label>
                      <input
                        type="text"
                        id="label"
                        name="label"
                        value={customFieldData.label}
                        onChange={handleCustomFieldChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="ej: Mi Campo"
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={customFieldData.category}
                        onChange={handleCustomFieldChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCustomFieldForm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Añadir
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Lista de campos arrastrables */}
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                <span className="ml-2 text-gray-600">Cargando campos...</span>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId={`fields-${activeTab}`}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="bg-gray-50 rounded-md p-2 min-h-[200px]"
                    >
                      {categoryFields.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No hay campos en esta categoría
                        </div>
                      ) : (
                        categoryFields.map((field, index) => (
                          <Draggable key={field.id} draggableId={field.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center justify-between p-3 mb-2 rounded-md ${
                                  field.selected ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-gray-200'
                                }`}
                              >
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={field.selected}
                                    onChange={() => toggleFieldSelection(field.id)}
                                    className="h-4 w-4 text-blue-600 rounded"
                                  />
                                  <span className="ml-3 text-gray-900">{field.label}</span>
                                  {field.isCustom && (
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                                      Personalizado
                                    </span>
                                  )}
                                </div>
                                <div className="text-gray-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={saveFieldsConfig}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/3">
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-bold mb-4">Campos Seleccionados</h2>
            <p className="text-gray-600 mb-4">
              Estos son los campos que se mostrarán en sus informes y tablas.
            </p>
            
            <div className="space-y-2">
              {getSelectedFields().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay campos seleccionados
                </div>
              ) : (
                getSelectedFields().map(field => (
                  <div key={field.id} className="bg-white p-3 rounded-md border border-gray-200">
                    <div className="font-medium">{field.label}</div>
                    <div className="text-xs text-gray-500">{field.id}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
