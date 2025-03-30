import { InvoiceData } from '../../../types/invoice';

export const extractField = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, part) => {
    if (acc === null || acc === undefined) return null;
    return acc[part];
  }, obj);
};

export const extractFields = (data: InvoiceData[], fields: string[]): any[] => {
  return data.map(item => {
    const extractedData: any = {};
    fields.forEach(field => {
      extractedData[field] = extractField(item, field);
    });
    return extractedData;
  });
};
