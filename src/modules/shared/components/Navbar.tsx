import { Link } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
}

interface NavbarProps {
  items?: NavItem[];
}

const defaultItems: NavItem[] = [
  { label: 'Inicio', path: '/' },
  { label: 'Facturas', path: '/invoices' },
  { label: 'Reportes', path: '/reports' }
];

export const Navbar = ({ items = defaultItems }: NavbarProps) => {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <svg className="w-8 h-8 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span className="text-xl font-bold text-gray-800">HIFLEX</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
