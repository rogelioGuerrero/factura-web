import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import NavbarEditor from '../components/NavbarEditor';
import FieldSelector from '../components/FieldSelector';
import { FieldConfig } from '../models/FieldSelectionModel';
import './Home.css';

const Home: React.FC = () => {
  const [showNavbarEditor, setShowNavbarEditor] = useState(false);
  const [selectedFields, setSelectedFields] = useState<FieldConfig[]>([]);
  
  const handleNavbarEditClick = () => {
    setShowNavbarEditor(true);
  };
  
  const handleNavbarEditorClose = () => {
    setShowNavbarEditor(false);
  };
  
  const handleNavbarEditorSave = () => {
    setShowNavbarEditor(false);
    // Aquí podríamos realizar acciones adicionales después de guardar
    // como mostrar un mensaje de éxito
  };
  
  const handleFieldsChange = (fields: FieldConfig[]) => {
    setSelectedFields(fields);
    console.log('Campos seleccionados:', fields);
  };
  
  return (
    <div className="home-container">
      <Navbar onEditClick={handleNavbarEditClick} />
      
      {showNavbarEditor && (
        <NavbarEditor 
          onClose={handleNavbarEditorClose} 
          onSave={handleNavbarEditorSave} 
        />
      )}
      
      <main className="main-content">
        <section className="hero-section">
          <div className="hero-content">
            <h1>Sistema de Gestión de Facturas Electrónicas</h1>
            <p>Bienvenido a la plataforma de administración de facturas electrónicas. Utilice las herramientas disponibles para gestionar sus documentos fiscales de manera eficiente.</p>
            <div className="hero-buttons">
              <Link to="/invoices" className="primary-button">Gestionar Facturas</Link>
              <Link to="/firebase-invoices" className="primary-button">Facturas en Firebase</Link>
              <Link to="/reports" className="secondary-button">Ver Reportes</Link>
            </div>
          </div>
        </section>
        
        <section className="features-section">
          <h2>Módulos Disponibles</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Gestión de Facturas</h3>
              <p>Cargue, visualice y administre sus facturas electrónicas en un solo lugar.</p>
              <Link to="/invoices" className="feature-link">Ir al módulo</Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔥</div>
              <h3>Facturas en Firebase</h3>
              <p>Gestione sus facturas con almacenamiento persistente en la nube usando Firebase.</p>
              <div className="feature-links">
                <Link to="/firebase-invoices" className="feature-link">Importar Facturas</Link>
                <Link to="/view-invoices" className="feature-link">Consultar Facturas</Link>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Reportes y Estadísticas</h3>
              <p>Genere informes detallados y visualice estadísticas sobre sus operaciones.</p>
              <Link to="/reports" className="feature-link">Ir al módulo</Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h3>Configuración</h3>
              <p>Personalice la aplicación según sus necesidades y preferencias.</p>
              <Link to="/settings" className="feature-link">Ir al módulo</Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🧭</div>
              <h3>Gestor de Menú</h3>
              <p>Configure y personalice los elementos del menú de navegación.</p>
              <Link to="/menu-manager" className="feature-link">Ir al módulo</Link>
            </div>
          </div>
        </section>
        
        <section className="modules-section">
          <h2>Personalización de Campos</h2>
          <p>Seleccione los campos que desea visualizar en sus informes y tablas de datos:</p>
          
          <div className="field-selector-container">
            <FieldSelector onFieldsChange={handleFieldsChange} />
          </div>
          
          {selectedFields.length > 0 && (
            <div className="selected-fields">
              <h3>Campos Seleccionados:</h3>
              <ul>
                {selectedFields.map(field => (
                  <li key={field.id}>{field.label}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
      
      <footer className="main-footer">
        <div className="footer-content">
          <p>&copy; 2025 Sistema de Gestión de Facturas Electrónicas</p>
          <div className="footer-links">
            <Link to="/about">Acerca de</Link>
            <Link to="/help">Ayuda</Link>
            <Link to="/contact">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
