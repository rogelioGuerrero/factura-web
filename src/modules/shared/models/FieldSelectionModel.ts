export interface FieldDefinition {
  path: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  required?: boolean;
  defaultValue?: any;
}

export interface FieldGroup {
  name: string;
  fields: FieldDefinition[];
}

export const defaultFields: FieldGroup[] = [
  {
    name: 'Identificación',
    fields: [
      { path: 'identificacion.codigoGeneracion', label: 'Código', type: 'string', required: true },
      { path: 'identificacion.fecEmi', label: 'Fecha Emisión', type: 'date', required: true }
    ]
  },
  {
    name: 'Emisor',
    fields: [
      { path: 'emisor.nombre', label: 'Nombre', type: 'string', required: true },
      { path: 'emisor.nit', label: 'NIT', type: 'string', required: true },
      { path: 'emisor.nrc', label: 'NRC', type: 'string', required: true }
    ]
  },
  {
    name: 'Receptor',
    fields: [
      { path: 'receptor.nombre', label: 'Nombre', type: 'string', required: true },
      { path: 'receptor.nit', label: 'NIT', type: 'string', required: true }
    ]
  },
  {
    name: 'Resumen',
    fields: [
      { path: 'resumen.montoTotalOperacion', label: 'Monto Total', type: 'number', required: true },
      { path: 'resumen.totalIVA', label: 'Total IVA', type: 'number', required: true }
    ]
  }
];
