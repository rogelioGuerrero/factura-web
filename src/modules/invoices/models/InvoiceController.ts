import { InvoiceService } from '../models/InvoiceService';
import { InvoiceData } from '../../../types/invoice';
import { FilterCondition, SortCondition } from '../../../shared/utils/FirestoreService';

export class InvoiceController {
  private static instance: InvoiceController;
  private service: InvoiceService;

  private constructor() {
    this.service = InvoiceService.getInstance();
  }

  static getInstance(): InvoiceController {
    if (!InvoiceController.instance) {
      InvoiceController.instance = new InvoiceController();
    }
    return InvoiceController.instance;
  }

  async handleFileUpload(files: File[]): Promise<{ success: boolean; data?: InvoiceData[]; error?: string }> {
    try {
      const processedInvoices: InvoiceData[] = [];
      
      for (const file of files) {
        const invoice = await this.service.processJsonFile(file);
        processedInvoices.push(invoice);
      }
      
      // Guardar cada factura en Firebase
      for (const invoice of processedInvoices) {
        await this.service.addInvoice(invoice);
      }
      return { success: true, data: processedInvoices };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Error desconocido al procesar los archivos' };
    }
  }

  async handleUrlImport(url: string): Promise<{ success: boolean; data?: InvoiceData[]; error?: string }> {
    try {
      // Procesar la URL para obtener los datos JSON
      const processedInvoices = await this.service.processJsonFromUrl(url);
      
      if (processedInvoices.length === 0) {
        return { success: false, error: 'No se encontraron facturas válidas en la URL proporcionada' };
      }
      
      // Guardar cada factura en Firebase
      for (const invoice of processedInvoices) {
        await this.service.addInvoice(invoice);
      }
      return { success: true, data: processedInvoices };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Error desconocido al procesar la URL' };
    }
  }


  // Métodos para Firebase
  async addInvoice(invoice: InvoiceData): Promise<string> {
    try {
      return await this.service.addInvoice(invoice);
    } catch (error) {
      console.error('Error al guardar factura en Firebase:', error);
      throw error;
    }
  }

  async getInvoiceById(id: string): Promise<InvoiceData | null> {
    try {
      return await this.service.getInvoiceById(id);
    } catch (error) {
      console.error('Error al obtener factura de Firebase:', error);
      throw error;
    }
  }

  async getAllInvoices(): Promise<InvoiceData[]> {
    try {
      return await this.service.getAllInvoices();
    } catch (error) {
      console.error('Error al obtener facturas de Firebase:', error);
      throw error;
    }
  }

  async updateInvoice(id: string, data: Partial<InvoiceData>): Promise<void> {
    try {
      await this.service.updateInvoice(id, data);
    } catch (error) {
      console.error('Error al actualizar factura en Firebase:', error);
      throw error;
    }
  }

  async deleteInvoice(id: string): Promise<void> {
    try {
      await this.service.deleteInvoice(id);
    } catch (error) {
      console.error('Error al eliminar factura de Firebase:', error);
      throw error;
    }
  }

  async getInvoicesWithFilters(
    filters: FilterCondition[] = [],
    sortBy: SortCondition[] = []
  ): Promise<InvoiceData[]> {
    try {
      return await this.service.getInvoicesWithFilters(filters, sortBy);
    } catch (error) {
      console.error('Error al buscar facturas en Firebase:', error);
      throw error;
    }
  }
}
