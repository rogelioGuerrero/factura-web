import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/Reports.css';

interface InvoiceData {
  id: string;
  fecha: string;
  total: number;
  emisor: string;
  receptor: string;
  estado: string;
}

const Reports: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [averageAmount, setAverageAmount] = useState(0);
  const [monthlyData, setMonthlyData] = useState<{[key: string]: number}>({});
  const [usingDemoData, setUsingDemoData] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const invoicesRef = collection(db, 'facturas');
        const q = query(invoicesRef, orderBy('fecha', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const invoicesData: InvoiceData[] = [];
        let total = 0;
        const monthlyTotals: {[key: string]: number} = {};
        
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<InvoiceData, 'id'>;
          
          // Validar que los datos tengan la estructura esperada
          if (data && typeof data.total === 'number') {
            invoicesData.push({
              id: doc.id,
              fecha: data.fecha || 'Sin fecha',
              total: data.total || 0,
              emisor: data.emisor || 'Sin emisor',
              receptor: data.receptor || 'Sin receptor',
              estado: data.estado || 'Pendiente'
            });
            
            // Calcular total
            total += data.total || 0;
            
            // Agrupar por mes para gráficos
            if (data.fecha) {
              try {
                const date = new Date(data.fecha);
                const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
                
                if (!monthlyTotals[monthYear]) {
                  monthlyTotals[monthYear] = 0;
                }
                
                monthlyTotals[monthYear] += data.total || 0;
              } catch (e) {
                console.error('Error al procesar fecha:', data.fecha, e);
              }
            }
          }
        });
        
        console.log('Datos cargados desde Firebase:', invoicesData.length, 'facturas');
        
        if (invoicesData.length > 0) {
          setInvoices(invoicesData);
          setTotalAmount(total);
          setInvoiceCount(invoicesData.length);
          setAverageAmount(invoicesData.length > 0 ? total / invoicesData.length : 0);
          setMonthlyData(monthlyTotals);
          setUsingDemoData(false);
          setError(null);
        } else {
          console.log('No se encontraron datos en Firebase, usando datos de demostración');
          generateDemoData();
          setUsingDemoData(true);
        }
      } catch (err) {
        console.error('Error al cargar facturas:', err);
        setError('Error al cargar los datos de facturas. Por favor, intenta de nuevo más tarde.');
        generateDemoData();
        setUsingDemoData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Función para generar datos de ejemplo si no hay datos reales
  const generateDemoData = () => {
    const demoInvoices: InvoiceData[] = [];
    const demoMonthlyData: {[key: string]: number} = {};
    let demoTotal = 0;
    
    // Generar 12 meses de datos
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      const monthlyTotal = Math.floor(Math.random() * 50000) + 10000; // Entre 10,000 y 60,000
      
      demoMonthlyData[monthYear] = monthlyTotal;
      demoTotal += monthlyTotal;
      
      // Generar algunas facturas para cada mes
      const invoicesPerMonth = Math.floor(Math.random() * 5) + 3; // Entre 3 y 8 facturas por mes
      
      for (let j = 0; j < invoicesPerMonth; j++) {
        const invoiceDate = new Date(date);
        invoiceDate.setDate(Math.floor(Math.random() * 28) + 1); // Día aleatorio del mes
        
        const invoiceAmount = Math.floor(Math.random() * 10000) + 1000; // Entre 1,000 y 11,000
        
        demoInvoices.push({
          id: `demo-${i}-${j}`,
          fecha: invoiceDate.toISOString().split('T')[0],
          total: invoiceAmount,
          emisor: 'Empresa Demo',
          receptor: `Cliente ${j + 1}`,
          estado: Math.random() > 0.2 ? 'Pagada' : 'Pendiente'
        });
      }
    }
    
    setInvoices(demoInvoices);
    setTotalAmount(demoTotal);
    setInvoiceCount(demoInvoices.length);
    setAverageAmount(demoInvoices.length > 0 ? demoTotal / demoInvoices.length : 0);
    setMonthlyData(demoMonthlyData);
  };

  // Renderizar gráfico de barras simple con CSS
  const renderBarChart = () => {
    const months = Object.keys(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.split('/').map(Number);
      const [monthB, yearB] = b.split('/').map(Number);
      
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });
    
    const maxValue = Math.max(...Object.values(monthlyData));
    
    return (
      <div className="chart-container">
        <h3>Facturación Mensual</h3>
        <div className="bar-chart">
          {months.map((month) => (
            <div key={month} className="bar-chart-item">
              <div className="bar-label">{month}</div>
              <div className="bar-container">
                <div 
                  className="bar" 
                  style={{ height: `${(monthlyData[month] / maxValue) * 100}%` }}
                >
                  <span className="bar-value">${monthlyData[month].toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="reports-container">
      <h1 className="reports-title">Reportes y Estadísticas</h1>
      
      {loading ? (
        <div className="loading-indicator">Cargando datos...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {usingDemoData && (
            <div className="demo-data-notice">
              Mostrando datos de demostración. Los datos reales aparecerán cuando haya facturas en el sistema.
            </div>
          )}
          
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Total Facturado</h3>
              <div className="stat-value">${totalAmount.toLocaleString()}</div>
            </div>
            
            <div className="stat-card">
              <h3>Facturas Emitidas</h3>
              <div className="stat-value">{invoiceCount}</div>
            </div>
            
            <div className="stat-card">
              <h3>Promedio por Factura</h3>
              <div className="stat-value">${averageAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </div>
          </div>
          
          {renderBarChart()}
          
          <div className="recent-invoices">
            <h3>Facturas Recientes</h3>
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Emisor</th>
                  <th>Receptor</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.fecha}</td>
                    <td>{invoice.emisor}</td>
                    <td>{invoice.receptor}</td>
                    <td>${invoice.total.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge status-${invoice.estado.toLowerCase()}`}>
                        {invoice.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
