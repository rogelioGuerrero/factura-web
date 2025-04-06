export interface NavItem {
  id: string;
  title: string;
  path?: string;
  icon?: string;
  children?: NavItem[];
}

export class NavbarModel {
  // Your implementation
}