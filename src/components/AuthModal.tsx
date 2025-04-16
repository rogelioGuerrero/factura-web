import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup } from '../firebase';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (tab === 'register' && form.password !== form.confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    // Aquí iría la lógica de autenticación/registro con Firebase
    alert(tab === 'login' ? 'Simulando inicio de sesión...' : 'Simulando registro...');
    onClose();
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoadingGoogle(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      setError('Error al iniciar sesión con Google: ' + (err?.message || ''));
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative border border-gray-100">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
          aria-label="Cerrar"
        >
          &times;
        </button>
        <div className="flex mb-8 border-b">
          <button
            className={`flex-1 py-2 font-semibold text-lg transition-colors ${tab === 'login' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
            onClick={() => setTab('login')}
          >Iniciar sesión</button>
          <button
            className={`flex-1 py-2 font-semibold text-lg transition-colors ${tab === 'register' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
            onClick={() => setTab('register')}
          >Registrarse</button>
        </div>
        {/* Botón Google destacado */}
        <div className="flex flex-col gap-3 mb-4">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 shadow-sm font-medium text-base text-gray-700 transition disabled:opacity-60"
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
            style={{ boxShadow: '0 1px 4px 0 rgba(60,64,67,.15)' }}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            {loadingGoogle ? 'Conectando...' : 'Continuar con Google'}
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 font-medium text-base cursor-not-allowed"
            disabled
            title="Próximamente"
          >
            <img src="https://www.svgrepo.com/show/448224/facebook.svg" alt="Facebook" className="w-5 h-5" />
            Continuar con Facebook <span className="text-xs text-gray-400">(próximamente)</span>
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 font-medium text-base cursor-not-allowed"
            disabled
            title="Próximamente"
          >
            <span className="w-5 h-5 flex items-center justify-center">
              <svg viewBox="0 0 32 32" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="16" fill="#fff"/>
                <path d="M10 10L22 22M22 10L10 22" stroke="#14171A" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            Continuar con X <span className="text-xs text-gray-400">(próximamente)</span>
          </button>
        </div>
        {/* Separador visual */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">o</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          {tab === 'register' && (
            <div>
              <label className="block text-sm font-medium mb-1">Confirmar contraseña</label>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>
          )}
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-xl font-bold text-base text-white shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
            style={{
              background: 'linear-gradient(90deg, #6366f1 0%, #0ea5e9 100%)',
              boxShadow: '0 2px 8px 0 rgba(80,80,200,0.10)',
              letterSpacing: '0.02em',
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #0ea5e9 0%, #6366f1 100%)')}
            onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #0ea5e9 100%)')}
          >
            {tab === 'login' ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
