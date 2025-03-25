import { InvoiceFirebaseService } from '../firebase/InvoiceFirebaseService';
import { InvoiceData } from '../types/invoice';
import * as fs from 'fs';
import * as path from 'path';

// Función para cargar un archivo JSON
const loadJsonFile = (filePath: string): InvoiceData => {
  try {
    const absolutePath = path.resolve(filePath);
    console.log(`Cargando archivo: ${absolutePath}`);
    const fileContent = fs.readFileSync(absolutePath, 'utf8');
    return JSON.parse(fileContent) as InvoiceData;
  } catch (error) {
    console.error(`Error al cargar el archivo ${filePath}:`, error);
    throw error;
  }
};

// Función principal para ejecutar las pruebas
const runTests = async () => {
  console.log('=== INICIANDO PRUEBAS DE CRUD EN FIREBASE ===');
  
  try {
    // Inicializar el servicio de Firebase
    const firebaseService = InvoiceFirebaseService.getInstance();
    
    // Cargar los archivos JSON de prueba
    const invoice1Path = path.join(process.cwd(), '004207D5-F1E8-4E90-B997-459D17FADE01.json');
    const invoice2Path = path.join(process.cwd(), 'FA58FED6-8345-4312-A93A-76035C8B08F8.json');
    
    console.log(`Ruta de factura 1: ${invoice1Path}`);
    console.log(`Ruta de factura 2: ${invoice2Path}`);
    
    const invoice1 = loadJsonFile(invoice1Path);
    const invoice2 = loadJsonFile(invoice2Path);
    
    console.log('=== PRUEBA 1: CREAR FACTURA ===');
    // Guardar la primera factura
    console.log(`Intentando guardar factura con código: ${invoice1.identificacion.codigoGeneracion}`);
    const id1 = await firebaseService.saveInvoice(invoice1);
    console.log(`Factura guardada con ID: ${id1}`);
    
    console.log('=== PRUEBA 2: VERIFICAR EXISTENCIA ===');
    // Verificar si la factura existe
    const exists = await firebaseService.getInvoiceByCodigoGeneracion(invoice1.identificacion.codigoGeneracion);
    console.log(`¿Existe la factura? ${exists ? 'SÍ' : 'NO'}`);
    if (exists) {
      console.log('Detalles de la factura:', exists);
    }
    
    console.log('=== PRUEBA 3: INTENTAR GUARDAR DUPLICADO ===');
    // Intentar guardar la misma factura nuevamente (debería detectar duplicado)
    const duplicateId = await firebaseService.saveInvoice(invoice1);
    console.log(`Resultado de guardar duplicado: ${duplicateId}`);
    
    console.log('=== PRUEBA 4: GUARDAR SEGUNDA FACTURA ===');
    // Guardar la segunda factura
    console.log(`Intentando guardar factura con código: ${invoice2.identificacion.codigoGeneracion}`);
    const id2 = await firebaseService.saveInvoice(invoice2);
    console.log(`Segunda factura guardada con ID: ${id2}`);
    
    console.log('=== PRUEBA 5: ELIMINAR FACTURA ===');
    // Eliminar la primera factura
    await firebaseService.deleteInvoiceByCodigoGeneracion(invoice1.identificacion.codigoGeneracion);
    console.log(`Factura con código ${invoice1.identificacion.codigoGeneracion} eliminada`);
    
    console.log('=== PRUEBA 6: VERIFICAR ELIMINACIÓN ===');
    // Verificar que la factura ya no existe
    const existsAfterDelete = await firebaseService.getInvoiceByCodigoGeneracion(invoice1.identificacion.codigoGeneracion);
    console.log(`¿Existe la factura después de eliminar? ${existsAfterDelete ? 'SÍ (ERROR)' : 'NO (CORRECTO)'}`);
    
    console.log('=== PRUEBA 7: ELIMINAR SEGUNDA FACTURA ===');
    // Eliminar la segunda factura
    await firebaseService.deleteInvoiceByCodigoGeneracion(invoice2.identificacion.codigoGeneracion);
    console.log(`Factura con código ${invoice2.identificacion.codigoGeneracion} eliminada`);
    
    console.log('=== PRUEBAS COMPLETADAS EXITOSAMENTE ===');
  } catch (error) {
    console.error('Error durante las pruebas:', error);
  }
};

// Ejecutar las pruebas
runTests().then(() => {
  console.log('Proceso de pruebas finalizado');
}).catch(error => {
  console.error('Error en el proceso de pruebas:', error);
});
