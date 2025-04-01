// src/modules/export/index.ts
export { default as ExportButton } from './components/ExportButton';
export { ExportController } from './controllers/ExportController';
export type { ExportOptions } from './models/ExportModel';
export { ExportModel } from './models/ExportModel';

// Importar el controlador para usarlo en quickExport
import { ExportController } from './controllers/ExportController';
import { ExportOptions } from './models/ExportModel';

// Función de ayuda para exportación rápida
export const quickExport = async (
  data: any[], 
  format: 'csv' | 'excel' = 'excel', 
  filename: string = 'export'
) => {
  const controller = new ExportController(data);
  const options: ExportOptions = { format, filename };
  return controller.exportData(options);
};