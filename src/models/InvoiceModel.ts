import { InvoiceData } from '../types/invoice';

export class InvoiceModel {
  private static instance: InvoiceModel;
  private invoices: InvoiceData[] = [];

  private constructor() {}

  static getInstance(): InvoiceModel {
    if (!InvoiceModel.instance) {
      InvoiceModel.instance = new InvoiceModel();
    }
    return InvoiceModel.instance;
  }

  getInvoices(): InvoiceData[] {
    return this.invoices;
  }

  addInvoices(newInvoices: InvoiceData[]): void {
    this.invoices = [...this.invoices, ...newInvoices];
  }

  removeInvoice(index: number): void {
    this.invoices = this.invoices.filter((_, i) => i !== index);
  }

  clearInvoices(): void {
    this.invoices = [];
  }

  getInvoiceById(id: string): InvoiceData | undefined {
    return this.invoices.find(invoice => 
      invoice.identificacion.codigoGeneracion === id || 
      invoice.identificacion.numeroControl === id
    );
  }

  searchInvoices(searchTerm: string): InvoiceData[] {
    if (!searchTerm.trim()) return this.invoices;
    
    const term = searchTerm.toLowerCase();
    return this.invoices.filter(invoice => {
      const codigoGeneracion = invoice.identificacion?.codigoGeneracion?.toLowerCase() || '';
      const numeroControl = invoice.identificacion?.numeroControl?.toLowerCase() || '';
      const emisorNombre = invoice.emisor?.nombre?.toLowerCase() || '';
      const receptorNombre = invoice.receptor?.nombre?.toLowerCase() || '';
      
      return codigoGeneracion.includes(term) ||
             numeroControl.includes(term) ||
             emisorNombre.includes(term) ||
             receptorNombre.includes(term);
    });
  }
}
