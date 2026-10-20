import React, { useState } from 'react';
import { KeyRound, Mail, User, ShieldCheck, ArrowRight, Sparkles, Building2, AlertCircle } from 'lucide-react';
import { validateInvitation } from '../../services/api';

interface WelcomeStepProps {
  onValidated: (data: { candidate: any; assessment: any; accessCode: string }) => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onValidated }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!acceptPrivacy) {
      setErrorMessage('Debe marcar la casilla de aceptación del tratamiento de datos personales para continuar.');
      return;
    }

    if (!accessCode.trim()) {
      setErrorMessage('Por favor ingrese su código individual de invitación proporcionado por QUIMICORP.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await validateInvitation(accessCode.trim().toUpperCase(), acceptPrivacy);
      onValidated({
        candidate: res.candidate,
        assessment: res.assessment,
        accessCode: accessCode.trim().toUpperCase()
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Código de invitación inválido o evaluación ya finalizada.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper para pruebas rápidas de las 2 candidatas iniciales
  const handleQuickFill = (name: string, mail: string, code: string) => {
    setFullName(name);
    setEmail(mail);
    setAccessCode(code);
    setAcceptPrivacy(true);
    setErrorMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Banner institucional */}
        <div className="bg-gradient-to-r from-[#08265C] via-[#0D3882] to-[#2563EB] p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-44 h-44 bg-blue-400/10 rounded-full blur-2xl"></div>
          <div className="inline-flex items-center gap-2 bg-blue-900/60 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase border border-blue-400/20 mb-3">
            <Building2 className="w-3.5 h-3.5 text-blue-300" />
            <span>QUIMICORP PERÚ S.A.C.</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Evaluación de Competencias Comerciales
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-lg mx-auto font-normal">
            Proceso de selección para el puesto de <strong className="font-semibold text-white">Ejecutiva de Ventas, Captación Digital y E-commerce</strong>
          </p>
        </div>

        {/* Formulario */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold">Atención al validar acceso:</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Botones de prueba rápida para Esther y Geraldine */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Candidatas pre-registradas para evaluación:
              </span>
              <span className="text-[11px] text-slate-500">Haz clic para auto-completar</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('Esther Cruzado Albines', 'esther.cruzado@quimicorp-postulante.pe', 'ESTHER-QUIMI-2026')}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left"
              >
                <div>
                  <p className="font-semibold text-slate-800">1. Esther Cruzado Albines</p>
                  <p className="text-[11px] text-slate-500 font-mono">Código: ESTHER-QUIMI-2026</p>
                </div>
                <span className="text-blue-600 font-bold text-xs">Usar &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('Geraldine Ruby', 'geraldine.ruby@quimicorp-postulante.pe', 'GERALDINE-QUIMI-2026')}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left"
              >
                <div>
                  <p className="font-semibold text-slate-800">2. Geraldine Ruby</p>
                  <p className="text-[11px] text-slate-500 font-mono">Código: GERALDINE-QUIMI-2026</p>
                </div>
                <span className="text-blue-600 font-bold text-xs">Usar &rarr;</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombres y Apellidos
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Esther Cruzado Albines"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@correo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="accessCode" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Código Individual de Invitación
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="accessCode"
                  type="text"
                  required
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="Ej: ESTHER-QUIMI-2026"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-blue-900 font-bold"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                El código individual es único, intransferible y habilita una única sesión de evaluación.
              </p>
            </div>

            {/* Checkbox de tratamiento de datos personales */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptPrivacy}
                  onChange={(e) => setAcceptPrivacy(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">
                  Acepto el aviso de privacidad y autorizo el tratamiento de mis datos personales exclusivamente con fines de evaluación para el proceso de selección de personal de <strong className="font-semibold text-slate-800">QUIMICORP PERÚ S.A.C.</strong> conforme a la Ley N° 29733 de Protección de Datos Personales de la República del Perú.
                </span>
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-[#08265C] to-[#2563EB] hover:from-[#0B337A] hover:to-[#1D4ED8] text-white font-semibold rounded-xl shadow-lg shadow-blue-950/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Validando invitación en servidor...</span>
                  </>
                ) : (
                  <>
                    <span>Continuar a las Instrucciones</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
