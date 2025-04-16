import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * Card DaisyUI mejorado.
 *
 * Uso recomendado:
 * <Card
 *   title="Título"
 *   description="Descripción"
 *   icon={<IconComponent />}
 *   to="/ruta"
 *   color="primary"
 *   shadow="lg"
 *   bordered
 *   compact
 *   image="/img.jpg"
 *   imageFull
 * >
 *   <Contenido />
 * </Card>
 */

interface CardProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  to?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'info';
  tooltip?: string;
  width?: string;
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
  headerActions?: ReactNode;
  image?: string;
  imageAlt?: string;
  bordered?: boolean;
  compact?: boolean;
  imageFull?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  icon,
  to,
  color = 'primary',
  tooltip,
  width = 'auto',
  shadow = 'lg',
  children,
  actions,
  className = '',
  headerActions,
  image,
  imageAlt = 'Card image',
  bordered = true,
  compact = false,
  imageFull = false
}) => {
  const colorClasses = {
    primary: 'bg-primary text-primary-content',
    secondary: 'bg-secondary text-secondary-content',
    accent: 'bg-accent text-accent-content',
    info: 'bg-info text-info-content',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  return (
    <div
      className={`card ${color !== 'primary' ? colorClasses[color] : 'bg-base-100'}
        ${width !== 'auto' ? width : ''}
        ${shadowClasses[shadow]}
        ${bordered ? 'border border-base-200' : ''}
        ${compact ? 'card-compact' : ''}
        ${imageFull ? 'image-full' : ''}
        ${className}
        hover:shadow-xl transition-all duration-300`}
      data-tip={tooltip}
    >
      {image && (
        <figure>
          <img src={image} alt={imageAlt} className={imageFull ? 'w-full h-48 object-cover' : 'w-full'} />
        </figure>
      )}

      <div className="card-body p-6">
        {headerActions && (
          <div className="card-actions justify-end mb-2">
            {headerActions}
          </div>
        )}

        {icon && (
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-2 ${colorClasses[color]}`}>
            {icon}
          </div>
        )}

        {title && <h2 className="card-title text-lg font-semibold mb-1">{title}</h2>}
        {description && <p className="text-base-content/70 text-sm mb-2">{description}</p>}

        {children}

        {(actions || to) && (
          <div className="card-actions justify-end mt-4">
            {actions}
            {to && (
              <Link to={to} className={`btn btn-${color} btn-sm`}>
                Acceder
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;