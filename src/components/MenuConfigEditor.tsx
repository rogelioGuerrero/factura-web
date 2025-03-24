import React, { useState, useEffect, useCallback } from 'react';
import { MenuConfigController } from '../controllers/MenuConfigController';
import { NavItem } from '../models/NavbarModel';
import './MenuConfigEditor.css';

interface MenuConfigEditorProps {
  onClose: () => void;
  onSave: () => void;
}

const MenuConfigEditor: React.FC<MenuConfigEditorProps> = ({ onClose, onSave }) => {
  const configController = MenuConfigController.getInstance();
  
  const [menuItems, setMenuItems] = useState<NavItem[]>([]);
  const [position, setPosition] = useState<'top' | 'left' | 'right'>('top');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Definir loadMenuConfig con useCallback para evitar recreaciones
  const loadMenuConfig = useCallback(() => {
    setMenuItems(configController.getMenuItems());
    setPosition(configController.getMenuPosition());
    setTheme(configController.getMenuTheme());
  }, [configController]);
  
  // Cargar datos iniciales
  useEffect(() => {
    loadMenuConfig();
  }, [loadMenuConfig]);
  
  // Guardar cambios
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage({ text: 'Guardando cambios...', type: 'info' });
      
      // Actualizar modelo con los cambios actuales
      menuItems.forEach(item => {
        configController.updateMenuItem(item.id, item);
      });
      
      configController.setMenuPosition(position);
      configController.setMenuTheme(theme);
      
      // Guardar en Firebase
      const success = await configController.saveUserSettings();
      
      if (success) {
        setMessage({ text: 'Cambios guardados correctamente', type: 'success' });
        onSave();
      } else {
        setMessage({ text: 'Error al guardar cambios', type: 'error' });
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      setMessage({ text: 'Error al guardar cambios', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Resetear a valores predeterminados
  const handleReset = async () => {
    if (window.confirm('¿Estás seguro de que deseas restaurar la configuración predeterminada? Esta acción no se puede deshacer.')) {
      try {
        setIsSaving(true);
        setMessage({ text: 'Restaurando valores predeterminados...', type: 'info' });
        
        const success = await configController.resetToDefaults();
        
        if (success) {
          // Recargar datos
          loadMenuConfig();
          setMessage({ text: 'Configuración restaurada correctamente', type: 'success' });
        } else {
          setMessage({ text: 'Error al restaurar configuración', type: 'error' });
        }
      } catch (error) {
        console.error('Error al restaurar configuración:', error);
        setMessage({ text: 'Error al restaurar configuración', type: 'error' });
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  // Editar un elemento
  const handleEditItem = (item: NavItem) => {
    setEditingItem({ ...item });
  };
  
  // Guardar cambios en un elemento
  const handleSaveItem = () => {
    if (!editingItem) return;
    
    setMenuItems(items => 
      items.map(item => 
        item.id === editingItem.id ? { ...editingItem } : item
      )
    );
    
    setEditingItem(null);
  };
  
  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingItem(null);
  };
  
  // Eliminar un elemento
  const handleDeleteItem = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este elemento?')) {
      setMenuItems(items => items.filter(item => item.id !== id));
    }
  };
  
  // Mover un elemento hacia arriba
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newItems = [...menuItems];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    
    setMenuItems(newItems);
  };
  
  // Mover un elemento hacia abajo
  const handleMoveDown = (index: number) => {
    if (index === menuItems.length - 1) return;
    
    const newItems = [...menuItems];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    
    setMenuItems(newItems);
  };
  
  // Añadir nuevo elemento
  const handleAddItem = () => {
    const newItem: NavItem = {
      id: `item-${Date.now()}`,
      label: 'Nuevo Elemento',
      path: '/',
      icon: 'link'
    };
    
    setMenuItems([...menuItems, newItem]);
    handleEditItem(newItem);
  };
  
  return (
    <div className="menu-config-editor">
      <div className="menu-config-header">
        <h2>Configuración del Menú</h2>
        <button 
          className="close-button" 
          onClick={onClose}
          disabled={isSaving}
        >
          &times;
        </button>
      </div>
      
      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="menu-config-options">
        <div className="option-group">
          <label>Posición del Menú:</label>
          <select 
            value={position} 
            onChange={(e) => setPosition(e.target.value as 'top' | 'left' | 'right')}
            disabled={isSaving}
          >
            <option value="top">Superior</option>
            <option value="left">Izquierda</option>
            <option value="right">Derecha</option>
          </select>
        </div>
        
        <div className="option-group">
          <label>Tema:</label>
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            disabled={isSaving}
          >
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </div>
      </div>
      
      <div className="menu-items-container">
        <h3>Elementos del Menú</h3>
        
        {menuItems.length === 0 ? (
          <div className="no-items">No hay elementos en el menú</div>
        ) : (
          <ul className="menu-items-list">
            {menuItems.map((item, index) => (
              <li key={item.id} className="menu-item">
                <div className="menu-item-info">
                  <span className="menu-item-label">
                    {item.icon && <i className={`icon icon-${item.icon}`}></i>}
                    {item.label}
                  </span>
                  <span className="menu-item-path">{item.path}</span>
                </div>
                
                <div className="menu-item-actions">
                  <button 
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || isSaving}
                    title="Mover arriba"
                  >
                    ↑
                  </button>
                  <button 
                    onClick={() => handleMoveDown(index)}
                    disabled={index === menuItems.length - 1 || isSaving}
                    title="Mover abajo"
                  >
                    ↓
                  </button>
                  <button 
                    onClick={() => handleEditItem(item)}
                    disabled={isSaving}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={isSaving}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <button 
          className="add-item-button"
          onClick={handleAddItem}
          disabled={isSaving}
        >
          + Añadir Elemento
        </button>
      </div>
      
      {editingItem && (
        <div className="item-editor-overlay">
          <div className="item-editor">
            <h3>{editingItem.id.startsWith('item-') ? 'Nuevo Elemento' : 'Editar Elemento'}</h3>
            
            <div className="form-group">
              <label>Etiqueta:</label>
              <input 
                type="text" 
                value={editingItem.label} 
                onChange={(e) => setEditingItem({...editingItem, label: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Ruta:</label>
              <input 
                type="text" 
                value={editingItem.path} 
                onChange={(e) => setEditingItem({...editingItem, path: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Icono:</label>
              <select 
                value={editingItem.icon || ''} 
                onChange={(e) => setEditingItem({...editingItem, icon: e.target.value || undefined})}
              >
                <option value="">Sin icono</option>
                <option value="home">Inicio</option>
                <option value="document">Documento</option>
                <option value="chart">Gráfico</option>
                <option value="settings">Configuración</option>
                <option value="user">Usuario</option>
                <option value="link">Enlace</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={!!editingItem.isExternal} 
                  onChange={(e) => setEditingItem({...editingItem, isExternal: e.target.checked})}
                />
                Enlace externo
              </label>
            </div>
            
            <div className="item-editor-actions">
              <button onClick={handleCancelEdit}>Cancelar</button>
              <button onClick={handleSaveItem}>Guardar</button>
            </div>
          </div>
        </div>
      )}
      
      <div className="menu-config-actions">
        <button 
          className="reset-button"
          onClick={handleReset}
          disabled={isSaving}
        >
          Restaurar Predeterminados
        </button>
        
        <div className="action-buttons">
          <button 
            className="cancel-button"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button 
            className="save-button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuConfigEditor;
