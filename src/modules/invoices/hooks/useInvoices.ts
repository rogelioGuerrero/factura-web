import { useState, useEffect, useCallback } from 'react';
import { InvoiceService } from '../models/InvoiceService';
import { InvoiceData } from '@/types/invoice';
import { FilterCondition, SortCondition } from '@/shared/utils/FirestoreService';
import { PaginationOptions } from '@/types/firestore';

export interface UseInvoicesOptions {
  initialPage?: number;
  pageSize?: number;
  initialSortBy?: SortCondition[];
  initialFilters?: FilterCondition[];
}

export function useInvoices(options: UseInvoicesOptions = {}) {
  const {
    initialPage = 1,
    pageSize = 10,
    initialSortBy = [],
    initialFilters = []
  } = options;

  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: initialPage,
    pageSize,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState<SortCondition[]>(initialSortBy);
  const [filters, setFilters] = useState<FilterCondition[]>(initialFilters);

  const invoiceService = InvoiceService.getInstance();

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convertir página a límite y startAfter para Firestore
      const firestorePagination: PaginationOptions = {
        pageSize: pagination.pageSize,
        page: pagination.page
      };
      
      console.log('Cargando facturas con paginación:', firestorePagination);
      
      const result = await invoiceService.getInvoices(firestorePagination, sortBy, filters);
      
      // Verificar si hay datos
      if (result.data.length === 0 && (result.totalCount ?? 0) > 0 && pagination.page && pagination.page > 1) {
        // Si no hay datos pero hay registros y estamos en una página mayor a 1,
        // probablemente estamos en una página que ya no existe (por ejemplo, después de filtrar)
        // Volvemos a la primera página
        console.log('No hay datos en esta página, volviendo a la primera página');
        setPagination(prev => ({ ...prev, page: 1 }));
        return;
      }
      
      setInvoices(result.data);
      
      // Guardar el total de registros
      if (result.totalCount !== undefined) {
        setTotalCount(result.totalCount);
        
        // Calcular total de páginas
        const calculatedTotalPages = Math.ceil(result.totalCount / (pagination.pageSize || 10));
        const finalTotalPages = calculatedTotalPages > 0 ? calculatedTotalPages : 1;
        setTotalPages(finalTotalPages);
        
        // Si la página actual es mayor que el total de páginas, ajustar a la última página
        if (pagination.page && pagination.page > finalTotalPages) {
          console.log(`Ajustando página actual ${pagination.page} al total de páginas ${finalTotalPages}`);
          setPagination(prev => ({ ...prev, page: finalTotalPages }));
        }
      } else {
        setTotalPages(1);
      }
      
      console.log(`Facturas cargadas: ${result.data.length}, Total: ${result.totalCount}, Páginas: ${result.totalPages || 1}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar facturas');
      console.error('Error al cargar facturas:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, sortBy, filters, invoiceService]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleSort = useCallback((field: string) => {
    const currentDirection = sortBy.find(s => s.field === field)?.direction;
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    setSortBy([{ field, direction: newDirection }]);
  }, [sortBy]);

  const handleFilter = useCallback((field: string, value: string) => {
    if (!value) {
      setFilters(prev => prev.filter(f => f.field !== field));
      return;
    }

    const newFilter: FilterCondition = {
      field,
      operator: '==',
      value
    };

    setFilters(prev => {
      const updated = [...prev.filter(f => f.field !== field), newFilter];
      // Al cambiar filtros, volver a la primera página
      setPagination(prev => ({ ...prev, page: 1 }));
      return updated;
    });
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > totalPages) {
      console.log(`Página ${newPage} fuera de rango (1-${totalPages})`);
      return;
    }
    
    console.log(`Cambiando a página ${newPage}`);
    
    // Forzar actualización del estado de paginación
    setPagination(prev => {
      const updated = { ...prev, page: newPage };
      console.log('Nueva configuración de paginación:', updated);
      return updated;
    });
  }, [totalPages]);

  const setPageSize = useCallback((newSize: number) => {
    console.log(`Cambiando tamaño de página a ${newSize}`);
    // Al cambiar el tamaño de página, volver a la primera página
    setPagination(prev => ({ ...prev, page: 1, pageSize: newSize }));
  }, []);

  const deleteInvoice = useCallback(async (codigoGeneracion: string) => {
    try {
      await invoiceService.deleteInvoice(codigoGeneracion);
      await loadInvoices();
    } catch (err) {
      throw err;
    }
  }, [invoiceService, loadInvoices]);

  return {
    invoices,
    loading,
    error,
    pagination: {
      currentPage: pagination.page,
      totalPages,
      pageSize: pagination.pageSize,
      totalCount
    },
    actions: {
      handleSort,
      handleFilter,
      handlePageChange,
      setPageSize,
      refresh: loadInvoices,
      deleteInvoice,
    }
  };
}
