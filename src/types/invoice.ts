export interface Identificacion {
  version: number;
  ambiente: string;
  tipoDte: string;
  numeroControl: string;
  codigoGeneracion: string;
  fecEmi: string;
  horEmi: string;
  tipoMoneda: string;
  fecVencimiento?: string | any;
}

export interface DocumentoRelacionado {
  tipoDocumento: string;
  numeroDocumento: string;
  fechaEmision: string;
}

export interface Direccion {
  departamento: string;
  municipio: string;
  complemento: string;
}

export interface Emisor {
  nit: string;
  nrc: string;
  nombre: string;
  codActividad: string;
  descActividad: string;
  nombreComercial: string;
  tipoEstablecimiento: string;
  direccion: Direccion;
  telefono: string;
  correo: string;
}

export interface Receptor {
  nit: string;
  nrc: string;
  nombre: string;
  codActividad: string;
  descActividad: string;
  direccion: Direccion;
  telefono: string;
  correo: string;
}

export interface InvoiceItem {
  numItem: number;
  tipoItem?: number;
  numeroDocumento?: string | null;
  codigo: string;
  codTributo?: string | null;
  descripcion: string;
  cantidad: number | string;
  uniMedida?: number;
  precioUni: number | string;
  montoDescu: number;
  ventaNoSuj?: number;
  ventaExe?: number;
  ventaGravada?: number;
}

export interface OtrosDocumentos {
  codDocAsociado: number;
  descDocumento: string;
  detalleDocumento: string;
}

export interface Tributo {
  codigo: string;
  descripcion: string;
  valor: number;
}

export interface Pago {
  codigo: string;
  montoPago: number;
  referencia: string;
  plazo: string;
  periodo: number;
}

export interface Resumen {
  totalNoSuj: number;
  totalExenta: number;
  totalGravada: number;
  subTotalVentas: number;
  descuNoSuj: number;
  descuExenta: number;
  descuGravada: number;
  porcentajeDescuento: number;
  totalDescu: number;
  subTotal: number;
  ivaRete1: number;
  reteRenta: number;
  montoTotalOperacion: number;
  totalNoGravado: number;
  totalPagar: number;
  totalLetras: string;
  totalIva: number;
  totalIVA?: number; 
  saldoFavor: number;
  condicionOperacion: number;
  pagos: Pago[];
  numPagoElectronico: string;
  totalImpuestos?: number; 
  montoTotal?: number; 
  montoGravable?: number; 
  [key: string]: any; 
}

export interface Extension {
  docuEntrega: string;
  nombEntrega: string;
  docuRecibe: string;
  nombRecibe: string;
  observaciones: string;
}

export interface VentaTercero {
  nit: string;
  nombre: string;
}

export interface InvoiceData {
  id?: string;
  identificacion: Identificacion;
  documentoRelacionado?: DocumentoRelacionado;
  emisor: Emisor;
  receptor: Receptor;
  cuerpoDocumento: InvoiceItem[];
  otrosDocumentos?: OtrosDocumentos[] | null;
  ventaTercero?: VentaTercero | null;
  resumen: Resumen;
  extension?: Extension;
  firmaElectronica?: string;
  selloRecibido?: string;
  totalExenta?: number;
  ventaNoSuj?: number;
  
}

export interface InvoiceSummary {
  id: string;
  numeroControl: string;
  fechaEmision: string;
  receptorNombre: string;
  montoTotal: number;
  estado?: string;
  totalGravada?: number;
}

export interface ProcessResult {
  data: InvoiceData[];
  warnings: string[];
}
