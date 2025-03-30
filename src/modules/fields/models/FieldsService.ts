// Modelo para la gestión de campos

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { FieldConfig } from '../types/field';

/**
 * Servicio para gestionar los campos de la aplicación
 */
export class FieldsService {
  private static instance: FieldsService;
  
  // Constante para el ID del documento en Firestore
  private FIELDS_DOCUMENT_ID = 'global_fields_config';
  private FIELDS_COLLECTION = 'fields_config';
  
  private constructor() {}
  
  public static getInstance(): FieldsService {
    if (!FieldsService.instance) {
      FieldsService.instance = new FieldsService();
    }
    return FieldsService.instance;
  }
  
  /**
   * Guarda la configuración de campos en Firestore
   */
  saveFieldsConfig = async (_userId: string, fields: FieldConfig[]): Promise<void> => {
    try {
      console.log(`FieldsService: Guardando configuración en Firestore`);
      console.log(`FieldsService: Total de campos a guardar: ${fields.length}`);
      console.log(`FieldsService: Campos seleccionados: ${fields.filter(f => f.selected).length}`);
      
      // Guardar en Firestore
      const docRef = doc(db, this.FIELDS_COLLECTION, this.FIELDS_DOCUMENT_ID);
      await setDoc(docRef, { fields });
      
      console.log(`FieldsService: Configuración guardada en Firestore correctamente`);
      
      return Promise.resolve();
    } catch (error) {
      console.error('FieldsService: Error al guardar configuración de campos:', error);
      return Promise.reject(error);
    }
  };

  /**
   * Obtiene la configuración de campos desde Firestore
   */
  getFieldsConfig = async (_userId?: string): Promise<FieldConfig[]> => {
    try {
      console.log(`FieldsService: Obteniendo configuración desde Firestore`);
      
      // Obtener de Firestore
      const docRef = doc(db, this.FIELDS_COLLECTION, this.FIELDS_DOCUMENT_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const fields = data.fields as FieldConfig[];
        
        console.log(`FieldsService: Configuración encontrada con ${fields.length} campos`);
        console.log(`FieldsService: Campos seleccionados: ${fields.filter(f => f.selected).length}`);
        
        return Promise.resolve(fields);
      } else {
        console.log(`FieldsService: No se encontró configuración en Firestore, devolviendo campos predeterminados`);
        return Promise.resolve(this.getDefaultFieldsConfig());
      }
    } catch (error) {
      console.error('FieldsService: Error al obtener configuración de campos:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Obtiene la configuración predeterminada de campos
   * @returns Configuración predeterminada
   */
  getDefaultFieldsConfig(): FieldConfig[] {
    // Campos predeterminados basados en el archivo de ejemplo JSON
    return [
      // Identificación
      { id: 'identificacion.codigoGeneracion', label: 'Código de Generación', selected: true, category: 'identificacion', order: 1 },
      { id: 'identificacion.fecEmi', label: 'Fecha de Emisión', selected: true, category: 'identificacion', order: 2 },
      { id: 'identificacion.tipoDte', label: 'Tipo de Documento', selected: true, category: 'identificacion', order: 3 },
      { id: 'identificacion.numeroControl', label: 'Número de Control', selected: true, category: 'identificacion', order: 4 },
      { id: 'identificacion.selloRecibido', label: 'Sello Recibido', selected: true, category: 'identificacion', order: 5 },
      { id: 'identificacion.horEmi', label: 'Hora de Emisión', selected: false, category: 'identificacion', order: 6 },
      { id: 'identificacion.tipoModelo', label: 'Tipo de Modelo', selected: false, category: 'identificacion', order: 7 },
      { id: 'identificacion.tipoOperacion', label: 'Tipo de Operación', selected: false, category: 'identificacion', order: 8 },
      { id: 'identificacion.tipoMoneda', label: 'Tipo de Moneda', selected: false, category: 'identificacion', order: 9 },
      { id: 'identificacion.version', label: 'Versión', selected: false, category: 'identificacion', order: 10 },
      { id: 'identificacion.ambiente', label: 'Ambiente', selected: false, category: 'identificacion', order: 11 },
      
      // Emisor
      { id: 'emisor.nombre', label: 'Nombre del Emisor', selected: true, category: 'emisor', order: 12 },
      { id: 'emisor.nit', label: 'NIT Emisor', selected: true, category: 'emisor', order: 13 },
      { id: 'emisor.nrc', label: 'NRC Emisor', selected: true, category: 'emisor', order: 14 },
      { id: 'emisor.codActividad', label: 'Código de Actividad', selected: false, category: 'emisor', order: 15 },
      { id: 'emisor.descActividad', label: 'Descripción de Actividad', selected: false, category: 'emisor', order: 16 },
      { id: 'emisor.tipoEstablecimiento', label: 'Tipo de Establecimiento', selected: false, category: 'emisor', order: 17 },
      { id: 'emisor.telefono', label: 'Teléfono Emisor', selected: false, category: 'emisor', order: 18 },
      { id: 'emisor.correo', label: 'Correo Emisor', selected: false, category: 'emisor', order: 19 },
      { id: 'emisor.direccion.departamento', label: 'Departamento Emisor', selected: false, category: 'emisor', order: 20 },
      { id: 'emisor.direccion.municipio', label: 'Municipio Emisor', selected: false, category: 'emisor', order: 21 },
      { id: 'emisor.direccion.complemento', label: 'Dirección Emisor', selected: false, category: 'emisor', order: 22 },
      
      // Receptor
      { id: 'receptor.nombre', label: 'Nombre del Receptor', selected: true, category: 'receptor', order: 23 },
      { id: 'receptor.nit', label: 'NIT Receptor', selected: true, category: 'receptor', order: 24 },
      { id: 'receptor.nrc', label: 'NRC Receptor', selected: true, category: 'receptor', order: 25 },
      { id: 'receptor.codActividad', label: 'Código de Actividad Receptor', selected: false, category: 'receptor', order: 26 },
      { id: 'receptor.descActividad', label: 'Descripción de Actividad Receptor', selected: false, category: 'receptor', order: 27 },
      { id: 'receptor.nombreComercial', label: 'Nombre Comercial Receptor', selected: false, category: 'receptor', order: 28 },
      { id: 'receptor.telefono', label: 'Teléfono Receptor', selected: false, category: 'receptor', order: 29 },
      { id: 'receptor.correo', label: 'Correo Receptor', selected: false, category: 'receptor', order: 30 },
      { id: 'receptor.direccion.departamento', label: 'Departamento Receptor', selected: false, category: 'receptor', order: 31 },
      { id: 'receptor.direccion.municipio', label: 'Municipio Receptor', selected: false, category: 'receptor', order: 32 },
      { id: 'receptor.direccion.complemento', label: 'Dirección Receptor', selected: false, category: 'receptor', order: 33 },
      
      // Detalles del Item
      { id: 'cuerpoDocumento.0.descripcion', label: 'Descripción', selected: true, category: 'detalles', order: 34 },
      { id: 'cuerpoDocumento.0.cantidad', label: 'Cantidad', selected: true, category: 'detalles', order: 35 },
      { id: 'cuerpoDocumento.0.precioUni', label: 'Precio Unitario', selected: true, category: 'detalles', order: 36 },
      { id: 'cuerpoDocumento.0.ventaGravada', label: 'Venta Gravada', selected: true, category: 'detalles', order: 37 },
      { id: 'cuerpoDocumento.0.numItem', label: 'Número de Item', selected: false, category: 'detalles', order: 38 },
      { id: 'cuerpoDocumento.0.tipoItem', label: 'Tipo de Item', selected: false, category: 'detalles', order: 39 },
      { id: 'cuerpoDocumento.0.uniMedida', label: 'Unidad de Medida', selected: false, category: 'detalles', order: 40 },
      { id: 'cuerpoDocumento.0.montoDescu', label: 'Monto Descuento', selected: false, category: 'detalles', order: 41 },
      { id: 'cuerpoDocumento.0.ventaNoSuj', label: 'Venta No Sujeta', selected: false, category: 'detalles', order: 42 },
      { id: 'cuerpoDocumento.0.ventaExenta', label: 'Venta Exenta', selected: false, category: 'detalles', order: 43 },
      { id: 'cuerpoDocumento.0.tributos', label: 'Tributos', selected: false, category: 'detalles', order: 44 },
      
      // Resumen
      { id: 'resumen.totalGravada', label: 'Total Gravada', selected: true, category: 'resumen', order: 45 },
      { id: 'resumen.montoTotalOperacion', label: 'Monto Total Operación', selected: true, category: 'resumen', order: 46 },
      { id: 'resumen.totalPagar', label: 'Total a Pagar', selected: true, category: 'resumen', order: 47 },
      { id: 'resumen.totalExenta', label: 'Total Exenta', selected: false, category: 'resumen', order: 48 },
      { id: 'resumen.totalNoSuj', label: 'Total No Sujeta', selected: false, category: 'resumen', order: 49 },
      { id: 'resumen.subTotalVentas', label: 'Subtotal Ventas', selected: false, category: 'resumen', order: 50 },
      { id: 'resumen.totalDescu', label: 'Total Descuento', selected: false, category: 'resumen', order: 51 },
      { id: 'resumen.subTotal', label: 'Subtotal', selected: false, category: 'resumen', order: 52 },
      { id: 'resumen.totalLetras', label: 'Total en Letras', selected: false, category: 'resumen', order: 53 },
      { id: 'resumen.condicionOperacion', label: 'Condición de Operación', selected: false, category: 'resumen', order: 54 },
      { id: 'resumen.tributos.0.descripcion', label: 'Descripción de Tributo', selected: false, category: 'resumen', order: 55 },
      { id: 'resumen.tributos.0.valor', label: 'Valor de Tributo', selected: false, category: 'resumen', order: 56 },
      { id: 'resumen.pagos.0.codigo', label: 'Código de Pago', selected: false, category: 'resumen', order: 57 },
      { id: 'resumen.pagos.0.montoPago', label: 'Monto de Pago', selected: false, category: 'resumen', order: 58 }
    ];
  }
  
  /**
   * Reordena los campos según el orden especificado
   * @param fields Campos a reordenar
   * @returns Campos reordenados con órdenes actualizados
   */
  reorderFields(fields: FieldConfig[]): FieldConfig[] {
    return fields.map((field, index) => ({
      ...field,
      order: index + 1
    }));
  }
  
  /**
   * Analiza un objeto JSON para detectar campos
   * @param jsonData Datos JSON a analizar
   * @param existingFields Campos existentes para comparar
   * @returns Lista de campos nuevos encontrados
   */
  detectNewFields(jsonData: any, existingFields: FieldConfig[]): FieldConfig[] {
    const newFields: FieldConfig[] = [];
    const existingIds = existingFields.map(field => field.id);
    
    // Función recursiva para explorar el objeto JSON
    const exploreObject = (obj: any, path: string = '', category: string = 'otros') => {
      if (!obj || typeof obj !== 'object') return;
      
      // Si es un array, exploramos cada elemento
      if (Array.isArray(obj)) {
        // Solo exploramos el primer elemento del array como muestra
        if (obj.length > 0) {
          exploreObject(obj[0], `${path}.0`, category);
        }
        return;
      }
      
      // Exploramos cada propiedad del objeto
      Object.keys(obj).forEach(key => {
        const newPath = path ? `${path}.${key}` : key;
        
        // Determinamos la categoría basada en la ruta
        let newCategory = category;
        if (newPath.startsWith('identificacion')) newCategory = 'identificacion';
        else if (newPath.startsWith('emisor')) newCategory = 'emisor';
        else if (newPath.startsWith('receptor')) newCategory = 'receptor';
        else if (newPath.startsWith('cuerpoDocumento')) newCategory = 'detalles';
        else if (newPath.startsWith('resumen')) newCategory = 'resumen';
        
        // Si es un valor primitivo y no existe en los campos actuales, lo añadimos
        if (
          (typeof obj[key] === 'string' || 
           typeof obj[key] === 'number' || 
           typeof obj[key] === 'boolean') && 
          !existingIds.includes(newPath)
        ) {
          // Convertimos el ID técnico a una etiqueta legible
          const label = this.pathToLabel(key);
          
          newFields.push({
            id: newPath,
            label,
            selected: false,
            category: newCategory,
            order: existingFields.length + newFields.length + 1
          });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          // Si es un objeto, seguimos explorando recursivamente
          exploreObject(obj[key], newPath, newCategory);
        }
      });
    };
    
    exploreObject(jsonData);
    return newFields;
  }
  
  /**
   * Convierte un path técnico a una etiqueta legible
   * @param path Path técnico (ej: "codigoGeneracion")
   * @returns Etiqueta legible (ej: "Código de Generación")
   */
  pathToLabel(path: string): string {
    // Separamos por puntos y tomamos la última parte
    const parts = path.split('.');
    const lastPart = parts[parts.length - 1];
    
    // Eliminamos números y caracteres especiales
    const cleaned = lastPart.replace(/[0-9\[\]]/g, '');
    
    // Separamos por mayúsculas y convertimos a título
    return cleaned
      // Insertamos espacios antes de las mayúsculas
      .replace(/([A-Z])/g, ' $1')
      // Convertimos la primera letra a mayúscula
      .replace(/^./, str => str.toUpperCase())
      // Eliminamos espacios extra
      .trim();
  }
  
  /**
   * Añade un campo personalizado a la configuración
   * @param fields Configuración actual de campos
   * @param id ID técnico del campo
   * @param label Etiqueta para mostrar
   * @param category Categoría del campo
   * @returns Configuración actualizada con el nuevo campo
   */
  addCustomField(
    fields: FieldConfig[], 
    id: string, 
    label: string, 
    category: string = 'otros'
  ): FieldConfig[] {
    // Verificamos si el campo ya existe
    if (fields.some(field => field.id === id)) {
      return fields;
    }
    
    // Añadimos el nuevo campo
    return [
      ...fields,
      {
        id,
        label,
        selected: true,
        category,
        order: fields.length + 1,
        isCustom: true
      }
    ];
  }
  
  /**
   * Actualiza la configuración de campos con nuevos campos detectados
   * @param existingFields Campos existentes
   * @param newFields Nuevos campos detectados
   * @returns Configuración actualizada
   */
  mergeFields(existingFields: FieldConfig[], newFields: FieldConfig[]): FieldConfig[] {
    // Si no hay campos nuevos, devolvemos los existentes
    if (newFields.length === 0) {
      return existingFields;
    }
    
    // Combinamos los campos existentes con los nuevos
    return [
      ...existingFields,
      ...newFields
    ];
  }
}
