import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { FieldsService } from '@/modules/fields/models/FieldsService';
import { FieldConfig } from '@/modules/fields/types';
import { Link } from 'react-router-dom';

interface Invoice {
  id: string;
  data: any;
}

const ViewInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldConfig[]>([]);

  // Cargar facturas y campos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar configuración de campos
        const fieldsService = FieldsService.getInstance();
        const fieldsConfig = await fieldsService.getFieldsConfig();
        const selectedFields = fieldsConfig.filter(field => field.selected);
        setFields(selectedFields);
        
        // Cargar facturas
        const invoicesRef = collection(db, 'invoices');
        const q = query(invoicesRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const loadedInvoices: Invoice[] = [];
        querySnapshot.forEach((doc) => {
          loadedInvoices.push({
            id: doc.id,
            data: doc.data()
          });
        });
        
        setInvoices(loadedInvoices);
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar las facturas. Por favor, intente de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Obtener valor de un campo anidado
  const getNestedValue = (obj: any, path: string) => {
    try {
      const parts = path.split('.');
      let current = obj;
      
      for (const part of parts) {
        if (current === null || current === undefined) return '';
        current = current[part];
      }
      
      return current !== null && current !== undefined ? current : '';
    } catch (error) {
      console.error(`Error al obtener valor para ${path}:`, error);
      return '';
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Formatear valor según el tipo
  const formatValue = (value: any, fieldId: string) => {
    if (value === null || value === undefined) return '';
    
    // Formatear fechas
    if (fieldId.includes('fecEmi') || fieldId.includes('fecha')) {
      return formatDate(value);
    }
    
    // Formatear valores monetarios
    if (fieldId.includes('total') || fieldId.includes('monto') || fieldId.includes('valor')) {
      return typeof value === 'number' 
        ? `$${value.toFixed(2)}` 
        : value;
    }
    
    return value;
  };

  return (
    <div className="view-invoices-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Facturas Importadas</h1>
        <Link 
          to="/" 
          style={{
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          Volver al Inicio
        </Link>
      </div>
      
      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Cargando facturas...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px' 
        }}>
          <h2>No hay facturas importadas</h2>
          <p>Importe facturas utilizando el asistente de importación.</p>
          <Link 
            to="/upload" 
            style={{
              backgroundColor: '#3f51b5',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '4px',
              textDecoration: 'none',
              display: 'inline-block',
              marginTop: '15px',
              fontWeight: 'bold'
            }}
          >
            Ir al Asistente de Importación
          </Link>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '15px' }}>
            <p>Total de facturas: <strong>{invoices.length}</strong></p>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              backgroundColor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  {fields.map(field => (
                    <th 
                      key={field.id} 
                      style={{ 
                        padding: '12px 15px', 
                        textAlign: 'left', 
                        borderBottom: '1px solid #ddd',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {field.label}
                    </th>
                  ))}
                  <th style={{ 
                    padding: '12px 15px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #ddd' 
                  }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => (
                  <tr 
                    key={invoice.id} 
                    style={{ 
                      backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9',
                      borderBottom: '1px solid #ddd'
                    }}
                  >
                    {fields.map(field => (
                      <td 
                        key={`${invoice.id}-${field.id}`} 
                        style={{ 
                          padding: '10px 15px',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={String(getNestedValue(invoice.data, field.id))}
                      >
                        {formatValue(getNestedValue(invoice.data, field.id), field.id)}
                      </td>
                    ))}
                    <td style={{ 
                      padding: '10px 15px', 
                      textAlign: 'center' 
                    }}>
                      <button 
                        style={{
                          backgroundColor: '#2196f3',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                        onClick={() => {
                          // Aquí iría la lógica para ver detalles de la factura
                          alert(`Ver detalles de la factura ${invoice.id}`);
                        }}
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewInvoices;
