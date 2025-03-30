import { NavbarModel, NavItem } from '../models/NavbarModel';
import { MenuFirebaseService } from '../firebase/MenuFirebaseService';

export class NavbarController {
  private static instance: NavbarController;
  private model: NavbarModel;
  private firebaseService: MenuFirebaseService;

  private constructor() {
    this.model = NavbarModel.getInstance();
    this.firebaseService = MenuFirebaseService.getInstance();
  }

  static getInstance(): NavbarController {
    if (!NavbarController.instance) {
      NavbarController.instance = new NavbarController();
    }
    return NavbarController.instance;
  }

  getNavItems(): NavItem[] {
    return this.model.getNavItems();
  }
  
  setNavItems(items: NavItem[]): void {
    this.model.setNavItems(items);
  }

  addNavItem(item: NavItem): void {
    this.model.addNavItem(item);
  }

  updateNavItem(id: string, updatedItem: Partial<NavItem>): void {
    this.model.updateNavItem(id, updatedItem);
  }

  removeNavItem(id: string): void {
    this.model.removeNavItem(id);
  }

  reorderNavItems(orderedIds: string[]): void {
    this.model.reorderNavItems(orderedIds);
  }

  getNavbarPosition(): 'top' | 'left' | 'right' {
    return this.model.getNavbarPosition();
  }

  setNavbarPosition(position: 'top' | 'left' | 'right'): void {
    this.model.setNavbarPosition(position);
  }

  getNavbarTheme(): 'light' | 'dark' {
    return this.model.getNavbarTheme();
  }

  setNavbarTheme(theme: 'light' | 'dark'): void {
    this.model.setNavbarTheme(theme);
  }

  resetToDefaults(): void {
    this.model.resetToDefaults();
  }

  // Métodos para Firebase
  async loadNavItemsFromFirebase(): Promise<NavItem[]> {
    try {
      console.log('Intentando cargar elementos de menú desde Firebase...');
      const items = await this.firebaseService.getAllMenuItems();
      
      if (items && items.length > 0) {
        console.log(`Se encontraron ${items.length} elementos de menú en Firebase`);
        
        // Verificar que no haya IDs duplicados
        const uniqueItems = this.removeDuplicateNavItems(items);
        if (uniqueItems.length !== items.length) {
          console.log(`Se eliminaron ${items.length - uniqueItems.length} elementos duplicados`);
          // Si había duplicados, actualizar en Firebase
          await this.saveNavItemsToFirebase(uniqueItems);
        }
        
        // Actualizar el modelo local con los elementos de Firebase
        this.model.setNavItems(uniqueItems);
        return uniqueItems;
      } else {
        console.log('No se encontraron elementos de menú en Firebase, usando valores predeterminados');
        // Si no hay elementos en Firebase, usar los valores predeterminados
        const defaultItems = this.model.getNavItems();
        // Guardar los valores predeterminados en Firebase
        await this.saveNavItemsToFirebase(defaultItems);
        return defaultItems;
      }
    } catch (error) {
      console.error('Error al cargar elementos de menú desde Firebase:', error);
      // En caso de error, devolver los elementos locales
      return this.model.getNavItems();
    }
  }

  // Método para eliminar elementos duplicados basados en ID
  private removeDuplicateNavItems(items: NavItem[]): NavItem[] {
    const uniqueMap = new Map<string, NavItem>();
    
    // Mantener solo la última ocurrencia de cada ID
    items.forEach(item => {
      uniqueMap.set(item.id, item);
      
      // Procesar recursivamente los hijos si existen
      if (item.children && item.children.length > 0) {
        item.children = this.removeDuplicateNavItems(item.children);
      }
    });
    
    return Array.from(uniqueMap.values());
  }

  async saveNavItemsToFirebase(items: NavItem[] = this.model.getNavItems()): Promise<string[]> {
    try {
      // Eliminar duplicados antes de guardar
      const uniqueItems = this.removeDuplicateNavItems(items);
      
      // Guardar los elementos en Firebase
      return await this.firebaseService.saveMenuItems(uniqueItems);
    } catch (error) {
      console.error('Error al guardar elementos de menú en Firebase:', error);
      throw error;
    }
  }

  async saveNavItemToFirebase(item: NavItem): Promise<string> {
    try {
      // Guardar un elemento en Firebase
      const id = await this.firebaseService.saveMenuItem(item);
      // Actualizar el modelo local
      this.addNavItem(item);
      return id;
    } catch (error) {
      console.error('Error al guardar elemento de menú en Firebase:', error);
      throw error;
    }
  }

  async updateNavItemInFirebase(id: string, updatedItem: Partial<NavItem>): Promise<void> {
    try {
      // Actualizar el elemento en Firebase
      await this.firebaseService.updateMenuItem(id, updatedItem);
      // Actualizar el modelo local
      this.updateNavItem(id, updatedItem);
    } catch (error) {
      console.error('Error al actualizar elemento de menú en Firebase:', error);
      throw error;
    }
  }

  async deleteNavItemFromFirebase(id: string): Promise<void> {
    try {
      // Eliminar el elemento de Firebase
      await this.firebaseService.deleteMenuItem(id);
      // Actualizar el modelo local
      this.removeNavItem(id);
    } catch (error) {
      console.error('Error al eliminar elemento de menú de Firebase:', error);
      throw error;
    }
  }
}
