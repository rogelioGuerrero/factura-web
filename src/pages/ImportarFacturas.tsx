import React from 'react';
import FileUploadWizard from '../modules/upload/components/FileUploadWizard';

const ImportarFacturas: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 fade-in">
      <h1 className="text-2xl font-bold mb-4">Importar Facturas</h1>
      <FileUploadWizard />
    </div>
  );
};

export default ImportarFacturas;
