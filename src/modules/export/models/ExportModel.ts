// src/modules/export/models/ExportModel.ts
import * as XLSX from 'xlsx';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filename: string;
  sheetName?: string;
  includeHeaders?: boolean;
}

export class ExportModel {
  private data: any[];
  
  constructor(data: any[] = []) {
    this.data = data;
  }
  
  setData(data: any[]): void {
    this.data = data;
  }
  
  getData(): any[] {
    return this.data;
  }
  
  filterFields(fieldsToInclude: string[]): any[] {
    if (!fieldsToInclude || fieldsToInclude.length === 0) {
      return this.data;
    }
    
    return this.data.map(item => {
      const filteredItem: any = {};
      fieldsToInclude.forEach(field => {
        filteredItem[field] = item[field];
      });
      return filteredItem;
    });
  }
  
  prepareWorksheet(data: any[]): XLSX.WorkSheet {
    return XLSX.utils.json_to_sheet(data);
  }
  
  generateCSV(worksheet: XLSX.WorkSheet): Blob {
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    return new Blob([csvOutput], { type: 'text/csv;charset=utf-8' });
  }
  
  generateExcel(worksheet: XLSX.WorkSheet, sheetName: string): Blob {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
}