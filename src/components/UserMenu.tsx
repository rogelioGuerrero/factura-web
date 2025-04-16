import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../modules/auth/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const menuItems = [
  { label: 'Settings', icon: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Zm7.94-2.34a1 1 0 0 0 .24 1.09l.06.06a2 2 0 0 1 0 2.83l-1.42 1.42a2 2 0 0 1-2.83 0l-.06-.06a1 1 0 0 0-1.09-.24 7.08 7.08 0 0 1-2.19.43 1 1 0 0 0-1 .99v.17a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h.17a1 1 0 0 0 .99-1 7.08 7.08 0 0 1 .43-2.19 1 1 0 0 0-.24-1.09l-.06-.06a2 2 0 0 1 0-2.83l1.42-1.42a2 2 0 0 1 2.83 0l.06.06a1 1 0 0 0 1.09.24 7.08 7.08 0 0 1 2.19-.43 1 1 0 0 0 1-.99V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-.17a1 1 0 0 0-.99 1 7.08 7.08 0 0 1-.43 2.19Z"/></svg>
  )},
  { label: 'Contact us', icon: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M21 8.5V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.5m18-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v-.5m18 0-9 7-9-7"/></svg>
  )},
];

export const UserMenu: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!user) return null;

  const displayName = user.displayName || user.email || 'Mi Perfil';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-2 p-2 rounded-full hover:bg-base-200 transition"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menú de usuario"
      >
        <span className="w-9 h-9 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-lg">
          {initial}
        </span>
        <span className="font-medium text-gray-700 hidden sm:block max-w-[120px] truncate">{displayName}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100 animate-fade-in">
          <div className="px-4 py-2 border-b border-gray-100 text-sm font-semibold text-gray-900">{displayName}</div>
          <ul className="py-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-base-100 gap-3 text-base">
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
            <li>
              <button
                className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 gap-3 text-base border-t border-gray-100 mt-2"
                onClick={() => signOut(auth)}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M16 17l5-5m0 0l-5-5m5 5H9m-4 5V7a2 2 0 0 1 2-2h6"/></svg>
                Log out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
