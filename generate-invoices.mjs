// generate-invoices.mjs
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { writeFileSync } from 'fs';

// Configuración fija del receptor (tus datos)
const receptorFijo = {
  "tipoDocumento": "13",
  "numDocumento": "12345678-9",
  "nombre": "JOHN DOE",
  "direccion": {
    "departamento": "06",
    "municipio": "23",
    "complemento": "SAN SALVADOR"
  },
  "telefono": "77000871",
  "correo": "john.doe@example.com"
};

// Función para generar una factura
function generateInvoice(index) {
  const timestamp = new Date().getTime() - (index * 86400000);
  const numeroFactura = `FAC-${String(index + 1001).padStart(6, '0')}`;
  const tipoDte = index % 2 === 0 ? "01" : "03";
  
  // Datos del cliente
  const cliente = {
    nombre: faker.person.fullName(),
    nit: faker.string.numeric(14),
    direccion: faker.location.streetAddress(),
    telefono: faker.string.numeric(8),
    email: faker.internet.email()
  };
  
  // Datos del emisor
  const emisor = {
    nit: faker.string.numeric(14),
    nrc: faker.string.numeric(7),
    nombre: faker.company.name(),
    codActividad: faker.number.int({ min: 10000, max: 99999 }).toString(),
    direccion: {
      departamento: faker.number.int({ min: 1, max: 14 }).toString().padStart(2, '0'),
      municipio: faker.number.int({ min: 1, max: 50 }).toString().padStart(2, '0'),
      complemento: faker.location.streetAddress()
    }
  };

  // Datos de la factura
  const fecha = new Date(timestamp);
  const fechaEmision = fecha.toISOString().split('T')[0];
  
  // Ítems de la factura (asegurando que todos los valores numéricos son números)
  const items = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, (_, idx) => {
    const cantidad = parseFloat(faker.number.float({ min: 1, max: 10, precision: 0.5 }).toFixed(2));
    const precioUnitario = parseFloat(faker.number.float({ min: 1, max: 100, precision: 0.01 }).toFixed(2));
    const subtotal = parseFloat((cantidad * precioUnitario).toFixed(2));
    
    return {
      id: idx + 1,
      descripcion: faker.commerce.productName(),
      cantidad: cantidad,
      precioUnitario: precioUnitario,
      subtotal: subtotal
    };
  });
  
  // Calcular subtotales y totales (asegurando que son números)
  const subtotal = parseFloat(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
  const iva = parseFloat((subtotal * 0.13).toFixed(2));
  const total = parseFloat((subtotal + iva).toFixed(2));
  
  // Generar ítems del documento (formato original con valores numéricos garantizados)
  const cuerpoDocumento = items.map((item, idx) => {
    const precioUni = parseFloat(item.precioUnitario.toFixed(2));
    const cantidad = parseFloat(item.cantidad.toFixed(2));
    const montoDescu = 0;
    const ventaNoSuj = 0;
    const ventaExenta = 0;
    const ventaGravada = parseFloat((precioUni * cantidad).toFixed(2));
    const ivaItem = parseFloat((ventaGravada * 0.13).toFixed(2));
    
    return {
      numItem: idx + 1,
      tipoItem: 1,
      numeroDocumento: "",
      codigo: faker.string.alphanumeric(8).toUpperCase(),
      descripcion: item.descripcion,
      cantidad: cantidad,
      uniMedida: 59,
      precioUni: precioUni,
      montoDescu: montoDescu,
      ventaNoSuj: ventaNoSuj,
      ventaExenta: ventaExenta,
      ventaGravada: ventaGravada,
      tributos: ["20"],
      ivaItem: ivaItem,
      codigoRetencionMH: ""
    };
  });
  
  // Asegurar que todos los campos numéricos en resumen son números
  const resumen = {
    totalNoSuj: 0,
    totalExenta: 0,
    totalGravada: subtotal,
    subTotalVentas: subtotal,
    descuNoSuj: 0,
    descuExenta: 0,
    descuGravada: 0,
    porcentajeDescuento: 0,
    totalDescu: 0,
    tributos: [
      {
        codigo: "20",
        descripcion: "Impuesto al Valor Agregado 13%",
        valor: iva
      }
    ],
    subTotal: subtotal,
    ivaRete1: 0,
    reteRenta: 0,
    montoTotalOperacion: total,
    totalNoGravado: 0,
    totalPagar: total,
    totalLetras: "CIEN DOLARES",
    saldoFavor: 0,
    condicionOperacion: 1,
    pagos: [
      {
        codigo: "01",
        montoPago: total,
        referencia: "EFECTIVO",
        plazo: "0",
        periodo: 0
      }
    ],
    numPagoElectronico: ""
  };
  
  return {
    // Nuevos campos
    id: uuidv4(),
    timestamp: timestamp,
    numeroFactura: numeroFactura,
    fechaEmision: fechaEmision,
    cliente: cliente,
    items: items,
    subtotal: subtotal,
    iva: iva,
    total: total,
    estado: faker.helpers.arrayElement(['Pagada', 'Pendiente', 'Anulada']),
    
    // Campos originales completos
    identificacion: {
      version: 1,
      ambiente: "00",
      tipoDte: tipoDte,
      numeroControl: numeroFactura,
      codigoGeneracion: uuidv4().toUpperCase(),
      puntoVentaId: faker.number.int({ min: 1, max: 999 }),
      puntoVenta: faker.location.streetAddress(),
      fecEmi: fechaEmision,
      horEmi: fecha.toTimeString().substring(0, 8),
      tipoMoneda: "USD",
      firmaElectronica: null
    },
    documentoRelacionado: null,
    emisor: emisor,
    receptor: {
      ...receptorFijo,
      nombre: cliente.nombre
    },
    otrosDocumentos: null,
    ventaTercero: null,
    cuerpoDocumento: cuerpoDocumento,
    resumen: resumen,
    extension: null,
    apendice: null
  };
}

// Generar 50 facturas y guardar en JSON
const invoices = Array.from({ length: 50 }, (_, i) => generateInvoice(i));
writeFileSync('./synthetic-invoices.json', JSON.stringify(invoices, null, 2));
console.log('✅ 50 facturas sintéticas generadas en synthetic-invoices.json');