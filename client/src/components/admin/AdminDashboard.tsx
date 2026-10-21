import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Award, 
  CheckCircle, 
  FileSpreadsheet, 
  UserPlus, 
  BarChart3, 
  RefreshCw, 
  Search, 
  Eye, 
  Printer, 
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { OverviewData, CandidateOverviewRow } from '../../types';
import { getAdminOverview, getCandidateDetail } from '../../services/api';
import { CandidateDetailModal } from './CandidateDetailModal';
import { CandidateComparisonModal } from './CandidateComparisonModal';
import { NewCandidateModal } from './NewCandidateModal';
import { PrintableReport } from './PrintableReport';

interface AdminDashboardProps {
  authToken: string;
  currentReviewer: { id: string; name: string };
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  authToken,
  currentReviewer,
  onLogout
}) => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modales
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isNewCandidateOpen, setIsNewCandidateOpen] = useState(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);
  const [printableData, setPrintableData] = useState<any | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await getAdminOverview(authToken);
      setOverview(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cargar datos del panel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [authToken]);

  const handleOpenDetail = async (candidateId: string) => {
    try {
      const detail = await getCandidateDetail(candidateId, authToken);
      setSelectedCandidateDetail(detail);
      setIsDetailOpen(true);
    } catch (err: any) {
      alert(err.message || 'Error al obtener la ficha de la candidata.');
    }
  };

  const handleOpenPrint = async (candidateId: string) => {
    try {
      const detail = await getCandidateDetail(candidateId, authToken);
      setPrintableData(detail);
      setIsPrintReportOpen(true);
    } catch (err: any) {
      alert(err.message || 'Error al cargar reporte imprimible.');
    }
  };

  const handleExportCSV = () => {
    window.open('/api/admin/export/csv', '_blank');
  };

  // Filtrar candidatas
  const filteredCandidates = overview?.candidates.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.access_code.toLowerCase().includes(q)
    );
  }) || [];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Barra de bienvenida al evaluador */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              QUIMICORP PERÚ S.A.C. — Panel de Evaluadores
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="text-xs text-slate-500 font-medium">Sesión Activa</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Supervisión y Calificación Comercial
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Evaluador en funciones: <strong className="text-blue-900 font-bold">{currentReviewer.name}</strong> • Convocatoria: Ejecutiva de Ventas & E-commerce
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsNewCandidateOpen(true)}
            className="px-4 py-2.5 bg-[#08265C] hover:bg-[#0D3882] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nueva Candidata</span>
          </button>

          <button
            onClick={() => setIsCompareOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Comparar Candidatas</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Descargar tabla en formato CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={fetchOverview}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all cursor-pointer"
            title="Recargar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-2.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Tarjetas de Métricas / KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Candidatas</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {overview?.kpis.total_candidates || 0}
          </p>
          <span className="text-[11px] text-slate-500">Registradas en sistema</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pendientes</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-600">
            {overview?.kpis.pending || 0}
          </p>
          <span className="text-[11px] text-slate-500">Aún no inician</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">En Progreso</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
          </div>
          <p className="text-2xl font-black text-blue-600">
            {overview?.kpis.in_progress || 0}
          </p>
          <span className="text-[11px] text-slate-500">Respondiendo examen</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Por Calificar</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">
            {overview?.kpis.submitted_pending_review || 0}
          </p>
          <span className="text-[11px] text-slate-500">Requiere revisión manual</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Calificadas</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {overview?.kpis.graded || 0}
          </p>
          <span className="text-[11px] text-slate-500">Con dictamen final</span>
        </div>
      </div>

      {/* Tabla Principal de Candidatas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Barra de búsqueda y conteo */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Listado de Postulantes
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {filteredCandidates.length}
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, código o email..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Candidata</th>
                <th className="py-3 px-3">Código Invitación</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3 text-center">Puntaje Auto (52)</th>
                <th className="py-3 px-3 text-center">Puntaje Manual (48)</th>
                <th className="py-3 px-3 text-center">Total (100)</th>
                <th className="py-3 px-3 text-center">Tiempo</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se encontraron candidatas registradas.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map(c => {
                  const mins = Math.floor(c.total_time_seconds / 60);
                  const secs = c.total_time_seconds % 60;

                  return (
                    <tr key={c.candidate_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {c.full_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{c.full_name}</p>
                            <p className="text-[11px] text-slate-500">
                              {c.email ? c.email : <span className="text-amber-600 italic">Gmail pendiente de registro</span>}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {c.access_code}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          c.status === 'graded' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : c.status === 'submitted'
                            ? 'bg-amber-100 text-amber-800'
                            : c.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            c.status === 'graded' ? 'bg-emerald-500' :
                            c.status === 'submitted' ? 'bg-amber-500' :
                            c.status === 'in_progress' ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'
                          }`}></span>
                          <span>
                            {c.status === 'graded' ? 'Calificada' :
                             c.status === 'submitted' ? 'Pendiente revisión' :
                             c.status === 'in_progress' ? 'En progreso' : 'Pendiente'}
                          </span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center font-extrabold text-emerald-600 text-xs">
                        {c.status === 'pending' ? '—' : `${c.objective_score} pts`}
                      </td>

                      <td className="py-3.5 px-3 text-center font-extrabold text-blue-600 text-xs">
                        {c.status === 'pending' ? '—' : `${c.manual_score} pts`}
                      </td>

                      <td className="py-3.5 px-3 text-center text-xs">
                        {c.status === 'pending' ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <span className="font-black text-slate-900 text-sm">
                            {c.total_score} <span className="text-[10px] text-slate-400 font-normal">/ 100</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono text-[11px] text-slate-600">
                        {c.total_time_seconds > 0 ? `${mins}m ${secs}s` : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(c.candidate_id)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="Revisar respuestas y calificar preguntas abiertas"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{c.status === 'submitted' ? 'Calificar' : 'Ficha'}</span>
                          </button>

                          <button
                            onClick={() => handleOpenPrint(c.candidate_id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                            title="Generar reporte imprimible"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      <CandidateDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        data={selectedCandidateDetail}
        authToken={authToken}
        currentReviewer={currentReviewer}
        onReload={() => {
          fetchOverview();
          if (selectedCandidateDetail) {
            handleOpenDetail(selectedCandidateDetail.candidate.id);
          }
        }}
      />

      <CandidateComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        candidates={overview?.candidates || []}
        authToken={authToken}
        reviewerName={currentReviewer.name}
        onSaved={fetchOverview}
      />

      <NewCandidateModal
        isOpen={isNewCandidateOpen}
        onClose={() => setIsNewCandidateOpen(false)}
        authToken={authToken}
        onCandidateCreated={fetchOverview}
      />

      <PrintableReport
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        data={printableData}
      />
    </div>
  );
};
