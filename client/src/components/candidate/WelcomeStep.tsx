import React, { useState, useEffect } from 'react';
import { KeyRound, Mail, User, Phone, ArrowRight, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateInvitation, lookupInvitationCode } from '../../services/api';

interface WelcomeStepProps {
  onValidated: (data: { candidate: any; assessment: any; accessCode: string }) => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onValidated }) => {
  const [accessCode, setAccessCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [recognizedCandidate, setRecognizedCandidate] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Búsqueda automática cuando la candidata ingresa su código
  useEffect(() => {
    const clean = accessCode.trim().toUpperCase();
    if (clean.length < 5) {
      setRecognizedCandidate(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLookingUp(true);
      const res = await lookupInvitationCode(clean);
      setIsLookingUp(false);
      if (res?.found && res?.candidate) {
        setRecognizedCandidate(res.candidate.full_name);
        if (!fullName || fullName === 'Esther Cruzado Albines' || fullName === 'Geraldine Ruby') {
          setFullName(res.candidate.full_name);
        }
        if (!email) {
          setEmail(res.candidate.email || '');
        }
        if (!phone && res.candidate.phone) {
          setPhone(res.candidate.phone);
        }
        setErrorMessage('');
      } else {
        setRecognizedCandidate(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [accessCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!acceptPrivacy) {
      setErrorMessage('Debe marcar la casilla de aceptación del tratamiento de datos personales para continuar.');
      return;
    }

    if (!accessCode.trim()) {
      setErrorMessage('Por favor ingrese su código individual de invitación.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Por favor confirme o ingrese sus nombres y apellidos completos.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Por favor confirme o ingrese su correo electrónico de contacto.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await validateInvitation(accessCode.trim().toUpperCase(), acceptPrivacy, {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined
      });

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

        {/* Formulario de Acceso y Confirmación */}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo 1: Código Individual de Invitación (Prominente) */}
            <div className="p-4 bg-blue-50/50 border border-blue-200/70 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="accessCode" className="block text-xs font-bold text-[#08265C] uppercase tracking-wider">
                  Código Individual de Invitación *
                </label>
                {isLookingUp && (
                  <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                    <span className="w-3 h-3 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></span>
                    Verificando...
                  </span>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="accessCode"
                  type="text"
                  required
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="Ej: ESTHER-QUIMI-2026"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-blue-300 rounded-xl text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-[#08265C] font-bold shadow-sm transition-all"
                  autoComplete="off"
                />
              </div>

              {recognizedCandidate ? (
                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Código verificado: <strong>{recognizedCandidate}</strong>. Por favor confirma tus datos abajo.
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Ingresa el código alfanumérico proporcionado por el evaluador o Recursos Humanos para tu sesión.
                </p>
              )}
            </div>

            {/* Campo 2: Nombres y Apellidos */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombres y Apellidos Completos *
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

            {/* Campo 3: Correo Electrónico */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico de Contacto *
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
                  placeholder="postulante@ejemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Campo 4: Teléfono / WhatsApp (Opcional) */}
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Número de Celular / WhatsApp <span className="text-slate-400 font-normal lowercase">(opcional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: +51 987 654 321"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 font-medium"
                />
              </div>
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

            {/* Botón de envío */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-[#08265C] to-[#2563EB] hover:from-[#0B337A] hover:to-[#1D4ED8] text-white font-bold rounded-xl shadow-lg shadow-blue-950/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-60 cursor-pointer text-sm"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Validando e Iniciando Sesión...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar Datos y Ver Instrucciones</span>
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
