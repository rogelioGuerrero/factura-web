import { InvoiceData, InvoiceItem } from '../types/invoice';
import { FieldConfig } from '../models/FieldSelectionModel';

/**
 * Extrae un valor de un objeto usando una ruta de acceso en formato string
 * Ejemplo: "emisor.nombre" extraerá data.emisor.nombre
 */
export const extractValueByPath = (data: Record<string, unknown>, path: string): unknown => {
  if (!path) return undefined;
  
  // Caso especial para campos calculados
  if (path === 'calculated') return undefined;
  
  // Manejo de arrays con notación cuerpoDocumento[]
  if (path.includes('[]')) {
    return undefined; // Los arrays se manejan de forma especial en flattenInvoiceData
  }
  
  const keys = path.split('.');
  let result: unknown = data;
  
  for (const key of keys) {
    if (result === undefined || result === null) return undefined;
    result = (result as Record<string, unknown>)[key];
  }
  
  return result;
};

/**
 * Calcula valores derivados basados en los datos del item
 */
export const calculateDerivedValue = (item: InvoiceItem, fieldId: string): unknown => {
  if (fieldId === 'subtotal') {
    const cantidad = typeof item.cantidad === 'string' ? parseFloat(item.cantidad) : item.cantidad;
    const precio = typeof item.precioUni === 'string' ? parseFloat(item.precioUni) : item.precioUni;
    return (cantidad * precio).toFixed(2);
  }
  
  return undefined;
};

/**
 * Convierte las facturas en una lista plana de items con todos los campos seleccionados
 */
export const flattenInvoiceData = (
  invoices: InvoiceData[], 
  selectedFields: FieldConfig[]
): Record<string, unknown>[] => {
  if (!invoices || invoices.length === 0 || !selectedFields || selectedFields.length === 0) {
    return [];
  }

  const result: Record<string, unknown>[] = [];
  
  invoices.forEach(invoice => {
    if (invoice.cuerpoDocumento && Array.isArray(invoice.cuerpoDocumento)) {
      // Para cada item en cuerpoDocumento, crear un objeto plano con todos los campos seleccionados
      invoice.cuerpoDocumento.forEach(item => {
        const flatItem: Record<string, unknown> = {};
        
        selectedFields.forEach(field => {
          if (field.path.includes('cuerpoDocumento[]')) {
            // Extraer la propiedad del item directamente
            const itemProperty = field.path.split('.').pop() || '';
            flatItem[field.id] = item[itemProperty as keyof InvoiceItem];
          } else if (field.calculated) {
            // Calcular valores derivados
            flatItem[field.id] = calculateDerivedValue(item, field.id);
          } else {
            // Extraer valores de la factura
            flatItem[field.id] = extractValueByPath(invoice as unknown as Record<string, unknown>, field.path);
          }
        });
        
        result.push(flatItem);
      });
    }
  });
  
  return result;
};

/**
 * Formatea un valor para su visualización en la tabla
 */
export const formatFieldValue = (value: unknown, fieldId: string): string => {
  if (value === undefined || value === null) return '';
  
  // Formateo específico según el tipo de campo
  switch (fieldId) {
    case 'precioUnitario':
    case 'subtotal':
    case 'totalPagar':
    case 'totalIva': {
      return `$${typeof value === 'string' ? value : (value as number).toFixed(2)}`;
    }
    
    case 'fechaEmision': {
      return new Date(value as string).toLocaleDateString();
    }
      
    case 'condicionOperacion': {
      const condiciones: Record<number, string> = {
        1: 'Contado',
        2: 'Crédito',
        3: 'Otro'
      };
      return condiciones[value as number] || (value as number).toString();
    }
      
    default:
      return value.toString();
  }
};
