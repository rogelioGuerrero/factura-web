import React, { useState } from 'react';

// Puedes definir InvoiceData aquí o importar tu tipo si lo tienes
// type InvoiceData = { identificacion?: { codigoGeneracion?: string, fecEmi?: string }, emisor?: { nrc?: string }, [key: string]: any };

const LOCAL_STORAGE_KEY = 'facturas-importadas';

const JsonImportWizard: React.FC = () => {
  const [importedData, setImportedData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('Por favor selecciona un archivo .json válido.');
      return;
    }
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (!Array.isArray(json)) {
        setError('El archivo debe contener un array de facturas.');
        return;
      }
      if (!json[0] || !json[0].identificacion) {
        setError('El archivo JSON no tiene el formato esperado de facturas.');
        return;
      }
      setImportedData(json);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json));
      setSuccess(`¡Importación exitosa! Se guardaron ${json.length} facturas en tu navegador.`);
    } catch (err: any) {
      setError('Error al leer o parsear el archivo JSON. ¿Formato correcto?');
    }
  };

  const handleClear = () => {
    setImportedData(null);
    setError(null);
    setSuccess(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: 24, background: 'white', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Importar Facturas desde JSON</h2>
      <input
        type="file"
        accept=".json"
        style={{ marginBottom: 16 }}
        onChange={handleFileChange}
      />
      {error && <div style={{ marginBottom: 8, padding: 8, background: '#fee', color: '#b00', borderRadius: 4 }}>{error}</div>}
      {success && <div style={{ marginBottom: 8, padding: 8, background: '#efe', color: '#070', borderRadius: 4 }}>{success}</div>}
      {importedData && (
        <div style={{ margin: '16px 0' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Resumen de Facturas Importadas:</h3>
          <ul style={{ marginLeft: 24, fontSize: 15 }}>
            {importedData.slice(0, 5).map((factura, idx) => (
              <li key={idx} style={{ marginBottom: 4 }}>
                <span style={{ fontWeight: 500 }}>{factura.identificacion?.codigoGeneracion || 'Sin código'}</span> - {factura.identificacion?.fecEmi || 'Sin fecha'} - {factura.emisor?.nrc || 'Sin NRC'}
              </li>
            ))}
          </ul>
          {importedData.length > 5 && (
            <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>...y {importedData.length - 5} más</div>
          )}
          <button
            onClick={handleClear}
            style={{ marginTop: 16, padding: '8px 18px', background: '#eee', borderRadius: 4, fontSize: 14, cursor: 'pointer', border: 'none' }}
          >
            Limpiar datos importados
          </button>
        </div>
      )}
      {!importedData && (
        <div style={{ color: '#666', fontSize: 15, marginTop: 16 }}>
          Selecciona un archivo .json con tus facturas para importarlas y guardarlas en tu navegador.
        </div>
      )}
    </div>
  );
};

export default JsonImportWizard;
