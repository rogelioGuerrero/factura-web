import React, { useState, useEffect } from 'react';
import { useFields } from '@/modules/fields/contexts/FieldsContext';
import { FieldsService } from '@/modules/fields/models/FieldsService';
import { FieldConfig, FieldGroup } from '@/modules/fields/types';

// Mapear los campos del servicio al formato que espera la interfaz
const mapServiceFieldsToGroups = (fields: FieldConfig[]): FieldGroup[] => {
  const groupsMap = new Map<string, FieldGroup>();
  
  // Crear grupos basados en categorías
  fields.forEach(field => {
    const categoryName = field.category.charAt(0).toUpperCase() + field.category.slice(1);
    let title = categoryName;
    
    // Mapear categorías a títulos más amigables
    if (categoryName === 'Identificacion') title = 'Identificación';
    if (categoryName === 'Detalles') title = 'Detalles del Item';
    
    if (!groupsMap.has(field.category)) {
      groupsMap.set(field.category, {
        title,
        fields: []
      });
    }
    
    const group = groupsMap.get(field.category)!;
    group.fields.push({
      id: field.id,
      name: field.label,
      selected: field.selected,
      default: !field.isCustom // Los campos no personalizados son los predeterminados
    });
  });
  
  // Convertir el mapa a un array y ordenar los grupos
  return Array.from(groupsMap.values());
};

const CustomFields: React.FC = () => {
  const fieldsService = FieldsService.getInstance();
  const defaultFieldsConfig = fieldsService.getDefaultFieldsConfig();
  
  const [fieldGroups, setFieldGroups] = useState<FieldGroup[]>(mapServiceFieldsToGroups(defaultFieldsConfig));
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const { saveFieldsConfig: contextSaveFieldsConfig } = useFields();

  // Cargar configuración guardada
  useEffect(() => {
    const loadSavedConfig = async () => {
      try {
        setLoading(true);
        console.log('Intentando cargar configuración guardada desde Firestore...');
        
        const config = await fieldsService.getFieldsConfig();
        console.log('Configuración cargada:', config);
        
        if (config && config.length > 0) {
          // Mapear la configuración a grupos de campos
          const mappedGroups = mapServiceFieldsToGroups(config);
          console.log('Grupos mapeados:', mappedGroups);
          setFieldGroups(mappedGroups);
        }
      } catch (err) {
        console.error('Error al cargar configuración:', err);
        setError('No se pudo cargar la configuración guardada.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedConfig();
  }, []);

  // Manejar cambios en los campos
  const handleFieldChange = (groupIndex: number, fieldIndex: number, checked: boolean) => {
    const newFieldGroups = [...fieldGroups];
    newFieldGroups[groupIndex].fields[fieldIndex].selected = checked;
    setFieldGroups(newFieldGroups);
  };

  // Restaurar valores predeterminados
  const handleRestoreDefaults = () => {
    const defaultFieldsConfig = fieldsService.getDefaultFieldsConfig();
    setFieldGroups(mapServiceFieldsToGroups(defaultFieldsConfig));
    setSuccessMessage('Valores predeterminados restaurados. Haga clic en "Aplicar" para guardar los cambios.');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // Obtener campos seleccionados
  const getSelectedFields = () => {
    const selected: FieldConfig[] = [];
    
    fieldGroups.forEach(group => {
      group.fields.forEach(field => {
        if (field.selected) {
          selected.push({
            id: field.id,
            label: field.name,
            selected: field.selected,
            category: group.title.toLowerCase().replace('ó', 'o').replace('í', 'i'),
            order: 0, // Se reordenará automáticamente
            isCustom: field.default ? undefined : true
          });
        }
      });
    });
    
    return selected;
  };

  // Guardar configuración
  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      console.log('Guardando configuración en Firestore...');
      
      // Convertir los grupos de campos a una lista plana
      const fieldsToSave = getSelectedFields();
      console.log('Campos a guardar:', fieldsToSave);
      
      // Guardar la configuración en Firestore
      await fieldsService.saveFieldsConfig('', fieldsService.reorderFields(fieldsToSave));
      console.log('Configuración guardada exitosamente en Firestore');
      
      // Actualizar el contexto para que otros componentes se actualicen
      await contextSaveFieldsConfig();
      console.log('Contexto de campos actualizado correctamente');
      
      // Disparar un evento de storage para notificar a otras pestañas/componentes
      window.dispatchEvent(new Event('storage'));
      
      // Mostrar mensaje de éxito
      setSuccessMessage('¡Configuración guardada correctamente!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      setError('Error al guardar la configuración. Por favor, inténtelo de nuevo.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="custom-fields-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="page-title" style={{ marginBottom: '10px', fontSize: '24px', fontWeight: 'bold' }}>Gestor de Campos</h1>
      <p className="page-description" style={{ marginBottom: '20px', color: '#666' }}>
        Seleccione los campos que desea visualizar en sus informes y tablas de datos:
      </p>
      
      {/* Mensajes de notificación flotantes */}
      {error && (
        <div className="error-message" style={{ 
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '15px 20px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '4px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          maxWidth: '400px'
        }}>
          <div style={{ marginRight: '10px', fontWeight: 'bold' }}>⚠️</div>
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="success-message" style={{ 
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '15px 20px', 
          backgroundColor: '#e8f5e9', 
          color: '#2e7d32', 
          borderRadius: '4px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          maxWidth: '400px'
        }}>
          <div style={{ marginRight: '10px', fontWeight: 'bold' }}>✅</div>
          <div>
            <strong>Éxito:</strong> {successMessage}
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="loading-container" style={{ 
          textAlign: 'center', 
          padding: '20px' 
        }}>
          <p>Cargando configuración de campos...</p>
        </div>
      ) : (
        <div className="custom-fields-content" style={{ 
          display: 'flex', 
          gap: '20px',
          flexDirection: 'row',
          flexWrap: 'wrap'
        }}>
          {/* Columna izquierda - Configuración de campos */}
          <div className="fields-config-container" style={{ 
            flex: '1',
            minWidth: '300px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              marginTop: '0',
              marginBottom: '10px'
            }}>Configurar Campos Visibles</h2>
            
            <p style={{ 
              fontSize: '14px',
              color: '#666',
              marginBottom: '15px'
            }}>Selecciona los campos que deseas mostrar en la tabla.</p>
            
            <button 
              onClick={handleRestoreDefaults}
              className="restore-defaults-btn"
              style={{ 
                backgroundColor: '#f5f5f5', 
                border: '1px solid #ddd', 
                padding: '8px 12px', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '14px',
                marginBottom: '20px'
              }}
            >
              Restaurar valores predeterminados
            </button>
            
            {fieldGroups.map((group, groupIndex) => (
              <div key={group.title} className="field-group" style={{ 
                marginBottom: '20px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <h3 className="group-title" style={{ 
                  backgroundColor: '#f5f5f5',
                  padding: '10px 15px',
                  margin: '0',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #e0e0e0'
                }}>{group.title}</h3>
                
                <div className="fields-list" style={{ 
                  padding: '10px 15px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px'
                }}>
                  {group.fields.map((field, fieldIndex) => (
                    <div key={field.id} className="field-checkbox" style={{ 
                      margin: '4px 0', 
                      display: 'flex', 
                      alignItems: 'center' 
                    }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}>
                        <input
                          type="checkbox"
                          checked={field.selected}
                          onChange={(e) => handleFieldChange(groupIndex, fieldIndex, e.target.checked)}
                          style={{ marginRight: '8px' }}
                        />
                        {field.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="config-actions" style={{ 
              marginTop: '20px', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'flex-start'
            }}>
              <button 
                className="apply-btn"
                onClick={handleSaveConfig}
                disabled={saving}
                style={{ 
                  backgroundColor: '#4caf50', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '4px', 
                  cursor: saving ? 'not-allowed' : 'pointer', 
                  opacity: saving ? 0.7 : 1,
                  fontWeight: 'bold'
                }}
              >
                {saving ? 'Guardando...' : 'Aplicar'}
              </button>
            </div>
          </div>
          
          {/* Columna derecha - Campos seleccionados */}
          <div className="selected-fields-container" style={{ 
            flex: '1',
            minWidth: '300px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              marginTop: '0',
              marginBottom: '20px'
            }}>Campos Seleccionados:</h2>
            
            <div className="selected-fields-list" style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '10px' 
            }}>
              {getSelectedFields().length > 0 ? (
                getSelectedFields().map(field => (
                  <div key={field.id} className="selected-field" style={{ 
                    padding: '10px 15px', 
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#333',
                    fontWeight: 'normal'
                  }}>
                    {field.label}
                  </div>
                ))
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                  No hay campos seleccionados. Por favor, seleccione al menos un campo.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFields;
