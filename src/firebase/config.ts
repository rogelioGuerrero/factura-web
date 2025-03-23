import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Tu configuración de Firebase
// NOTA: Deberás reemplazar estos valores con tu propia configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDIlQ0X4po5VN-XLJmUJxKKyRbEQiLnSpc",
  authDomain: "facturas-electronicas-app.firebaseapp.com",
  databaseURL: "https://facturas-electronicas-app-default-rtdb.firebaseio.com",
  projectId: "facturas-electronicas-app",
  storageBucket: "facturas-electronicas-app.firebasestorage.app",
  messagingSenderId: "425503865175",
  appId: "1:425503865175:web:59c1fefe4895305ffda612",
  measurementId: "G-FFQ77DPW0S"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
