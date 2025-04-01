// src/modules/export/controllers/ExportController.ts
import { saveAs } from 'file-saver';
import { ExportModel, ExportOptions } from '../models/ExportModel';

export class ExportController {
  private model: ExportModel;
  
  constructor(initialData: any[] = []) {
    this.model = new ExportModel(initialData);
  }
  
  updateData(data: any[]): void {
    this.model.setData(data);
  }
  
  async exportData(options: ExportOptions, fieldsToInclude?: string[]): Promise<boolean> {
    try {
      // Preparar datos
      const data = fieldsToInclude ? 
        this.model.filterFields(fieldsToInclude) : 
        this.model.getData();
      
      if (!data || data.length === 0) {
        console.warn('No data to export');
        return false;
      }
      
      // Crear worksheet
      const worksheet = this.model.prepareWorksheet(data);
      
      // Exportar según formato
      let blob: Blob;
      
      switch (options.format) {
        case 'csv':
          blob = this.model.generateCSV(worksheet);
          saveAs(blob, `${options.filename}.csv`);
          break;
          
        case 'excel':
          blob = this.model.generateExcel(worksheet, options.sheetName || 'Data');
          saveAs(blob, `${options.filename}.xlsx`);
          break;
          
        case 'pdf':
          // Implementación futura para PDF
          console.warn('PDF export not implemented yet');
          return false;
          
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }
      
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      return false;
    }
  }
}