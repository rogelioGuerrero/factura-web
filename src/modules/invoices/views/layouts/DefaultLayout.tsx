import { ReactNode } from 'react';

interface DefaultLayoutProps {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}

export const DefaultLayout = ({ children, title = 'Facturas', actions }: DefaultLayoutProps) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        {actions && (
          <div className="flex gap-4">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};
