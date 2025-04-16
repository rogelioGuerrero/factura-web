// Usamos el alias '@' definido en tsconfig.json para imports más limpios y robustos
import { MenuFirebaseService } from "@/firebase/MenuFirebaseService";
import { NavItem } from '../models/NavbarModel';

export class MenuController {
  private static instance: MenuController;
  private menuItems: NavItem[] = [];
  private firebaseService: MenuFirebaseService;

  private constructor() {
    // Inicializar el servicio de Firebase
    this.firebaseService = MenuFirebaseService.getInstance();
    this.initializeDefaultMenuItems();
  }

  static getInstance(): MenuController {
    if (!MenuController.instance) {
      MenuController.instance = new MenuController();
    }
    return MenuController.instance;
  }

  private initializeDefaultMenuItems(): void {
    this.menuItems = [
      {
        id: 'home',
        label: 'Inicio',
        path: '/',
        icon: 'home'
      },
      {
        id: 'invoices',
        label: 'Facturas',
        path: '/invoices',
        icon: 'document'
      },
      {
        id: 'reports',
        label: 'Reportes',
        path: '/reports',
        icon: 'chart',
        children: [
          {
            id: 'monthly',
            label: 'Mensual',
            path: '/reports/monthly'
          },
          {
            id: 'annual',
            label: 'Anual',
            path: '/reports/annual'
          }
        ]
      }
    ];
  }

  // Métodos para manejar elementos del menú localmente
  getMenuItems(): NavItem[] {
    return [...this.menuItems];
  }

  setMenuItems(items: NavItem[]): void {
    this.menuItems = [...items];
  }

  addMenuItem(item: NavItem): void {
    if (!this.menuItems.some(menuItem => menuItem.id === item.id)) {
      this.menuItems.push(item);
    }
  }

  updateMenuItem(id: string, updatedItem: Partial<NavItem>): void {
    this.menuItems = this.menuItems.map(item => {
      if (item.id === id) {
        return { ...item, ...updatedItem };
      }
      return item;
    });
  }

  removeMenuItem(id: string): void {
    this.menuItems = this.menuItems.filter(item => item.id !== id);
  }

  // Métodos para Firebase
  async loadMenuItemsFromFirebase(): Promise<NavItem[]> {
    try {
      const items = await this.firebaseService.getAllMenuItems();
      if (items && items.length > 0) {
        // Actualizar el modelo local con los elementos de Firebase
        this.menuItems = items;
        return items;
      } else {
        // Si no hay elementos en Firebase, usar los valores predeterminados
        const defaultItems = this.getMenuItems();
        // Guardar los valores predeterminados en Firebase
        await this.saveMenuItemsToFirebase(defaultItems);
        return defaultItems;
      }
    } catch (error) {
      console.error('Error al cargar elementos de menú desde Firebase:', error);
      // En caso de error, devolver los elementos locales
      return this.getMenuItems();
    }
  }

  async saveMenuItemsToFirebase(items: NavItem[] = this.getMenuItems()): Promise<string[]> {
    try {
      // Guardar los elementos en Firebase
      return await this.firebaseService.saveMenuItems(items);
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
      this.addMenuItem(item);
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
      this.updateMenuItem(id, updatedItem);
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
      this.removeMenuItem(id);
    } catch (error) {
      console.error('Error al eliminar elemento de menú de Firebase:', error);
      throw error;
    }
  }
}
