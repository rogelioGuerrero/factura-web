import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useFieldsManager } from '../hooks/useFieldsManager';
import { FieldConfig } from '../models/FieldsService';

interface FieldsContextType {
  selectedFields: FieldConfig[];
  allFields: FieldConfig[];
  loading: boolean;
  error: string | null;
  toggleFieldSelection: (fieldId: string) => void;
  reorderFields: (startIndex: number, endIndex: number, category?: string) => void;
  saveFieldsConfig: () => Promise<void>;
  resetToDefaults: () => void;
  detectNewFields: (jsonData: any) => FieldConfig[];
}

const FieldsContext = createContext<FieldsContextType | undefined>(undefined);

export const FieldsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fieldsLoaded, setFieldsLoaded] = useState(false);
  
  const {
    fields,
    loading,
    error,
    toggleFieldSelection,
    reorderFields,
    saveFieldsConfig,
    resetToDefaults,
    getSelectedFields,
    detectNewFields
  } = useFieldsManager();

  // Escuchar cambios en el localStorage
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Si el cambio es en la configuración de campos, recargar la página
      if (event.key && event.key.startsWith('fields_config_')) {
        console.log('Detectado cambio en localStorage para campos:', event.key);
        // Forzar recarga de la página para aplicar los cambios
        window.location.reload();
      }
    };

    // Añadir listener para cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Asegurarse de que los campos se carguen correctamente
  useEffect(() => {
    // Si ya se cargaron los campos, no hacer nada
    if (fieldsLoaded) return;
    
    // Marcar como cargados para evitar cargas repetidas
    setFieldsLoaded(true);
    
    // Registrar cuando se cargan los campos
    console.log('Campos cargados en el contexto:', fields.length);
    console.log('Campos seleccionados en el contexto:', getSelectedFields().length);
  }, [fields, fieldsLoaded, getSelectedFields]);

  const selectedFields = getSelectedFields();
  
  // Registrar cuando cambian los campos seleccionados
  useEffect(() => {
    console.log('Campos seleccionados actualizados:', selectedFields.length);
    console.log('IDs de campos seleccionados:', selectedFields.map(f => f.id).join(', '));
  }, [selectedFields]);

  const value = {
    selectedFields,
    allFields: fields,
    loading,
    error,
    toggleFieldSelection,
    reorderFields,
    saveFieldsConfig,
    resetToDefaults,
    detectNewFields
  };

  return (
    <FieldsContext.Provider value={value}>
      {children}
    </FieldsContext.Provider>
  );
};

export const useFields = (): FieldsContextType => {
  const context = useContext(FieldsContext);
  if (context === undefined) {
    throw new Error('useFields debe ser usado dentro de un FieldsProvider');
  }
  return context;
};
