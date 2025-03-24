import { NavbarModel, NavItem } from '../models/NavbarModel';
import { MenuSettingsService, MenuSettings } from '../firebase/MenuSettingsService';

export class MenuConfigController {
  private static instance: MenuConfigController;
  private navbarModel: NavbarModel;
  private settingsService: MenuSettingsService;
  private hasLoadedUserSettings: boolean = false;

  private constructor() {
    this.navbarModel = NavbarModel.getInstance();
    this.settingsService = MenuSettingsService.getInstance();
  }

  static getInstance(): MenuConfigController {
    if (!MenuConfigController.instance) {
      MenuConfigController.instance = new MenuConfigController();
    }
    return MenuConfigController.instance;
  }

  // Cargar configuración del usuario desde Firebase
  async loadUserSettings(): Promise<boolean> {
    try {
      console.log('Cargando configuración de menú del usuario...');
      
      // Si ya hemos cargado las configuraciones del usuario, no volver a cargar
      if (this.hasLoadedUserSettings) {
        console.log('Configuración de usuario ya cargada anteriormente');
        return true;
      }
      
      const settings = await this.settingsService.getUserMenuSettings();
      
      if (settings) {
        console.log('Configuración de usuario encontrada, aplicando...');
        
        // Aplicar configuración al modelo
        if (settings.items && settings.items.length > 0) {
          this.navbarModel.setNavItems(settings.items);
        }
        
        if (settings.position) {
          this.navbarModel.setNavbarPosition(settings.position);
        }
        
        if (settings.theme) {
          this.navbarModel.setNavbarTheme(settings.theme);
        }
        
        this.hasLoadedUserSettings = true;
        return true;
      } else {
        console.log('No se encontró configuración de usuario, usando valores predeterminados');
        return false;
      }
    } catch (error) {
      console.error('Error al cargar configuración de usuario:', error);
      return false;
    }
  }

  // Guardar configuración actual como configuración de usuario
  async saveUserSettings(): Promise<boolean> {
    try {
      const settings: MenuSettings = {
        items: this.navbarModel.getNavItems(),
        position: this.navbarModel.getNavbarPosition(),
        theme: this.navbarModel.getNavbarTheme(),
        lastUpdated: Date.now()
      };
      
      await this.settingsService.saveUserMenuSettings(settings);
      this.hasLoadedUserSettings = true;
      console.log('Configuración de menú guardada correctamente');
      return true;
    } catch (error) {
      console.error('Error al guardar configuración de usuario:', error);
      return false;
    }
  }

  // Resetear a valores predeterminados
  async resetToDefaults(): Promise<boolean> {
    try {
      this.navbarModel.resetToDefaults();
      await this.settingsService.deleteUserMenuSettings();
      this.hasLoadedUserSettings = false;
      console.log('Configuración de menú reseteada a valores predeterminados');
      return true;
    } catch (error) {
      console.error('Error al resetear configuración:', error);
      return false;
    }
  }

  // Métodos para manipular elementos del menú
  addMenuItem(item: NavItem): void {
    this.navbarModel.addNavItem(item);
  }

  updateMenuItem(id: string, updatedItem: Partial<NavItem>): void {
    this.navbarModel.updateNavItem(id, updatedItem);
  }

  removeMenuItem(id: string): void {
    this.navbarModel.removeNavItem(id);
  }

  reorderMenuItems(orderedIds: string[]): void {
    this.navbarModel.reorderNavItems(orderedIds);
  }

  // Obtener elementos actuales del menú
  getMenuItems(): NavItem[] {
    return [...this.navbarModel.getNavItems()];
  }

  // Establecer los elementos del menú
  setMenuItems(items: NavItem[]): void {
    // Limpiar elementos actuales
    this.navbarModel.clearNavItems();
    
    // Añadir los nuevos elementos
    items.forEach(item => {
      this.navbarModel.addNavItem(item);
    });
  }

  // Obtener/establecer posición del menú
  getMenuPosition(): 'top' | 'left' | 'right' {
    return this.navbarModel.getNavbarPosition();
  }

  setMenuPosition(position: 'top' | 'left' | 'right'): void {
    this.navbarModel.setNavbarPosition(position);
  }

  // Obtener/establecer tema del menú
  getMenuTheme(): 'light' | 'dark' {
    return this.navbarModel.getNavbarTheme();
  }

  setMenuTheme(theme: 'light' | 'dark'): void {
    this.navbarModel.setNavbarTheme(theme);
  }
}
