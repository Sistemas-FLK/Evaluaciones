import React from 'react';
import { Printer, X, Building2, CheckCircle2 } from 'lucide-react';
import { CandidateDetailResponse } from '../../types';

interface PrintableReportProps {
  isOpen: boolean;
  onClose: () => void;
  data: CandidateDetailResponse | null;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!isOpen || !data) return null;

  const { candidate, assessment, questions_detail, final_review } = data;

  const handlePrint = () => {
    window.print();
  };

  const totalTimeSeconds = questions_detail.reduce((sum, item) => {
    return sum + (item.candidate_answer?.elapsed_seconds || 0);
  }, 0);

  const mins = Math.floor(totalTimeSeconds / 60);
  const secs = totalTimeSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Barra de control superior (oculta al imprimir) */}
        <div className="bg-[#08265C] p-4 text-white flex items-center justify-between no-print flex-shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-300" />
            <span className="font-bold text-sm">Vista de Impresión — Reporte Ejecutivo QUIMICORP</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-blue-900/50 hover:bg-blue-800 text-blue-200 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hoja imprimible corporativa */}
        <div className="p-8 sm:p-12 overflow-y-auto space-y-6 text-slate-900 bg-white print:p-0">
          {/* Membrete institucional */}
          <div className="border-b-2 border-[#08265C] pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#08265C] text-white flex items-center justify-center font-black text-2xl tracking-wider">
                Q
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-[#08265C] tracking-tight">
                  QUIMICORP PERÚ S.A.C.
                </h1>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                  RUC: 20601234567 • Gerencia de Talento Humano y Comercial
                </p>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="font-bold text-blue-900 block">INFORME TÉCNICO DE EVALUACIÓN</span>
              <span className="text-slate-500">Fecha: {new Date().toLocaleDateString('es-PE')}</span>
            </div>
          </div>

          {/* Datos de la candidata y posición */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <p className="text-slate-500 font-semibold uppercase">Postulante Evaluada:</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{candidate.full_name}</p>
              <p className="text-slate-600 mt-0.5">{candidate.email}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold uppercase">Posición Convocada:</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">Ejecutiva de Ventas, Captación Digital y E-commerce</p>
              <p className="text-slate-600 mt-0.5">Tiempo total utilizado: {mins}m {secs}s (Máx 14m)</p>
            </div>
          </div>

          {/* Cuadro de Puntuaciones Oficiales */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Puntaje Automático</span>
              <p className="text-lg font-black text-emerald-700 mt-0.5">{assessment.objective_score} / 52 pts</p>
              <span className="text-[10px] text-slate-500">6 preguntas objetivas</span>
            </div>
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Puntaje Manual</span>
              <p className="text-lg font-black text-blue-700 mt-0.5">{assessment.manual_score} / 48 pts</p>
              <span className="text-[10px] text-slate-500">4 casos con rúbrica</span>
            </div>
            <div className="p-3 border-2 border-[#08265C] rounded-xl bg-blue-50/60">
              <span className="text-[11px] font-bold text-[#08265C] uppercase">Calificación Total</span>
              <p className="text-xl font-black text-[#08265C] mt-0.5">{assessment.total_score} / 100 pts</p>
              <span className="text-[10px] font-semibold text-blue-800">
                {assessment.total_score >= 85 ? 'Desempeño Destacado' :
                 assessment.total_score >= 70 ? 'Buen Desempeño' :
                 assessment.total_score >= 55 ? 'Potencial con Capacitación' : 'Requiere Mayor Evaluación'}
              </span>
            </div>
          </div>

          {/* Tabla de los 10 ejercicios evaluados */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Desglose de Resultados por Ejercicio:
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#08265C] text-white">
                  <tr>
                    <th className="p-2.5 font-bold">#</th>
                    <th className="p-2.5 font-bold">Competencia / Enunciado</th>
                    <th className="p-2.5 font-bold">Tipo</th>
                    <th className="p-2.5 font-bold">Tiempo</th>
                    <th className="p-2.5 font-bold">Puntaje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {questions_detail.map((item) => {
                    const { question, candidate_answer, reviews } = item;
                    const isMC = question.question_type === 'multiple_choice';
                    let pointsEarned = 0;
                    if (isMC) {
                      pointsEarned = candidate_answer?.objective_points || 0;
                    } else if (reviews.length > 0) {
                      pointsEarned = reviews.reduce((acc, r) => acc + r.total_points, 0) / reviews.length;
                    }

                    return (
                      <tr key={question.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{question.position}</td>
                        <td className="p-2.5">
                          <p className="font-bold text-slate-800">{question.category}</p>
                          <p className="text-[11px] text-slate-600 line-clamp-1">{question.statement}</p>
                          {!isMC && candidate_answer?.written_answer && (
                            <p className="text-[10px] text-slate-500 italic mt-1 bg-slate-50 p-1.5 rounded">
                              "{candidate_answer.written_answer.substring(0, 140)}..."
                            </p>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-500 whitespace-nowrap">
                          {isMC ? 'Opción múltiple' : 'Abierta'}
                        </td>
                        <td className="p-2.5 font-mono text-slate-600 whitespace-nowrap">
                          {candidate_answer?.elapsed_seconds || 0}s / {question.time_limit_seconds}s
                        </td>
                        <td className="p-2.5 font-bold whitespace-nowrap text-right">
                          {pointsEarned.toFixed(1)} / {question.max_points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dictamen y Justificación Colegiada */}
          <div className="p-4 rounded-xl border-2 border-slate-300 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold uppercase text-slate-700">Dictamen Final del Comité Evaluador:</span>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                {final_review?.recommendation || 'Pendiente de dictamen final'}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">Fundamentación y Justificación:</p>
              <p className="text-xs text-slate-800 mt-1 leading-relaxed whitespace-pre-line bg-white p-3 rounded-lg border border-slate-200">
                {final_review?.justification || 'Aún no se ha registrado la justificación colegiada en el sistema.'}
              </p>
            </div>
          </div>

          {/* Firmas de Evaluadores Responsables */}
          <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-t border-slate-400 pt-2 w-3/4 mx-auto font-bold text-slate-900">
                María
              </div>
              <p className="text-slate-500 text-[11px]">Evaluadora Principal de Ventas</p>
              <p className="text-slate-400 text-[10px]">QUIMICORP PERÚ S.A.C.</p>
            </div>

            <div>
              <div className="border-t border-slate-400 pt-2 w-3/4 mx-auto font-bold text-slate-900">
                Segundo Evaluador
              </div>
              <p className="text-slate-500 text-[11px]">Comité de Captación & E-commerce</p>
              <p className="text-slate-400 text-[10px]">QUIMICORP PERÚ S.A.C.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
