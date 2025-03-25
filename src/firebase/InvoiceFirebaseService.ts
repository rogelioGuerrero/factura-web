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
      // Extraer el código de generación
      const codigoGeneracion = invoiceData.identificacion.codigoGeneracion;
      console.log(`Intentando guardar factura con código: ${codigoGeneracion}`);
      
      // Verificar si la factura ya existe por su código de generación
      const existingInvoice = await this.getInvoiceByCodigoGeneracion(codigoGeneracion);
      if (existingInvoice) {
        console.log(`La factura con código ${codigoGeneracion} ya existe en Firestore con ID: ${existingInvoice.id}`);
        return existingInvoice.id as string;
      }

      // Convertir de forma segura a FirestoreDocument
      const firestoreDoc = this.convertToFirestoreDocument(invoiceData as unknown as Record<string, unknown>);
      
      // Añadir el código de generación como campo de búsqueda a nivel raíz del documento
      firestoreDoc.codigoGeneracion = codigoGeneracion;
      
      // Guardar el documento en Firestore
      const id = await this.firestoreService.create(firestoreDoc);
      console.log(`Factura con código ${codigoGeneracion} guardada exitosamente con ID: ${id}`);
      
      return id;
    } catch (error) {
      console.error(`Error al guardar factura con código ${invoiceData.identificacion.codigoGeneracion}:`, error);
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
  
  // Buscar una factura por su código de generación
  async getInvoiceByCodigoGeneracion(codigoGeneracion: string): Promise<DocumentData | null> {
    try {
      console.log(`Buscando factura con código de generación: ${codigoGeneracion}`);
      
      const filters: FilterCondition[] = [
        {
          field: 'codigoGeneracion',
          operator: '==',
          value: codigoGeneracion
        }
      ];
      
      const results = await this.firestoreService.getWithFilters(filters);
      console.log(`Se encontraron ${results.length} facturas con código ${codigoGeneracion}`);
      
      if (results.length > 0) {
        console.log(`Factura encontrada con ID: ${results[0].id}`);
        return results[0];
      }
      
      console.log(`No se encontró factura con código ${codigoGeneracion}`);
      return null;
    } catch (error) {
      console.error('Error al buscar factura por código de generación:', error);
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
  
  // Eliminar una factura por su código de generación
  async deleteInvoiceByCodigoGeneracion(codigoGeneracion: string): Promise<void> {
    try {
      console.log(`Buscando factura con código de generación: ${codigoGeneracion}`);
      
      // Buscar la factura por su código de generación
      const filters: FilterCondition[] = [
        {
          field: 'codigoGeneracion',
          operator: '==',
          value: codigoGeneracion
        }
      ];
      
      const results = await this.firestoreService.getWithFilters(filters);
      console.log(`Se encontraron ${results.length} facturas con código ${codigoGeneracion}`);
      
      if (results.length > 0) {
        const invoice = results[0];
        console.log(`Eliminando factura con ID ${invoice.id} (código ${codigoGeneracion})`);
        await this.firestoreService.delete(invoice.id as string);
        console.log(`Factura con ID ${invoice.id} eliminada correctamente`);
      } else {
        console.warn(`No se encontró factura con código ${codigoGeneracion} para eliminar`);
      }
    } catch (error) {
      console.error(`Error al eliminar factura con código ${codigoGeneracion}:`, error);
      throw error;
    }
  }
  
  // Importar facturas desde archivos JSON
  async importInvoicesFromJson(jsonData: InvoiceData[]): Promise<string[]> {
    try {
      const ids: string[] = [];
      
      // Procesar cada elemento del JSON
      for (const invoice of jsonData) {
        // Verificar si la factura ya existe por su código de generación
        const codigoGeneracion = invoice.identificacion.codigoGeneracion;
        const existingInvoice = await this.getInvoiceByCodigoGeneracion(codigoGeneracion);
        
        if (existingInvoice) {
          console.log(`La factura con código ${codigoGeneracion} ya existe en Firestore, omitiendo`);
          if (existingInvoice.id) {
            ids.push(existingInvoice.id as string);
          }
          continue;
        }
        
        // Convertir de forma segura a FirestoreDocument
        const firestoreDoc = this.convertToFirestoreDocument(invoice as unknown as Record<string, unknown>);
        
        // Añadir el código de generación como campo de búsqueda
        firestoreDoc.codigoGeneracion = codigoGeneracion;
        
        const id = await this.firestoreService.create(firestoreDoc);
        ids.push(id);
        console.log(`Factura con código ${codigoGeneracion} guardada con ID ${id}`);
      }
      
      return ids;
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
