import React, { useState } from 'react';
import { 
  X, 
  BarChart3, 
  Award, 
  Clock, 
  CheckCircle, 
  Sparkles, 
  Save, 
  ShieldCheck, 
  Users,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { CandidateOverviewRow } from '../../types';
import { submitFinalReview } from '../../services/api';

interface CandidateComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CandidateOverviewRow[];
  authToken: string;
  reviewerName: string;
  onSaved: () => void;
}

export const CandidateComparisonModal: React.FC<CandidateComparisonModalProps> = ({
  isOpen,
  onClose,
  candidates,
  authToken,
  reviewerName,
  onSaved
}) => {
  if (!isOpen) return null;

  // Seleccionar a Esther y Geraldine por defecto si existen
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    candidates[0]?.candidate_id || ''
  );
  const [recommendation, setRecommendation] = useState<string>('Recomendada');
  const [justification, setJustification] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const currentCandidate = candidates.find(c => c.candidate_id === selectedCandidateId) || candidates[0];

  const handleSaveRecommendation = async () => {
    if (!currentCandidate || !currentCandidate.assessment_id) {
      alert('La candidata seleccionada aún no tiene una evaluación iniciada.');
      return;
    }

    if (!justification.trim() || justification.trim().length < 10) {
      alert('Por favor ingrese una justificación comercial fundada para respaldar el dictamen.');
      return;
    }

    setSubmitting(true);
    setSuccessMsg('');
    try {
      await submitFinalReview({
        assessment_id: currentCandidate.assessment_id,
        recommendation,
        justification: justification.trim(),
        approved_by: reviewerName
      }, authToken);

      setSuccessMsg(`Dictamen final registrado para ${currentCandidate.full_name}.`);
      onSaved();
    } catch (err: any) {
      alert(err.message || 'Error al guardar dictamen final.');
    } finally {
      setSubmitting(false);
    }
  };

  // Comparativa de competencias
  const competencies = [
    { name: 'Atención y Oportunidad de Venta (P1)', max: 8 },
    { name: 'Negociación bajo Presión (P2)', max: 12 },
    { name: 'Captación Orgánica en Redes (P3)', max: 12 },
    { name: 'Razonamiento y Conversión (P4)', max: 10 },
    { name: 'Cálculo Comercial y Margen (P5)', max: 10 },
    { name: 'Priorización y Criterio (P6)', max: 8 },
    { name: 'Ética y Responsabilidad (P7)', max: 8 },
    { name: 'Recuperación de Ventas (P8)', max: 12 },
    { name: 'Creatividad y Video B2B (P9)', max: 12 },
    { name: 'Análisis de Conversión (P10)', max: 8 }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Encabezado */}
        <div className="bg-[#08265C] p-6 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                QUIMICORP PERÚ S.A.C.
              </span>
              <h2 className="text-xl font-extrabold text-white">
                Módulo Comparativo de Competencias Comerciales
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Evaluación objetiva y colegiada de postulantes a Ventas & E-commerce
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-blue-900/50 hover:bg-blue-800 text-blue-200 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Tarjeta comparativa Head-to-Head */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Comparativa Global de Postulantes
              </h3>
              <span className="text-xs text-slate-500">
                Puntaje sobre 100 puntos estándar
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map(cand => {
                const isSelected = cand.candidate_id === currentCandidate?.candidate_id;
                const scorePercent = Math.min(100, cand.total_score);
                const mins = Math.floor(cand.total_time_seconds / 60);
                const secs = cand.total_time_seconds % 60;

                return (
                  <div
                    key={cand.candidate_id}
                    onClick={() => setSelectedCandidateId(cand.candidate_id)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-white shadow-md ring-2 ring-blue-600/10'
                        : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                          {cand.full_name[0]}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{cand.full_name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{cand.access_code}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        cand.status === 'graded' ? 'bg-emerald-100 text-emerald-800' :
                        cand.status === 'submitted' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {cand.status === 'graded' ? 'Calificada' : cand.status === 'submitted' ? 'Pendiente revisión' : cand.status}
                      </span>
                    </div>

                    {/* Desglose de puntajes */}
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center border-t border-slate-100 pt-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Automático</span>
                        <p className="text-sm font-black text-emerald-600">{cand.objective_score} / 52</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Manual</span>
                        <p className="text-sm font-black text-blue-600">{cand.manual_score} / 48</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                        <p className="text-base font-black text-slate-900">{cand.total_score} / 100</p>
                      </div>
                    </div>

                    {/* Barra de progreso de puntaje */}
                    <div className="mt-3">
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${scorePercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Tiempo contextual */}
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Tiempo invertido: {mins}m {secs}s
                      </span>
                      {isSelected && (
                        <span className="text-blue-600 font-bold text-[11px]">
                          Seleccionada para dictamen &check;
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guía de interpretación de puntajes */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-slate-900 uppercase">Rangos de interpretación orientativa:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-medium">
              <span className="p-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                <strong>85–100:</strong> Desempeño destacado
              </span>
              <span className="p-2 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                <strong>70–84:</strong> Buen desempeño
              </span>
              <span className="p-2 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                <strong>55–69:</strong> Potencial con capacitación
              </span>
              <span className="p-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-300">
                <strong>&lt; 55:</strong> Requiere mayor evaluación
              </span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1 italic">
              * Estos rangos son contextuales y no implican contratación o rechazo automático; la decisión final es colegiada.
            </p>
          </div>

          {/* Formulario de Dictamen y Recomendación Final */}
          {currentCandidate && (
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    Dictamen Final Colegiado para: <span className="text-blue-900 font-extrabold">{currentCandidate.full_name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Registrado por el evaluador: <strong className="text-slate-800">{reviewerName}</strong>
                  </p>
                </div>
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Recomendación de Selección:
                  </label>
                  <select
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    className="w-full sm:w-80 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Recomendada">Recomendada</option>
                    <option value="Recomendada con capacitación">Recomendada con capacitación</option>
                    <option value="Pendiente de evaluación adicional">Pendiente de evaluación adicional</option>
                    <option value="No recomendada para este puesto por ahora">No recomendada para este puesto por ahora</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Justificación Comercial y Fundamentos de la Decisión:
                  </label>
                  <textarea
                    rows={4}
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Detalla las fortalezas observadas en ventas, captación, razonamiento numérico, ética comercial y áreas de oportunidad de mejora..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-normal shadow-inner"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Esta justificación se incorporará en el reporte oficial descargable e imprimible de QUIMICORP.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSaveRecommendation}
                    className="px-6 py-2.5 bg-[#08265C] hover:bg-[#0D3882] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{submitting ? 'Guardando dictamen...' : 'Guardar y Aprobar Dictamen Final'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
