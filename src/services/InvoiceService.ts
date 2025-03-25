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

  // Procesar JSON desde una URL
  async processJsonFromUrl(url: string): Promise<InvoiceData[]> {
    try {
      // Verificar si la URL termina en .json (archivo individual)
      if (url.toLowerCase().endsWith('.json')) {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error al obtener el archivo: ${response.status} ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        // Verificar si es un array de facturas o una factura individual
        if (Array.isArray(jsonData)) {
          return jsonData as InvoiceData[];
        } else {
          return [jsonData as InvoiceData];
        }
      } 
      // Si no termina en .json, intentar obtener un listado de archivos (si es una API o directorio)
      else {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error al obtener el directorio: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Intentar determinar si es un listado de archivos o una respuesta de API
        if (Array.isArray(data)) {
          // Asumimos que puede ser un array de URLs o un array de facturas directamente
          const invoices: InvoiceData[] = [];
          
          // Verificar si son URLs o facturas directamente
          for (const item of data) {
            if (typeof item === 'string' && item.toLowerCase().endsWith('.json')) {
              // Es una URL a un archivo JSON
              const fileResponse = await fetch(item);
              if (fileResponse.ok) {
                const invoiceData = await fileResponse.json();
                invoices.push(invoiceData as InvoiceData);
              }
            } else if (typeof item === 'object' && item !== null) {
              // Asumimos que es una factura directamente
              if (this.isValidInvoice(item)) {
                invoices.push(item as InvoiceData);
              }
            }
          }
          
          return invoices;
        } else if (typeof data === 'object' && data !== null) {
          // Podría ser una respuesta de API con una estructura específica
          // Intentamos buscar arrays en las propiedades del objeto
          for (const key in data) {
            if (Array.isArray(data[key])) {
              const possibleInvoices = data[key].filter((item: unknown) => this.isValidInvoice(item));
              if (possibleInvoices.length > 0) {
                return possibleInvoices as InvoiceData[];
              }
            }
          }
          
          // Si llegamos aquí, verificamos si el objeto mismo es una factura
          if (this.isValidInvoice(data)) {
            return [data as InvoiceData];
          }
        }
        
        throw new Error('No se encontraron facturas válidas en la URL proporcionada');
      }
    } catch (error) {
      console.error('Error al procesar JSON desde URL:', error);
      throw error;
    }
  }

  // Verificar si un objeto tiene la estructura básica de una factura
  private isValidInvoice(obj: unknown): boolean {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      'identificacion' in obj &&
      'emisor' in obj &&
      'receptor' in obj &&
      'cuerpoDocumento' in obj &&
      'resumen' in obj
    );
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
      console.log(`Intentando eliminar factura con ID: ${id}`);
      await this.firebaseService.deleteInvoiceByCodigoGeneracion(id);
      console.log(`Factura con ID ${id} eliminada correctamente`);
    } catch (error) {
      console.error('Error al eliminar factura de Firebase:', error);
      throw error;
    }
  }

  async invoiceExistsInFirebase(codigoGeneracion: string): Promise<boolean> {
    try {
      const invoice = await this.firebaseService.getInvoiceByCodigoGeneracion(codigoGeneracion);
      return invoice !== null;
    } catch (error) {
      console.error('Error al verificar si la factura existe en Firebase:', error);
      return false; // En caso de error, asumimos que no existe
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
