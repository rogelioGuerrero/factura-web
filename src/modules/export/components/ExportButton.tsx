// src/modules/export/components/ExportButton.tsx
import React, { useState } from 'react';
import { ExportController } from '../controllers/ExportController';
import { ExportOptions } from '../models/ExportModel';

interface ExportButtonProps {
  data: any[];
  options?: Partial<ExportOptions>;
  fieldsToInclude?: string[];
  label?: string;
  className?: string;
  onExportStart?: () => void;
  onExportComplete?: (success: boolean) => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  options = {},
  fieldsToInclude,
  label,
  className,
  onExportStart,
  onExportComplete
}) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    onExportStart?.();
    
    const controller = new ExportController(data);
    
    // Configuración predeterminada
    const exportOptions: ExportOptions = {
      format: options.format || 'excel',
      filename: options.filename || 'export',
      sheetName: options.sheetName || 'Data',
      includeHeaders: options.includeHeaders !== false
    };
    
    const success = await controller.exportData(exportOptions, fieldsToInclude);
    
    setIsExporting(false);
    onExportComplete?.(success);
  };
  
  // Determinar etiqueta del botón
  const buttonLabel = label || 
    (options.format === 'csv' ? 'Exportar CSV' : 
     options.format === 'pdf' ? 'Exportar PDF' : 'Exportar Excel');
  
  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={className || 'export-button'}
      style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '4px',
        border: 'none',
        cursor: isExporting ? 'not-allowed' : 'pointer'
      }}
    >
      {isExporting ? 'Exportando...' : buttonLabel}
    </button>
  );
};

export default ExportButton;