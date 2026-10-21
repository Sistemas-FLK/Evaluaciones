import React from 'react';
import { ShieldCheck, UserCheck, Database, Award, ExternalLink } from 'lucide-react';

interface NavbarProps {
  currentRole: 'candidate' | 'admin';
  onSwitchRole: (role: 'candidate' | 'admin') => void;
  supabaseStatus?: { isConfigured: boolean; message: string; url: string };
  onOpenSupabaseModal: () => void;
  candidateName?: string;
  reviewerName?: string;
  onLogoutAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSwitchRole,
  supabaseStatus,
  onOpenSupabaseModal,
  candidateName,
  reviewerName,
  onLogoutAdmin
}) => {
  return (
    <header className="bg-[#08265C] text-white border-b border-blue-900 shadow-md sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center font-black text-xl shadow-inner tracking-wider">
            Q
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg text-white">QUIMICORP</span>
              <span className="bg-blue-600/60 text-blue-200 text-xs font-semibold px-2 py-0.5 rounded border border-blue-400/30">
                TALENT
              </span>
            </div>
            <p className="text-xs text-blue-200/80 -mt-0.5">
              {currentRole === 'admin' ? 'Panel de Supervisión y Calificación' : 'Evaluación Comercial — Ventas & E-commerce'}
            </p>
          </div>
        </div>

        {/* Center: Info or Candidate In Progress */}
        {candidateName && currentRole === 'candidate' && (
          <div className="hidden md:flex items-center gap-2 bg-blue-950/60 px-3 py-1.5 rounded-full border border-blue-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">Postulante activa:</span>
            <span className="font-semibold text-white">{candidateName}</span>
          </div>
        )}

        {/* Actions / Role Controls */}
        <div className="flex items-center gap-3">
          {/* Supabase status badge */}
          <button
            onClick={onOpenSupabaseModal}
            title={supabaseStatus?.message || 'Estado de base de datos'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              supabaseStatus?.isConfigured
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900'
                : 'bg-amber-950/70 text-amber-300 border border-amber-700/60 hover:bg-amber-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {supabaseStatus?.isConfigured ? 'Supabase Conectado' : 'Modo Contingencia'}
            </span>
            <span className={`w-2 h-2 rounded-full ${supabaseStatus?.isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
          </button>

          {/* Si está en modo ADMIN, mostrar perfil de evaluador y botón salir */}
          {currentRole === 'admin' ? (
            <div className="flex items-center gap-2 bg-blue-950/80 p-1.5 rounded-xl border border-blue-800">
              <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs text-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-white">{reviewerName || 'Evaluador'}</span>
              </div>
              <button
                type="button"
                onClick={onLogoutAdmin || (() => onSwitchRole('candidate'))}
                className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            /* Modo Candidata: Enlace sutil para evaluadores */
            <button
              type="button"
              onClick={() => onSwitchRole('admin')}
              className="text-xs text-blue-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-900/40 transition-colors flex items-center gap-1 cursor-pointer opacity-80 hover:opacity-100"
              title="Acceso exclusivo para evaluadores y gerencia"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Acceso Evaluador</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
