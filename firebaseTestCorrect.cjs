// Script para probar operaciones CRUD en Firebase
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Importar Firebase
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc 
} = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');

// Configuración de Firebase usando las variables de entorno
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log('Usando configuración de Firebase:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  // No mostrar claves sensibles
});

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Función para cargar un archivo JSON
const loadJsonFile = (filePath) => {
  try {
    const absolutePath = path.resolve(filePath);
    console.log(`Cargando archivo: ${absolutePath}`);
    const fileContent = fs.readFileSync(absolutePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error al cargar el archivo ${filePath}:`, error);
    throw error;
  }
};

// Función para guardar una factura en Firestore
const saveInvoice = async (invoice) => {
  try {
    const codigoGeneracion = invoice.identificacion.codigoGeneracion;
    console.log(`Intentando guardar factura con código: ${codigoGeneracion}`);
    
    // Verificar si la factura ya existe
    const existingInvoice = await getInvoiceByCodigoGeneracion(codigoGeneracion);
    if (existingInvoice) {
      console.log(`La factura con código ${codigoGeneracion} ya existe en Firestore con ID: ${existingInvoice.id}`);
      return existingInvoice.id;
    }
    
    // Añadir el código de generación como campo de búsqueda a nivel raíz
    const invoiceData = {
      ...invoice,
      codigoGeneracion: codigoGeneracion
    };
    
    // Guardar en Firestore
    const docRef = await addDoc(collection(db, 'invoices'), invoiceData);
    console.log(`Factura guardada con ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error(`Error al guardar factura:`, error);
    throw error;
  }
};

// Función para buscar una factura por su código de generación
const getInvoiceByCodigoGeneracion = async (codigoGeneracion) => {
  try {
    console.log(`Buscando factura con código de generación: ${codigoGeneracion}`);
    
    const q = query(
      collection(db, 'invoices'), 
      where('codigoGeneracion', '==', codigoGeneracion)
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`Se encontraron ${querySnapshot.docs.length} facturas con código ${codigoGeneracion}`);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      console.log(`Factura encontrada con ID: ${doc.id}`);
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    
    console.log(`No se encontró factura con código ${codigoGeneracion}`);
    return null;
  } catch (error) {
    console.error('Error al buscar factura:', error);
    throw error;
  }
};

// Función para eliminar una factura por su código de generación
const deleteInvoiceByCodigoGeneracion = async (codigoGeneracion) => {
  try {
    console.log(`Buscando factura con código de generación: ${codigoGeneracion}`);
    
    const invoice = await getInvoiceByCodigoGeneracion(codigoGeneracion);
    
    if (invoice) {
      console.log(`Eliminando factura con ID ${invoice.id} (código ${codigoGeneracion})`);
      await deleteDoc(doc(db, 'invoices', invoice.id));
      console.log(`Factura con ID ${invoice.id} eliminada correctamente`);
    } else {
      console.warn(`No se encontró factura con código ${codigoGeneracion} para eliminar`);
    }
  } catch (error) {
    console.error(`Error al eliminar factura:`, error);
    throw error;
  }
};

// Función principal para ejecutar las pruebas
const runTests = async () => {
  console.log('=== INICIANDO PRUEBAS DE CRUD EN FIREBASE ===');
  
  try {
    // Autenticar anónimamente
    console.log('Autenticando con Firebase...');
    await signInAnonymously(auth);
    console.log('Autenticación exitosa');
    
    // Cargar los archivos JSON de prueba
    const invoice1Path = path.join(process.cwd(), '004207D5-F1E8-4E90-B997-459D17FADE01.json');
    const invoice2Path = path.join(process.cwd(), 'FA58FED6-8345-4312-A93A-76035C8B08F8.json');
    
    console.log(`Ruta de factura 1: ${invoice1Path}`);
    console.log(`Ruta de factura 2: ${invoice2Path}`);
    
    const invoice1 = loadJsonFile(invoice1Path);
    const invoice2 = loadJsonFile(invoice2Path);
    
    console.log('=== PRUEBA 1: CREAR FACTURA ===');
    // Guardar la primera factura
    const id1 = await saveInvoice(invoice1);
    
    console.log('=== PRUEBA 2: VERIFICAR EXISTENCIA ===');
    // Verificar si la factura existe
    const exists = await getInvoiceByCodigoGeneracion(invoice1.identificacion.codigoGeneracion);
    console.log(`¿Existe la factura? ${exists ? 'SÍ' : 'NO'}`);
    
    console.log('=== PRUEBA 3: INTENTAR GUARDAR DUPLICADO ===');
    // Intentar guardar la misma factura nuevamente (debería detectar duplicado)
    const duplicateId = await saveInvoice(invoice1);
    console.log(`Resultado de guardar duplicado: ${duplicateId}`);
    
    console.log('=== PRUEBA 4: GUARDAR SEGUNDA FACTURA ===');
    // Guardar la segunda factura
    const id2 = await saveInvoice(invoice2);
    
    console.log('=== PRUEBA 5: ELIMINAR FACTURA ===');
    // Eliminar la primera factura
    await deleteInvoiceByCodigoGeneracion(invoice1.identificacion.codigoGeneracion);
    
    console.log('=== PRUEBA 6: VERIFICAR ELIMINACIÓN ===');
    // Verificar que la factura ya no existe
    const existsAfterDelete = await getInvoiceByCodigoGeneracion(invoice1.identificacion.codigoGeneracion);
    console.log(`¿Existe la factura después de eliminar? ${existsAfterDelete ? 'SÍ (ERROR)' : 'NO (CORRECTO)'}`);
    
    console.log('=== PRUEBA 7: ELIMINAR SEGUNDA FACTURA ===');
    // Eliminar la segunda factura
    await deleteInvoiceByCodigoGeneracion(invoice2.identificacion.codigoGeneracion);
    
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
