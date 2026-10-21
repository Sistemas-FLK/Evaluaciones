import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Clock, 
  AlertCircle, 
  Send, 
  Save, 
  HelpCircle, 
  User, 
  ShieldAlert
} from 'lucide-react';
import { 
  getCurrentQuestion, 
  saveDraftAnswer, 
  submitQuestionAnswer 
} from '../../services/api';

interface ExamStepProps {
  assessmentId: string;
  candidateName: string;
  onFinished: () => void;
}

export const ExamStep: React.FC<ExamStepProps> = ({
  assessmentId,
  candidateName,
  onFinished
}) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questionData, setQuestionData] = useState<any>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [writtenAnswer, setWrittenAnswer] = useState<string>('');
  const [draftSaved, setDraftSaved] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showEmptyWarning, setShowEmptyWarning] = useState<boolean>(false);

  // Refs para evitar problemas de cierres obsoletos (stale closures) en el temporizador
  const selectedOptionRef = useRef<string>('');
  const writtenAnswerRef = useRef<string>('');
  const submittingRef = useRef<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetEndTimeRef = useRef<number>(0);
  const draftDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Sincronizar refs con el estado más reciente
  useEffect(() => {
    selectedOptionRef.current = selectedOption;
  }, [selectedOption]);

  useEffect(() => {
    writtenAnswerRef.current = writtenAnswer;
  }, [writtenAnswer]);

  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  // Aplicar datos de una pregunta y reiniciar temporizador de forma precisa
  const applyQuestionData = useCallback((data: any) => {
    setQuestionData(data);
    const duration = data.time_remaining_seconds !== undefined 
      ? data.time_remaining_seconds 
      : data.question.time_limit_seconds;

    setSecondsRemaining(duration);
    targetEndTimeRef.current = Date.now() + duration * 1000;
    questionStartTimeRef.current = Date.now();

    setSelectedOption('');
    selectedOptionRef.current = '';

    const initialDraft = data.draft_answer || '';
    setWrittenAnswer(initialDraft);
    writtenAnswerRef.current = initialDraft;

    setDraftSaved(true);
    setShowEmptyWarning(false);
    setErrorMsg('');
  }, []);

  // Cargar pregunta inicial
  const loadInitialQuestion = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await getCurrentQuestion(assessmentId);

      if (data.finished) {
        onFinished();
        return;
      }

      applyQuestionData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cargar la pregunta.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialQuestion();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (draftDebounceRef.current) clearTimeout(draftDebounceRef.current);
    };
  }, [assessmentId]);

  // Protección anti-cierre y anti-recarga accidental durante el examen
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Función unificada de envío (manual o por expiración de tiempo)
  const executeSubmit = useCallback(async (isAutoTimeout = false) => {
    if (submittingRef.current || !questionData?.question) return;

    submittingRef.current = true;
    setSubmitting(true);
    setShowEmptyWarning(false);

    try {
      const clientElapsed = Math.max(1, Math.floor((Date.now() - questionStartTimeRef.current) / 1000));
      const res = await submitQuestionAnswer(assessmentId, questionData.question.id, {
        selected_option: selectedOptionRef.current,
        written_answer: writtenAnswerRef.current,
        client_elapsed_seconds: clientElapsed
      });

      if (res.finished) {
        onFinished();
        return;
      }

      // Avanzar directamente con la respuesta que el servidor ya entrega (sin pantalla de carga ni parpadeo)
      applyQuestionData(res);
    } catch (err: any) {
      console.error('Error al enviar respuesta:', err);
      setErrorMsg(err.message || 'Error al registrar respuesta. Inténtalo de nuevo.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [assessmentId, questionData, applyQuestionData, onFinished]);

  // Manejador del temporizador basado en tiempo real (muro de reloj)
  useEffect(() => {
    if (loading || !questionData) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (submittingRef.current) return;

      const now = Date.now();
      const left = Math.max(0, Math.ceil((targetEndTimeRef.current - now) / 1000));
      setSecondsRemaining(left);

      if (left <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        executeSubmit(true);
      }
    }, 500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, questionData, executeSubmit]);

  // Auto-guardado de borrador en preguntas abiertas (anti-pérdida)
  const handleWrittenChange = (val: string) => {
    setWrittenAnswer(val);
    writtenAnswerRef.current = val;
    setDraftSaved(false);

    if (draftDebounceRef.current) clearTimeout(draftDebounceRef.current);
    draftDebounceRef.current = setTimeout(async () => {
      if (questionData?.question?.id) {
        try {
          await saveDraftAnswer(assessmentId, questionData.question.id, val);
          setDraftSaved(true);
        } catch (e) {
          console.warn('Error al auto-guardar borrador', e);
        }
      }
    }, 800);
  };

  // Clic en "Guardar y continuar"
  const handleManualClick = () => {
    if (submitting) return;

    // Validación suave no bloqueante
    const isMC = questionData?.question?.question_type === 'multiple_choice';
    const isOptionEmpty = isMC && !selectedOption;
    const isTextEmpty = !isMC && !writtenAnswer.trim();

    if ((isOptionEmpty || isTextEmpty) && !showEmptyWarning) {
      setShowEmptyWarning(true);
      return;
    }

    executeSubmit(false);
  };

  // Formato MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-slate-700">Cargando ejercicio de evaluación...</p>
      </div>
    );
  }

  if (errorMsg && !questionData) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-red-800">Incidencia en la evaluación</h2>
          <p className="text-sm text-red-600">{errorMsg}</p>
          <button
            onClick={loadInitialQuestion}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
          >
            Reconectar sesión
          </button>
        </div>
      </div>
    );
  }

  const { question, current_question_index, total_questions } = questionData;
  const progressPercent = Math.round((current_question_index / total_questions) * 100);

  // Estados visuales del temporizador
  const isWarning = secondsRemaining <= 15 && secondsRemaining > 0;
  const isDanger = secondsRemaining === 0;

  let timerColorClass = 'bg-blue-50 text-blue-900 border-blue-200';
  if (isWarning) {
    timerColorClass = 'bg-amber-500 text-white border-amber-600 timer-warning';
  } else if (isDanger) {
    timerColorClass = 'bg-red-600 text-white border-red-700 timer-danger';
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Encabezado de la evaluación: Candidata, Progreso y Cronómetro */}
        <div className="bg-[#08265C] p-4 sm:p-6 text-white border-b border-blue-900">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-700/60 flex items-center justify-center font-bold text-xs text-blue-200">
                <User className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs text-blue-200 leading-none">Postulante</p>
                <p className="text-sm font-bold text-white">{candidateName}</p>
              </div>
            </div>

            {/* Temporizador destacado */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-lg shadow-inner transition-all ${timerColorClass}`}>
              <Clock className={`w-5 h-5 ${isWarning ? 'animate-bounce' : ''}`} />
              <span>{formatTime(secondsRemaining)}</span>
              {isWarning && (
                <span className="text-[11px] font-sans font-semibold tracking-wide ml-1 uppercase">
                  ¡Últimos 15s!
                </span>
              )}
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-blue-200">
              <span className="font-semibold text-white">
                Pregunta {current_question_index} de {total_questions}
              </span>
              <span className="bg-blue-900/60 px-2 py-0.5 rounded text-[11px] border border-blue-400/20">
                {question.category}
              </span>
              <span className="font-medium">{progressPercent}% completado</span>
            </div>
            <div className="w-full bg-blue-950/80 rounded-full h-2 overflow-hidden border border-blue-800">
              <div 
                className="bg-gradient-to-r from-blue-400 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Cuerpo del ejercicio */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Alerta de error si ocurrió durante el envío */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Advertencia no bloqueante de campo vacío */}
          {showEmptyWarning && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-800 flex items-center justify-between gap-3 animate-shake">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>No has completado tu respuesta. Si continúas ahora, se registrará en blanco.</span>
              </div>
              <button
                type="button"
                onClick={() => executeSubmit(false)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs whitespace-nowrap cursor-pointer transition-all"
              >
                Continuar de todos modos
              </button>
            </div>
          )}

          {/* Tarjeta de Situación contextual (si aplica) */}
          {question.situation && (
            <div className="bg-slate-50 border-l-4 border-blue-600 p-4 rounded-r-xl text-slate-700 text-sm leading-relaxed">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Contexto del caso comercial:</span>
              </div>
              <p className="whitespace-pre-line font-medium text-slate-800">
                {question.situation}
              </p>
            </div>
          )}

          {/* Enunciado de la Pregunta */}
          <div className="space-y-2">
            <span className="inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200">
              {question.question_type === 'multiple_choice' ? 'Selección Múltiple' : 'Respuesta Abierta'} • Valor: {question.max_points} puntos
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug whitespace-pre-line">
              {question.statement}
            </h2>
          </div>

          {/* Opciones (si es opción múltiple) */}
          {question.question_type === 'multiple_choice' && question.options && (
            <div className="space-y-3 pt-2">
              {question.options.map((opt: any) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="quiz-option"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => {
                        setSelectedOption(opt.id);
                        setShowEmptyWarning(false);
                      }}
                      className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-sm text-slate-900 mr-2">
                        {opt.id}.
                      </span>
                      <span className="text-sm text-slate-800 leading-relaxed">
                        {opt.text}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {/* Campo de texto (si es respuesta abierta) */}
          {question.question_type === 'open_text' && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Escribe tu respuesta con claridad y criterio profesional:</span>
                <span className="flex items-center gap-1 font-medium">
                  {draftSaved ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Save className="w-3.5 h-3.5" /> Borrador guardado
                    </span>
                  ) : (
                    <span className="text-amber-600">Guardando borrador...</span>
                  )}
                </span>
              </div>
              <textarea
                rows={6}
                value={writtenAnswer}
                onChange={(e) => {
                  handleWrittenChange(e.target.value);
                  if (showEmptyWarning && e.target.value.trim()) {
                    setShowEmptyWarning(false);
                  }
                }}
                placeholder="Redacta aquí tu respuesta completa..."
                className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800 leading-relaxed font-normal shadow-inner"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{writtenAnswer.length} caracteres redactados</span>
                <span>Tus borradores se almacenan automáticamente en el servidor</span>
              </div>
            </div>
          )}

          {/* Pie de página con botón de continuar y advertencia de no retroceso */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>No podrás regresar a este ejercicio después de avanzar.</span>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleManualClick}
              className="w-full sm:w-auto px-7 py-3 bg-[#08265C] hover:bg-[#0D3882] text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span>
                    {current_question_index === total_questions ? 'Finalizar evaluación' : 'Guardar y continuar'}
                  </span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
