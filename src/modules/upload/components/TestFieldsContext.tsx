import React from 'react';
import { useFields } from '@/modules/fields/contexts/FieldsContext';

const TestFieldsContext: React.FC = () => {
  const { selectedFields, allFields } = useFields();

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h2>Prueba de Contexto de Campos</h2>
      
      <div>
        <h3>Campos Seleccionados ({selectedFields.length})</h3>
        <pre>{JSON.stringify(selectedFields, null, 2)}</pre>
      </div>
      
      <div>
        <h3>Todos los Campos ({allFields.length})</h3>
        <pre>{JSON.stringify(allFields.slice(0, 3), null, 2)}</pre>
      </div>
    </div>
  );
};

export default TestFieldsContext;
