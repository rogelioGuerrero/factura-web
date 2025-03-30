import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import defaultFields from '../data/default-fields.json';

/**
 * Script para subir la configuración de campos predeterminada a Firestore
 */
const uploadFieldsConfig = async () => {
  try {
    console.log('Iniciando carga de configuración de campos a Firestore...');
    
    // Referencia al documento en Firestore
    const docRef = doc(db, 'fields_config', 'global_fields_config');
    
    // Subir los datos
    await setDoc(docRef, defaultFields);
    
    console.log('Configuración de campos subida exitosamente a Firestore');
    console.log(`Total de campos subidos: ${defaultFields.fields.length}`);
    console.log(`Campos seleccionados: ${defaultFields.fields.filter(f => f.selected).length}`);
    
    return true;
  } catch (error) {
    console.error('Error al subir la configuración de campos:', error);
    return false;
  }
};

export default uploadFieldsConfig;
