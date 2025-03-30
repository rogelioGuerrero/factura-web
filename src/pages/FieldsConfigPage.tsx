import React, { useState } from 'react';
import { JsonFieldDetector } from '@/modules/fields/components/JsonFieldDetector';
import { MainLayout } from '../modules/layout/components/MainLayout';

export const FieldsConfigPage: React.FC = () => {
  const [detectedFields, setDetectedFields] = useState<any>(null);

  const handleFieldsDetected = (data: any) => {
    console.log('Campos detectados:', data);
    setDetectedFields(data);
    // Aquí puedes implementar la lógica para procesar los campos detectados
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Configuración de Campos</h1>
        <p className="text-gray-600 mb-6">
          En esta sección puede configurar qué campos desea visualizar en sus informes y tablas de datos.
          También puede detectar automáticamente campos nuevos a partir de archivos JSON.
        </p>
        
        <JsonFieldDetector onFieldsDetected={handleFieldsDetected} />

        {detectedFields && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
            <h2 className="text-lg font-semibold mb-2">Campos detectados</h2>
            <p className="text-sm text-gray-600">
              Se han detectado campos del archivo JSON. Puede utilizarlos para configurar sus vistas.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FieldsConfigPage;
