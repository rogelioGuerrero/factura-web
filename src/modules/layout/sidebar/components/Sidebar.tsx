import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../../../context/ThemeContext";
import AuthModal from '../../../../components/AuthModal';
import { useAuthModal } from '../../../../components/useAuthModal';

import {
  HomeIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  Cog6ToothIcon,

  MapIcon,
  TableCellsIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { HiOutlineMenu } from "react-icons/hi";
// Íconos de color para hover
import { FcHome, FcBusinessman, FcPaid, FcProcess } from "react-icons/fc";

const Logo = ({ collapsed }: { collapsed: boolean }) => (
  <div className="flex items-center justify-center h-12 w-full">
    <span className="font-bold text-primary text-2xl tracking-tight select-none">
      {collapsed ? "F" : ""}
    </span>
  </div>
);

// Agrupación y organización de los ítems del menú
const generalMenuItems = [
  {
    id: "home",
    label: "Inicio",
    path: "/",
    icon: HomeIcon,
    iconColor: FcHome
  },
  {
    id: "invoices",
    label: "Facturas",
    path: "/invoices",
    icon: CloudArrowUpIcon,
    iconColor: FcPaid
  },
  {
    id: "routes",
    label: "Rutas",
    path: "/routes",
    icon: MapIcon,
    iconColor: FcProcess
  }
];

// Subcomponentes para orden y escalabilidad
type MenuItem = {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
  iconColor: React.ElementType;
};

interface SidebarMenuSectionProps {
  items: MenuItem[];
  collapsed: boolean;
  location: ReturnType<typeof useLocation>;
}
const SidebarMenuSection = ({ items, collapsed, location }: SidebarMenuSectionProps) => (
  <ul className="space-y-1">
    {items.map((item) => (
      <SidebarMenuItem
        key={item.id}
        item={item}
        collapsed={collapsed}
        active={location.pathname === item.path}
      />
    ))}
  </ul>
);

interface SidebarMenuItemProps {
  item: MenuItem;
  collapsed: boolean;
  active: boolean;
}
const SidebarMenuItem = ({ item, collapsed, active }: SidebarMenuItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = isHovered ? item.iconColor : item.icon;
  return (
    <li
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={item.path}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-base-content hover:bg-primary/10 hover:text-primary ${active ? 'bg-primary/10 text-primary font-semibold' : ''} ${collapsed ? 'justify-center' : ''}`}
        title={collapsed ? item.label : undefined}
      >
        <span className="text-xl">
          {isHovered ? <Icon style={{ width: 24, height: 24 }} /> : <Icon className="w-6 h-6" />}
        </span>
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    </li>
  );
};

const SidebarFooter = ({ theme, toggleTheme, openModal, closeModal, open }: any) => (
  <div className={`flex items-center justify-center gap-4 py-4 border-t border-base-200 bg-base-100 w-full`} style={{ flexShrink: 0 }}>
    <button
      className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-base-200 transition"
      onClick={toggleTheme}
      aria-label="Cambiar tema"
      title={theme === 'light' ? 'Tema claro' : 'Tema oscuro'}
    >
      {theme === "light" ? <SunIcon className="w-6 h-6 text-warning" /> : <MoonIcon className="w-6 h-6 text-primary" />}
    </button>
    <button
      type="button"
      className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-base-200 transition"
      aria-label="Iniciar sesión"
      title="Iniciar sesión"
      style={{ color: 'oklch(58% 0.158 241.966)' }}
      onClick={openModal}
    >
      <svg xmlns="htt
      p://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12l-3-3m0 0l3-3m-3 3h12" />
      </svg>
    </button>
    <AuthModal open={open} onClose={closeModal} />
  </div>
);

// Título de sección opcional
interface SidebarSectionTitleProps {
  title: string;
  collapsed: boolean;
}
const SidebarSectionTitle = ({ title, collapsed }: SidebarSectionTitleProps) =>
  collapsed ? null : (
    <div className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-base-content/70 select-none">
      {title}
    </div>
  );

const Sidebar = () => {
  const { open, openModal, closeModal } = useAuthModal();
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-base-100 border-r border-base-200 shadow-xl transition-all duration-300 ${collapsed && !hovered ? 'w-20' : 'w-64'} flex flex-col`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Solo botón de menú cuando está colapsado */}
      <div className={`flex items-center justify-center h-16 ${collapsed ? '' : 'px-4 justify-between border-b border-base-200'}`}>
        <button
          className="p-2 rounded-lg hover:bg-base-200 transition"
          onClick={toggleSidebar}
          aria-label={collapsed && !hovered ? 'Expandir menú' : 'Colapsar menú'}
        >
          <HiOutlineMenu className="h-7 w-7 text-primary" />
        </button>
        {!(collapsed && !hovered) && <Logo collapsed={collapsed && !hovered} />}
      </div>
      {/* Menú scrollable */}
      <nav className="flex-1 min-h-0 overflow-y-auto py-4">
        <SidebarSectionTitle title="Menú" collapsed={collapsed && !hovered} />
        <SidebarMenuSection
          items={generalMenuItems}
          collapsed={collapsed && !hovered}
          location={location}
        />
      </nav>
      <SidebarFooter theme={theme} toggleTheme={toggleTheme} openModal={openModal} closeModal={closeModal} open={open} />
    </aside>
  );
};

export default Sidebar;