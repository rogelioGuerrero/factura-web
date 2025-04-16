import React from "react";

const Login: React.FC = () => {
  // Aquí puedes conectar tu lógica de autenticación real
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
      <div className="bg-base-100 shadow-xl rounded-2xl p-8 w-full max-w-sm border border-base-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">Iniciar sesión</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-base-content mb-1">Correo electrónico</label>
            <input
              type="email"
              className="input input-bordered w-full"
              placeholder="usuario@correo.com"
              required
            />
          </div>
          <div>
            <label className="block text-base-content mb-1">Contraseña</label>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn w-full mt-2"
            style={{ background: 'oklch(58% 0.158 241.966)', color: '#fff', border: 'none' }}
          >
            Acceder
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
