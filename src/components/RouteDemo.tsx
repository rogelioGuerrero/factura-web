import React, { useState } from 'react';
import Card from './Card';
import MapComponent from './MapComponent';

type Package = {
  id: string;
  address: string;
  weight: number;
  deliveryWindow: string;
  coordinates: [number, number];
};

type OptimizationResults = {
  totalDistance: string;
  estimatedTime: string;
  vehicleLoad: string;
  fuelCost: string;
};

const RouteDemo: React.FC = () => {
  // Datos estáticos de demostración
  const [packages] = useState<Package[]>([
    {
      id: "PKG-001",
      address: "Av. Principal 123",
      weight: 4.5,
      deliveryWindow: "09:00 - 12:00",
      coordinates: [-34.6037, -58.3816]
    },
    {
      id: "PKG-002",
      address: "Calle Secundaria 456",
      weight: 2.8,
      deliveryWindow: "13:00 - 15:00",
      coordinates: [-34.6118, -58.3684]
    },
    {
      id: "PKG-003",
      address: "Blvd. Norte 789",
      weight: 5.2,
      deliveryWindow: "10:30 - 13:30",
      coordinates: [-34.5998, -58.3750]
    },
    {
      id: "PKG-004",
      address: "Paseo del Sur 234",
      weight: 3.7,
      deliveryWindow: "14:00 - 17:00",
      coordinates: [-34.6150, -58.3770]
    },
    {
      id: "PKG-005",
      address: "Av. Central 567",
      weight: 6.1,
      deliveryWindow: "08:00 - 11:00",
      coordinates: [-34.6080, -58.3900]
    }
  ]);

  // Resultados de optimización estáticos
  const [optimizationResults] = useState<OptimizationResults>({
    totalDistance: "15.2 km",
    estimatedTime: "2h 15m",
    vehicleLoad: "320 kg / 500 kg",
    fuelCost: "$8.50"
  });

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Demo de Optimización de Rutas
      </h1>

      {/* Sección superior: Paquetes y Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: Listado de Paquetes */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Paquetes a Entregar</h2>
          {packages.map((pkg) => (
            <Card 
              key={pkg.id}
              title={`Paquete ${pkg.id}`}
              bordered
              shadow="md"
              className="hover:bg-base-200 transition-colors"
            >
              <div className="space-y-2">
                <p><strong>Dirección:</strong> {pkg.address}</p>
                <p><strong>Peso:</strong> {pkg.weight} kg</p>
                <p><strong>Ventana de entrega:</strong> {pkg.deliveryWindow}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Columna Derecha: Resultados de Optimización */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Resultados de Ruteo</h2>
          <Card color="primary" bordered shadow="lg">
            <div className="grid grid-cols-2 gap-4 text-lg">
              <div className="font-bold">Distancia Total:</div>
              <div>{optimizationResults.totalDistance}</div>
              
              <div className="font-bold">Tiempo Estimado:</div>
              <div>{optimizationResults.estimatedTime}</div>
              
              <div className="font-bold">Carga Vehículo:</div>
              <div>{optimizationResults.vehicleLoad}</div>
              
              <div className="font-bold">Costo Combustible:</div>
              <div>{optimizationResults.fuelCost}</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Mapa (Ancho Completo) */}
      <div className="h-96 rounded-lg overflow-hidden shadow-xl">
        <MapComponent />
      </div>

      {/* Call to Action */}
      <div className="text-center mt-8">
        <button className="btn btn-primary btn-lg">
          ¡Prueba con tus propios datos!
        </button>
      </div>
    </div>
  );
};

export default RouteDemo;