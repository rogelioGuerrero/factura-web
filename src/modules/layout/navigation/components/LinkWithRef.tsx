import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

interface LinkWithRefProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente LinkWithRef que extiende el componente Link de react-router-dom
 * para proporcionar una referencia y funcionalidad adicional
 */
const LinkWithRef: React.FC<LinkWithRefProps> = ({ children, className, ...props }) => {
  return (
    <Link 
      className={className || "inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"} 
      {...props}
    >
      {children}
    </Link>
  );
};

export default LinkWithRef;
