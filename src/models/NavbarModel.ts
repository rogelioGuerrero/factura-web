export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavItem[];
  isExternal?: boolean;
}

export class NavbarModel {
  private static instance: NavbarModel;
  private navItems: NavItem[] = [];
  private navbarPosition: 'top' | 'left' | 'right' = 'top';
  private navbarTheme: 'light' | 'dark' = 'light';

  private constructor() {
    this.initializeDefaultNavItems();
  }

  static getInstance(): NavbarModel {
    if (!NavbarModel.instance) {
      NavbarModel.instance = new NavbarModel();
    }
    return NavbarModel.instance;
  }

  private initializeDefaultNavItems(): void {
    this.navItems = [
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
      },
      {
        id: 'settings',
        label: 'Configuración',
        path: '/settings',
        icon: 'settings'
      }
    ];
  }

  getNavItems(): NavItem[] {
    return [...this.navItems];
  }
  
  setNavItems(items: NavItem[]): void {
    this.navItems = [...items];
  }

  addNavItem(item: NavItem): void {
    if (!this.navItems.some(navItem => navItem.id === item.id)) {
      this.navItems.push(item);
    }
  }

  updateNavItem(id: string, updatedItem: Partial<NavItem>): void {
    this.navItems = this.navItems.map(item => {
      if (item.id === id) {
        return { ...item, ...updatedItem };
      }
      return item;
    });
  }

  removeNavItem(id: string): void {
    this.navItems = this.navItems.filter(item => item.id !== id);
  }

  reorderNavItems(orderedIds: string[]): void {
    const itemsMap = new Map<string, NavItem>();
    this.navItems.forEach(item => itemsMap.set(item.id, item));
    
    const reorderedItems: NavItem[] = [];
    orderedIds.forEach(id => {
      const item = itemsMap.get(id);
      if (item) {
        reorderedItems.push(item);
        itemsMap.delete(id);
      }
    });
    
    // Añadir cualquier elemento que no esté en el orden especificado
    itemsMap.forEach(item => reorderedItems.push(item));
    
    this.navItems = reorderedItems;
  }

  getNavbarPosition(): 'top' | 'left' | 'right' {
    return this.navbarPosition;
  }

  setNavbarPosition(position: 'top' | 'left' | 'right'): void {
    this.navbarPosition = position;
  }

  getNavbarTheme(): 'light' | 'dark' {
    return this.navbarTheme;
  }

  setNavbarTheme(theme: 'light' | 'dark'): void {
    this.navbarTheme = theme;
  }

  resetToDefaults(): void {
    this.initializeDefaultNavItems();
    this.navbarPosition = 'top';
    this.navbarTheme = 'light';
  }
}
