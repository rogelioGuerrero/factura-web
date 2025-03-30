// Script para subir la configuración de campos a Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Configuración de Firebase (reemplaza con tus credenciales)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "tu-api-key",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "tu-proyecto.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "tu-proyecto-id",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "tu-proyecto.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "tu-messaging-sender-id",
  appId: process.env.VITE_FIREBASE_APP_ID || "tu-app-id"
};

// Datos de campos para subir a Firestore
const fieldsData = {
  fields: [
    {
      id: "identificacion.codigoGeneracion",
      label: "Código de Generación",
      selected: true,
      category: "identificacion",
      order: 1
    },
    {
      id: "identificacion.fecEmi",
      label: "Fecha de Emisión",
      selected: true,
      category: "identificacion",
      order: 2
    },
    {
      id: "identificacion.tipoDte",
      label: "Tipo de Documento",
      selected: true,
      category: "identificacion",
      order: 3
    },
    {
      id: "identificacion.numeroControl",
      label: "Número de Control",
      selected: true,
      category: "identificacion",
      order: 4
    },
    {
      id: "identificacion.selloRecibido",
      label: "Sello Recibido",
      selected: false,
      category: "identificacion",
      order: 5
    },
    {
      id: "emisor.nrc",
      label: "NRC Emisor",
      selected: true,
      category: "emisor",
      order: 6
    },
    {
      id: "emisor.nombre",
      label: "Nombre del Emisor",
      selected: true,
      category: "emisor",
      order: 7
    },
    {
      id: "emisor.tipoEstablecimiento",
      label: "Tipo de Establecimiento",
      selected: false,
      category: "emisor",
      order: 8
    },
    {
      id: "receptor.nombre",
      label: "Nombre del Receptor",
      selected: true,
      category: "receptor",
      order: 9
    },
    {
      id: "receptor.nrc",
      label: "NRC Receptor",
      selected: false,
      category: "receptor",
      order: 10
    },
    {
      id: "receptor.codActividad",
      label: "Código de Actividad",
      selected: false,
      category: "receptor",
      order: 11
    },
    {
      id: "resumen.totalGravada",
      label: "Total Gravado",
      selected: true,
      category: "resumen",
      order: 12
    },
    {
      id: "resumen.totalIva",
      label: "Total IVA",
      selected: true,
      category: "resumen",
      order: 13
    },
    {
      id: "resumen.totalPagar",
      label: "Total a Pagar",
      selected: true,
      category: "resumen",
      order: 14
    }
  ]
};

async function uploadFieldsToFirestore() {
  try {
    console.log('Iniciando carga de configuración de campos a Firestore...');
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Referencia al documento en Firestore
    const docRef = doc(db, 'fields_config', 'global_fields_config');
    
    // Subir los datos
    await setDoc(docRef, fieldsData);
    
    console.log('Configuración de campos subida exitosamente a Firestore');
    console.log(`Total de campos subidos: ${fieldsData.fields.length}`);
    console.log(`Campos seleccionados: ${fieldsData.fields.filter(f => f.selected).length}`);
    
    return true;
  } catch (error) {
    console.error('Error al subir la configuración de campos:', error);
    return false;
  }
}

// Ejecutar la función
uploadFieldsToFirestore()
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
