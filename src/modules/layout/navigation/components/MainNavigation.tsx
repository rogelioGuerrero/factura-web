import React from 'react';
import { useLocation } from 'react-router-dom';
import LinkWithRef from './LinkWithRef';
import '../styles/MainNavigation.css';

interface NavItem {
  id: string;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Inicio', path: '/' },
  { id: 'invoices', label: 'Facturas', path: '/invoices' },
  { id: 'firebase-invoices', label: 'Firebase Facturas', path: '/firebase-invoices' },
  { id: 'view-invoices', label: 'Ver Facturas', path: '/view-invoices' },
  { id: 'reports', label: 'Reportes', path: '/reports' },
  { id: 'custom-fields', label: 'Gestor de Contenido', path: '/custom-fields' },
  { id: 'menu-manager', label: 'Configuración', path: '/menu-manager' }
];

const MainNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="main-navigation">
      <div className="nav-container">
        {navItems.map(item => (
          <LinkWithRef
            key={item.id}
            to={item.path}
            className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
          >
            {item.label}
          </LinkWithRef>
        ))}
      </div>
    </nav>
  );
};

export default MainNavigation;
