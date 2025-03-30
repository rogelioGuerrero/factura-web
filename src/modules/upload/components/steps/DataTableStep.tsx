import React, { useState, useEffect } from 'react';
import { InvoiceData } from '@/types/invoice';
import { useFields } from '@/modules/fields/contexts/FieldsContext';
import { FieldsService } from '@/modules/fields/models/FieldsService';
import { FieldConfig } from '@/modules/fields/types';
import '../styles/DataTableStep.css';

interface ColumnDef {
  id: string;
  header: string;
  width?: number;
  accessor: (invoice: any) => string | number | React.ReactNode;
}

interface DataTableStepProps {
  invoices: InvoiceData[];
  onBack?: () => void;
  onSave?: (selectedInvoices: InvoiceData[]) => void;
  isProcessing?: boolean;
}

const DataTableStep: React.FC<DataTableStepProps> = ({ 
  invoices, 
  onBack,
  onSave,
  isProcessing = false
}) => {
  const [selectedInvoices, setSelectedInvoices] = useState<InvoiceData[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const { selectedFields } = useFields();
  const [columns, setColumns] = useState<ColumnDef[]>([]);
  
  // Inicialmente seleccionar todas las facturas
  useEffect(() => {
    setSelectedInvoices([...invoices]);
    setSelectAll(true);
  }, [invoices]);

  // Manejar la selección de todas las facturas
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices([...invoices]);
    }
    setSelectAll(!selectAll);
  };

  // Manejar la selección individual de facturas
  const handleSelectInvoice = (invoice: InvoiceData, isSelected: boolean) => {
    if (isSelected) {
      setSelectedInvoices(prev => [...prev, invoice]);
    } else {
      setSelectedInvoices(prev => prev.filter(inv => 
        inv.identificacion?.codigoGeneracion !== invoice.identificacion?.codigoGeneracion
      ));
    }
  };

  // Verificar si una factura está seleccionada
  const isInvoiceSelected = (invoice: InvoiceData) => {
    return selectedInvoices.some(inv => 
      inv.identificacion?.codigoGeneracion === invoice.identificacion?.codigoGeneracion
    );
  };

  // Actualizar el estado selectAll cuando cambia la selección de facturas
  useEffect(() => {
    setSelectAll(selectedInvoices.length === invoices.length);
  }, [selectedInvoices, invoices]);

  // Obtener el valor de un campo específico de la factura
  const getFieldValue = (invoice: any, fieldId: string): string => {
    // Extraer la categoría y el nombre del campo del ID
    const parts = fieldId.split('.');
    
    try {
      // Navegar por la estructura del objeto según la ruta del campo
      let value = invoice;
      for (const part of parts) {
        if (value === undefined || value === null) return '-';
        value = value[part];
      }
      
      // Formatear valores monetarios
      if (typeof value === 'number' && ['totalPagar', 'totalGravada', 'totalNoSuj', 'totalExenta', 'montoTotalOperacion', 'valor'].includes(parts[parts.length - 1])) {
        return `$${value.toFixed(2)}`;
      }
      
      return value !== undefined && value !== null ? String(value) : '-';
    } catch (error) {
      console.error(`Error al acceder al campo ${fieldId}:`, error);
      return '-';
    }
  };

  // Cargar campos desde Firestore
  useEffect(() => {
    const loadFieldsFromFirestore = async () => {
      try {
        console.log('DataTableStep: Cargando campos desde Firestore');
        
        // Usar el servicio de campos para obtener la configuración
        const fieldsService = FieldsService.getInstance();
        const fields = await fieldsService.getFieldsConfig();
        
        if (fields && fields.length > 0) {
          // Filtrar solo los campos seleccionados
          const selectedFields = fields.filter((field: FieldConfig) => field.selected);
          console.log('DataTableStep: Campos seleccionados desde Firestore:', selectedFields.length);
          
          if (selectedFields.length > 0) {
            // Generar columnas basadas en estos campos
            generateColumnsFromFields(selectedFields);
            return;
          }
        }
        
        // Si no hay campos seleccionados, usar columnas predeterminadas
        console.log('DataTableStep: No hay campos seleccionados en Firestore, usando columnas predeterminadas');
        generateDefaultColumns();
      } catch (error) {
        console.error('DataTableStep: Error al cargar campos desde Firestore:', error);
        generateDefaultColumns();
      }
    };
    
    loadFieldsFromFirestore();
  }, []);

  // Escuchar cambios en el localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('DataTableStep: Detectado cambio en localStorage, recargando campos');
      
      try {
        const fieldsService = FieldsService.getInstance();
        fieldsService.getFieldsConfig()
          .then((fields) => {
            if (fields && fields.length > 0) {
              const selectedFields = fields.filter((field: FieldConfig) => field.selected);
              
              if (selectedFields.length > 0) {
                console.log('DataTableStep: Actualizando columnas con campos seleccionados:', selectedFields.length);
                generateColumnsFromFields(selectedFields);
              }
            }
          })
          .catch((error) => {
            console.error('DataTableStep: Error al cargar campos desde Firestore:', error);
          });
      } catch (error) {
        console.error('DataTableStep: Error al procesar cambio en localStorage:', error);
      }
    };
    
    // Agregar evento para escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar el evento personalizado que disparamos al guardar la configuración
    window.addEventListener('fieldsConfigUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('fieldsConfigUpdated', handleStorageChange);
    };
  }, []);

  // Función para generar columnas predeterminadas
  const generateDefaultColumns = () => {
    const defaultColumns: ColumnDef[] = [
      {
        id: 'selection',
        header: '',
        width: 50,
        accessor: () => ''
      },
      { 
        id: 'identificacion.fecEmi', 
        header: 'Fecha de Emisión', 
        accessor: (invoice: any) => invoice.identificacion?.fecEmi || '-' 
      },
      { 
        id: 'identificacion.tipoDte', 
        header: 'Tipo de Documento', 
        accessor: (invoice: any) => invoice.identificacion?.tipoDte || '-' 
      },
      { 
        id: 'identificacion.numeroControl', 
        header: 'Número de Control', 
        accessor: (invoice: any) => invoice.identificacion?.numeroControl || '-' 
      },
      { 
        id: 'identificacion.selloRecibido', 
        header: 'Sello Recibido', 
        accessor: (invoice: any) => invoice.identificacion?.selloRecibido || '-' 
      },
      { 
        id: 'identificacion.codigoGeneracion', 
        header: 'Código de Generación', 
        accessor: (invoice: any) => invoice.identificacion?.codigoGeneracion || '-' 
      },
      { 
        id: 'emisor.nrc', 
        header: 'NRC Emisor', 
        accessor: (invoice: any) => invoice.emisor?.nrc || '-' 
      }
    ];
    
    setColumns(defaultColumns);
  };

  // Función para generar columnas a partir de campos
  const generateColumnsFromFields = (fieldsToUse: FieldConfig[]) => {
    console.log('DataTableStep: Generando columnas a partir de campos:', fieldsToUse.length);
    
    const newColumns: ColumnDef[] = [];
    
    // Siempre mostrar la columna de selección
    newColumns.push({
      id: 'selection',
      header: '',
      width: 50,
      accessor: () => ''
    });
    
    // Ordenar los campos por la propiedad order
    const sortedFields = [...fieldsToUse].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Usar todos los campos seleccionados, pero limitar a 10 para no sobrecargar la tabla
    const fieldsToShow = sortedFields.slice(0, 10);
    
    fieldsToShow.forEach(field => {
      console.log(`DataTableStep: Añadiendo columna desde Firestore: ${field.id} - ${field.label}`);
      newColumns.push({
        id: field.id,
        header: field.label,
        accessor: (invoice: any) => getFieldValue(invoice, field.id)
      });
    });
    
    setColumns(newColumns);
  };

  // Generar columnas basadas en los campos seleccionados del contexto
  useEffect(() => {
    console.log('DataTableStep: Actualizando columnas con campos seleccionados del contexto:', selectedFields);
    
    if (selectedFields && selectedFields.length > 0) {
      console.log('DataTableStep: Usando campos seleccionados del contexto para generar columnas:', selectedFields.length);
      generateColumnsFromFields(selectedFields);
    } else {
      console.log('DataTableStep: No hay campos seleccionados en el contexto, verificando Firestore...');
      
      // Si no hay campos en el contexto, intentar cargar desde Firestore
      try {
        const fieldsService = FieldsService.getInstance();
        fieldsService.getFieldsConfig()
          .then((fields) => {
            if (fields && fields.length > 0) {
              const selectedFromFirestore = fields.filter((field: FieldConfig) => field.selected);
              
              if (selectedFromFirestore.length > 0) {
                console.log('DataTableStep: Usando campos seleccionados desde Firestore:', selectedFromFirestore.length);
                generateColumnsFromFields(selectedFromFirestore);
              } else {
                generateDefaultColumns();
              }
            } else {
              generateDefaultColumns();
            }
          })
          .catch((error) => {
            console.error('DataTableStep: Error al cargar campos desde Firestore:', error);
            generateDefaultColumns();
          });
      } catch (error) {
        console.error('DataTableStep: Error al verificar Firestore:', error);
        generateDefaultColumns();
      }
      return; // Evitar que se generen columnas predeterminadas aquí
    }
  }, [selectedFields]);

  return (
    <div className="data-table-step">
      <div className="step-header">
        <h2>Facturas encontradas: {invoices.length}</h2>
        <p className="step-description">Seleccione las facturas que desea importar</p>
      </div>
      
      <div className="select-all-container">
        <button 
          className="select-all-button"
          onClick={handleSelectAll}
        >
          {selectAll ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
        </button>
        <span className="selected-count">
          {selectedInvoices.length} de {invoices.length} seleccionadas
        </span>
      </div>
      
      <div className="invoices-table-container">
        {columns.length > 1 ? (
          <table className="invoices-table">
            <thead>
              <tr>
                <th className="selection-column">
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                {columns.slice(1).map((column) => (
                  <th key={column.id}>{column.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr 
                  key={invoice.identificacion?.codigoGeneracion || index}
                  className={isInvoiceSelected(invoice) ? 'selected-row' : ''}
                  onClick={() => handleSelectInvoice(invoice, !isInvoiceSelected(invoice))}
                >
                  <td className="selection-column" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={isInvoiceSelected(invoice)}
                      onChange={(e) => handleSelectInvoice(invoice, e.target.checked)}
                    />
                  </td>
                  {columns.slice(1).map((column) => (
                    <td key={column.id}>{column.accessor(invoice)}</td>
                  ))}
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="empty-table-message">
                    No se encontraron facturas para importar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="loading-container">
            <p>Cargando configuración de campos...</p>
          </div>
        )}
      </div>
      
      <div className="step-actions">
        <button 
          className="back-button"
          onClick={onBack}
          disabled={isProcessing}
        >
          Volver
        </button>
        <button 
          className="save-button"
          onClick={() => onSave && onSave(selectedInvoices)}
          disabled={selectedInvoices.length === 0 || isProcessing}
        >
          {isProcessing ? 'Guardando...' : `Guardar Seleccionados (${selectedInvoices.length})`}
        </button>
      </div>
    </div>
  );
};

export default DataTableStep;
