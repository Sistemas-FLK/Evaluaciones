import React, { useEffect } from 'react';
import { CheckCircle2, Building2, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CompletionStepProps {
  candidateName: string;
  onResetToLogin: () => void;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({
  candidateName,
  onResetToLogin
}) => {
  useEffect(() => {
    // Disparar celebración discreta al finalizar
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignorar si el navegador bloquea canvas
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-center">
        {/* Encabezado festivo institucional */}
        <div className="bg-gradient-to-b from-[#08265C] to-[#0D3882] p-8 text-white">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
            QUIMICORP PERÚ S.A.C.
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            ¡Evaluación finalizada!
          </h1>
          <p className="text-blue-100 text-sm mt-2 max-w-md mx-auto">
            Estimada <strong>{candidateName}</strong>, tus respuestas han sido registradas y aseguradas satisfactoriamente en nuestro servidor.
          </p>
        </div>

        {/* Mensaje oficial */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-700">
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl text-sm leading-relaxed text-slate-800 font-medium">
            <p>
              Gracias por participar en el proceso de selección de <strong>QUIMICORP PERÚ S.A.C.</strong> para la posición de <strong>Ejecutiva de Ventas, Captación Digital y E-commerce</strong>.
            </p>
            <p className="mt-3 text-slate-600 font-normal">
              El equipo evaluador y la gerencia comercial revisarán tus respuestas y continuarán con las siguientes etapas del proceso de selección. Nos comunicaremos contigo a través de tu correo electrónico y WhatsApp de contacto.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Privacidad y Seguridad</p>
                <p className="text-xs text-slate-500 mt-0.5">Tus datos y respuestas quedan custodiados bajo estricta confidencialidad.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Siguiente Contacto</p>
                <p className="text-xs text-slate-500 mt-0.5">Recibirás la retroalimentación oportuna por parte de Recursos Humanos.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={onResetToLogin}
              className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Volver a la pantalla principal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
