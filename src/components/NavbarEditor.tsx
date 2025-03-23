import React, { useState, useEffect, useCallback } from 'react';
import { NavbarController } from '../controllers/NavbarController';
import { NavItem } from '../models/NavbarModel';
import './NavbarEditor.css';

// Obtener el controlador fuera del componente para evitar recreaciones
const navbarController = NavbarController.getInstance();

interface NavbarEditorProps {
  onClose: () => void;
  onSave: () => void;
}

const NavbarEditor: React.FC<NavbarEditorProps> = ({ onClose, onSave }) => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [position, setPosition] = useState<'top' | 'left' | 'right'>('top');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Inicialización - se ejecuta una sola vez
  useEffect(() => {
    if (!initialized) {
      // Cargar configuración actual
      setNavItems(navbarController.getNavItems());
      setPosition(navbarController.getNavbarPosition());
      setTheme(navbarController.getNavbarTheme());
      setInitialized(true);
    }
  }, [initialized]);
  
  const handleSave = useCallback(() => {
    // Guardar cambios en el controlador
    navbarController.setNavItems(navItems);
    navbarController.setNavbarPosition(position);
    navbarController.setNavbarTheme(theme);
    
    // Notificar al componente padre
    onSave();
  }, [navItems, position, theme, onSave]);
  
  const handlePositionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPosition(e.target.value as 'top' | 'left' | 'right');
  }, []);
  
  const handleThemeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as 'light' | 'dark');
  }, []);
  
  const handleAddItem = useCallback(() => {
    setEditingItem({
      id: `item-${Date.now()}`,
      label: '',
      path: '',
      icon: ''
    });
    setShowAddForm(true);
  }, []);
  
  const handleEditItem = useCallback((item: NavItem) => {
    setEditingItem({ ...item });
    setShowAddForm(true);
  }, []);
  
  const handleRemoveItem = useCallback((id: string) => {
    setNavItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);
  
  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setNavItems(prevItems => {
      const newItems = [...prevItems];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      return newItems;
    });
  }, []);
  
  const handleMoveDown = useCallback((index: number) => {
    setNavItems(prevItems => {
      if (index === prevItems.length - 1) return prevItems;
      const newItems = [...prevItems];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      return newItems;
    });
  }, []);
  
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;
    
    setNavItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.id === editingItem.id);
      const newItems = [...prevItems];
      
      if (existingIndex >= 0) {
        newItems[existingIndex] = editingItem;
      } else {
        newItems.push(editingItem);
      }
      
      return newItems;
    });
    
    setEditingItem(null);
    setShowAddForm(false);
  }, [editingItem]);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingItem) return;
    
    setEditingItem(prevItem => {
      if (!prevItem) return null;
      return {
        ...prevItem,
        [e.target.name]: e.target.value
      };
    });
  }, [editingItem]);
  
  const handleReset = useCallback(() => {
    navbarController.resetToDefaults();
    setNavItems(navbarController.getNavItems());
    setPosition(navbarController.getNavbarPosition());
    setTheme(navbarController.getNavbarTheme());
  }, []);
  
  return (
    <div className="navbar-editor">
      <div className="navbar-editor-header">
        <h2>Configuración del Menú</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="navbar-editor-content">
        <div className="editor-section">
          <h3>Apariencia</h3>
          <div className="form-group">
            <label htmlFor="position">Posición:</label>
            <select 
              id="position" 
              value={position} 
              onChange={handlePositionChange}
            >
              <option value="top">Superior</option>
              <option value="left">Izquierda</option>
              <option value="right">Derecha</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="theme">Tema:</label>
            <select 
              id="theme" 
              value={theme} 
              onChange={handleThemeChange}
            >
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>
        </div>
        
        <div className="editor-section">
          <div className="section-header">
            <h3>Elementos del Menú</h3>
            <button className="add-button" onClick={handleAddItem}>
              + Añadir elemento
            </button>
          </div>
          
          {navItems.length === 0 ? (
            <p className="empty-message">No hay elementos en el menú.</p>
          ) : (
            <ul className="menu-items-list">
              {navItems.map((item, index) => (
                <li key={item.id} className="menu-item">
                  <div className="menu-item-content">
                    <span className="menu-item-label">{item.label}</span>
                    <span className="menu-item-path">{item.path}</span>
                  </div>
                  <div className="menu-item-actions">
                    <button 
                      className="action-button move-up" 
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                    >
                      ↑
                    </button>
                    <button 
                      className="action-button move-down" 
                      disabled={index === navItems.length - 1}
                      onClick={() => handleMoveDown(index)}
                    >
                      ↓
                    </button>
                    <button 
                      className="action-button edit" 
                      onClick={() => handleEditItem(item)}
                    >
                      Editar
                    </button>
                    <button 
                      className="action-button remove" 
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {showAddForm && (
        <div className="item-form-overlay">
          <div className="item-form">
            <h3>{editingItem && editingItem.id ? 'Editar Elemento' : 'Nuevo Elemento'}</h3>
            
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="label">Etiqueta:</label>
                <input 
                  type="text" 
                  id="label" 
                  name="label" 
                  value={editingItem?.label || ''} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="path">Ruta:</label>
                <input 
                  type="text" 
                  id="path" 
                  name="path" 
                  value={editingItem?.path || ''} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="icon">Icono (opcional):</label>
                <input 
                  type="text" 
                  id="icon" 
                  name="icon" 
                  value={editingItem?.icon || ''} 
                  onChange={handleInputChange} 
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={() => {
                    setEditingItem(null);
                    setShowAddForm(false);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="save-button">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="navbar-editor-footer">
        <button className="reset-button" onClick={handleReset}>
          Restaurar valores predeterminados
        </button>
        <div className="footer-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancelar
          </button>
          <button className="save-button" onClick={handleSave}>
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavbarEditor;
