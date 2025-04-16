// Modelo básico para los ítems del menú lateral
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavItem[];
}
