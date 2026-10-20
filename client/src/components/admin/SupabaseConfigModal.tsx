import React from 'react';
import { X, Database, CheckCircle2, AlertTriangle, FileCode, Server, ShieldCheck } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  status?: { isConfigured: boolean; message: string; url: string };
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  status
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Cabecera */}
        <div className="bg-[#08265C] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              status?.isConfigured ? 'bg-emerald-600/30 text-emerald-300' : 'bg-amber-600/30 text-amber-300'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Estado de Persistencia Supabase</h2>
              <p className="text-xs text-blue-200">PostgreSQL Relacional & Seguridad RLS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-blue-900/50 hover:bg-blue-800 text-blue-200 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          {/* Tarjeta de estado actual */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            status?.isConfigured 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {status?.isConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-sm">
                {status?.isConfigured ? 'Conexión Activa con Supabase' : 'Modo Local de Contingencia Activo'}
              </p>
              <p className="mt-1 leading-relaxed">
                {status?.message}
              </p>
              {status?.url && (
                <p className="mt-1 font-mono text-[11px] text-slate-600 break-all">
                  Instancia: {status.url}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-600" />
              Para enlazar tu proyecto Supabase PostgreSQL:
            </h3>

            <ol className="list-decimal list-inside space-y-2 text-slate-600 pl-1">
              <li>
                Crea un proyecto en <strong className="text-slate-800">Supabase.com</strong>.
              </li>
              <li>
                Abre el <strong className="text-slate-800">SQL Editor</strong> en Supabase y ejecuta el script:
                <code className="block bg-slate-100 p-2 rounded-lg font-mono text-[11px] text-blue-900 mt-1 border border-slate-200">
                  supabase/schema.sql y supabase/seed.sql
                </code>
              </li>
              <li>
                Configura en el archivo <strong className="text-slate-800">.env</strong> del backend:
                <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] mt-1 space-y-0.5">
                  <p>SUPABASE_URL=https://tu-proyecto.supabase.co</p>
                  <p>SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-secreta</p>
                </div>
              </li>
              <li>
                Reinicia el servidor API. El sistema sincronizará automáticamente las candidatas, preguntas y rúbricas.
              </li>
            </ol>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Transparencia de datos:</strong> Si las credenciales no están presentes, la aplicación registra todas las respuestas en el repositorio local auditado para garantizar que la prueba nunca se interrumpa durante la llamada de Google Meet.
            </span>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#08265C] hover:bg-[#0D3882] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
