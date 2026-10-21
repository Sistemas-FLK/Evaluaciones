import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  User, 
  Award, 
  RotateCcw, 
  Save, 
  FileText,
  HelpCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { CandidateDetailResponse } from '../../types';
import { submitReviewerScore, resetAssessment } from '../../services/api';

interface CandidateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CandidateDetailResponse | null;
  authToken: string;
  currentReviewer: { id: string; name: string };
  onReload: () => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  isOpen,
  onClose,
  data,
  authToken,
  currentReviewer,
  onReload
}) => {
  if (!isOpen || !data) return null;

  const { candidate, assessment, questions_detail, final_review } = data;

  // Estado para formularios de calificación manual
  const [scoringState, setScoringState] = useState<Record<number, {
    c1: number;
    c2: number;
    c3: number;
    c4: number;
    observation: string;
    submitting: boolean;
  }>>({});

  const [resetting, setResetting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Inicializar o leer valores de rúbrica
  const getRubricScores = (qId: number) => {
    return scoringState[qId] || { c1: 3, c2: 3, c3: 3, c4: 3, observation: '', submitting: false };
  };

  const handleScoreChange = (qId: number, field: 'c1' | 'c2' | 'c3' | 'c4', val: number) => {
    setScoringState(prev => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || { c1: 3, c2: 3, c3: 3, c4: 3, observation: '', submitting: false }),
        [field]: val
      }
    }));
  };

  const handleObservationChange = (qId: number, obs: string) => {
    setScoringState(prev => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || { c1: 3, c2: 3, c3: 3, c4: 3, observation: '', submitting: false }),
        observation: obs
      }
    }));
  };

  const handleSaveScore = async (qId: number, answerId: string) => {
    const scores = getRubricScores(qId);
    setScoringState(prev => ({
      ...prev,
      [qId]: { ...scores, submitting: true }
    }));
    setFeedbackMsg(null);

    try {
      await submitReviewerScore({
        answer_id: answerId,
        reviewer_id: currentReviewer.id,
        reviewer_name: currentReviewer.name,
        criterion_scores: {
          c1: scores.c1,
          c2: scores.c2,
          c3: scores.c3,
          c4: scores.c4
        },
        observation: scores.observation
      }, authToken);

      setFeedbackMsg({ type: 'success', text: `Calificación guardada para el ejercicio ${qId} por ${currentReviewer.name}.` });
      onReload();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error al guardar la calificación.' });
    } finally {
      setScoringState(prev => ({
        ...prev,
        [qId]: { ...scores, submitting: false }
      }));
    }
  };

  const handleResetAssessment = async () => {
    const reason = prompt('Indica el motivo justificado para autorizar el reinicio de esta evaluación (quedará registrado en auditoría):');
    if (!reason || !reason.trim()) return;

    setResetting(true);
    try {
      await resetAssessment(assessment.id, reason.trim(), currentReviewer.name, authToken);
      alert('Evaluación reiniciada satisfactoriamente.');
      onReload();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error al reiniciar evaluación.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Cabecera del modal */}
        <div className="bg-[#08265C] p-6 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center font-bold text-lg text-white">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Ficha Individual de Candidata
              </span>
              <h2 className="text-xl font-extrabold text-white">
                {candidate.full_name}
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                {candidate.email} {candidate.phone && `• ${candidate.phone}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetAssessment}
              disabled={resetting}
              title="Autorizar reinicio excepcional auditado"
              className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Prueba</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-blue-900/50 hover:bg-blue-800 text-blue-200 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resumen de Puntajes */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex-shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Estado</span>
              <p className="text-sm font-extrabold text-blue-900 capitalize mt-0.5">
                {assessment.status === 'submitted' ? 'Pendiente revisión' : assessment.status}
              </p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Puntaje Automático</span>
              <p className="text-sm font-extrabold text-emerald-600 mt-0.5">
                {assessment.objective_score} / 52 pts
              </p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Puntaje Manual</span>
              <p className="text-sm font-extrabold text-blue-600 mt-0.5">
                {assessment.manual_score} / 48 pts
              </p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Obtenido</span>
              <p className="text-base font-black text-slate-900 mt-0.5">
                {assessment.total_score} / 100 pts
              </p>
            </div>
          </div>

          {feedbackMsg && (
            <div className={`mt-3 p-3 rounded-xl text-xs font-semibold ${
              feedbackMsg.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {feedbackMsg.text}
            </div>
          )}
        </div>

        {/* Lista de las 10 preguntas y respuestas */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Detalle de los 10 Ejercicios de Evaluación
            </h3>
            <span className="text-xs text-slate-500">
              Evaluando actualmente como: <strong className="text-blue-900">{currentReviewer.name}</strong>
            </span>
          </div>

          <div className="space-y-4">
            {questions_detail.map((item, index) => {
              const { question, answer_key, candidate_answer, reviews } = item;
              const rubricScores = getRubricScores(question.id);
              const isMC = question.question_type === 'multiple_choice';

              return (
                <div 
                  key={question.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Encabezado del ejercicio */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#08265C] text-white flex items-center justify-center font-bold text-xs">
                        {question.position}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-800">{question.category}</span>
                        <span className="text-xs text-slate-500 ml-2">({isMC ? 'Opción múltiple' : 'Pregunta abierta'})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      {candidate_answer && (
                        <span className="flex items-center gap-1 font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {candidate_answer.elapsed_seconds}s utilizados / {question.time_limit_seconds}s
                          {candidate_answer.timed_out && (
                            <span className="text-red-600 font-bold ml-1">(Tiempo agotado)</span>
                          )}
                        </span>
                      )}

                      <span className="font-extrabold px-2.5 py-1 rounded-md bg-blue-50 text-blue-800">
                        {isMC ? `${candidate_answer?.objective_points || 0} / ${question.max_points} pts` : `Máx ${question.max_points} pts`}
                      </span>
                    </div>
                  </div>

                  {/* Situación y enunciado */}
                  {question.situation && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                      <strong>Situación:</strong> {question.situation}
                    </div>
                  )}

                  <p className="text-sm font-semibold text-slate-900 whitespace-pre-line">
                    {question.statement}
                  </p>

                  {/* Sección para selección múltiple */}
                  {isMC && (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-3 rounded-xl border bg-slate-50">
                          <span className="text-[11px] font-bold text-slate-500 uppercase">Respuesta de la Candidata:</span>
                          <p className="text-sm font-bold text-slate-900 mt-1">
                            {candidate_answer?.selected_option ? (
                              `Opción ${candidate_answer.selected_option}`
                            ) : (
                              <span className="text-red-500 font-normal italic">No respondió</span>
                            )}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
                          <span className="text-[11px] font-bold text-emerald-800 uppercase">Respuesta Correcta Oficial:</span>
                          <p className="text-sm font-bold text-emerald-900 mt-1">
                            Opción {answer_key.correct_option}
                          </p>
                        </div>
                      </div>
                      {answer_key.explanation && (
                        <p className="text-xs text-slate-500 italic mt-1">
                          <strong>Criterio técnico:</strong> {answer_key.explanation}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Sección para respuesta abierta con Rúbrica */}
                  {!isMC && (
                    <div className="space-y-4 pt-1">
                      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
                        <span className="text-xs font-bold text-blue-900 uppercase">Respuesta Redactada por la Candidata:</span>
                        <p className="text-sm text-slate-800 mt-2 leading-relaxed whitespace-pre-line bg-white p-3 rounded-lg border border-blue-100 shadow-inner">
                          {candidate_answer?.written_answer || (
                            <span className="text-red-500 italic">No registró respuesta escrita antes del tiempo límite.</span>
                          )}
                        </p>
                      </div>

                      {/* Guía Oficial del Evaluador y Respuesta Modelo */}
                      {answer_key.benchmark_guide && (
                        <details className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 group">
                          <summary className="font-bold flex items-center justify-between cursor-pointer select-none">
                            <span className="flex items-center gap-1.5 text-amber-900">
                              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              <span>Guía Oficial del Evaluador & Respuesta Modelo de Referencia</span>
                            </span>
                            <span className="text-[11px] text-amber-700 underline group-open:hidden">Ver guía de calificación</span>
                          </summary>
                          <div className="mt-3 space-y-3 pt-2.5 border-t border-amber-200/80">
                            <div>
                              <span className="font-bold text-[11px] uppercase tracking-wider text-amber-950 block">Enfoque Esperado:</span>
                              <p className="mt-0.5 text-slate-700 leading-relaxed">{answer_key.benchmark_guide.ideal_approach}</p>
                            </div>
                            <div>
                              <span className="font-bold text-[11px] uppercase tracking-wider text-amber-950 block">Respuesta Modelo Óptima (12 pts):</span>
                              <p className="mt-1 text-slate-800 italic bg-white p-3 rounded-lg border border-amber-200 leading-relaxed whitespace-pre-line shadow-xs">
                                "{answer_key.benchmark_guide.sample_answer}"
                              </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-emerald-950">
                                <span className="font-bold text-[11px] uppercase block mb-1 text-emerald-800">✅ Fortalezas a premiar (3 pts):</span>
                                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
                                  {answer_key.benchmark_guide.key_strengths?.map((str: string, i: number) => (
                                    <li key={i}>{str}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="bg-white p-2.5 rounded-lg border border-red-200 text-red-950">
                                <span className="font-bold text-[11px] uppercase block mb-1 text-red-800">⚠️ Señales de alerta (0-1 pt):</span>
                                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
                                  {answer_key.benchmark_guide.red_flags?.map((flag: string, i: number) => (
                                    <li key={i}>{flag}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </details>
                      )}

                      {/* Evaluaciones previas de otros evaluadores */}
                      {reviews.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-700 uppercase">Calificaciones registradas por evaluadores:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {reviews.map(rev => (
                              <div key={rev.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                                <div className="flex items-center justify-between font-bold text-slate-800">
                                  <span>{rev.reviewer_name}</span>
                                  <span className="text-blue-700 text-sm font-extrabold">{rev.total_points} / 12 pts</span>
                                </div>
                                <div className="text-slate-600 mt-1 space-y-0.5">
                                  {Object.entries(rev.criterion_scores).map(([cKey, val]) => (
                                    <span key={cKey} className="inline-block mr-2 text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                      {cKey.toUpperCase()}: {val}/3 pts
                                    </span>
                                  ))}
                                </div>
                                {rev.observation && (
                                  <p className="mt-2 text-slate-600 italic">"{rev.observation}"</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rúbrica interactiva para calificar */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                            Calificar con Rúbrica (0 a 3 puntos por criterio):
                          </span>
                          <span className="text-xs font-bold text-blue-900">
                            Total asignado: {rubricScores.c1 + rubricScores.c2 + rubricScores.c3 + rubricScores.c4} / 12 pts
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {/* Criterio 1 */}
                          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                            <span className="font-semibold text-slate-800 block">
                              1. {answer_key.scoring_metadata?.criteria?.[0]?.name || 'Investigación / Diagnóstico'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {[0, 1, 2, 3].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleScoreChange(question.id, 'c1', val)}
                                  className={`flex-1 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                    rubricScores.c1 === val
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Criterio 2 */}
                          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                            <span className="font-semibold text-slate-800 block">
                              2. {answer_key.scoring_metadata?.criteria?.[1]?.name || 'Argumentación comercial'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {[0, 1, 2, 3].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleScoreChange(question.id, 'c2', val)}
                                  className={`flex-1 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                    rubricScores.c2 === val
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Criterio 3 */}
                          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                            <span className="font-semibold text-slate-800 block">
                              3. {answer_key.scoring_metadata?.criteria?.[2]?.name || 'Propuesta de cierre / CTA'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {[0, 1, 2, 3].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleScoreChange(question.id, 'c3', val)}
                                  className={`flex-1 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                    rubricScores.c3 === val
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Criterio 4 */}
                          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                            <span className="font-semibold text-slate-800 block">
                              4. {answer_key.scoring_metadata?.criteria?.[3]?.name || 'Profesionalismo y ética'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {[0, 1, 2, 3].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleScoreChange(question.id, 'c4', val)}
                                  className={`flex-1 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                    rubricScores.c4 === val
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Observaciones del evaluador */}
                        <div>
                          <input
                            type="text"
                            value={rubricScores.observation}
                            onChange={(e) => handleObservationChange(question.id, e.target.value)}
                            placeholder="Observación u opinión técnica del evaluador..."
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>

                        {candidate_answer && (
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              disabled={rubricScores.submitting}
                              onClick={() => handleSaveScore(question.id, candidate_answer.id)}
                              className="px-4 py-2 bg-[#08265C] hover:bg-[#0D3882] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>{rubricScores.submitting ? 'Guardando...' : `Guardar Calificación como ${currentReviewer.name}`}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
