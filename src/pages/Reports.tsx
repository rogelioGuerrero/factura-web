import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import ReportsBarChart from './ReportsBarChart';
import { BanknotesIcon, UsersIcon, DocumentTextIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';


interface Invoice {
  id: string;
  identificacion: {
    numeroControl: string;
    codigoGeneracion: string;
    fecEmi: string;
    horEmi: string;
    tipoMoneda: string;
  };
  emisor: {
    nombre: string;
    nrc: string;
    nit: string;
  };
  receptor: {
    nombre: string;
    nrc: string;
    nit: string;
  };
  cuerpoDocumento: Array<{
    descripcion: string;
    cantidad: number;
    precioUni: number;
    ventaGravada: number;
  }>;
  resumen: {
    totalGravada: number;
    montoTotalOperacion: number;
    totalPagar: number;
    tributos: Array<{
      codigo: string;
      descripcion: string;
      valor: number;
    }>;
    condicionOperacion: number;
    pagos: Array<{
      codigo: string;
      montoPago: number;
    }>;
  };
  timestamp?: any;
}

interface MonthlyData {
  [key: string]: {
    count: number;
    total: number;
  };
}

interface ClientData {
  [key: string]: {
    count: number;
    total: number;
    name: string;
  };
}

const Reports: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({});
  const [clientData, setClientData] = useState<ClientData>({});
  const [totalInvoiced, setTotalInvoiced] = useState<number>(0);
  const [totalIVA, setTotalIVA] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const invoicesRef = collection(db, 'invoices');
      const q = query(invoicesRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const invoicesData: Invoice[] = [];
      let total = 0;
      let totalIva = 0;
      const monthlyStats: MonthlyData = {};
      const clientStats: ClientData = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Invoice;
        data.id = doc.id;
        
        // Asegurarse de que los campos necesarios existen
        if (data.identificacion && data.resumen) {
          invoicesData.push(data);
          
          // Calcular el total facturado
          const invoiceTotal = data.resumen.montoTotalOperacion || 0;
          total += invoiceTotal;
          
          // Calcular el total de IVA
          if (data.resumen.tributos && data.resumen.tributos.length > 0) {
            data.resumen.tributos.forEach(tributo => {
              if (tributo.codigo === "20") { // Código 20 es IVA
                totalIva += tributo.valor;
              }
            });
          }
          
          // Agrupar por mes
          if (data.identificacion.fecEmi) {
            const date = new Date(data.identificacion.fecEmi);
            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
            
            if (!monthlyStats[monthYear]) {
              monthlyStats[monthYear] = { count: 0, total: 0 };
            }
            
            monthlyStats[monthYear].count += 1;
            monthlyStats[monthYear].total += invoiceTotal;
          }
          
          // Agrupar por cliente
          if (data.receptor && data.receptor.nit) {
            const clientNit = data.receptor.nit;
            if (!clientStats[clientNit]) {
              clientStats[clientNit] = { 
                count: 0, 
                total: 0, 
                name: data.receptor.nombre || 'Cliente sin nombre'
              };
            }
            
            clientStats[clientNit].count += 1;
            clientStats[clientNit].total += invoiceTotal;
          }
        }
      });
      
      setInvoices(invoicesData);
      setTotalInvoiced(total);
      setTotalIVA(totalIva);
      setMonthlyData(monthlyStats);
      setClientData(clientStats);
      setLastUpdate(new Date().toLocaleString());
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getCondicionOperacionText = (codigo: number): string => {
    switch (codigo) {
      case 1:
        return 'Contado';
      case 2:
        return 'Crédito';
      case 3:
        return 'Otro';
      default:
        return 'Desconocido';
    }
  };

  const getFormaPagoText = (codigo: string): string => {
    switch (codigo) {
      case '01':
        return 'Efectivo';
      case '02':
        return 'Tarjeta Débito';
      case '03':
        return 'Tarjeta Crédito';
      case '04':
        return 'Cheque';
      case '05':
        return 'Transferencia';
      case '06':
        return 'Depósito Bancario';
      case '07':
        return 'Giro';
      case '08':
        return 'Tarjeta Prepago';
      case '99':
        return 'Otro';
      default:
        return 'Desconocido';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Fecha desconocida';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-SV', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const renderBarChart = () => {
    if (Object.keys(monthlyData).length === 0) {
      return (
        <div className="empty-chart-message">
          No hay datos disponibles para mostrar en el gráfico
        </div>
      );
    }

    const months = Object.keys(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.split('/').map(Number);
      const [monthB, yearB] = b.split('/').map(Number);
      
      if (yearA !== yearB) {
        return yearA - yearB;
      }
      return monthA - monthB;
    });

    // Obtener el valor máximo para escalar el gráfico
    const maxValue = Math.max(...months.map(month => monthlyData[month].total));

    return (
      <div className="chart">
        {months.map((month) => {
          const { total } = monthlyData[month];
          const heightPercentage = (total / maxValue) * 100;
          
          const [monthNum, year] = month.split('/');
          const monthNames = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
          ];
          const monthName = monthNames[parseInt(monthNum) - 1];
          
          return (
            <div className="bar-container" key={month}>
              <div className="bar">
                <div 
                  className="bar-fill" 
                  style={{ height: `${heightPercentage}%` }}
                  title={`${formatCurrency(total)}`}
                ></div>
              </div>
              <div className="bar-value">{formatCurrency(total)}</div>
              <div className="bar-label">{`${monthName} ${year}`}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTopClients = () => {
    if (Object.keys(clientData).length === 0) {
      return (
        <div className="empty-table-message">
          No hay datos de clientes disponibles
        </div>
      );
    }

    // Ordenar clientes por total facturado (de mayor a menor)
    const sortedClients = Object.entries(clientData)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 5); // Top 5 clientes

    return (
      <table className="invoices-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>NIT</th>
            <th>Facturas</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {sortedClients.map(([nit, data]) => (
            <tr key={nit}>
              <td>{data.name}</td>
              <td>{nit}</td>
              <td>{data.count}</td>
              <td>{formatCurrency(data.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderRecentInvoices = () => {
    if (invoices.length === 0) {
      return (
        <div className="empty-table-message">
          No hay facturas recientes para mostrar
        </div>
      );
    }

    return (
      <table className="invoices-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Número</th>
            <th>Cliente</th>
            <th>Condición</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoices.slice(0, 5).map((invoice) => (
            <tr key={invoice.id}>
              <td>{formatDate(invoice.identificacion?.fecEmi || '')}</td>
              <td>{invoice.identificacion?.numeroControl || 'N/A'}</td>
              <td>{invoice.receptor?.nombre || 'Cliente desconocido'}</td>
              <td>
                {getCondicionOperacionText(invoice.resumen?.condicionOperacion || 0)}
              </td>
              <td>{formatCurrency(invoice.resumen?.montoTotalOperacion || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading) {
    return (
      <div className="reports-container">
        <h1 className="reports-title">Reportes</h1>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando datos de facturas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-container">
        <h1 className="reports-title">Reportes</h1>
        <div className="error-container">
          <h2>Error al cargar los datos</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchInvoices}>
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="reports-container">
        <h1 className="reports-title">Reportes</h1>
        <div className="empty-data-container">
          <h2>No hay datos de facturas</h2>
          <p>No se encontraron facturas en la base de datos.</p>
          <button className="retry-button" onClick={fetchInvoices}>
            Actualizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <h1 className="reports-title">Reportes de Facturación</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  <div className="stats bg-base-100 shadow-xl rounded-2xl">
    <div className="stat flex flex-row items-center gap-3">
      <BanknotesIcon className="h-8 w-8 text-green-500" />
      <div>
        <div className="stat-title">Total Facturado</div>
        <div className="stat-value text-green-600">{formatCurrency(totalInvoiced)}</div>
      </div>
    </div>
  </div>
  <div className="stats bg-base-100 shadow-xl rounded-2xl">
    <div className="stat flex flex-row items-center gap-3">
      <DocumentTextIcon className="h-8 w-8 text-pink-500" />
      <div>
        <div className="stat-title">Total IVA</div>
        <div className="stat-value text-pink-600">{formatCurrency(totalIVA)}</div>
      </div>
    </div>
  </div>
  <div className="stats bg-base-100 shadow-xl rounded-2xl">
    <div className="stat flex flex-row items-center gap-3">
      <UsersIcon className="h-8 w-8 text-blue-500" />
      <div>
        <div className="stat-title">Facturas Emitidas</div>
        <div className="stat-value text-blue-600">{invoices.length}</div>
      </div>
    </div>
  </div>
  <div className="stats bg-base-100 shadow-xl rounded-2xl">
    <div className="stat flex flex-row items-center gap-3">
      <UserGroupIcon className="h-8 w-8 text-purple-500" />
      <div>
        <div className="stat-title">Clientes Activos</div>
        <div className="stat-value text-purple-600">{Object.keys(clientData).length}</div>
      </div>
    </div>
  </div>
</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
  <div className="card bg-base-100 shadow-xl p-6">
  <h3 className="card-title mb-4 flex items-center gap-2">
    <BanknotesIcon className="h-6 w-6 text-green-500" /> Facturación Mensual
  </h3>
  <ReportsBarChart data={Object.keys(monthlyData).sort((a, b) => {
    const [monthA, yearA] = a.split('/').map(Number);
    const [monthB, yearB] = b.split('/').map(Number);
    if (yearA !== yearB) return yearA - yearB;
    return monthA - monthB;
  }).map(month => {
    const [monthNum, year] = month.split('/');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return {
      month: `${monthNames[parseInt(monthNum) - 1]} ${year}`,
      total: monthlyData[month].total
    };
  })} />
</div>
  <div className="card bg-base-100 shadow-xl p-6">
    <h3 className="card-title mb-4">Facturas Recientes</h3>
    <div className="overflow-x-auto">
  <table className="table table-xs table-zebra w-full rounded-lg">
    <thead className="bg-base-200 text-base font-semibold">
      <tr>
        <th>Fecha</th>
        <th>Número</th>
        <th>Cliente</th>
        <th>Condición</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      {invoices.slice(0, 5).map((invoice) => (
        <tr key={invoice.id} className="text-sm">
          <td>{formatDate(invoice.identificacion?.fecEmi || '')}</td>
          <td>{invoice.identificacion?.numeroControl || 'N/A'}</td>
          <td>{invoice.receptor?.nombre || 'Cliente desconocido'}</td>
          <td>
            <span className={clsx(
              "badge badge-ghost font-medium",
              invoice.resumen?.condicionOperacion === 1 ? 'badge-success' :
              invoice.resumen?.condicionOperacion === 2 ? 'badge-info' :
              invoice.resumen?.condicionOperacion === 3 ? 'badge-warning' :
              'badge-ghost')}
            >
              {getCondicionOperacionText(invoice.resumen?.condicionOperacion || 0)}
            </span>
          </td>
          <td className="font-semibold">{formatCurrency(invoice.resumen?.montoTotalOperacion || 0)}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
  </div>
  <div className="card bg-base-100 shadow-xl p-6">
    <h3 className="card-title mb-4">Principales Clientes</h3>
    {renderTopClients()}
  </div>
  <div className="card bg-base-100 shadow-xl p-6">
    <h3 className="card-title mb-4">Métodos de Pago</h3>
    <table className="table table-zebra w-full rounded-lg">
  <thead className="bg-base-200">
    <tr>
      <th>Método</th>
      <th>Cantidad</th>
      <th>Total</th>
    </tr>
  </thead>
  <tbody>
    {Object.entries(
      invoices.reduce((acc: {[key: string]: {count: number, total: number}}, invoice) => {
        if (invoice.resumen?.pagos && invoice.resumen.pagos.length > 0) {
          const codigo = invoice.resumen.pagos[0].codigo || 'desconocido';
          if (!acc[codigo]) {
            acc[codigo] = { count: 0, total: 0 };
          }
          acc[codigo].count += 1;
          acc[codigo].total += invoice.resumen.montoTotalOperacion || 0;
        }
        return acc;
      }, {})
    )
      .sort(([, a], [, b]) => b.total - a.total)
      .map(([codigo, data]) => (
        <tr key={codigo}>
          <td>
            <span className={clsx(
              "badge",
              codigo === '01' ? 'badge-success' :
              codigo === '02' ? 'badge-info' :
              codigo === '03' ? 'badge-warning' :
              'badge-ghost')}
            >{getFormaPagoText(codigo)}</span>
          </td>
          <td>{data.count}</td>
          <td>{formatCurrency(data.total)}</td>
        </tr>
      ))
    }
  </tbody>
</table>
  </div>
</div>
      
      <div className="flex items-center gap-3 text-sm text-base-content mt-6">
  Última actualización: {lastUpdate}
  <button 
    className="btn btn-circle btn-ghost btn-sm"
    onClick={fetchInvoices}
    title="Actualizar datos"
  >
    ↻
  </button>
</div>
    </div>
  );
};

export default Reports;
