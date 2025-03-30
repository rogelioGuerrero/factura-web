import { db } from '../../firebase/config';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp, 
  QueryConstraint,
  limit as firestoreLimit,
  startAfter as firestoreStartAfter,
  getCountFromServer
} from 'firebase/firestore';
// Import types directly from the types folder
import { 
  FilterCondition, 
  SortCondition,
  PaginationOptions,
  PaginatedResult
} from '../../types/firestore';

// Re-export types for convenience elsewhere
export type { FilterCondition, SortCondition } from '../../types/firestore';

// Definir interfaces para los tipos de datos
export interface FirestoreDocument {
  id: string;
  [key: string]: unknown;
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

  // Alias for create method to match InvoiceService expectations
  async add<T extends object>(data: T): Promise<string> {
    return this.create(data as unknown as FirestoreDocument);
  }

  // Obtener un documento por ID
  async getById<T>(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as unknown as T;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener documento:', error);
      throw error;
    }
  }

  // Obtener todos los documentos
  async getAll<T>(): Promise<T[]> {
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
      })) as unknown as T[];
    } catch (error) {
      console.error('Error al obtener todos los documentos:', error);
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

  // Obtener documentos con filtros y ordenamiento
  async getWithFilters<T>(filters: FilterCondition[] = [], sortBy: SortCondition[] = []): Promise<T[]> {
    try {
      const collectionRef = collection(db, this.collectionName);
      
      // Construir las condiciones de consulta
      const queryConstraints: QueryConstraint[] = [];
      
      // Añadir filtros
      filters.forEach(filter => {
        queryConstraints.push(where(filter.field, filter.operator, filter.value));
      });
      
      // Añadir ordenamiento
      sortBy.forEach(sort => {
        queryConstraints.push(orderBy(sort.field, sort.direction));
      });
      
      // Ejecutar la consulta
      const q = query(collectionRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      // Mapear los resultados
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as T[];
    } catch (error) {
      console.error('Error al obtener documentos con filtros:', error);
      throw error;
    }
  }

  // Obtener documentos con paginación
  async getPaginated<T>(
    pagination: PaginationOptions,
    sortBy: SortCondition[] = [],
    filters: FilterCondition[] = []
  ): Promise<PaginatedResult<T>> {
    try {
      const collectionRef = collection(db, this.collectionName);
      const queryConstraints: QueryConstraint[] = [];
      
      // Añadir filtros
      filters.forEach(filter => {
        queryConstraints.push(where(filter.field, filter.operator, filter.value));
      });
      
      // Añadir ordenamiento
      sortBy.forEach(sort => {
        queryConstraints.push(orderBy(sort.field, sort.direction));
      });
      
      // Calcular el límite basado en el tamaño de página
      const pageSize = pagination.pageSize || 10;
      
      // Contar el total de documentos primero
      let totalCount = 0;
      try {
        // Crear una consulta sin límite ni paginación para contar
        const countConstraints = queryConstraints.filter(
          constraint => !String(constraint).includes('limit') && !String(constraint).includes('startAfter')
        );
        const countQuery = query(collectionRef, ...countConstraints);
        const countSnapshot = await getCountFromServer(countQuery);
        totalCount = countSnapshot.data().count;
        console.log(`Total de documentos encontrados: ${totalCount}`);
      } catch (countError) {
        console.warn('No se pudo obtener el conteo total:', countError);
      }
      
      // Calcular el total de páginas
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      
      // Verificar que la página solicitada esté dentro del rango válido
      const page = pagination.page || 1;
      const validPage = Math.min(Math.max(1, page), totalPages);
      
      console.log(`Solicitando página ${validPage} de ${totalPages} (tamaño: ${pageSize})`);
      
      // Añadir restricción de límite para la consulta final
      queryConstraints.push(firestoreLimit(pageSize));
      
      // Si se especifica una página mayor a 1, necesitamos calcular el punto de inicio
      if (validPage > 1) {
        // Calculamos cuántos documentos debemos saltar
        const docsToSkip = (validPage - 1) * pageSize;
        console.log(`Saltando ${docsToSkip} documentos para llegar a la página ${validPage}`);
        
        // Obtenemos los documentos hasta el punto de inicio
        const skipConstraints = [...queryConstraints.filter(
          constraint => !String(constraint).includes('limit')
        )];
        
        if (sortBy.length === 0) {
          // Si no hay ordenamiento especificado, añadimos uno por defecto
          skipConstraints.push(orderBy('id'));
        }
        
        const skipQuery = query(collectionRef, ...skipConstraints, firestoreLimit(docsToSkip));
        const skipSnapshot = await getDocs(skipQuery);
        
        // Si hay documentos suficientes, usamos el último como punto de inicio
        if (skipSnapshot.docs.length > 0) {
          const lastVisible = skipSnapshot.docs[skipSnapshot.docs.length - 1];
          queryConstraints.push(firestoreStartAfter(lastVisible));
          console.log(`Punto de inicio encontrado para la página ${validPage}`);
        } else {
          console.log(`No hay suficientes documentos para llegar a la página ${validPage}`);
          // Si no hay suficientes documentos, devolvemos la primera página
          return {
            data: [],
            totalCount,
            totalPages
          };
        }
      }
      
      // Ejecutar la consulta final con todas las restricciones
      const q = query(collectionRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      // Mapear los resultados
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as T[];
      
      console.log(`Obtenidos ${data.length} documentos para la página ${validPage}`);
      
      return {
        data,
        totalCount,
        totalPages
      };
    } catch (error) {
      console.error('Error al obtener documentos paginados:', error);
      throw error;
    }
  }

  // Contar documentos
  async count(filters: FilterCondition[] = []): Promise<number> {
    try {
      const collectionRef = collection(db, this.collectionName);
      
      // Construir las condiciones de consulta
      const queryConstraints: QueryConstraint[] = [];
      
      // Añadir filtros
      filters.forEach(filter => {
        queryConstraints.push(where(filter.field, filter.operator, filter.value));
      });
      
      // Ejecutar la consulta para contar
      const q = query(collectionRef, ...queryConstraints);
      const countSnapshot = await getCountFromServer(q);
      
      return countSnapshot.data().count;
    } catch (error) {
      console.error('Error al contar documentos:', error);
      throw error;
    }
  }
}

export default FirestoreService;
