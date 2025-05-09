import React, { useState, useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import FileUploadStep from './steps/FileUploadStep';
import DataTableStep from './steps/DataTableStep';
import { FieldsProvider } from '@/modules/fields/contexts/FieldsContext';
import { InvoiceData } from '@/types/invoice';
import './styles/FileUploadWizard.css';

const FileUploadWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Procesar archivos JSON
  const handleFilesProcessed = useCallback((processedInvoices: InvoiceData[]) => {
    console.log('Facturas procesadas:', processedInvoices.length);
    setIsProcessing(false);
    
    if (processedInvoices.length === 0) {
      setError('No se encontraron facturas válidas en los archivos subidos.');
      return;
    }
    
    setError(null);
    setInvoices(processedInvoices);
    
    // Avanzar al siguiente paso
    setCurrentStep(2);
  }, []);

  // Manejar errores de procesamiento
  const handleProcessingError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsProcessing(false);
  }, []);

  // Volver al paso anterior
  const handleBack = useCallback(() => {
    setCurrentStep(1);
    setError(null);
  }, []);

  // Guardar facturas seleccionadas
  const handleSaveInvoices = useCallback(async (selectedInvoices: InvoiceData[]) => {
    setIsProcessing(true);
    setError(null);
    
    console.log('Guardando facturas seleccionadas:', selectedInvoices.length);
    
    try {
      // Referencia a la colección de facturas
      const invoicesRef = collection(db, 'invoices');
      
      // Contador para seguimiento
      let savedCount = 0;
      const totalToSave = selectedInvoices.length;
      
      // Guardar cada factura en Firestore
      const savePromises = selectedInvoices.map(async (invoice) => {
        try {
          // Añadir timestamp para ordenar por fecha de importación
          const invoiceWithTimestamp = {
            ...invoice,
            timestamp: serverTimestamp()
          };
          
          // Guardar en Firestore
          await addDoc(invoicesRef, invoiceWithTimestamp);
          savedCount++;
          
          console.log(`Progreso: ${savedCount}/${totalToSave} facturas guardadas`);
          return true;
        } catch (err) {
          console.error(`Error al guardar factura individual:`, err);
          return false;
        }
      });
      
      // Esperar a que todas las facturas se guarden
      await Promise.all(savePromises);
      
      console.log(`¡Completado! Se guardaron ${savedCount} facturas en Firestore.`);
      
      // Avanzar al paso de confirmación
      setCurrentStep(3);
    } catch (error) {
      console.error('Error al guardar facturas en Firestore:', error);
      setError('Error al guardar las facturas. Por favor, inténtelo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Reiniciar el asistente
  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setInvoices([]);
    setError(null);
    setIsProcessing(false);
  }, []);


  // Renderizar el paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="upload-step-container">
            <FileUploadStep 
              onFilesProcessed={handleFilesProcessed} 
              onError={handleProcessingError}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          </div>
        );
      case 2:
        return (
          <div className="data-step-container">
            <DataTableStep 
              invoices={invoices} 
              onBack={handleBack} 
              onSave={handleSaveInvoices}
              isProcessing={isProcessing}
            />
          </div>
        );
      case 3:
        return (
          <div className="completion-step-container">
            <div className="completion-message">
              <div className="success-icon">✓</div>
              <h2>¡Importación Completada!</h2>
              <p>Las facturas seleccionadas han sido importadas correctamente.</p>
              <div className="completion-summary">
                <div className="summary-item">
                  <span className="summary-label">Total de facturas procesadas:</span>
                  <span className="summary-value">{invoices.length}</span>
                </div>
              </div>
              <div className="completion-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                <button 
                  className="new-import-button"
                  onClick={handleReset}
                  disabled={isProcessing}
                >
                  Nueva Importación
                </button>
                <a 
                  href="/view-invoices" 
                  className="view-invoices-button"
                  style={{
                    backgroundColor: '#3f51b5',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    display: 'inline-block',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    border: 'none',
                    fontSize: '16px',
                    textAlign: 'center'
                  }}
                >
                  Ver Facturas
                </a>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Paso no válido</div>;
    }
  };

  // Estado para mostrar mensaje de guardado local
  const [showLocalSaveMsg, setShowLocalSaveMsg] = useState(false);

  return (
    <FieldsProvider>
      <div className="file-upload-wizard">
        <div className="flex flex-col items-center mb-8 w-full">
          <h2 className="text-3xl font-bold text-center mb-8">Asistente de Importación de Facturas</h2>
          <ul className="steps steps-horizontal w-full max-w-xl mb-8">
            <li className={`step ${currentStep >= 1 ? 'step-primary' : ''}`}>Seleccionar Archivos</li>
            <li className={`step ${currentStep >= 2 ? 'step-primary' : ''}`}>Revisar Facturas</li>
            <li className={`step ${currentStep >= 3 ? 'step-primary' : ''}`}>Completado</li>
          </ul>
        </div>
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {renderCurrentStep()}
        {showLocalSaveMsg && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-6 py-3 rounded shadow-lg z-50 text-lg font-semibold">
            ¡Facturas guardadas en este navegador!
          </div>
        )}
      </div>
    </FieldsProvider>
  );
};

export default FileUploadWizard;



