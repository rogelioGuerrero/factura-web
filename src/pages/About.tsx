import React from 'react';

const features = [
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
    ),
    text: 'Gestión de facturas electrónicas',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="#0ea5e9" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>
    ),
    text: 'Administración de tarjetas y rutas',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 9h8M8 15h4"/></svg>
    ),
    text: 'Campos personalizados y configurables',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="#f59e42" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/></svg>
    ),
    text: 'Autenticación segura con Google y email',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="4"/><path d="M16 3H8"/></svg>
    ),
    text: 'Interfaz moderna y fácil de usar',
  },
];

const About: React.FC = () => (
  <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-10">
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-block bg-gradient-to-r from-indigo-500 to-sky-400 p-2 rounded-full shadow">
          <svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/></svg>
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-sky-400 bg-clip-text text-transparent tracking-tight">Acerca de esta aplicación</h1>
      </div>
      <p className="mb-6 mt-2 text-lg text-gray-700 font-medium">
        Plataforma moderna para la gestión de facturación electrónica, tarjetas, rutas y campos personalizados. El objetivo es facilitar la administración de procesos empresariales de manera eficiente y accesible desde cualquier dispositivo.
      </p>
      <ul className="mb-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 shadow-sm border border-gray-100">
            <span>{f.icon}</span>
            <span className="text-gray-700 font-semibold text-base">{f.text}</span>
          </li>
        ))}
      </ul>
      <div className="bg-gradient-to-r from-indigo-50 to-sky-50 border border-indigo-100 rounded-xl p-5 flex flex-col items-center mb-2">
        <div className="text-gray-600 text-center mb-2">
          <span className="font-semibold text-indigo-600">¿Tienes sugerencias o encontraste un problema?</span>
          <br />Puedes contactarnos fácilmente desde el menú de usuario.
        </div>
        <button
          className="mt-2 px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-bold shadow hover:scale-105 transition"
          disabled
        >
          Contactar soporte
        </button>
      </div>
      <div className="text-xs text-gray-400 text-center mt-4">
        Proyecto en desarrollo continuo. Última actualización: {new Date().toLocaleDateString()}
      </div>
    </div>
  </div>
);

export default About;
