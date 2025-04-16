import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon, 
  BellIcon 
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="navbar bg-base-100 shadow-sm px-4 sm:px-6">
      <div className="navbar-start">
        <div className="dropdown">
          <label 
            tabIndex={0} 
            className="btn btn-ghost lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </label>
          {isMenuOpen && (
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><Link to="/" className={isActive('/') ? 'active' : ''}>Inicio</Link></li>
              <li><Link to="/invoices" className={isActive('/invoices') ? 'active' : ''}>Facturas</Link></li>
              <li><Link to="/routes" className={isActive('/routes') ? 'active' : ''}>Rutas</Link></li>
              
            </ul>
          )}
        </div>
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          <span className="text-primary font-bold">Factura</span>
          <span className="text-secondary">Web</span>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/" className={`px-3 py-2 rounded-md ${isActive('/') ? 'bg-primary/10 text-primary' : ''}`}>Inicio</Link>
          </li>
          <li>
            <Link to="/invoices" className={`px-3 py-2 rounded-md ${isActive('/invoices') ? 'bg-primary/10 text-primary' : ''}`}>Facturas</Link>
          </li>
          <li>
            <Link to="/routes" className={`px-3 py-2 rounded-md ${isActive('/routes') ? 'bg-primary/10 text-primary' : ''}`}>Rutas</Link>
          </li>
          <li>
            
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <button className="btn btn-ghost btn-circle">
          <div className="indicator">
            <BellIcon className="h-5 w-5" />
            <span className="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircleIcon className="h-6 w-6 text-primary" />
            </div>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <a className="justify-between">
                Perfil
                <span className="badge">Nuevo</span>
              </a>
            </li>
            <li><a>Configuración</a></li>
            <li><a>Cerrar sesión</a></li>
          </ul>
        </div>
        {/* Aquí va el botón de cambio de tema */}
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Navbar;