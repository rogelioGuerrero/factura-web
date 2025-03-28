import { DocumentData } from 'firebase/firestore';
import { FirestoreService, FirestoreDocument, FilterCondition, SortCondition } from './FirestoreService';
import { InvoiceData } from '../types/invoice';

export class InvoiceFirebaseService {
  private static instance: InvoiceFirebaseService;
  private firestoreService: FirestoreService;
  
  private constructor() {
    // Colección para facturas electrónicas
    this.firestoreService = FirestoreService.getInstance('invoices');
    console.log('InvoiceFirebaseService inicializado con colección: invoices');
  }
  
  static getInstance(): InvoiceFirebaseService {
    if (!InvoiceFirebaseService.instance) {
      InvoiceFirebaseService.instance = new InvoiceFirebaseService();
    }
    return InvoiceFirebaseService.instance;
  }
  
  // Guardar una factura en Firestore
  async saveInvoice(invoiceData: InvoiceData): Promise<string> {
    try {
      // Convertir de forma segura a FirestoreDocument
      const firestoreDoc = this.convertToFirestoreDocument(invoiceData as unknown as Record<string, unknown>);
      return await this.firestoreService.create(firestoreDoc);
    } catch (error) {
      console.error('Error al guardar factura:', error);
      throw error;
    }
  }
  
  // Obtener una factura por ID
  async getInvoiceById(id: string): Promise<DocumentData | null> {
    try {
      return await this.firestoreService.getById(id);
    } catch (error) {
      console.error('Error al obtener factura:', error);
      throw error;
    }
  }
  
  // Obtener todas las facturas
  async getAllInvoices(): Promise<DocumentData[]> {
    try {
      console.log('Solicitando todas las facturas desde Firebase...');
      const result = await this.firestoreService.getAll();
      console.log(`getAllInvoices: Se obtuvieron ${result.length} facturas`);
      return result;
    } catch (error) {
      console.error('Error al obtener todas las facturas:', error);
      throw error;
    }
  }
  
  // Buscar facturas con filtros
  async searchInvoices(
    filters: FilterCondition[] = [],
    sortBy: SortCondition[] = []
  ): Promise<DocumentData[]> {
    try {
      return await this.firestoreService.getWithFilters(filters, sortBy);
    } catch (error) {
      console.error('Error al buscar facturas:', error);
      throw error;
    }
  }
  
  // Actualizar una factura
  async updateInvoice(id: string, data: Partial<InvoiceData>): Promise<void> {
    try {
      // Convertir de forma segura a Partial<FirestoreDocument>
      const firestoreData = this.convertToFirestoreDocument(data as unknown as Record<string, unknown>);
      await this.firestoreService.update(id, firestoreData);
    } catch (error) {
      console.error('Error al actualizar factura:', error);
      throw error;
    }
  }
  
  // Eliminar una factura
  async deleteInvoice(id: string): Promise<void> {
    try {
      await this.firestoreService.delete(id);
    } catch (error) {
      console.error('Error al eliminar factura:', error);
      throw error;
    }
  }
  
  // Importar facturas desde archivos JSON
  async importInvoicesFromJson(jsonData: InvoiceData[]): Promise<string[]> {
    try {
      // Convertir cada elemento del array de forma segura
      const firestoreDocs = jsonData.map(item => 
        this.convertToFirestoreDocument(item as unknown as Record<string, unknown>)
      );
      return await this.firestoreService.importJsonData(firestoreDocs);
    } catch (error) {
      console.error('Error al importar facturas desde JSON:', error);
      throw error;
    }
  }

  // Método auxiliar para convertir de forma segura a FirestoreDocument
  private convertToFirestoreDocument(data: Record<string, unknown>): FirestoreDocument {
    // Crear un nuevo objeto que cumple con la interfaz FirestoreDocument
    const firestoreDoc: FirestoreDocument = {};
    
    // Copiar todas las propiedades
    Object.entries(data).forEach(([key, value]) => {
      firestoreDoc[key] = value;
    });
    
    return firestoreDoc;
  }
}
