import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import InvoiceManager from './modules/invoices/components/InvoiceManager'
import MenuManager from '@/modules/layout/menu/components/MenuManager'
import AdminPanel from './components/AdminPanel'
import Sidebar from './modules/layout/sidebar/components/Sidebar'
//import MainNavigation from './modules/layout/navigation/components/MainNavigation'
import HomeButton from './modules/layout/navigation/components/HomeButton'
import Home from './pages/Home'
import ImportarFacturas from './pages/ImportarFacturas'
import CustomFields from './pages/CustomFields'
import About from './pages/About'
import { ThemeProvider } from './context/ThemeContext'
import { FieldsProvider } from './modules/fields/contexts/FieldsContext'
import { ViewSelector } from './modules/invoices/views'
import ComponentManager from './components/ComponentManager'
import './App.css'
import CardManager from './components/CardManager';
import RouteDemo from './components/RouteDemo';
import Reports from './pages/Reports';


import Login from './modules/auth/Login';
//import ThemeToggle from './components/ThemeToggle'

// Componente que renderiza el HomeButton solo cuando no estamos en la página principal
const HomeButtonWrapper = () => {
  const location = useLocation();
  
  // No mostrar el botón en la página principal
  if (location.pathname === '/') {
    return null;
  }
  
  return <HomeButton />;
};

import { AuthProvider } from './modules/auth/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <FieldsProvider>
          <Router>
            <div className="app-container" data-theme="nord">
              <Sidebar />
              <div className="content-wrapper full-width">
                <HomeButtonWrapper />
                <Routes>

                  <Route path="/" element={<Home />} />
                  <Route path="/importar-facturas" element={<ImportarFacturas />} />
                  
                  <Route path="/login" element={<Login />} />
                  <Route path="/card-manager" element={
                    <div className="container mx-auto px-4 py-8 fade-in">
                      <CardManager />
                    </div>
                  } />
                  <Route path="/invoices" element={
                    <div className="container mx-auto px-4 py-8 fade-in">
                      <InvoiceManager />
                    </div>
                  } />

                  <Route path="/component-manager" element={
                    <div className="container mx-auto px-4 py-8 fade-in">
                      <ComponentManager />
                    </div>
                  } />
                  <Route path="/firebase-invoices" element={
                    <div className="container mx-auto px-4 py-8 fade-in">
                      <ViewSelector />
                    </div>
                  } />
                  <Route path="/view-invoices" element={
                    <div className="container mx-auto px-4 py-8 fade-in">
                      <ViewSelector />
                    </div>
                  } />
                  <Route path="/route-demo" element={
                    <div className="container mx-auto px-4 py-8 fade-in">
                      <RouteDemo />
                    </div>
                  } />
                  <Route path="/custom-fields" element={
                    <div className="container mx-auto px-4 py-8 fade-in">
                      <CustomFields />
                    </div>
                  } />
                  <Route path="/menu-manager" element={
                    <div className="container mx-auto px-4 py-8 fade-in">
                      <MenuManager />
                    </div>
                  } />
                  <Route path="/reports" element={
                    <div className="container mx-auto px-4 py-8 fade-in">
                      <Reports />
                    </div>
                  } />
                  <Route path="/admin" element={
  <div className="container mx-auto px-4 py-8 fade-in">
    <AdminPanel />
  </div>
} />
<Route path="/about" element={<About />} />
                </Routes>
              </div>
            </div>
          </Router>
        </FieldsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App

