import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/CustomFields.css';

interface FieldGroup {
  title: string;
  fields: Field[];
}

interface Field {
  id: string;
  name: string;
  selected: boolean;
  default: boolean;
}

const defaultFieldGroups: FieldGroup[] = [
  {
    title: 'Identificación',
    fields: [
      { id: 'factura', name: 'Factura', selected: true, default: true },
      { id: 'numeroControl', name: 'Número de Control', selected: false, default: false },
      { id: 'fechaEmision', name: 'Fecha de Emisión', selected: false, default: false },
      { id: 'horaEmision', name: 'Hora de Emisión', selected: false, default: false },
      { id: 'tipoDocumento', name: 'Tipo de Documento', selected: false, default: false },
    ]
  },
  {
    title: 'Emisor',
    fields: [
      { id: 'emisor', name: 'Emisor', selected: true, default: true },
      { id: 'nitEmisor', name: 'NIT Emisor', selected: false, default: false },
      { id: 'nrcEmisor', name: 'NRC Emisor', selected: false, default: false },
      { id: 'actividadEmisor', name: 'Actividad Emisor', selected: false, default: false },
    ]
  },
  {
    title: 'Receptor',
    fields: [
      { id: 'receptor', name: 'Receptor', selected: true, default: true },
      { id: 'nitReceptor', name: 'NIT Receptor', selected: false, default: false },
      { id: 'nrcReceptor', name: 'NRC Receptor', selected: false, default: false },
      { id: 'actividadReceptor', name: 'Actividad Receptor', selected: false, default: false },
    ]
  },
  {
    title: 'Detalles del Item',
    fields: [
      { id: 'codigo', name: 'Código', selected: true, default: true },
      { id: 'descripcion', name: 'Descripción', selected: true, default: true },
      { id: 'cantidad', name: 'Cantidad', selected: true, default: true },
      { id: 'precioUnitario', name: 'Precio Unitario', selected: true, default: true },
      { id: 'subtotal', name: 'Subtotal', selected: true, default: true },
    ]
  },
  {
    title: 'Resumen',
    fields: [
      { id: 'totalPagar', name: 'Total a Pagar', selected: false, default: false },
      { id: 'totalIVA', name: 'Total IVA', selected: false, default: false },
      { id: 'condicionOperacion', name: 'Condición de Operación', selected: false, default: false },
    ]
  }
];

const CustomFields: React.FC = () => {
  const [fieldGroups, setFieldGroups] = useState<FieldGroup[]>(defaultFieldGroups);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar configuración guardada
  useEffect(() => {
    const fetchFieldSettings = async () => {
      try {
        setLoading(true);
        const configRef = doc(db, 'config', 'visibleFields');
        const configDoc = await getDoc(configRef);
        
        if (configDoc.exists()) {
          const savedConfig = configDoc.data() as { fieldGroups: FieldGroup[] };
          setFieldGroups(savedConfig.fieldGroups);
        } else {
          console.log('No se encontró configuración guardada, usando valores predeterminados');
        }
      } catch (err) {
        console.error('Error al cargar configuración de campos:', err);
        setError('Error al cargar la configuración de campos visibles. Se usarán los valores predeterminados.');
      } finally {
        setLoading(false);
      }
    };

    fetchFieldSettings();
  }, []);

  // Manejar cambios en los campos
  const handleFieldChange = (groupIndex: number, fieldIndex: number, checked: boolean) => {
    const newFieldGroups = [...fieldGroups];
    newFieldGroups[groupIndex].fields[fieldIndex].selected = checked;
    setFieldGroups(newFieldGroups);
  };

  // Restaurar valores predeterminados
  const handleRestoreDefaults = () => {
    const restoredGroups = fieldGroups.map(group => ({
      ...group,
      fields: group.fields.map(field => ({
        ...field,
        selected: field.default
      }))
    }));
    
    setFieldGroups(restoredGroups);
  };

  // Guardar configuración
  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const configRef = doc(db, 'config', 'visibleFields');
      await setDoc(configRef, { fieldGroups });
      
      setSuccess('Configuración guardada correctamente.');
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      setError('Error al guardar la configuración. Por favor, intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // Obtener campos seleccionados
  const getSelectedFields = () => {
    const selected: Field[] = [];
    
    fieldGroups.forEach(group => {
      group.fields.forEach(field => {
        if (field.selected) {
          selected.push(field);
        }
      });
    });
    
    return selected;
  };

  return (
    <div className="custom-fields-container">
      <h1 className="page-title">Personalización de Campos</h1>
      <p className="page-description">Seleccione los campos que desea visualizar en sus informes y tablas de datos:</p>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="custom-fields-content">
        <div className="fields-config-container">
          <div className="fields-config-header">
            <h2>Configurar Campos Visibles</h2>
            <p>Selecciona los campos que deseas mostrar en la tabla.</p>
            
            <button 
              onClick={handleRestoreDefaults}
              className="restore-defaults-btn"
            >
              Restaurar valores predeterminados
            </button>
          </div>
          
          {loading ? (
            <div className="loading-indicator">Cargando configuración...</div>
          ) : (
            <div className="field-groups">
              {fieldGroups.map((group, groupIndex) => (
                <div key={group.title} className="field-group">
                  <h3 className="group-title">{group.title}</h3>
                  
                  <div className="fields-list">
                    {group.fields.map((field, fieldIndex) => (
                      <div key={field.id} className="field-checkbox">
                        <label>
                          <input
                            type="checkbox"
                            checked={field.selected}
                            onChange={(e) => handleFieldChange(groupIndex, fieldIndex, e.target.checked)}
                          />
                          {field.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="config-actions">
            <button 
              onClick={handleSaveConfig}
              className="apply-btn"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Aplicar'}
            </button>
          </div>
        </div>
        
        <div className="selected-fields-container">
          <h2>Campos Seleccionados:</h2>
          
          <div className="selected-fields-list">
            {getSelectedFields().map(field => (
              <div key={field.id} className="selected-field">
                {field.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomFields;
