import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, Building2 } from 'lucide-react';
import { adminLogin } from '../../services/api';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, reviewer: { id: string; name: string }) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [key, setKey] = useState('');
  const [reviewerName, setReviewerName] = useState('María');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await adminLogin(key.trim(), reviewerName);
      onLoginSuccess(res.token, res.reviewer);
    } catch (err: any) {
      setErrorMsg(err.message || 'Clave de acceso incorrecta. (Prueba: admin123)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Encabezado */}
        <div className="bg-[#08265C] p-6 text-white text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center mx-auto mb-2 text-blue-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Acceso Evaluadores</h2>
          <p className="text-xs text-blue-200 mt-1">
            QUIMICORP PERÚ S.A.C. — Panel de Supervisión y Calificación
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Identidad del Evaluador:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReviewerName('María')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  reviewerName === 'María'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>María (Principal)</span>
              </button>

              <button
                type="button"
                onClick={() => setReviewerName('Segundo Evaluador')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  reviewerName === 'Segundo Evaluador'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Segundo Evaluador</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Permite calificar de forma independiente para llegar a un consenso sobre respuestas abiertas.
            </p>
          </div>

          <div>
            <label htmlFor="adminKey" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Clave de Evaluador:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="adminKey"
                type="password"
                required
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Ingresa clave (default: admin123)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Clave inicial predeterminada: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-semibold">admin123</code>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#08265C] hover:bg-[#0D3882] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Verificando...' : 'Acceder al Dashboard'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
