// FirestoreService.ts
// Servicio base para centralizar el acceso a Firestore en la app

import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Firestore, CollectionReference, DocumentData } from "firebase/firestore";
import { app } from "./firebaseApp";

// Usamos la instancia única de Firebase app exportada desde firebaseApp.ts

export class FirestoreService {
  private static instance: FirestoreService;
  private db: Firestore;
  private collectionName: string;
  private collectionRef: CollectionReference<DocumentData>;

  private constructor(collectionName: string) {
    this.db = getFirestore(app);
    this.collectionName = collectionName;
    this.collectionRef = collection(this.db, collectionName);
  }

  static getInstance(collectionName: string): FirestoreService {
    if (!FirestoreService.instance || FirestoreService.instance.collectionName !== collectionName) {
      FirestoreService.instance = new FirestoreService(collectionName);
    }
    return FirestoreService.instance;
  }

  // Ejemplo: obtener todos los documentos de la colección
  async getAll(): Promise<DocumentData[]> {
    const querySnapshot = await getDocs(this.collectionRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Ejemplo: obtener un documento por ID
  async getById(id: string): Promise<DocumentData | undefined> {
    const docRef = doc(this.collectionRef, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : undefined;
  }

  // Ejemplo: agregar un documento
  async add(data: DocumentData): Promise<string> {
    const docRef = await addDoc(this.collectionRef, data);
    return docRef.id;
  }

  // Ejemplo: actualizar un documento
  async update(id: string, data: Partial<DocumentData>): Promise<void> {
    const docRef = doc(this.collectionRef, id);
    await updateDoc(docRef, data);
  }

  // Ejemplo: eliminar un documento
  async delete(id: string): Promise<void> {
    const docRef = doc(this.collectionRef, id);
    await deleteDoc(docRef);
  }
}

// Puedes extender y personalizar esta clase según tus necesidades.
