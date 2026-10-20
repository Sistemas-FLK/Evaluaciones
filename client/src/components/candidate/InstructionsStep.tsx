import React, { useState } from 'react';
import { 
  Clock, 
  ListOrdered, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowLeft, 
  PlayCircle,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface InstructionsStepProps {
  candidate: { id: string; full_name: string; email: string };
  assessment: { id: string; status: string };
  onStart: () => void;
  onBack: () => void;
}

export const InstructionsStep: React.FC<InstructionsStepProps> = ({
  candidate,
  onStart,
  onBack
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleConfirmStart = () => {
    setIsStarting(true);
    onStart();
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Cabecera */}
        <div className="bg-[#08265C] p-6 sm:p-8 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-300 tracking-wider uppercase">
              QUIMICORP PERÚ S.A.C. — Instrucciones Oficiales
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              Evaluación Comercial y Razonamiento Digital
            </h1>
            <p className="text-sm text-blue-200 mt-1">
              Postulante: <strong className="text-white">{candidate.full_name}</strong>
            </p>
          </div>
          <div className="hidden sm:flex w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/30 items-center justify-center">
            <FileText className="w-6 h-6 text-blue-300" />
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-700">
          {/* Mensaje de bienvenida oficial */}
          <div className="bg-blue-50/70 border-l-4 border-blue-600 p-4 rounded-r-xl text-sm leading-relaxed">
            <p className="font-semibold text-blue-900 mb-1">
              Estimada {candidate.full_name}:
            </p>
            <p className="text-slate-700">
              Esta evaluación tiene como objetivo conocer tus capacidades para resolver situaciones comerciales, identificar oportunidades de venta, captar clientes y razonar sobre problemas habituales del comercio digital en el rubro químico e industrial.
            </p>
            <p className="mt-2 text-slate-700 font-medium">
              Responde con sinceridad, utiliza tu propio criterio y procura mantener la precisión en tus respuestas.
            </p>
          </div>

          {/* Tarjetas de parámetros de la prueba */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700">
                <ListOrdered className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estructura</p>
                <p className="text-lg font-extrabold text-slate-900">10 Ejercicios</p>
                <p className="text-xs text-slate-600 mt-0.5">Opción múltiple y redacción comercial</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiempo Límite</p>
                <p className="text-lg font-extrabold text-slate-900">14 Minutos</p>
                <p className="text-xs text-slate-600 mt-0.5">Tiempo total acumulado individual</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cronómetro</p>
                <p className="text-lg font-extrabold text-slate-900">Por Pregunta</p>
                <p className="text-xs text-slate-600 mt-0.5">Auto-avance sincronizado al expirar</p>
              </div>
            </div>
          </div>

          {/* Reglas críticas de la evaluación */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Reglas importantes de la prueba:
            </h2>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Una pregunta por pantalla:</strong> Cada ejercicio dispone de un tiempo determinado (entre 60 y 120 segundos). El tiempo se mostrará en formato MM:SS.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Alarma visual:</strong> El cronómetro cambiará a color <span className="text-amber-600 font-semibold">naranja cuando resten 15 segundos</span> y a <span className="text-red-600 font-semibold">rojo</span> al agotarse el tiempo.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Avance automático:</strong> Al llegar a cero, el sistema guardará automáticamente lo respondido y avanzará sin perder información. Si terminas antes, puedes hacer clic en "Guardar y continuar".
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900">Sin retroceso:</strong> Por equidad y rigurosidad técnica, <strong>no podrás regresar a preguntas anteriores</strong> una vez que avances.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Protección contra caídas de red:</strong> Las respuestas abiertas se guardan en borrador en segundo plano continuamente. En caso de micro-corte, al recargar la página el examen continuará exactamente en tu pregunta.
                </span>
              </li>
            </ul>
          </div>

          {/* Aviso sobre ajustes razonables de tiempo */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Igualdad y ajustes razonables:</strong> Ambos perfiles son evaluados bajo condiciones estandarizadas idénticas. Si requieres algún ajuste razonable justificado, debió ser coordinado previamente con el equipo de selección antes del inicio del examen.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>

            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#08265C] to-[#2563EB] hover:from-[#0B337A] hover:to-[#1D4ED8] text-white font-bold rounded-xl shadow-lg shadow-blue-950/20 text-sm flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] cursor-pointer"
            >
              <PlayCircle className="w-5 h-5" />
              <span>Comenzar evaluación</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación antes de iniciar el cronómetro */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">
                ¿Lista para iniciar la evaluación?
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Una vez que presiones <strong>"Sí, iniciar ahora"</strong>, el cronómetro de la <strong>Pregunta 1</strong> comenzará a correr inmediatamente.
              </p>
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-3 font-medium">
                Asegúrate de estar en un ambiente tranquilo y con buena conexión a internet.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isStarting}
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all cursor-pointer"
              >
                Revisar más tarde
              </button>
              <button
                type="button"
                disabled={isStarting}
                onClick={handleConfirmStart}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isStarting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <span>Sí, iniciar ahora</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
