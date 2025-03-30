import { useState, useEffect, useCallback } from 'react';
import { FieldConfig, FieldsService } from '../models/FieldsService';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const useFieldsManager = () => {
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const fieldsService = FieldsService.getInstance();
  
  // Cargar la configuración de campos al iniciar
  useEffect(() => {
    const loadFieldsConfig = async () => {
      // Usar un ID predeterminado si no hay usuario autenticado
      const userId = user ? user.uid : 'default_user';
      
      try {
        setLoading(true);
        const config = await fieldsService.getFieldsConfig(userId);
        if (config) {
          setFields(config);
        }
      } catch (err) {
        console.error('Error al cargar configuración de campos:', err);
        setError('No se pudo cargar la configuración de campos');
      } finally {
        setLoading(false);
      }
    };
    
    loadFieldsConfig();
  }, [user]);
  
  // Guardar la configuración de campos
  const saveFieldsConfig = async () => {
    // Usar un ID predeterminado si no hay usuario autenticado
    const userId = user ? user.uid : 'default_user';
    
    try {
      setLoading(true);
      await fieldsService.saveFieldsConfig(userId, fields);
      setError(null);
    } catch (err) {
      console.error('Error al guardar configuración de campos:', err);
      setError('No se pudo guardar la configuración de campos');
    } finally {
      setLoading(false);
    }
  };
  
  // Actualizar la selección de un campo
  const toggleFieldSelection = (fieldId: string) => {
    setFields(prevFields => 
      prevFields.map(field => 
        field.id === fieldId 
          ? { ...field, selected: !field.selected } 
          : field
      )
    );
  };
  
  // Reordenar campos
  const reorderFields = (sourceIndex: number, destinationIndex: number, category?: string) => {
    // Filtrar los campos por categoría si se proporciona una
    const fieldsToReorder = category 
      ? fields.filter(field => field.category === category)
      : fields;
    
    // Si no hay campos para reordenar, salir
    if (fieldsToReorder.length === 0) return null;
    
    // Obtener el campo a mover
    const [movedField] = fieldsToReorder.splice(sourceIndex, 1);
    
    // Insertar el campo en la nueva posición
    fieldsToReorder.splice(destinationIndex, 0, movedField);
    
    // Actualizar el orden de los campos
    const reorderedFields = fieldsToReorder.map((field, index) => ({
      ...field,
      order: index + 1
    }));
    
    // Si se filtró por categoría, combinar con los campos de otras categorías
    if (category) {
      const otherFields = fields.filter(field => field.category !== category);
      const updatedFields = [...otherFields, ...reorderedFields].sort((a, b) => a.order - b.order);
      setFields(updatedFields);
      return updatedFields;
    } else {
      setFields(reorderedFields);
      return reorderedFields;
    }
  };
  
  // Restaurar valores predeterminados
  const resetToDefaults = () => {
    const defaultFields = fieldsService.getDefaultFieldsConfig();
    setFields(defaultFields);
  };
  
  // Obtener campos seleccionados
  const getSelectedFields = () => {
    return fields
      .filter(field => field.selected)
      .sort((a, b) => a.order - b.order);
  };
  
  // Obtener campos por categoría
  const getFieldsByCategory = (category: string) => {
    return fields
      .filter(field => field.category === category)
      .sort((a, b) => a.order - b.order);
  };
  
  // Añadir un campo personalizado
  const addCustomField = (field: FieldConfig) => {
    // Verificar si el campo ya existe
    const exists = fields.some(f => f.id === field.id);
    
    if (exists) {
      setError(`Ya existe un campo con el ID: ${field.id}`);
      return;
    }
    
    // Añadir el nuevo campo
    setFields(prevFields => [
      ...prevFields,
      {
        ...field,
        order: prevFields.length + 1,
        isCustom: true
      }
    ]);
    
    setError(null);
  };
  
  // Detectar campos nuevos desde datos JSON
  const detectNewFields = useCallback((jsonData: any) => {
    if (!jsonData) return [];
    
    console.log('Detectando campos nuevos desde:', jsonData);
    const newFields = fieldsService.detectNewFields(jsonData, fields);
    console.log('Campos nuevos detectados:', newFields);
    
    return newFields;
  }, [fields, fieldsService]);
  
  return {
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
  };
};
