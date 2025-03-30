import { FieldDefinition, FieldGroup, defaultFields } from '@/modules/shared/models/FieldSelectionModel';

export class FieldSelectionController {
  private fields: FieldGroup[];

  constructor(customFields?: FieldGroup[]) {
    this.fields = customFields || defaultFields;
  }

  getFields(): FieldGroup[] {
    return this.fields;
  }

  getFieldByPath(path: string): FieldDefinition | null {
    for (const group of this.fields) {
      const field = group.fields.find(f => f.path === path);
      if (field) return field;
    }
    return null;
  }

  validateField(path: string, value: any): boolean {
    const field = this.getFieldByPath(path);
    if (!field) return true; // If the field is not defined in our schema, we don't validate it

    // Special case for Total IVA field - check both possible paths
    if (path === 'resumen.totalIVA' || path === 'resumen.totalIva') {
      // If either path exists in the data, it's valid
      return value !== undefined && (typeof value === 'number' || !isNaN(parseFloat(value)));
    }

    if (field.required && (value === null || value === undefined)) {
      return false;
    }

    // If the field is not required and the value is null or undefined, it's valid
    if (!field.required && (value === null || value === undefined)) {
      return true;
    }

    switch (field.type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' || !isNaN(parseFloat(value));
      case 'date':
        return !isNaN(Date.parse(value));
      case 'boolean':
        return typeof value === 'boolean';
      default:
        return false;
    }
  }

  validateData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // First, check if this is a valid invoice structure
    if (!this.isValidInvoiceStructure(data)) {
      errors.push('Estructura de factura inválida');
      return { isValid: false, errors };
    }

    for (const group of this.fields) {
      for (const field of group.fields) {
        // Special case for Total IVA - check both possible paths
        if (field.path === 'resumen.totalIVA') {
          const valueIVA = this.getValueFromPath(data, 'resumen.totalIVA');
          const valueIva = this.getValueFromPath(data, 'resumen.totalIva');
          
          // If either value exists and is valid, it's fine
          if (valueIVA === null && valueIva === null && field.required) {
            errors.push(`Campo inválido: ${field.label} (${field.path})`);
          } else if (valueIVA !== null && !this.isValidNumber(valueIVA)) {
            errors.push(`Campo inválido: ${field.label} (${field.path})`);
          } else if (valueIva !== null && !this.isValidNumber(valueIva)) {
            errors.push(`Campo inválido: ${field.label} (resumen.totalIva)`);
          }
          continue;
        }
        
        // For other required fields
        if (field.required) {
          const value = this.getValueFromPath(data, field.path);
          if (!this.validateField(field.path, value)) {
            errors.push(`Campo inválido: ${field.label} (${field.path})`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidNumber(value: any): boolean {
    return typeof value === 'number' || !isNaN(parseFloat(value));
  }

  private isValidInvoiceStructure(obj: any): boolean {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      'identificacion' in obj &&
      'emisor' in obj &&
      'receptor' in obj &&
      'cuerpoDocumento' in obj &&
      'resumen' in obj
    );
  }

  private getValueFromPath(obj: any, path: string): any {
    if (!obj) return null;
    
    return path.split('.').reduce((acc, part) => {
      if (acc === null || acc === undefined) return null;
      return acc[part];
    }, obj);
  }
}
