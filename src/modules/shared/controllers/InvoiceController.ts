import { InvoiceData, ProcessResult } from '../../../types/invoice';
import { FieldSelectionController } from './FieldSelectionController';
import { InvoiceService } from '@/modules/invoices/models/InvoiceService';

export class InvoiceController {
  private fieldController: FieldSelectionController;
  private invoiceService: InvoiceService;

  constructor() {
    this.fieldController = new FieldSelectionController();
    this.invoiceService = InvoiceService.getInstance();
  }

  /**
   * Verifica si una factura con el código de generación dado ya existe en la base de datos
   * @param codigoGeneracion El código de generación de la factura a verificar
   * @returns true si la factura ya existe, false si no
   */
  async checkDuplicateInvoice(codigoGeneracion: string): Promise<boolean> {
    try {
      const existingInvoices = await this.invoiceService.getInvoicesWithFilters([
        {
          field: 'identificacion.codigoGeneracion',
          operator: '==',
          value: codigoGeneracion
        }
      ]);
      
      return existingInvoices && existingInvoices.length > 0;
    } catch (error) {
      console.error('Error al verificar duplicados:', error);
      return false; // En caso de error, asumimos que no es duplicado
    }
  }

  async processFiles(files: File[]): Promise<ProcessResult> {
    const results: InvoiceData[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const duplicates: string[] = [];
    const duplicateDetails: {fileName: string, code: string}[] = [];

    // Filter files to only process JSON files
    const jsonFiles = Array.from(files).filter(file => 
      file.name.toLowerCase().endsWith('.json')
    );
    
    // Add warnings for non-JSON files
    const nonJsonFiles = Array.from(files).filter(file => 
      !file.name.toLowerCase().endsWith('.json')
    );
    
    if (nonJsonFiles.length > 0) {
      const fileNames = nonJsonFiles.map(f => f.name).join(', ');
      warnings.push(`Archivos ignorados (no son JSON): ${fileNames}`);
    }

    if (jsonFiles.length === 0) {
      throw new Error('No se encontraron archivos JSON para procesar');
    }

    // Process JSON files
    for (const file of jsonFiles) {
      try {
        const content = await this.readFileContent(file);
        
        // Validate JSON format
        let data: InvoiceData;
        try {
          data = JSON.parse(content) as InvoiceData;
        } catch (parseError) {
          errors.push(`Error al procesar ${file.name}: Formato JSON inválido`);
          continue;
        }
        
        // Check if invoice already exists in Firebase
        if (data.identificacion?.codigoGeneracion) {
          if (await this.checkDuplicateInvoice(data.identificacion.codigoGeneracion)) {
            duplicates.push(file.name);
            duplicateDetails.push({
              fileName: file.name,
              code: data.identificacion.codigoGeneracion
            });
            continue; // Skip further processing of this file
          }
        }
        
        // Validate invoice structure
        const validation = this.fieldController.validateData(data);
        if (!validation.isValid) {
          // Check if the only error is related to Total IVA
          const ivaErrors = validation.errors.filter(error => 
            error.includes('totalIVA') || error.includes('totalIva')
          );
          
          if (ivaErrors.length === validation.errors.length) {
            // If all errors are related to IVA field, try to fix it
            if (this.fixTotalIvaField(data)) {
              // If fixed, add to results with a warning
              results.push(data);
              warnings.push(`Advertencia en ${file.name}: Campo "Total IVA" corregido automáticamente`);
            } else {
              errors.push(`Error en ${file.name}: ${validation.errors.join(', ')}`);
            }
          } else {
            errors.push(`Error en ${file.name}: ${validation.errors.join(', ')}`);
          }
          continue;
        }

        results.push(data);
      } catch (error) {
        errors.push(`Error al procesar ${file.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }

    // If there were duplicates but no errors, add a summary warning
    if (duplicates.length > 0) {
      // Add a more user-friendly summary for large numbers of duplicates
      if (duplicates.length > 5) {
        warnings.push(`Se encontraron ${duplicates.length} archivos duplicados que ya existen en la base de datos.`);
        
        // Add a sample of the duplicates
        const sampleSize = Math.min(3, duplicates.length);
        const sample = duplicateDetails.slice(0, sampleSize);
        const sampleText = sample.map(d => `${d.fileName} (${d.code})`).join('\n• ');
        
        warnings.push(`Ejemplos de archivos duplicados:\n• ${sampleText}\n\n...y ${duplicates.length - sampleSize} más`);
      } else {
        // For a small number of duplicates, list them all
        const detailedList = duplicateDetails.map(d => 
          `El archivo ${d.fileName} (código: ${d.code}) ya existe en la base de datos`
        ).join('\n');
        
        warnings.push(detailedList);
        warnings.push(`Se encontraron ${duplicates.length} archivo(s) duplicado(s): ${duplicates.join(', ')}`);
      }
    }

    return { data: results, warnings };
  }

  async processUrl(url: string): Promise<ProcessResult> {
    try {
      // Validate URL format
      if (!this.isValidUrl(url)) {
        throw new Error('URL inválida. Debe comenzar con http:// o https://');
      }

      const invoices = await this.invoiceService.processJsonFromUrl(url);
      
      // If no invoices were found, return an error
      if (!invoices || invoices.length === 0) {
        throw new Error('No se encontraron facturas válidas en la URL proporcionada');
      }
      
      const validInvoices: InvoiceData[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];
      const duplicates: string[] = [];
      const duplicateDetails: {identifier: string, code: string}[] = [];

      for (const invoice of invoices) {
        // Check if invoice already exists in Firebase
        if (invoice.identificacion?.codigoGeneracion) {
          if (await this.checkDuplicateInvoice(invoice.identificacion.codigoGeneracion)) {
            const identifier = invoice.identificacion.numeroControl || invoice.identificacion.codigoGeneracion;
            duplicates.push(identifier);
            duplicateDetails.push({
              identifier,
              code: invoice.identificacion.codigoGeneracion
            });
            continue; // Skip further processing of this invoice
          }
        }
        
        const validation = this.fieldController.validateData(invoice);
        if (!validation.isValid) {
          // Check if the only error is related to Total IVA
          const ivaErrors = validation.errors.filter(error => 
            error.includes('totalIVA') || error.includes('totalIva')
          );
          
          if (ivaErrors.length === validation.errors.length) {
            // If all errors are related to IVA field, try to fix it
            if (this.fixTotalIvaField(invoice)) {
              // If fixed, add to results with a warning
              const identifier = invoice.identificacion?.numeroControl || 'desconocida';
              validInvoices.push(invoice);
              warnings.push(`Advertencia en factura ${identifier}: Campo "Total IVA" corregido automáticamente`);
            } else {
              const identifier = invoice.identificacion?.numeroControl || 'desconocida';
              errors.push(`Error en factura ${identifier}: ${validation.errors.join(', ')}`);
            }
          } else {
            const identifier = invoice.identificacion?.numeroControl || 'desconocida';
            errors.push(`Error en factura ${identifier}: ${validation.errors.join(', ')}`);
          }
          continue;
        }
        validInvoices.push(invoice);
      }

      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }

      // If there were duplicates but no errors, add a summary warning
      if (duplicates.length > 0) {
        // Add a more user-friendly summary for large numbers of duplicates
        if (duplicates.length > 5) {
          warnings.push(`Se encontraron ${duplicates.length} facturas duplicadas que ya existen en la base de datos.`);
          
          // Add a sample of the duplicates
          const sampleSize = Math.min(3, duplicates.length);
          const sample = duplicateDetails.slice(0, sampleSize);
          const sampleText = sample.map(d => `Factura ${d.identifier} (código: ${d.code})`).join('\n• ');
          
          warnings.push(`Ejemplos de facturas duplicadas:\n• ${sampleText}\n\n...y ${duplicates.length - sampleSize} más`);
        } else {
          // For a small number of duplicates, list them all
          const detailedList = duplicateDetails.map(d => 
            `La factura ${d.identifier} (código: ${d.code}) ya existe en la base de datos`
          ).join('\n');
          
          warnings.push(detailedList);
          warnings.push(`Se encontraron ${duplicates.length} factura(s) duplicada(s): ${duplicates.join(', ')}`);
        }
      }

      return { data: validInvoices, warnings };
    } catch (error) {
      throw new Error(`Error al procesar URL: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Intenta corregir el campo Total IVA en la factura
   * @param invoice Datos de la factura
   * @returns true si se pudo corregir, false si no
   */
  private fixTotalIvaField(invoice: InvoiceData): boolean {
    try {
      if (!invoice.resumen) {
        invoice.resumen = {} as any; // Forzar el tipo para evitar errores
        return false;
      }

      // Si existe totalIva pero no totalIVA, copiar el valor
      if (invoice.resumen.totalIva !== undefined && invoice.resumen.totalIVA === undefined) {
        invoice.resumen.totalIVA = invoice.resumen.totalIva;
        return true;
      }

      // Si existe totalIVA pero no totalIva, copiar el valor
      if (invoice.resumen.totalIVA !== undefined && invoice.resumen.totalIva === undefined) {
        invoice.resumen.totalIva = invoice.resumen.totalIVA;
        return true;
      }

      // Si no existe ninguno, intentar calcularlo a partir de otros campos
      if (invoice.resumen.totalIVA === undefined && invoice.resumen.totalIva === undefined) {
        // Verificar si hay tributos y buscar el IVA (código 20)
        if (invoice.resumen.tributos && Array.isArray(invoice.resumen.tributos)) {
          const ivaTributo = invoice.resumen.tributos.find(tributo => 
            tributo.codigo === '20' || 
            (tributo.descripcion && tributo.descripcion.toLowerCase().includes('iva'))
          );
          
          if (ivaTributo && ivaTributo.valor !== undefined) {
            invoice.resumen.totalIVA = ivaTributo.valor;
            invoice.resumen.totalIva = ivaTributo.valor;
            return true;
          }
        }
        
        // Si hay información de impuestos, intentar calcular el IVA
        if (invoice.resumen.totalImpuestos !== undefined) {
          invoice.resumen.totalIVA = invoice.resumen.totalImpuestos;
          invoice.resumen.totalIva = invoice.resumen.totalImpuestos;
          return true;
        }
        
        // Si hay información de montos, intentar calcular el IVA (asumiendo 16%)
        if (invoice.resumen.montoTotal !== undefined && invoice.resumen.montoGravable !== undefined) {
          const iva = invoice.resumen.montoTotal - invoice.resumen.montoGravable;
          if (iva >= 0) {
            invoice.resumen.totalIVA = iva;
            invoice.resumen.totalIva = iva;
            return true;
          }
        }
        
        // Intentar calcular del montoTotalOperacion y totalGravada (si existe)
        if (invoice.resumen.montoTotalOperacion !== undefined && invoice.resumen.totalGravada !== undefined) {
          const iva = invoice.resumen.montoTotalOperacion - invoice.resumen.totalGravada;
          if (iva >= 0) {
            invoice.resumen.totalIVA = iva;
            invoice.resumen.totalIva = iva;
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Error al corregir el campo Total IVA:', error);
      return false;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Error al leer el archivo'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      
      reader.readAsText(file);
    });
  }
}
