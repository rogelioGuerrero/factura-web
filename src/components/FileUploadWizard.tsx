import { useState, useEffect } from 'react';
import FileUploadStep from './steps/FileUploadStep';
import DataTableStep from './steps/DataTableStep';
import PreviewModal from './PreviewModal';
import { InvoiceData } from '../types/invoice';
import { InvoiceController } from '../controllers/InvoiceController';

const FileUploadWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [jsonData, setJsonData] = useState<InvoiceData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<InvoiceData | null>(null);
  
  const controller = InvoiceController.getInstance();

  // Para depuración
  useEffect(() => {
    console.log("FileUploadWizard - jsonData actualizado:", jsonData);
  }, [jsonData]);

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFileData = (data: InvoiceData[]) => {
    console.log("handleFileData recibió:", data);
    // Usar el controlador para manejar los datos
    controller.addInvoices(data);
    setJsonData(controller.getAllInvoices());
  };

  const handleViewData = () => {
    if (jsonData.length > 0) {
      nextStep();
    }
  };

  const handlePreview = (invoice: InvoiceData) => {
    console.log("Mostrando vista previa de factura:", invoice);
    setPreviewData(invoice);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-full">
      <div className="bg-blue-500 text-white text-center py-3 rounded-t-lg">
        <h1 className="text-xl font-bold">Gestor de Facturas Electrónicas</h1>
      </div>
      
      <div className="bg-white p-4 rounded-b-lg shadow-md h-[calc(100vh-180px)] overflow-auto">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-1">Gestor de Facturas</h2>
          <p className="text-gray-600 text-sm">Sube, visualiza y gestiona tus facturas electrónicas</p>
          
          {/* Indicador de pasos */}
          <div className="flex items-center mt-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              currentStep === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              1
            </div>
            <div className="flex-1 h-1 mx-2 bg-gray-200">
              <div className={`h-full ${currentStep === 2 ? 'bg-blue-500' : 'bg-gray-200'}`} style={{ width: currentStep > 1 ? '100%' : '0%' }}></div>
            </div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              currentStep === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              2
            </div>
          </div>
        </div>

        {currentStep === 1 && (
          <FileUploadStep
            onFileUpload={handleFileData}
            onPreview={handlePreview}
            onViewData={handleViewData}
            data={jsonData}
          />
        )}

        {currentStep === 2 && (
          <DataTableStep
            data={jsonData}
            onPrev={prevStep}
          />
        )}

        {showPreview && previewData && (
          <PreviewModal
            data={previewData}
            onClose={closePreview}
          />
        )}
      </div>
    </div>
  );
};

export default FileUploadWizard;
