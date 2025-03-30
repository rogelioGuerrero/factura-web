// Definición del tipo FieldConfig directamente en este archivo para evitar problemas de importación
export interface FieldConfig {
  id: string;
  label: string;
  path: string;
  category: string;
  calculated?: boolean;
}

export class FieldSelectionModel {
  private static instance: FieldSelectionModel;
  private selectedFields: FieldConfig[] = [];
  private availableFields: FieldConfig[] = [];

  private constructor() {
    // Inicializar con campos predeterminados
    this.initializeAvailableFields();
    this.initializeDefaultSelectedFields();
  }

  static getInstance(): FieldSelectionModel {
    if (!FieldSelectionModel.instance) {
      FieldSelectionModel.instance = new FieldSelectionModel();
    }
    return FieldSelectionModel.instance;
  }

  private initializeAvailableFields(): void {
    this.availableFields = [
      { id: 'invoiceId', label: 'Factura', path: 'identificacion.codigoGeneracion', category: 'identificacion' },
      { id: 'numeroControl', label: 'Número de Control', path: 'identificacion.numeroControl', category: 'identificacion' },
      { id: 'fechaEmision', label: 'Fecha de Emisión', path: 'identificacion.fecEmi', category: 'identificacion' },
      { id: 'horaEmision', label: 'Hora de Emisión', path: 'identificacion.horEmi', category: 'identificacion' },
      { id: 'tipoDocumento', label: 'Tipo de Documento', path: 'identificacion.tipoDte', category: 'identificacion' },
      
      { id: 'emisorNombre', label: 'Emisor', path: 'emisor.nombre', category: 'emisor' },
      { id: 'emisorNit', label: 'NIT Emisor', path: 'emisor.nit', category: 'emisor' },
      { id: 'emisorNrc', label: 'NRC Emisor', path: 'emisor.nrc', category: 'emisor' },
      { id: 'emisorActividad', label: 'Actividad Emisor', path: 'emisor.descActividad', category: 'emisor' },
      
      { id: 'receptorNombre', label: 'Receptor', path: 'receptor.nombre', category: 'receptor' },
      { id: 'receptorNit', label: 'NIT Receptor', path: 'receptor.nit', category: 'receptor' },
      { id: 'receptorNrc', label: 'NRC Receptor', path: 'receptor.nrc', category: 'receptor' },
      { id: 'receptorActividad', label: 'Actividad Receptor', path: 'receptor.descActividad', category: 'receptor' },
      
      { id: 'codigo', label: 'Código', path: 'cuerpoDocumento[].codigo', category: 'item' },
      { id: 'descripcion', label: 'Descripción', path: 'cuerpoDocumento[].descripcion', category: 'item' },
      { id: 'cantidad', label: 'Cantidad', path: 'cuerpoDocumento[].cantidad', category: 'item' },
      { id: 'precioUnitario', label: 'Precio Unitario', path: 'cuerpoDocumento[].precioUni', category: 'item' },
      { id: 'subtotal', label: 'Subtotal', path: 'calculated', category: 'item', calculated: true },
      
      { id: 'totalPagar', label: 'Total a Pagar', path: 'resumen.totalPagar', category: 'resumen' },
      { id: 'totalIva', label: 'Total IVA', path: 'resumen.totalIva', category: 'resumen' },
      { id: 'condicionOperacion', label: 'Condición de Operación', path: 'resumen.condicionOperacion', category: 'resumen' },
    ];
  }

  private initializeDefaultSelectedFields(): void {
    // Campos que se mostrarán por defecto
    const defaultFields = [
      'invoiceId', 
      'emisorNombre', 
      'receptorNombre', 
      'codigo', 
      'descripcion', 
      'cantidad', 
      'precioUnitario', 
      'subtotal'
    ];
    
    this.selectedFields = this.availableFields.filter(field => 
      defaultFields.includes(field.id)
    );
  }

  getAvailableFields(): FieldConfig[] {
    return [...this.availableFields];
  }

  getSelectedFields(): FieldConfig[] {
    return [...this.selectedFields];
  }

  setSelectedFields(fieldIds: string[]): void {
    this.selectedFields = this.availableFields.filter(field => 
      fieldIds.includes(field.id)
    );
  }

  addSelectedField(fieldId: string): void {
    const field = this.availableFields.find(f => f.id === fieldId);
    if (field && !this.selectedFields.some(f => f.id === fieldId)) {
      this.selectedFields.push(field);
    }
  }

  removeSelectedField(fieldId: string): void {
    this.selectedFields = this.selectedFields.filter(field => field.id !== fieldId);
  }

  getFieldsByCategory(): Record<string, FieldConfig[]> {
    const categories: Record<string, FieldConfig[]> = {};
    
    this.availableFields.forEach(field => {
      if (!categories[field.category]) {
        categories[field.category] = [];
      }
      categories[field.category].push(field);
    });
    
    return categories;
  }

  isFieldSelected(fieldId: string): boolean {
    return this.selectedFields.some(field => field.id === fieldId);
  }

  resetToDefaults(): void {
    this.initializeDefaultSelectedFields();
  }
}
