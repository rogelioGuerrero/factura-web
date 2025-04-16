// src/components/ComponentManager.tsx
import React, { useState, useEffect } from 'react';
import DependencyModal from './DependencyModal';

interface ComponentInfo {
  id: string;
  name: string;
  path: string;
  type: 'component' | 'layout' | 'page' | 'util';
  isActive: boolean;
}

const ComponentManager: React.FC = () => {
  const [components, setComponents] = useState<ComponentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [dotContent, setDotContent] = useState<string>('');

  // Simulamos la carga de componentes desde el sistema de archivos
  useEffect(() => {
    // Esta función simula la carga automática de componentes
    const loadComponentsAutomatically = () => {
    setLoading(true);
    const localComponents: ComponentInfo[] = [
      { id: '1', name: 'Card', path: 'src/components/Card.tsx', type: 'component', isActive: true },
      { id: '2', name: 'FieldSelector', path: 'src/components/FieldSelector.tsx', type: 'component', isActive: true },
      { id: '3', name: 'FileUploadWizard', path: 'src/components/FileUploadWizard.tsx', type: 'component', isActive: true },
      { id: '4', name: 'MenuConfigEditor', path: 'src/components/MenuConfigEditor.tsx', type: 'component', isActive: true },
      { id: '5', name: 'Navbar', path: 'src/components/Navbar.tsx', type: 'layout', isActive: true },
      { id: '6', name: 'PageTransition', path: 'src/components/PageTransition.tsx', type: 'util', isActive: true },
      { id: '7', name: 'Sidebar', path: 'src/components/Sidebar.tsx', type: 'layout', isActive: true },
      { id: '8', name: 'ThemeToggle', path: 'src/components/ThemeToggle.tsx', type: 'component', isActive: true },
      { id: '9', name: 'DataPreviewStep', path: 'src/components/steps/DataPreviewStep.tsx', type: 'component', isActive: true },
      { id: '10', name: 'DataTableStep', path: 'src/components/steps/DataTableStep.tsx', type: 'component', isActive: true },
      { id: '11', name: 'FileUploadStep', path: 'src/components/steps/FileUploadStep.tsx', type: 'component', isActive: true },
    ];
    setComponents(localComponents);
    setLoading(false);
  };
    // Esta es una lista estática basada en los archivos que mencionaste
    const localComponents: ComponentInfo[] = [
      { id: '1', name: 'Card', path: 'src/components/Card.tsx', type: 'component', isActive: true },
      { id: '2', name: 'FieldSelector', path: 'src/components/FieldSelector.tsx', type: 'component', isActive: true },
      { id: '3', name: 'FileUploadWizard', path: 'src/components/FileUploadWizard.tsx', type: 'component', isActive: true },
      { id: '4', name: 'MenuConfigEditor', path: 'src/components/MenuConfigEditor.tsx', type: 'component', isActive: true },
      { id: '5', name: 'Navbar', path: 'src/components/Navbar.tsx', type: 'layout', isActive: true },
      { id: '6', name: 'PageTransition', path: 'src/components/PageTransition.tsx', type: 'util', isActive: true },
      { id: '7', name: 'Sidebar', path: 'src/components/Sidebar.tsx', type: 'layout', isActive: true },
      { id: '8', name: 'ThemeToggle', path: 'src/components/ThemeToggle.tsx', type: 'component', isActive: true },
      { id: '9', name: 'DataPreviewStep', path: 'src/components/steps/DataPreviewStep.tsx', type: 'component', isActive: true },
      { id: '10', name: 'DataTableStep', path: 'src/components/steps/DataTableStep.tsx', type: 'component', isActive: true },
      { id: '11', name: 'FileUploadStep', path: 'src/components/steps/FileUploadStep.tsx', type: 'component', isActive: true },
    ];

    setComponents(localComponents);
    setLoading(false);
  }, []);

  const createNewComponent = () => {
    const name = prompt('Nombre del nuevo componente:');
    if (!name) return;

    const type = prompt('Tipo (component, layout, page, util):') as ComponentInfo['type'] || 'component';
    
    const newComponent: ComponentInfo = {
      id: Date.now().toString(),
      name,
      path: `src/components/${name}.tsx`,
      type,
      isActive: true
    };

    setComponents([...components, newComponent]);
    alert(`Para crear el componente ${name}, necesitarás crear manualmente el archivo en ${newComponent.path}`);
  };

  const filterByType = (type: ComponentInfo['type'] | 'all') => {
    if (type === 'all') {
      // Recargar todos los componentes
      const localComponents = [...components];
      setComponents(localComponents);
      return;
    }

    const filtered = components.filter(comp => comp.type === type);
    setComponents(filtered);
  };

  const viewDependencies = async (componentName: string) => {
    try {
      // Generamos dependencias más realistas según el componente
      let componentSpecificDependencies = '';
      
      // Dependencias específicas según el componente seleccionado
      if (componentName === 'Card') {
        componentSpecificDependencies = `
        // Dependencias específicas de Card
        "src/components/${componentName}.tsx" -> "src/components/ThemeToggle.tsx" [label="importa y usa"];`;
      } else if (componentName === 'Navbar') {
        componentSpecificDependencies = `
        // Dependencias específicas de Navbar
        "src/components/${componentName}.tsx" -> "src/components/ThemeToggle.tsx" [label="importa y renderiza"];
        "src/components/${componentName}.tsx" -> "src/components/Sidebar.tsx" [label="importa y usa props"];`;
      } else if (componentName === 'Sidebar') {
        componentSpecificDependencies = `
        // Dependencias específicas de Sidebar
        "src/components/${componentName}.tsx" -> "src/components/MenuConfigEditor.tsx" [label="importa y renderiza"];`;
      } else if (componentName === 'FileUploadStep') {
        componentSpecificDependencies = `
        // Dependencias específicas de FileUploadStep
        "src/components/${componentName}.tsx" -> "src/components/FileUploadWizard.tsx" [label="importa contexto"];`;
      } else {
        // Dependencias genéricas para otros componentes
        componentSpecificDependencies = `
        // Dependencias básicas
        "src/components/${componentName}.tsx" -> "src/App.tsx" [label="importado por"];`;
      }
  
      // Generamos el DOT con formato mejorado y etiquetas explicativas
      const dotContent = `digraph G {
    graph [rankdir=LR, fontname="Arial", bgcolor="white"];
    node [shape=box, style=filled, fillcolor="#bbfeff", fontname="Arial", fontsize=10];
    edge [fontname="Arial", fontsize=9, color="#555555"];
  
    // Definimos el componente principal
    "${componentName}" [fillcolor="#ffaaaa", fontcolor="#990000", penwidth=2];
  
    // Estructura del componente en el proyecto
    subgraph "cluster_src" {
      label="src";
      subgraph "cluster_src/components" {
        label="components";
        "src/components/${componentName}.tsx" [label=<${componentName}.tsx>, tooltip="${componentName}.tsx", URL="src/components/${componentName}.tsx", fillcolor="#ffaaaa", fontcolor="#990000"];
      }
    }
    
    // Dependencias de librerías externas
    "src/components/${componentName}.tsx" -> "react" [label="usa hooks/componentes"];
    "src/components/${componentName}.tsx" -> "react-dom" [label="manipulación DOM"];
    "src/components/${componentName}.tsx" -> "tailwindcss" [label="estilos"];
    ${componentSpecificDependencies}
  }`;
      
      setSelectedComponent(componentName);
      setDotContent(dotContent);
      setModalOpen(true);
    } catch (error) {
      console.error('Error al cargar las dependencias:', error);
      alert('No se pudieron cargar las dependencias');
    }
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Administrador de Componentes</h1>
        <button 
          onClick={createNewComponent}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Crear Componente
        </button>
      </div>

      <div className="mb-4 flex space-x-2">
        <button 
          onClick={() => filterByType('all')}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Todos
        </button>
        <button 
          onClick={() => filterByType('component')}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Componentes
        </button>
        <button 
          onClick={() => filterByType('layout')}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Layouts
        </button>
        <button 
          onClick={() => filterByType('util')}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Utilidades
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Nombre</th>
              <th className="py-2 px-4 border-b text-left">Ruta</th>
              <th className="py-2 px-4 border-b text-left">Tipo</th>
              <th className="py-2 px-4 border-b text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {components.map(comp => (
              <tr key={comp.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{comp.name}</td>
                <td className="py-2 px-4 border-b text-sm font-mono">{comp.path}</td>
                <td className="py-2 px-4 border-b">
                  <span className={`px-2 py-1 rounded text-xs ${
                    comp.type === 'component' ? 'bg-blue-100 text-blue-800' :
                    comp.type === 'layout' ? 'bg-green-100 text-green-800' :
                    comp.type === 'page' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {comp.type}
                  </span>
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <button 
                    onClick={() => alert(`Abrir ${comp.path} en el editor`)}
                    className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs mr-2 hover:bg-gray-300"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => viewDependencies(comp.name)}
                    className="bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs mr-2 hover:bg-blue-300"
                  >
                    Ver
                  </button>
                  <button 
                    onClick={() => {
                      const confirmed = confirm(`¿Estás seguro de que quieres duplicar ${comp.name}?`);
                      if (confirmed) {
                        const newComp = {...comp, id: Date.now().toString(), name: `${comp.name}Copy`};
                        setComponents([...components, newComp]);
                      }
                    }}
                    className="bg-green-200 text-green-700 px-2 py-1 rounded text-xs hover:bg-green-300"
                  >
                    Duplicar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>Nota: Este administrador muestra los componentes existentes en tu proyecto.</p>
        <p>Para editar un componente, haz clic en "Editar" y se te indicará la ruta del archivo.</p>
        <p>Los cambios en esta interfaz no modifican directamente los archivos del sistema.</p>
      </div>

      <DependencyModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        componentName={selectedComponent}
        dotContent={dotContent}
      />
    </div>
  );
};

export default ComponentManager;