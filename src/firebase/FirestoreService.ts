import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  DocumentData,
  QueryConstraint,
  Timestamp,
  WhereFilterOp
} from 'firebase/firestore';
import { db } from './config';

// Definir interfaces para los tipos de datos
export interface FirestoreDocument {
  id?: string;
  [key: string]: unknown;
}

export interface FilterCondition {
  field: string;
  operator: WhereFilterOp;
  value: unknown;
}

export interface SortCondition {
  field: string;
  direction: 'asc' | 'desc';
}

export class FirestoreService {
  private static instances: Record<string, FirestoreService> = {};
  private collectionName: string;

  private constructor(collectionName: string) {
    this.collectionName = collectionName;
    console.log(`Nueva instancia de FirestoreService creada para colección: ${collectionName}`);
  }

  static getInstance(collectionName: string): FirestoreService {
    if (!FirestoreService.instances[collectionName]) {
      console.log(`Creando nueva instancia de FirestoreService para colección: ${collectionName}`);
      FirestoreService.instances[collectionName] = new FirestoreService(collectionName);
    } else {
      console.log(`Reutilizando instancia existente de FirestoreService para colección: ${collectionName}`);
    }
    return FirestoreService.instances[collectionName];
  }

  // Crear un nuevo documento
  async create(data: FirestoreDocument): Promise<string> {
    try {
      // Añadir timestamps para creación y actualización
      const dataWithTimestamps = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, this.collectionName), dataWithTimestamps);
      return docRef.id;
    } catch (error) {
      console.error('Error al crear documento:', error);
      throw error;
    }
  }

  // Obtener un documento por ID
  async getById(id: string): Promise<DocumentData | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener documento:', error);
      throw error;
    }
  }

  // Obtener todos los documentos
  async getAll(): Promise<DocumentData[]> {
    try {
      console.log(`Intentando obtener todos los documentos de la colección: ${this.collectionName}`);
      const collectionRef = collection(db, this.collectionName);
      console.log('Referencia de colección creada:', collectionRef);
      
      const querySnapshot = await getDocs(collectionRef);
      console.log(`Se encontraron ${querySnapshot.docs.length} documentos en la colección ${this.collectionName}`);
      
      if (querySnapshot.docs.length === 0) {
        console.log('La colección está vacía o no existe');
      } else {
        // Mostrar los IDs de los primeros 5 documentos para depuración
        const sampleIds = querySnapshot.docs.slice(0, 5).map(doc => doc.id);
        console.log('Muestra de IDs encontrados:', sampleIds);
      }
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      throw error;
    }
  }

  // Obtener documentos con filtros
  async getWithFilters(
    filters: FilterCondition[] = [],
    sortBy: SortCondition[] = []
  ): Promise<DocumentData[]> {
    try {
      const constraints: QueryConstraint[] = [];
      
      // Añadir filtros
      filters.forEach(filter => {
        constraints.push(where(filter.field, filter.operator, filter.value));
      });
      
      // Añadir ordenamiento
      sortBy.forEach(sort => {
        constraints.push(orderBy(sort.field, sort.direction));
      });
      
      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener documentos con filtros:', error);
      throw error;
    }
  }

  // Actualizar un documento
  async update(id: string, data: Partial<FirestoreDocument>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      
      // Añadir timestamp de actualización
      const dataWithTimestamp = {
        ...data,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(docRef, dataWithTimestamp);
    } catch (error) {
      console.error('Error al actualizar documento:', error);
      throw error;
    }
  }

  // Eliminar un documento
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      throw error;
    }
  }

  // Importar datos JSON a Firestore
  async importJsonData(jsonData: FirestoreDocument[]): Promise<string[]> {
    try {
      const ids: string[] = [];
      
      // Procesar cada elemento del JSON
      for (const item of jsonData) {
        const id = await this.create(item);
        ids.push(id);
      }
      
      return ids;
    } catch (error) {
      console.error('Error al importar datos JSON:', error);
      throw error;
    }
  }
}
