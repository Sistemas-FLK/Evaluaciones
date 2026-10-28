import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CandidateOverviewRow } from '../../types';
import { manageCandidate } from '../../services/api';

export type CandidateAction = 'edit' | 'delete' | 'restore' | 'no_show' | 'incomplete' | 'active';
const labels: Record<CandidateAction, string> = {
  edit: 'Editar candidata', delete: 'Eliminar candidata', restore: 'Restaurar candidata',
  no_show: 'No se presentó', incomplete: 'No completó', active: 'Restablecer acceso'
};
interface Props {
  candidate: CandidateOverviewRow;
  action: CandidateAction;
  authToken: string;
  reviewerName: string;
  onClose: () => void;
  onSaved: () => void;
}
export function CandidateManagementModal({ candidate, action, authToken, reviewerName, onClose, onSaved }: Props) {
  const [name, setName] = useState(candidate.full_name);
  const [email, setEmail] = useState(candidate.email);
  const [phone, setPhone] = useState(candidate.phone || '');
  const [reason, setReason] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const editing = action === 'edit';
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    if (action === 'delete' && confirmation !== candidate.access_code) {
      setError('Escribe el código de invitación para confirmar la eliminación.'); return;
    }
    setSaving(true); setError('');
    try {
      await manageCandidate(candidate.candidate_id, action, {
        actor: reviewerName, ...(editing ? { full_name: name, email, phone } : { reason })
      }, authToken);
      onSaved();
    } catch (err: any) { setError(err.message || 'No se pudo guardar.'); }
    finally { setSaving(false); }
  };
  const fieldClass = 'w-full mt-1 p-3 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-600';
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="manage-title" className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto">
        <header className="flex justify-between items-center p-5 bg-[#08265C] text-white rounded-t-2xl">
          <h2 id="manage-title" className="font-bold">{labels[action]}</h2>
          <button type="button" aria-label="Cerrar gestión de candidata" disabled={saving} onClick={onClose}><X className="w-5 h-5" /></button>
        </header>
        <form onSubmit={submit} className="p-5 space-y-4">
          <p className="text-sm text-slate-700"><strong>{candidate.full_name}</strong><br /><span className="font-mono text-xs">{candidate.access_code}</span></p>
          {action === 'delete' && <p className="text-sm p-3 bg-red-50 border border-red-200 rounded-xl text-red-900">Se retirará del listado y se bloqueará su acceso. Sus respuestas y calificaciones se conservarán. Podrás restaurarla desde Eliminadas.</p>}
          {action === 'no_show' && <p className="text-sm text-slate-600">Registra que no asistió a la evaluación. Su código quedará bloqueado hasta restablecer el acceso.</p>}
          {action === 'incomplete' && <p className="text-sm text-slate-600">Cierra el acceso por abandono de la evaluación. Se conservan las respuestas y los puntajes registrados.</p>}
          {action === 'active' && <p className="text-sm text-slate-600">Quita la marca de asistencia y permite volver a ingresar. Conserva las respuestas y el cronómetro original; no inicia un nuevo intento.</p>}
          {action === 'restore' && <p className="text-sm text-slate-600">La candidata volverá al listado con sus respuestas y su estado de asistencia anterior.</p>}
          {editing ? <>
            <label className="block text-xs font-semibold text-slate-700">Nombres y apellidos<input autoFocus required minLength={2} maxLength={255} value={name} onChange={e=>setName(e.target.value)} className={fieldClass} disabled={saving} /></label>
            <label className="block text-xs font-semibold text-slate-700">Correo electrónico<input required type="email" maxLength={255} value={email} onChange={e=>setEmail(e.target.value)} className={fieldClass} disabled={saving} /></label>
            <label className="block text-xs font-semibold text-slate-700">Teléfono / WhatsApp<input maxLength={50} value={phone} onChange={e=>setPhone(e.target.value)} className={fieldClass} disabled={saving} /></label>
          </> : <label className="block text-xs font-semibold text-slate-700">Motivo<textarea autoFocus required minLength={5} maxLength={1000} rows={3} value={reason} onChange={e=>setReason(e.target.value)} className={fieldClass} disabled={saving} /></label>}
          {action === 'delete' && <label className="block text-xs font-semibold text-slate-700">Escribe {candidate.access_code} para confirmar<input required value={confirmation} onChange={e=>setConfirmation(e.target.value)} autoComplete="off" className={fieldClass} disabled={saving} /></label>}
          {error && <p role="alert" className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" disabled={saving} onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-700">Cancelar</button>
            <button disabled={saving} className={`px-4 py-2 rounded-xl text-white font-semibold text-sm disabled:opacity-50 ${action === 'delete' ? 'bg-red-700' : 'bg-[#08265C]'}`}>{saving ? 'Guardando...' : labels[action]}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
