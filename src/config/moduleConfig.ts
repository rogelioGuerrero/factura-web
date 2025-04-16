export interface ModuleConfig {
  id: string;
  title: string;
  description: string;
  path: string;
  enabled: boolean;
  bgColor: string;
  hoverColor: string;
  icon?: string;
}

// Configuración de los módulos disponibles en la aplicación
export const modules: ModuleConfig[] = [
  {
    id: 'upload',
    title: 'Gestor de Facturas',
    description: 'Gestiona y procesa facturas en formato JSON',
    path: '/invoices',
    enabled: true, // Este módulo está habilitado
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100'
  },
  {
    id: 'view-invoices',
    title: 'Ver Facturas',
    description: 'Visualiza y gestiona las facturas existentes',
    path: '/view-invoices',
    enabled: false, // Este módulo aún no está habilitado
    bgColor: 'bg-green-50',
    hoverColor: 'hover:bg-green-100'
  },
  {
    id: 'reports',
    title: 'Reportes',
    description: 'Genera reportes y análisis de las facturas',
    path: '/reports',
    enabled: false, // Este módulo aún no está habilitado
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:bg-purple-100'
  },
  {
    id: 'custom-fields',
    title: 'Gestor de Campos',
    description: 'Seleccione los campos que desea visualizar en sus informes y tablas de datos',
    path: '/custom-fields',
    enabled: false, // Este módulo aún no está habilitado
    bgColor: 'bg-yellow-50',
    hoverColor: 'hover:bg-yellow-100'
  }
];

// Función para obtener solo los módulos habilitados
export const getEnabledModules = (): ModuleConfig[] => {
  return modules.filter(module => module.enabled);
};

// Función para verificar si un módulo está habilitado por su ID
export const isModuleEnabled = (moduleId: string): boolean => {
  const module = modules.find(m => m.id === moduleId);
  return module ? module.enabled : false;
};
