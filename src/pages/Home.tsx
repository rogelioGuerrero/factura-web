import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hero-section bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Sistema de Gestión de Facturas Electrónicas</h1>
          <p className="text-xl mb-8">
            Bienvenido a la plataforma de administración de facturas electrónicas. Utilice las herramientas
            disponibles para gestionar sus documentos fiscales de manera eficiente.
          </p>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Ver Facturas */}
          <Link
            to="/view-invoices"
            className="p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors shadow-md flex flex-col items-center text-center"
          >
            <div className="mb-4">
              <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Ver Facturas</h3>
            <p className="text-gray-600">Consulta y visualiza las facturas almacenadas en la base de datos</p>
          </Link>

          {/* Gestor de Facturas */}
          <Link
            to="/invoices"
            className="p-6 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors shadow-md flex flex-col items-center text-center"
          >
            <div className="mb-4">
              <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Gestor de Facturas</h3>
            <p className="text-gray-600">Carga y procesa archivos JSON de facturas electrónicas</p>
          </Link>

          {/* Gestor de Campos */}
          <Link
            to="/custom-fields"
            className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors shadow-md flex flex-col items-center text-center"
          >
            <div className="mb-4">
              <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Gestor de Campos</h3>
            <p className="text-gray-600">Configura los campos y propiedades para la visualización de facturas</p>
          </Link>

          {/* Reportes */}
          <Link
            to="/reports"
            className="p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors shadow-md flex flex-col items-center text-center"
          >
            <div className="mb-4">
              <svg className="w-16 h-16 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Reportes</h3>
            <p className="text-gray-600">Genera y visualiza informes y estadísticas de tus facturas</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;
