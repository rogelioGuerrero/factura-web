import React, { useState } from 'react';
import Card from './Card';

type CardColorType = "primary" | "secondary" | "accent" | "info" | undefined;
type CardShadowType = "none" | "sm" | "md" | "lg" | "xl" | undefined;

const CardManager: React.FC = () => {
  // Estado para las propiedades de la tarjeta
  const [cardProps, setCardProps] = useState({
    title: 'Título de ejemplo',
    description: 'Esta es una descripción de ejemplo para la tarjeta',
    color: 'primary' as CardColorType,
    shadow: 'lg' as CardShadowType,
    width: 'auto',
    bordered: true,
    compact: false,
    imageFull: false,
    image: 'https://placehold.co/600x400',
    imageAlt: 'Imagen de ejemplo',
    to: '/ruta-ejemplo',
    size: 'normal',
    imagePosition: 'top',
    buttonStyle: 'primary',
    buttonText: 'Ver más',
    contentAlign: 'left'
  });

  // Función para actualizar propiedades
  const updateCardProp = (prop: string, value: any) => {
    setCardProps((prev) => ({ ...prev, [prop]: value }));
  };

  // Generar código JSX para la tarjeta actual
  const generateCardCode = () => {
    const props = Object.entries(cardProps)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => {
        if (typeof value === 'boolean') {
          return value ? `${key}` : `${key}={false}`;
        }
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        }
        return `${key}={${value}}`;
      })
      .join('\n  ');

    return `<Card\n  ${props}\n>\n  {/* Contenido de la tarjeta */}\n</Card>`;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Administrador de Componente Card</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de configuración */}
        <div className="bg-base-200 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Configuración</h2>
          
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Título</span>
            </label>
            <input 
              type="text" 
              className="input input-bordered" 
              value={cardProps.title} 
              onChange={(e) => updateCardProp('title', e.target.value)}
            />
          </div>
          
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Descripción</span>
            </label>
            <textarea 
              className="textarea textarea-bordered" 
              value={cardProps.description} 
              onChange={(e) => updateCardProp('description', e.target.value)}
            />
          </div>
          
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Color</span>
            </label>
            <select 
              className="select select-bordered" 
              value={cardProps.color}
              onChange={(e) => updateCardProp('color', e.target.value as CardColorType)}
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="accent">Accent</option>
              <option value="info">Info</option>
            </select>
          </div>
          
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Sombra</span>
            </label>
            <select 
              className="select select-bordered" 
              value={cardProps.shadow}
              onChange={(e) => updateCardProp('shadow', e.target.value)}
            >
              <option value="none">None</option>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </select>
          </div>
          
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">URL de imagen</span>
            </label>
            <input 
              type="text" 
              className="input input-bordered" 
              value={cardProps.image} 
              onChange={(e) => updateCardProp('image', e.target.value)}
            />
          </div>
          
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Enlace (to)</span>
            </label>
            <input 
              type="text" 
              className="input input-bordered" 
              value={cardProps.to} 
              onChange={(e) => updateCardProp('to', e.target.value)}
            />
          </div>
          
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Tamaño</span>
            </label>
            <select 
              className="select select-bordered" 
              value={cardProps.size || 'normal'}
              onChange={(e) => updateCardProp('size', e.target.value)}
            >
              <option value="normal">Normal</option>
              <option value="sm">Pequeño</option>
              <option value="md">Mediano</option>
              <option value="lg">Grande</option>
            </select>
          </div>
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Posición de imagen</span>
            </label>
            <select 
              className="select select-bordered" 
              value={cardProps.imagePosition || 'top'}
              onChange={(e) => updateCardProp('imagePosition', e.target.value)}
            >
              <option value="top">Superior</option>
              <option value="bottom">Inferior</option>
              <option value="side">Lateral</option>
            </select>
          </div>
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Estilo de botón</span>
            </label>
            <select 
              className="select select-bordered" 
              value={cardProps.buttonStyle || 'primary'}
              onChange={(e) => updateCardProp('buttonStyle', e.target.value)}
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="accent">Accent</option>
              <option value="ghost">Ghost</option>
              <option value="link">Link</option>
              <option value="outline">Outline</option>
            </select>
          </div>
          
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Texto del botón</span>
            </label>
            <input 
              type="text" 
              className="input input-bordered" 
              value={cardProps.buttonText || 'Ver más'}
              onChange={(e) => updateCardProp('buttonText', e.target.value)}
            />
          </div>
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Alineación del contenido</span>
            </label>
            <select 
              className="select select-bordered" 
              value={cardProps.contentAlign || 'left'}
              onChange={(e) => updateCardProp('contentAlign', e.target.value)}
            >
              <option value="left">Izquierda</option>
              <option value="center">Centro</option>
              <option value="right">Derecha</option>
            </select>
          </div>
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Ancho</span>
            </label>
            <select 
               className="select select-bordered" 
               value={cardProps.width}
               onChange={(e) => updateCardProp('width', e.target.value)}
               >
               <option value="auto">Auto</option>
               <option value="100%">100% (Ancho completo)</option>
               <option value="96">24rem (384px)</option>
               <option value="80">20rem (320px)</option>
               <option value="64">16rem (256px)</option>
               <option value="48">12rem (192px)</option>
               <option value="32">8rem (128px)</option>
               <option value="custom">Personalizado</option>
             </select>

             {cardProps.width === 'custom' && (
               <input 
                    type="text" 
                    className="input input-bordered mt-2" 
                    placeholder="Ej: 250px o 50%"
                    onChange={(e) => updateCardProp('width', e.target.value)}
               />
               )}
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="form-control">
              <label className="cursor-pointer label">
                <span className="label-text mr-2">Con borde</span>
                <input 
                  type="checkbox" 
                  className="toggle" 
                  checked={cardProps.bordered} 
                  onChange={(e) => updateCardProp('bordered', e.target.checked)}
                />
              </label>
            </div>
            
            <div className="form-control">
              <label className="cursor-pointer label">
                <span className="label-text mr-2">Compacto</span>
                <input 
                  type="checkbox" 
                  className="toggle" 
                  checked={cardProps.compact} 
                  onChange={(e) => updateCardProp('compact', e.target.checked)}
                />
              </label>
            </div>
            
            <div className="form-control">
              <label className="cursor-pointer label">
                <span className="label-text mr-2">Imagen completa</span>
                <input 
                  type="checkbox" 
                  className="toggle" 
                  checked={cardProps.imageFull} 
                  onChange={(e) => updateCardProp('imageFull', e.target.checked)}
                />
              </label>
            </div>
          </div>
        </div>
        
        {/* Panel de vista previa */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Vista previa</h2>
          <div className="mb-4">
          {/* Renderizado condicional con manejo de errores */}
          {(() => {
          try {
               return <Card {...cardProps} />;
          } catch (error) {
               return (
               <div className="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>Error al renderizar la vista previa: {error instanceof Error ? error.message : 'Error desconocido'}</span>
               </div>
               );
          }
          })()}
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Código generado</h2>
          <div className="bg-base-300 p-4 rounded-lg">
            <pre className="text-sm overflow-x-auto">{generateCardCode()}</pre>
          </div>
          
          <button 
            className="btn btn-primary mt-4"
            onClick={() => {
              navigator.clipboard.writeText(generateCardCode());
              alert('Código copiado al portapapeles');
            }}
          >
            Copiar código
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardManager;