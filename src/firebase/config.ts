import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBDefaultApiKey',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'default-project.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://default-project.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'default-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-ABCDEFGHIJ'
};

// Mostrar información de configuración (sin mostrar claves sensibles)
console.log('Configuración de Firebase:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
  // No mostrar apiKey ni otras claves sensibles
});

let app;
let db;
let storage;

// Inicializar Firebase
try {
  console.log('Inicializando Firebase...');
  app = initializeApp(firebaseConfig);
  console.log('Firebase inicializado correctamente');
  
  // Inicializar servicios
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Verificar si estamos en modo de desarrollo
  if (import.meta.env.DEV) {
    console.log('Ejecutando en modo desarrollo');
  }
} catch (error) {
  console.error('Error al inicializar Firebase:', error);
  throw new Error(`No se pudo inicializar Firebase: ${error instanceof Error ? error.message : 'Error desconocido'}`);
}

// Exportar servicios
export { app, db, storage };
