// Script para subir la configuración de campos a Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, addDoc, collection } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde .env si existe
try {
  dotenv.config({ path: resolve(__dirname, '.env') });
  console.log('Variables de entorno cargadas desde .env');
} catch (error) {
  console.log('No se pudo cargar .env, usando variables de entorno del sistema');
}

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Then add this before the uploadInvoices function
// Load the invoices from the JSON file
let invoices;
try {
  const invoicesData = readFileSync('./synthetic-invoices.json', 'utf8');
  invoices = JSON.parse(invoicesData);
  console.log(`📋 Cargadas ${invoices.length} facturas del archivo JSON`);
} catch (error) {
  console.error('❌ Error al cargar las facturas:', error.message);
  process.exit(1);
}

async function uploadInvoices() {
  try {
    console.log('🔥 Conectando a Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Subir cada factura
    for (const invoice of invoices) {
      await addDoc(collection(db, 'invoices'), invoice);
      console.log(`📄 Factura ${invoice.identificacion.numeroControl} subida`);
    }

    console.log('✅ Todas las facturas se subieron exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar la función
uploadInvoices()
  .then(success => {
    if (success) {
      console.log('Script completado con éxito');
      process.exit(0);
    } else {
      console.error('Script completado con errores');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Error al ejecutar el script:', error);
    process.exit(1);
  });
