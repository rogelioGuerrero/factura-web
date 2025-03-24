import { FirestoreService, FirestoreDocument } from './FirestoreService';
import { NavItem } from '../models/NavbarModel';
import { getAuth } from 'firebase/auth';

export interface MenuSettings {
  items: NavItem[];
  position: 'top' | 'left' | 'right';
  theme: 'light' | 'dark';
  lastUpdated: number;
}

export class MenuSettingsService {
  private static instance: MenuSettingsService;
  private firestoreService: FirestoreService;
  
  private constructor() {
    // Colección para configuraciones de menú
    this.firestoreService = FirestoreService.getInstance('menu-settings');
  }
  
  static getInstance(): MenuSettingsService {
    if (!MenuSettingsService.instance) {
      MenuSettingsService.instance = new MenuSettingsService();
    }
    return MenuSettingsService.instance;
  }
  
  // Obtener el ID del usuario actual
  private getCurrentUserId(): string {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('No hay usuario autenticado, usando ID genérico');
      return 'default-user';
    }
    
    return user.uid;
  }
  
  // Guardar configuración de menú para el usuario actual
  async saveUserMenuSettings(settings: MenuSettings): Promise<string> {
    try {
      const userId = this.getCurrentUserId();
      console.log(`Guardando configuración de menú para usuario: ${userId}`);
      
      // Añadir timestamp de última actualización
      const settingsToSave = {
        ...settings,
        lastUpdated: Date.now(),
        userId
      };
      
      // Convertir a FirestoreDocument
      const firestoreDoc = this.convertToFirestoreDocument(settingsToSave as unknown as Record<string, unknown>);
      
      // Intentar obtener configuración existente
      const existingSettings = await this.getUserMenuSettings();
      
      if (existingSettings && existingSettings.id) {
        // Actualizar configuración existente
        await this.firestoreService.update(existingSettings.id, firestoreDoc);
        return existingSettings.id;
      } else {
        // Crear nueva configuración
        return await this.firestoreService.create(firestoreDoc);
      }
    } catch (error) {
      console.error('Error al guardar configuración de menú:', error);
      throw error;
    }
  }
  
  // Obtener configuración de menú para el usuario actual
  async getUserMenuSettings(): Promise<MenuSettings & { id?: string } | null> {
    try {
      const userId = this.getCurrentUserId();
      console.log(`Obteniendo configuración de menú para usuario: ${userId}`);
      
      // Buscar configuración por userId
      const docs = await this.firestoreService.getAll();
      const userDocs = docs.filter(doc => doc.userId === userId);
      
      if (userDocs && userDocs.length > 0) {
        // Devolver la configuración más reciente
        const sortedDocs = userDocs.sort((a: FirestoreDocument, b: FirestoreDocument) => 
          ((b.lastUpdated as number) || 0) - ((a.lastUpdated as number) || 0)
        );
        
        return {
          ...sortedDocs[0] as unknown as MenuSettings,
          id: sortedDocs[0].id
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error al obtener configuración de menú:', error);
      throw error;
    }
  }
  
  // Eliminar configuración de menú para el usuario actual
  async deleteUserMenuSettings(): Promise<void> {
    try {
      const settings = await this.getUserMenuSettings();
      
      if (settings && settings.id) {
        await this.firestoreService.delete(settings.id);
        console.log(`Configuración de menú eliminada para usuario: ${this.getCurrentUserId()}`);
      }
    } catch (error) {
      console.error('Error al eliminar configuración de menú:', error);
      throw error;
    }
  }
  
  // Método auxiliar para convertir a FirestoreDocument
  private convertToFirestoreDocument(data: Record<string, unknown>): FirestoreDocument {
    const firestoreDoc: FirestoreDocument = {};
    
    Object.entries(data).forEach(([key, value]) => {
      firestoreDoc[key] = value;
    });
    
    return firestoreDoc;
  }
}
