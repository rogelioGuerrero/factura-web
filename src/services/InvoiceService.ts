import { InvoiceData } from '../types/invoice';
import { InvoiceFirebaseService } from '../firebase/InvoiceFirebaseService';
import { FilterCondition, SortCondition } from '../firebase/FirestoreService';

export class InvoiceService {
  private static instance: InvoiceService;
  private invoices: InvoiceData[] = [];
  private firebaseService: InvoiceFirebaseService;

  private constructor() {
    this.firebaseService = InvoiceFirebaseService.getInstance();
  }

  static getInstance(): InvoiceService {
    if (!InvoiceService.instance) {
      InvoiceService.instance = new InvoiceService();
    }
    return InvoiceService.instance;
  }

  // Procesar un archivo JSON
  async processJsonFile(file: File): Promise<InvoiceData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          if (!event.target || typeof event.target.result !== 'string') {
            reject(new Error('Error al leer el archivo'));
            return;
          }
          
          const jsonData = JSON.parse(event.target.result);
          resolve(jsonData as InvoiceData);
        } catch (error) {
          reject(new Error(`Error al procesar el archivo JSON: ${error instanceof Error ? error.message : 'Error desconocido'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      
      reader.readAsText(file);
    });
  }

  // Métodos para memoria local
  addInvoices(invoices: InvoiceData[]): void {
    this.invoices = [...this.invoices, ...invoices];
  }

  removeInvoice(index: number): void {
    if (index >= 0 && index < this.invoices.length) {
      this.invoices.splice(index, 1);
    }
  }

  getInvoices(): InvoiceData[] {
    return [...this.invoices];
  }

  searchInvoices(searchTerm: string): InvoiceData[] {
    if (!searchTerm) return this.getInvoices();
    
    const term = searchTerm.toLowerCase();
    return this.invoices.filter(invoice => {
      return (
        invoice.emisor.nombre.toLowerCase().includes(term) ||
        invoice.receptor.nombre.toLowerCase().includes(term) ||
        invoice.identificacion.codigoGeneracion.toLowerCase().includes(term)
      );
    });
  }

  getInvoiceById(id: string): InvoiceData | undefined {
    return this.invoices.find(invoice => invoice.identificacion.codigoGeneracion === id);
  }

  // Métodos para Firebase
  async saveInvoiceToFirebase(invoice: InvoiceData): Promise<string> {
    try {
      return await this.firebaseService.saveInvoice(invoice);
    } catch (error) {
      console.error('Error al guardar factura en Firebase:', error);
      throw error;
    }
  }

  async saveInvoicesToFirebase(invoices: InvoiceData[]): Promise<string[]> {
    try {
      return await this.firebaseService.importInvoicesFromJson(invoices);
    } catch (error) {
      console.error('Error al guardar facturas en Firebase:', error);
      throw error;
    }
  }

  async getInvoiceFromFirebase(id: string): Promise<InvoiceData | null> {
    try {
      const doc = await this.firebaseService.getInvoiceById(id);
      if (!doc) return null;
      return doc as unknown as InvoiceData;
    } catch (error) {
      console.error('Error al obtener factura de Firebase:', error);
      throw error;
    }
  }

  async getAllInvoicesFromFirebase(): Promise<InvoiceData[]> {
    try {
      const docs = await this.firebaseService.getAllInvoices();
      return docs as unknown as InvoiceData[];
    } catch (error) {
      console.error('Error al obtener todas las facturas de Firebase:', error);
      throw error;
    }
  }

  async updateInvoiceInFirebase(id: string, data: Partial<InvoiceData>): Promise<void> {
    try {
      await this.firebaseService.updateInvoice(id, data);
    } catch (error) {
      console.error('Error al actualizar factura en Firebase:', error);
      throw error;
    }
  }

  async deleteInvoiceFromFirebase(id: string): Promise<void> {
    try {
      await this.firebaseService.deleteInvoice(id);
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
      const docs = await this.firebaseService.searchInvoices(filters, sortBy);
      return docs as unknown as InvoiceData[];
    } catch (error) {
      console.error('Error al buscar facturas en Firebase:', error);
      throw error;
    }
  }
}
