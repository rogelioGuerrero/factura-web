/**
 * Modelo para la configuración de campos
 */
export interface FieldConfig {
  id: string;
  label: string;
  category: string;
  selected: boolean;
  path: string;
  isCustom?: boolean;
  order?: number;
}

/**
 * Modelo para la configuración de campos agrupados por categoría
 */
export interface FieldsByCategory {
  [category: string]: FieldConfig[];
}

/**
 * Categorías predefinidas para los campos
 */
export enum FieldCategory {
  IDENTIFICACION = 'identificacion',
  EMISOR = 'emisor',
  RECEPTOR = 'receptor',
  DETALLES = 'detalles',
  RESUMEN = 'resumen'
}

/**
 * Configuración predeterminada de campos
 */
export const DEFAULT_FIELDS: FieldConfig[] = [
  // Campos de identificación
  { id: 'identificacion.numeroFactura', label: 'Número de Factura', category: FieldCategory.IDENTIFICACION, selected: true, path: 'identificacion.numeroFactura' },
  { id: 'identificacion.numeroControl', label: 'Número de Control', category: FieldCategory.IDENTIFICACION, selected: true, path: 'identificacion.numeroControl' },
  { id: 'identificacion.fechaEmision', label: 'Fecha de Emisión', category: FieldCategory.IDENTIFICACION, selected: true, path: 'identificacion.fechaEmision' },
  { id: 'identificacion.tipoDocumento', label: 'Tipo de Documento', category: FieldCategory.IDENTIFICACION, selected: false, path: 'identificacion.tipoDocumento' },
  { id: 'identificacion.selloRecibido', label: 'Sello Recibido', category: FieldCategory.IDENTIFICACION, selected: false, path: 'identificacion.selloRecibido' },
  { id: 'identificacion.codigoGeneracion', label: 'Código de Generación', category: FieldCategory.IDENTIFICACION, selected: false, path: 'identificacion.codigoGeneracion' },
  
  // Campos del emisor
  { id: 'emisor.nombre', label: 'Nombre del Emisor', category: FieldCategory.EMISOR, selected: true, path: 'emisor.nombre' },
  { id: 'emisor.nrc', label: 'NRC Emisor', category: FieldCategory.EMISOR, selected: true, path: 'emisor.nrc' },
  { id: 'emisor.nit', label: 'NIT Emisor', category: FieldCategory.EMISOR, selected: false, path: 'emisor.nit' },
  { id: 'emisor.actividad', label: 'Actividad Emisor', category: FieldCategory.EMISOR, selected: false, path: 'emisor.actividad' },
  
  // Campos del receptor
  { id: 'receptor.nombre', label: 'Nombre del Receptor', category: FieldCategory.RECEPTOR, selected: true, path: 'receptor.nombre' },
  { id: 'receptor.nrc', label: 'NRC Receptor', category: FieldCategory.RECEPTOR, selected: false, path: 'receptor.nrc' },
  { id: 'receptor.nit', label: 'NIT Receptor', category: FieldCategory.RECEPTOR, selected: false, path: 'receptor.nit' },
  
  // Campos de detalles
  { id: 'cuerpoDocumento.0.descripcion', label: 'Descripción', category: FieldCategory.DETALLES, selected: true, path: 'cuerpoDocumento.0.descripcion' },
  { id: 'cuerpoDocumento.0.cantidad', label: 'Cantidad', category: FieldCategory.DETALLES, selected: true, path: 'cuerpoDocumento.0.cantidad' },
  { id: 'cuerpoDocumento.0.precioUnitario', label: 'Precio Unitario', category: FieldCategory.DETALLES, selected: true, path: 'cuerpoDocumento.0.precioUnitario' },
  { id: 'cuerpoDocumento.0.subtotal', label: 'Subtotal', category: FieldCategory.DETALLES, selected: true, path: 'cuerpoDocumento.0.subtotal' },
  
  // Campos de resumen
  { id: 'resumen.totalExenta', label: 'Total Exenta', category: FieldCategory.RESUMEN, selected: false, path: 'resumen.totalExenta' },
  { id: 'resumen.totalNoSujeta', label: 'Total No Sujeta', category: FieldCategory.RESUMEN, selected: false, path: 'resumen.totalNoSujeta' },
  { id: 'resumen.totalGravada', label: 'Total Gravada', category: FieldCategory.RESUMEN, selected: true, path: 'resumen.totalGravada' },
  { id: 'resumen.valor', label: 'Valor', category: FieldCategory.RESUMEN, selected: false, path: 'resumen.valor' },
  { id: 'resumen.montoTotalOperacion', label: 'Monto Total Operación', category: FieldCategory.RESUMEN, selected: true, path: 'resumen.montoTotalOperacion' }
];

/**
 * Modelo para la selección de campos
 * Implementa el patrón Singleton para asegurar una única instancia en toda la aplicación
 */
export class FieldSelectionModel {
  private static instance: FieldSelectionModel;
  private availableFields: FieldConfig[];
  private selectedFieldIds: string[];
  
  private constructor() {
    // Inicializar con los campos predeterminados
    this.availableFields = [...DEFAULT_FIELDS];
    
    // Inicializar los campos seleccionados
    this.selectedFieldIds = this.availableFields
      .filter(field => field.selected)
      .map(field => field.id);
  }
  
  /**
   * Obtener la instancia única del modelo
   */
  static getInstance(): FieldSelectionModel {
    if (!FieldSelectionModel.instance) {
      FieldSelectionModel.instance = new FieldSelectionModel();
    }
    return FieldSelectionModel.instance;
  }
  
  /**
   * Obtener todos los campos disponibles
   */
  getAvailableFields(): FieldConfig[] {
    return [...this.availableFields];
  }
  
  /**
   * Obtener los campos seleccionados
   */
  getSelectedFields(): FieldConfig[] {
    return this.availableFields.filter(field => 
      this.selectedFieldIds.includes(field.id)
    );
  }
  
  /**
   * Establecer los campos seleccionados
   */
  setSelectedFields(fieldIds: string[]): void {
    this.selectedFieldIds = [...fieldIds];
  }
  
  /**
   * Añadir un campo a la selección
   */
  addSelectedField(fieldId: string): void {
    if (!this.selectedFieldIds.includes(fieldId)) {
      this.selectedFieldIds.push(fieldId);
    }
  }
  
  /**
   * Eliminar un campo de la selección
   */
  removeSelectedField(fieldId: string): void {
    this.selectedFieldIds = this.selectedFieldIds.filter(id => id !== fieldId);
  }
  
  /**
   * Verificar si un campo está seleccionado
   */
  isFieldSelected(fieldId: string): boolean {
    return this.selectedFieldIds.includes(fieldId);
  }
  
  /**
   * Obtener campos agrupados por categoría
   */
  getFieldsByCategory(): Record<string, FieldConfig[]> {
    const fieldsByCategory: Record<string, FieldConfig[]> = {};
    
    this.availableFields.forEach(field => {
      if (!fieldsByCategory[field.category]) {
        fieldsByCategory[field.category] = [];
      }
      
      fieldsByCategory[field.category].push({
        ...field,
        selected: this.selectedFieldIds.includes(field.id)
      });
    });
    
    return fieldsByCategory;
  }
  
  /**
   * Restablecer a valores predeterminados
   */
  resetToDefaults(): void {
    this.selectedFieldIds = DEFAULT_FIELDS
      .filter(field => field.selected)
      .map(field => field.id);
  }
  
  /**
   * Añadir un nuevo campo disponible
   */
  addAvailableField(field: FieldConfig): void {
    // Verificar si el campo ya existe
    const existingIndex = this.availableFields.findIndex(f => f.id === field.id);
    
    if (existingIndex === -1) {
      // Si no existe, añadirlo
      this.availableFields.push(field);
      
      // Si está marcado como seleccionado, añadirlo a los seleccionados
      if (field.selected) {
        this.addSelectedField(field.id);
      }
    }
  }
}
