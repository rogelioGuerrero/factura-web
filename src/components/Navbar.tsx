import React, { useState, useEffect } from 'react';
import { NavbarController } from '../controllers/NavbarController';
import { NavItem } from '../models/NavbarModel';
import './Navbar.css';

// Obtener el controlador fuera del componente para evitar recreaciones
const navbarController = NavbarController.getInstance();

interface NavbarProps {
  onEditClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onEditClick }) => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [position, setPosition] = useState<'top' | 'left' | 'right'>('top');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Cargar elementos del menú desde Firebase
    const loadNavItems = async () => {
      try {
        setLoading(true);
        const items = await navbarController.loadNavItemsFromFirebase();
        setNavItems(items);
        setPosition(navbarController.getNavbarPosition());
        setTheme(navbarController.getNavbarTheme());
        setError(null);
      } catch (err) {
        console.error('Error al cargar elementos del menú:', err);
        setError('Error al cargar el menú. Usando valores predeterminados.');
        // Usar datos locales como fallback
        setNavItems(navbarController.getNavItems());
        setPosition(navbarController.getNavbarPosition());
        setTheme(navbarController.getNavbarTheme());
      } finally {
        setLoading(false);
      }
    };

    loadNavItems();
  }, []);
  
  const handleToggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const renderSubMenu = (children: NavItem[]) => {
    return (
      <ul className="navbar-submenu">
        {children.map((child) => (
          <li key={child.id} className="navbar-item">
            <a 
              href={child.path} 
              className="navbar-link"
              target={child.isExternal ? "_blank" : undefined}
              rel={child.isExternal ? "noopener noreferrer" : undefined}
            >
              {child.label}
            </a>
          </li>
        ))}
      </ul>
    );
  };
  
  const navbarClass = `navbar navbar-${position} navbar-${theme} ${mobileMenuOpen ? 'mobile-open' : ''}`;
  
  if (loading) {
    return (
      <nav className={navbarClass}>
        <div className="navbar-container">
          <div className="navbar-brand">
            <a href="/">
              <img src="/logo.png" alt="Logo" className="navbar-logo" />
            </a>
          </div>
          <div className="navbar-loading">Cargando menú...</div>
        </div>
      </nav>
    );
  }
  
  return (
    <nav className={navbarClass}>
      {error && (
        <div className="navbar-error">
          {error}
        </div>
      )}
      <div className="navbar-container">
        <div className="navbar-brand">
          <a href="/">
            <img src="/logo.png" alt="Logo" className="navbar-logo" />
          </a>
          
          <button className="navbar-mobile-toggle" onClick={handleToggleMobileMenu}>
            <span className="navbar-mobile-icon"></span>
          </button>
        </div>
        
        <ul className="navbar-menu">
          {navItems.map((item) => (
            <li key={item.id} className={`navbar-item ${item.children && item.children.length > 0 ? 'has-dropdown' : ''}`}>
              <a 
                href={item.path} 
                className="navbar-link"
                target={item.isExternal ? "_blank" : undefined}
                rel={item.isExternal ? "noopener noreferrer" : undefined}
              >
                {item.icon && <span className={`icon icon-${item.icon}`}></span>}
                {item.label}
              </a>
              {item.children && item.children.length > 0 && renderSubMenu(item.children)}
            </li>
          ))}
        </ul>
        
        {onEditClick && (
          <button className="navbar-edit-button" onClick={onEditClick}>
            <span className="icon icon-edit"></span>
            Editar Menú
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
