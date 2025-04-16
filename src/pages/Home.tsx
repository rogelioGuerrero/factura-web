import { Link } from 'react-router-dom';
import './Home.css';
import { useState } from 'react';
import { colorIconMap } from '../icons/ColorIconsMap';
import Card from '../components/Card';
import { 
  DocumentTextIcon, 
  CloudArrowUpIcon, 
  Cog6ToothIcon, 
  ChartBarIcon,
  MapIcon,
  TruckIcon,
  PresentationChartLineIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Componente auxiliar para iconos con hover
const IconWithHover = ({
  BaseIcon,
  ColorIcon,
  className = "",
  style = {},
  ...props
}: {
  BaseIcon: React.ElementType;
  ColorIcon?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={className}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
    >
      {hovered && ColorIcon ? (
        <ColorIcon style={{ width: 24, height: 24 }} />
      ) : (
        <BaseIcon className="w-6 h-6" />
      )}
    </div>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section más compacto */}
      <div className="bg-gradient-to-r from-primary to-secondary py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3 text-black">Soluciones Empresariales</h1>
          <p className="text-lg mb-5 max-w-2xl mx-auto text-black">
            Gestiona tus procesos y servicios de manera eficiente desde cualquier dispositivo.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/invoices" className="btn btn-sm btn-primary bg-white text-primary hover:bg-white/90">
              Suscripción
            </Link>
            <Link to="/about" className="btn btn-sm btn-ghost text-black border-black hover:bg-white/10">
              Conocer más
            </Link>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        {/* Sección 1: Gestión de Facturas */}
        <div className="mb-10">
          <div className="flex items-center mb-4">
            <div className="h-8 w-1 bg-primary rounded-full mr-3"></div>
            <h2 className="text-2xl font-bold text-black">Gestión de Facturas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card color="primary" tooltip="Automatiza la carga de tus facturas electrónicas" shadow="sm">
              <IconWithHover
                BaseIcon={CloudArrowUpIcon}
                ColorIcon={colorIconMap.CloudArrowUpIcon}
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-primary/10 text-primary"
              />
              <h2 className="card-title text-base font-semibold mb-2 text-black">Importación Automática</h2>
              <p className="text-neutral-800 text-xs">Sube y valida tus facturas electrónicas fácilmente.</p>
              <div className="card-actions justify-end mt-3">
                <Link to="/importar-facturas" className="btn btn-primary btn-xs">
                  Acceder
                </Link>
              </div>
            </Card>

            <Card color="primary" tooltip="Consulta y organiza tus comprobantes" shadow="sm">
              <IconWithHover
                BaseIcon={DocumentTextIcon}
                ColorIcon={colorIconMap.DocumentTextIcon}
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-primary/10 text-primary"
              />
              <h2 className="card-title text-base font-semibold mb-2 text-black">Consulta de Facturas</h2>
              <p className="text-neutral-800 text-xs">Revisa y organiza tus comprobantes en todo momento.</p>
              <div className="card-actions justify-end mt-3">
                <Link to="/view-invoices" className="btn btn-primary btn-xs">
                  Acceder
                </Link>
              </div>
            </Card>

            <Card color="primary" tooltip="Personaliza la información fiscal relevante" shadow="sm">
              <IconWithHover
                BaseIcon={Cog6ToothIcon}
                ColorIcon={colorIconMap.Cog6ToothIcon}
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-primary/10 text-primary"
              />
              <h2 className="card-title text-base font-semibold mb-2 text-black">Configuración de Campos</h2>
              <p className="text-neutral-800 text-xs">Ajusta la visualización de información fiscal según tus necesidades.</p>
              <div className="card-actions justify-end mt-3">
                <Link to="/custom-fields" className="btn btn-primary btn-xs">
                  Acceder
                </Link>
              </div>
            </Card>

            <Card color="primary" tooltip="Genera informes dinámicos para tu gestión contable" shadow="sm">
              <IconWithHover
                BaseIcon={ChartBarIcon}
                ColorIcon={colorIconMap.ChartBarIcon}
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-primary/10 text-primary"
              />
              <h2 className="card-title text-base font-semibold mb-2 text-black">Reportes Dinámicos</h2>
              <p className="text-neutral-800 text-xs">Genera y exporta informes para tu gestión contable.</p>
              <div className="card-actions justify-end mt-3">
                <Link to="/reports" className="btn btn-primary btn-xs">
                  Acceder
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Sección 2: Optimización de Transporte */}
        <div>
          <div className="flex items-center mb-4">
            <div className="h-8 w-1 bg-primary rounded-full mr-3"></div>
            <h2 className="text-2xl font-bold text-black">Optimización de Transporte</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card shadow="sm" tooltip="Optimiza y automatiza tus rutas de entrega">
              <IconWithHover
                BaseIcon={MapIcon}
                ColorIcon={colorIconMap.MapIcon}
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-primary/10 text-primary"
              />
              <h2 className="card-title text-base font-semibold mb-2 text-black">Planeación Automática de Rutas</h2>
              <p className="text-neutral-800 text-xs">Calcula los trayectos más eficientes para tus operaciones.</p>
              <div className="card-actions justify-end mt-3">
                <Link to="/route-optimization" className="btn btn-primary btn-xs">
                  Acceder
                </Link>
              </div>
            </Card>

            <Card shadow="sm" tooltip="Monitorea tus unidades y entregas en tiempo real">
              <IconWithHover
                BaseIcon={TruckIcon}
                ColorIcon={colorIconMap.TruckIcon}
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-primary/10 text-primary"
              />
              <h2 className="card-title text-base font-semibold mb-2 text-black">Monitoreo en Tiempo Real</h2>
              <p className="text-neutral-800 text-xs">Supervisa la ubicación y estado de tus unidades al instante.</p>
              <div className="card-actions justify-end mt-3">
                <Link to="/real-time-tracking" className="btn btn-primary btn-xs">
                  Acceder
                </Link>
              </div>
            </Card>

            <Card shadow="sm" tooltip="Analiza y gestiona tus métricas logísticas">
              <IconWithHover
                BaseIcon={PresentationChartLineIcon}
                ColorIcon={colorIconMap.PresentationChartLineIcon}
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-primary/10 text-primary"
              />
              <h2 className="card-title text-base font-semibold mb-2 text-black">Panel de Control Logístico</h2>
              <p className="text-neutral-800 text-xs">Analiza métricas clave para optimizar tu operación.</p>
              <div className="card-actions justify-end mt-3">
                <Link to="/dashboard" className="btn btn-primary btn-xs">
                  Acceder
                </Link>
              </div>
            </Card>

            <Card shadow="sm" tooltip="Simula y compara alternativas de rutas">
              <IconWithHover
                BaseIcon={ClockIcon}
                ColorIcon={colorIconMap.ClockIcon}
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-primary/10 text-primary"
              />
              <h2 className="card-title text-base font-semibold mb-2 text-black">Simulación de Recorridos</h2>
              <p className="text-neutral-800 text-xs">Evalúa y compara rutas antes de tomar decisiones.</p>
              <div className="card-actions justify-end mt-3">
                <Link to="/route-demo" className="btn btn-primary btn-xs">
                  Acceder
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;