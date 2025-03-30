// Script para borrar todos los documentos de la colección 'invoices' en Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteAllInvoices() {
  console.log('Iniciando proceso de eliminación de facturas...');
  
  try {
    // Obtener referencia a la colección
    const invoicesRef = collection(db, 'invoices');
    
    // Obtener todos los documentos
    const snapshot = await getDocs(invoicesRef);
    
    if (snapshot.empty) {
      console.log('No hay documentos en la colección invoices.');
      return;
    }
    
    console.log(`Se encontraron ${snapshot.size} documentos para eliminar.`);
    
    // Contador para seguimiento
    let deletedCount = 0;
    
    // Eliminar cada documento
    for (const document of snapshot.docs) {
      await deleteDoc(doc(db, 'invoices', document.id));
      deletedCount++;
      
      // Mostrar progreso cada 10 documentos
      if (deletedCount % 10 === 0) {
        console.log(`Progreso: ${deletedCount}/${snapshot.size} documentos eliminados.`);
      }
    }
    
    console.log(`¡Completado! Se eliminaron ${deletedCount} documentos de la colección invoices.`);
  } catch (error) {
    console.error('Error al eliminar documentos:', error);
  }
}

// Ejecutar la función principal
deleteAllInvoices()
  .then(() => console.log('Proceso finalizado.'))
  .catch(error => console.error('Error en el proceso:', error));
