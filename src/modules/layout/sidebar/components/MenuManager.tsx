import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MenuController } from '../models/MenuController';
import { NavItem } from '../models/NavbarModel';
import './MenuManager.css';

// Obtener la instancia del controlador FUERA del componente React
// siguiendo el patrón para evitar actualizaciones infinitas
const menuController = MenuController.getInstance();

const MenuManager: React.FC = () => {
  const [menuItems, setMenuItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  
  // Para el formulario de edición
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  
  // Cargar elementos del menú desde Firebase
  useEffect(() => {
    if (!initialized) {
      const loadMenuItems = async () => {
        try {
          setLoading(true);
          const items = await menuController.loadMenuItemsFromFirebase();
          setMenuItems(items);
          setError(null);
        } catch (err) {
          console.error('Error al cargar elementos del menú:', err);
          setError('Error al cargar elementos del menú desde Firebase.');
          // Usar datos locales como fallback
          setMenuItems(menuController.getMenuItems());
        } finally {
          setLoading(false);
          setInitialized(true);
        }
      };

      loadMenuItems();
    }
  }, [initialized]);

  // Manejar la actualización de un elemento
  const handleUpdateItem = useCallback(async () => {
    if (!editingItem) return;
    
    try {
      setLoading(true);
      // Solo actualizamos la etiqueta, manteniendo el resto de propiedades intactas
      await menuController.updateNavItemInFirebase(editingItem.id, {
        label: editingItem.label
      });
      
      // Actualizar la lista de elementos
      const updatedItems = await menuController.loadMenuItemsFromFirebase();
      setMenuItems(updatedItems);
      
      // Cerrar el formulario de edición
      setEditingItem(null);
      setError(null);
    } catch (err) {
      console.error('Error al actualizar elemento de menú:', err);
      setError('Error al actualizar elemento de menú');
    } finally {
      setLoading(false);
    }
  }, [editingItem]);

  // Manejar cambios en el formulario de edición
  const handleEditingItemChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingItem) return;
    
    const { name, value } = e.target;
    
    setEditingItem(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: value
      };
    });
  }, [editingItem]);

  // Manejar el movimiento de elementos hacia arriba
  const handleMoveUp = useCallback(async (index: number) => {
    if (index <= 0) return;
    
    try {
      setLoading(true);
      const newItems = [...menuItems];
      
      // Intercambiar posiciones
      const temp = newItems[index];
      newItems[index] = newItems[index - 1];
      newItems[index - 1] = temp;
      
      // Guardar todos los elementos actualizados en Firebase
      await menuController.saveMenuItemsToFirebase(newItems);
      
      // Actualizar el estado local
      setMenuItems(newItems);
      setError(null);
    } catch (err) {
      console.error('Error al reordenar elementos del menú:', err);
      setError('Error al reordenar elementos del menú');
    } finally {
      setLoading(false);
    }
  }, [menuItems]);

  // Manejar el movimiento de elementos hacia abajo
  const handleMoveDown = useCallback(async (index: number) => {
    if (index >= menuItems.length - 1) return;
    
    try {
      setLoading(true);
      const newItems = [...menuItems];
      
      // Intercambiar posiciones
      const temp = newItems[index];
      newItems[index] = newItems[index + 1];
      newItems[index + 1] = temp;
      
      // Guardar todos los elementos actualizados en Firebase
      await menuController.saveMenuItemsToFirebase(newItems);
      
      // Actualizar el estado local
      setMenuItems(newItems);
      setError(null);
    } catch (err) {
      console.error('Error al reordenar elementos del menú:', err);
      setError('Error al reordenar elementos del menú');
    } finally {
      setLoading(false);
    }
  }, [menuItems]);

  // Obtener el icono para mostrar en la tabla
  const getIconDisplay = (icon: string | undefined) => {
    if (!icon) return '-';
    return icon;
  };

  // Obtener la ruta para mostrar en la tabla
  const getPathDisplay = (path: string) => {
    return path || '-';
  };

  // Renderizar la lista de elementos del menú
  const renderMenuItems = () => {
    if (menuItems.length === 0) {
      return <p>No hay elementos de menú disponibles.</p>;
    }

    return (
      <div className="menu-items-container">
        <table className="menu-items-table">
          <thead>
            <tr>
              <th>Texto</th>
              <th>Módulo</th>
              <th>Icono</th>
              <th>Orden</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item, index) => (
              <tr key={item.id} className="menu-item-row">
                <td>{item.label}</td>
                <td>{getPathDisplay(item.path)}</td>
                <td>{getIconDisplay(item.icon)}</td>
                <td>
                  <div className="order-buttons">
                    <button 
                      className="order-button up"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      title="Mover hacia arriba"
                    >
                      ↑
                    </button>
                    <button 
                      className="order-button down"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === menuItems.length - 1}
                      title="Mover hacia abajo"
                    >
                      ↓
                    </button>
                  </div>
                </td>
                <td>
                  <button 
                    className="edit-button"
                    onClick={() => setEditingItem(item)}
                    title="Editar nombre del elemento"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Renderizar el formulario para editar un elemento
  const renderEditItemForm = () => {
    if (!editingItem) return null;

    return (
      <div className="edit-form-overlay">
        <div className="edit-form">
          <h3>Editar Elemento de Menú</h3>
          
          <div className="form-group">
            <label>
              Texto:
              <input
                type="text"
                name="label"
                value={editingItem.label}
                onChange={handleEditingItemChange}
                className="form-input"
                required
              />
            </label>
          </div>
          
          <div className="form-info">
            <p>Módulo: <strong>{getPathDisplay(editingItem.path)}</strong></p>
            {editingItem.icon && <p>Icono: <strong>{editingItem.icon}</strong></p>}
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="cancel-button"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleUpdateItem}
              className="save-button"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="menu-manager">
      <div className="menu-manager-header">
        <h1>Gestor de Menú</h1>
        <Link to="/" className="back-link">Volver al inicio</Link>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="menu-manager-content">
        <div className="menu-instructions">
          <h2>Instrucciones</h2>
          <p>Aquí puede reorganizar y renombrar los elementos del menú de navegación:</p>
          <ul>
            <li>Use los botones <strong>↑</strong> y <strong>↓</strong> para cambiar el orden de los elementos.</li>
            <li>Haga clic en <strong>Editar</strong> para cambiar el texto de un elemento.</li>
            <li>La columna <strong>Módulo</strong> muestra la ruta asociada al elemento del menú.</li>
            <li>La columna <strong>Icono</strong> muestra el icono asociado al elemento del menú.</li>
          </ul>
          <div className="info-box">
            <p><strong>Nota:</strong> Los elementos del menú están asociados a módulos específicos del sistema. Solo se puede modificar el nombre y el orden de los elementos, no su asociación con los módulos.</p>
          </div>
        </div>
        
        {loading && !editingItem ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          renderMenuItems()
        )}
      </div>
      
      {editingItem && renderEditItemForm()}
    </div>
  );
};

export default MenuManager;
