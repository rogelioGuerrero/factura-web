import { useState } from 'react';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  children?: MenuItem[];
}

const MenuManager = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const handleAddItem = () => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      label: 'Nuevo Item',
      path: '/',
      icon: 'default'
    };
    setMenuItems([...menuItems, newItem]);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Administrador de Menú</h1>
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Agregar Item
        </button>
      </div>

      <div className="space-y-4">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white rounded shadow flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{item.label}</h3>
              <p className="text-sm text-gray-500">{item.path}</p>
            </div>
            <div className="space-x-2">
              <button
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                onClick={() => {
                  // Implementar edición
                }}
              >
                Editar
              </button>
              <button
                className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                onClick={() => {
                  setMenuItems(menuItems.filter(m => m.id !== item.id));
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuManager;
