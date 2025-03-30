import { FilterCondition, SortCondition } from '@/shared/utils/FirestoreService'; // Using alias
import { InvoiceData, InvoiceSummary } from '@/types/invoice'; // Using alias
import { PaginationOptions, PaginatedResult } from '@/types/firestore'; // Using alias
import { FirestoreService } from '@/shared/utils/FirestoreService';
// Keep Timestamp import for potential future use in date handling
import type { Timestamp } from 'firebase/firestore';

export class InvoiceService {
  private firestoreService: FirestoreService;
  private collectionName = 'invoices';

  constructor() {
    this.firestoreService = FirestoreService.getInstance(this.collectionName);
  }

  // Obtener una instancia singleton del servicio
  private static instance: InvoiceService;
  public static getInstance(): InvoiceService {
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

  // Obtener facturas con paginación, ordenamiento y filtros
  async getInvoices(
    pagination: PaginationOptions,
    sortBy: SortCondition[] = [],
    filters: FilterCondition[] = []
  ): Promise<PaginatedResult<InvoiceData>> {
    try {
      // Usar el FirestoreService genérico
      const paginatedResult = await this.firestoreService.getPaginated<InvoiceData>(
        pagination,
        sortBy,
        filters
      );
      return paginatedResult;
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      throw new Error(`Failed to fetch invoices: ${error.message}`);
    }
  }

  // Obtener el resumen de las facturas
  async getInvoiceSummary(): Promise<InvoiceSummary[]> {
    try {
      // Implementar lógica para obtener solo los campos necesarios para el resumen
      // Esto podría requerir una consulta específica o mapeo post-fetch
      const invoices = await this.firestoreService.getAll<InvoiceData>();
      return invoices.map(inv => ({
        id: inv.id!,
        numeroControl: inv.identificacion.numeroControl,
        fechaEmision: inv.identificacion.fecEmi, // Asegúrate que el tipo sea consistente
        receptorNombre: inv.receptor.nombre,
        montoTotal: inv.resumen.montoTotalOperacion,
        estado: 'Pendiente' // Lógica para determinar estado aquí
      }));
    } catch (error: any) {
      console.error('Error fetching invoice summary:', error);
      throw new Error(`Failed to fetch invoice summary: ${error.message}`);
    }
  }

  // Actualizar una factura existente
  async updateInvoice(id: string, data: Partial<InvoiceData>): Promise<void> {
    try {
      await this.firestoreService.update(id, data);
    } catch (error: any) {
      console.error(`Error updating invoice ${id}:`, error);
      throw new Error(`Failed to update invoice: ${error.message}`);
    }
  }

  // Eliminar una factura
  async deleteInvoice(id: string): Promise<void> {
    try {
      await this.firestoreService.delete(id);
    } catch (error: any) {
      console.error(`Error deleting invoice ${id}:`, error);
      throw new Error(`Failed to delete invoice: ${error.message}`);
    }
  }

  // Obtener todas las facturas (sin paginación, usar con precaución)
  async getAllInvoices(): Promise<InvoiceData[]> {
    try {
      return await this.firestoreService.getAll<InvoiceData>();
    } catch (error: any) {
      console.error('Error fetching all invoices:', error);
      throw new Error(`Failed to fetch all invoices: ${error.message}`);
    }
  }

  // Obtener una factura por ID
  async getInvoiceById(id: string): Promise<InvoiceData | null> {
    try {
      const data = await this.firestoreService.getById<InvoiceData>(id);
      return data ? { ...data, id } : null; // Agregar el ID al objeto
    } catch (error: any) {
      console.error(`Error fetching invoice ${id}:`, error);
      throw new Error(`Failed to fetch invoice by ID: ${error.message}`);
    }
  }

  // Agregar una nueva factura
  async addInvoice(data: Omit<InvoiceData, 'id'>): Promise<string> {
    try {
      // Create a copy of the data to avoid modifying the original
      const invoiceData = { ...data };
      
      // Handle date conversions if needed
      // Note: We're not directly modifying fecEmi as it should remain a string in the interface
      const processedData = {
        ...invoiceData,
        // Add any additional processing here if needed
      };

      return await this.firestoreService.add(processedData);
    } catch (error: any) {
      console.error('Error adding invoice:', error);
      throw new Error(`Failed to add invoice: ${error.message}`);
    }
  }

  // Método para obtener facturas con filtros avanzados
  async getInvoicesWithFilters(
    filters: FilterCondition[],
    sortBy: SortCondition[] = []
  ): Promise<InvoiceData[]> {
    try {
      return await this.firestoreService.getWithFilters<InvoiceData>(filters, sortBy);
    } catch (error: any) {
      console.error('Error fetching invoices with filters:', error);
      throw new Error(`Failed to fetch invoices with filters: ${error.message}`);
    }
  }

  // Método para contar facturas (opcional, depende de FirestoreService)
  async countInvoices(filters: FilterCondition[] = []): Promise<number> {
    try {
       // Asumiendo que FirestoreService tiene un método count
      return await this.firestoreService.count(filters);
    } catch (error: any) {
      console.error('Error counting invoices:', error);
      throw new Error(`Failed to count invoices: ${error.message}`);
    }
  }
}
