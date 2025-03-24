import { InvoiceService } from '../services/InvoiceService';
import { InvoiceData } from '../types/invoice';
import { FilterCondition, SortCondition } from '../firebase/FirestoreService';

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
      
      // Guardar en memoria local
      this.service.addInvoices(processedInvoices);
      
      // Guardar en Firebase
      try {
        await this.service.saveInvoicesToFirebase(processedInvoices);
        console.log('Facturas guardadas en Firebase correctamente');
      } catch (firebaseError) {
        console.error('Error al guardar en Firebase:', firebaseError);
        // Continuar con la operación local aunque falle Firebase
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
      
      // Guardar en memoria local
      this.service.addInvoices(processedInvoices);
      
      // Guardar en Firebase
      try {
        await this.service.saveInvoicesToFirebase(processedInvoices);
        console.log('Facturas desde URL guardadas en Firebase correctamente');
      } catch (firebaseError) {
        console.error('Error al guardar facturas desde URL en Firebase:', firebaseError);
        // Continuar con la operación local aunque falle Firebase
      }
      
      return { success: true, data: processedInvoices };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Error desconocido al procesar la URL' };
    }
  }

  // Métodos para memoria local
  addInvoices(invoices: InvoiceData[]): void {
    this.service.addInvoices(invoices);
  }

  removeInvoice(index: number): void {
    this.service.removeInvoice(index);
  }

  getAllInvoices(): InvoiceData[] {
    return this.service.getInvoices();
  }

  searchInvoices(searchTerm: string): InvoiceData[] {
    return this.service.searchInvoices(searchTerm);
  }

  getInvoiceById(id: string): InvoiceData | undefined {
    return this.service.getInvoiceById(id);
  }

  // Métodos para Firebase
  async saveInvoiceToFirebase(invoice: InvoiceData): Promise<string> {
    try {
      return await this.service.saveInvoiceToFirebase(invoice);
    } catch (error) {
      console.error('Error al guardar factura en Firebase:', error);
      throw error;
    }
  }

  async getInvoiceFromFirebase(id: string): Promise<InvoiceData | null> {
    try {
      return await this.service.getInvoiceFromFirebase(id);
    } catch (error) {
      console.error('Error al obtener factura de Firebase:', error);
      throw error;
    }
  }

  async getAllInvoicesFromFirebase(): Promise<InvoiceData[]> {
    try {
      return await this.service.getAllInvoicesFromFirebase();
    } catch (error) {
      console.error('Error al obtener facturas de Firebase:', error);
      throw error;
    }
  }

  async updateInvoiceInFirebase(id: string, data: Partial<InvoiceData>): Promise<void> {
    try {
      await this.service.updateInvoiceInFirebase(id, data);
    } catch (error) {
      console.error('Error al actualizar factura en Firebase:', error);
      throw error;
    }
  }

  async deleteInvoiceFromFirebase(id: string): Promise<void> {
    try {
      await this.service.deleteInvoiceFromFirebase(id);
    } catch (error) {
      console.error('Error al eliminar factura de Firebase:', error);
      throw error;
    }
  }

  async searchInvoicesInFirebase(
    filters: FilterCondition[] = [],
    sortBy: SortCondition[] = []
  ): Promise<InvoiceData[]> {
    try {
      return await this.service.searchInvoicesInFirebase(filters, sortBy);
    } catch (error) {
      console.error('Error al buscar facturas en Firebase:', error);
      throw error;
    }
  }
}
