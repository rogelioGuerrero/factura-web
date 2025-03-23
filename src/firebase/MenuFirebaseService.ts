import { FirestoreService, FirestoreDocument } from './FirestoreService';
import { NavItem } from '../models/NavbarModel';

export class MenuFirebaseService {
  private static instance: MenuFirebaseService;
  private firestoreService: FirestoreService;
  
  private constructor() {
    // Colección para elementos del menú
    this.firestoreService = FirestoreService.getInstance('menu-items');
  }
  
  static getInstance(): MenuFirebaseService {
    if (!MenuFirebaseService.instance) {
      MenuFirebaseService.instance = new MenuFirebaseService();
    }
    return MenuFirebaseService.instance;
  }
  
  // Guardar un elemento de menú en Firestore
  async saveMenuItem(menuItem: NavItem): Promise<string> {
    try {
      // Convertir de forma segura a FirestoreDocument
      const firestoreDoc = this.convertToFirestoreDocument(menuItem as unknown as Record<string, unknown>);
      return await this.firestoreService.create(firestoreDoc);
    } catch (error) {
      console.error('Error al guardar elemento de menú:', error);
      throw error;
    }
  }
  
  // Obtener un elemento de menú por ID
  async getMenuItemById(id: string): Promise<NavItem | null> {
    try {
      const doc = await this.firestoreService.getById(id);
      if (!doc) return null;
      return doc as unknown as NavItem;
    } catch (error) {
      console.error('Error al obtener elemento de menú:', error);
      throw error;
    }
  }
  
  // Obtener todos los elementos del menú
  async getAllMenuItems(): Promise<NavItem[]> {
    try {
      const docs = await this.firestoreService.getAll();
      return docs as unknown as NavItem[];
    } catch (error) {
      console.error('Error al obtener todos los elementos del menú:', error);
      throw error;
    }
  }
  
  // Actualizar un elemento de menú
  async updateMenuItem(id: string, data: Partial<NavItem>): Promise<void> {
    try {
      // Convertir de forma segura a Partial<FirestoreDocument>
      const firestoreData = this.convertToFirestoreDocument(data as unknown as Record<string, unknown>);
      await this.firestoreService.update(id, firestoreData);
    } catch (error) {
      console.error('Error al actualizar elemento de menú:', error);
      throw error;
    }
  }
  
  // Eliminar un elemento de menú
  async deleteMenuItem(id: string): Promise<void> {
    try {
      await this.firestoreService.delete(id);
    } catch (error) {
      console.error('Error al eliminar elemento de menú:', error);
      throw error;
    }
  }
  
  // Guardar múltiples elementos de menú
  async saveMenuItems(menuItems: NavItem[]): Promise<string[]> {
    try {
      // Convertir cada elemento del array de forma segura
      const firestoreDocs = menuItems.map(item => 
        this.convertToFirestoreDocument(item as unknown as Record<string, unknown>)
      );
      return await this.firestoreService.importJsonData(firestoreDocs);
    } catch (error) {
      console.error('Error al guardar elementos de menú:', error);
      throw error;
    }
  }

  // Método auxiliar para convertir de forma segura a FirestoreDocument
  private convertToFirestoreDocument(data: Record<string, unknown>): FirestoreDocument {
    // Crear un nuevo objeto que cumple con la interfaz FirestoreDocument
    const firestoreDoc: FirestoreDocument = {};
    
    // Copiar todas las propiedades
    Object.entries(data).forEach(([key, value]) => {
      firestoreDoc[key] = value;
    });
    
    return firestoreDoc;
  }
}
