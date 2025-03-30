import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../../../context/ThemeContext';
import './Sidebar.css';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  children?: MenuItem[];
}

const defaultMenuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'Inicio',
    path: '/',
    icon: 'home'
  },
  {
    id: 'invoices',
    label: 'Facturas',
    path: '/invoices',
    icon: 'document',
    children: [
      {
        id: 'upload',
        label: 'Gestionar Facturas',
        path: '/invoices',
        icon: 'upload'
      },
      {
        id: 'firebase-invoices',
        label: 'Facturas en la BD',
        path: '/firebase-invoices',
        icon: 'firebase'
      },
      {
        id: 'view-invoices',
        label: 'Ver Facturas',
        path: '/view-invoices',
        icon: 'view'
      }
    ]
  },
  {
    id: 'reports',
    label: 'Reportes',
    path: '/reports',
    icon: 'chart'
  },
  {
    id: 'custom-fields',
    label: 'Gestor de Contenido',
    path: '/custom-fields',
    icon: 'customize'
  },
  {
    id: 'menu',
    label: 'Configuración',
    path: '/menu-manager',
    icon: 'settings'
  }
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [menuItems] = useState<MenuItem[]>(defaultMenuItems);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => (
      <div key={item.id} className="sidebar-menu-item">
        <Link 
          to={item.path} 
          className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
        >
          <span className={`sidebar-icon icon-${item.icon}`}></span>
          {!collapsed && <span className="sidebar-label">{item.label}</span>}
        </Link>
        {item.children && !collapsed && (
          <div className="sidebar-submenu">
            {renderMenuItems(item.children)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <h2 className="sidebar-title">Facturación</h2>}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <div className="sidebar-content">
        <div className="sidebar-menu">
          {renderMenuItems(menuItems)}
        </div>
      </div>
      
      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={toggleTheme} title="Cambiar tema">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        {!collapsed && <span className="theme-label">{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>}
      </div>
    </div>
  );
};

export default Sidebar;
