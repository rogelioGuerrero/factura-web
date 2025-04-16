import React, { useState } from 'react';
import CardManager from './CardManager';
import ComponentManager from './ComponentManager';
import { FieldsManager } from '../modules/fields/components/FieldsManager';
import InvoiceManager from '../modules/invoices/components/InvoiceManager';
import MenuManagerSidebar from '../modules/layout/sidebar/components/MenuManager';
import MenuManagerMenu from '../modules/layout/menu/components/MenuManager';

const managerTabs = [
  { label: 'Tarjetas', component: <CardManager /> },
  { label: 'Componentes', component: <ComponentManager /> },
  { label: 'Campos', component: <FieldsManager /> },
  { label: 'Facturas', component: <InvoiceManager /> },
  { label: 'Menú Sidebar', component: <MenuManagerSidebar /> },
  { label: 'Menú Principal', component: <MenuManagerMenu /> },
];

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 bg-base-100 shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-primary">Panel de Administración</h2>
      <div className="flex border-b border-base-200 mb-6">
        {managerTabs.map((tab, idx) => (
          <button
            key={tab.label}
            className={`px-4 py-2 font-medium transition border-b-2 -mb-px focus:outline-none ${activeTab === idx ? 'border-primary text-primary' : 'border-transparent text-base-content hover:text-primary'}`}
            onClick={() => setActiveTab(idx)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {managerTabs[activeTab].component}
      </div>
    </div>
  );
};

export default AdminPanel;
