import { db } from '../data/mockDatabase.js';
import { CandidateAdministrativeState } from '../types.js';

export class CandidateManagementService {
  private candidate(id: string) {
    const candidate = db.getCandidateById(id);
    if (!candidate) throw new Error('Candidata no encontrada.');
    return candidate;
  }
  private context(reason: unknown, actor: unknown) {
    if (typeof reason !== 'string' || reason.trim().length < 5 || reason.length > 1000) {
      throw new Error('Indica un motivo de entre 5 y 1000 caracteres.');
    }
    if (typeof actor !== 'string' || !actor.trim() || actor.length > 100) throw new Error('Evaluador no válido.');
    return { reason: reason.trim(), actor: actor.trim() };
  }
  private async record(id: string, state: CandidateAdministrativeState, actor: string) {
    const previous = db.getCandidateAdministrativeState(id);
    await db.addAuditLog(actor, 'CANDIDATE_LIFECYCLE', id, { ...state, revision: previous.revision + 1 });
    return db.getCandidateAdministrativeState(id);
  }
  async edit(id: string, input: { full_name?: unknown; email?: unknown; phone?: unknown }, actor: unknown) {
    const previous = this.candidate(id);
    if (db.getCandidateAdministrativeState(id).deleted) throw new Error('Restaura el registro antes de editarlo.');
    const name = typeof input.full_name === 'string' ? input.full_name.trim() : '';
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const phone = typeof input.phone === 'string' ? input.phone.trim() : '';
    if (name.length < 2 || name.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255 || phone.length > 50) {
      throw new Error('Revisa el nombre, correo y teléfono de la candidata.');
    }
    if (typeof actor !== 'string' || !actor.trim() || actor.length > 100) throw new Error('Evaluador no válido.');
    const duplicate = db.getCandidateByEmail(email);
    if (duplicate && duplicate.id !== id) throw new Error('Ese correo pertenece a otra candidata, incluida la papelera.');
    const candidate = await db.updateCandidate(id, { full_name: name, email, phone });
    await db.addAuditLog(actor.trim(), 'EDIT_CANDIDATE', id, {
      fields: ['full_name','email','phone'].filter(field => previous[field as keyof typeof previous] !== candidate?.[field as keyof typeof previous])
    });
    return candidate;
  }
  async remove(id: string, reason: unknown, actor: unknown) {
    this.candidate(id);
    const context = this.context(reason, actor);
    const state = db.getCandidateAdministrativeState(id);
    if (state.deleted) return state;
    return this.record(id, { ...state, deleted: true, delete_reason: context.reason, deleted_by: context.actor, deleted_at: new Date().toISOString() }, context.actor);
  }
  async restore(id: string, reason: unknown, actor: unknown) {
    this.candidate(id);
    const context = this.context(reason, actor);
    const state = db.getCandidateAdministrativeState(id);
    if (!state.deleted) return state;
    return this.record(id, { ...state, deleted: false, last_action_reason: context.reason }, context.actor);
  }
  async participation(id: string, status: unknown, reason: unknown, actor: unknown) {
    this.candidate(id);
    const context = this.context(reason, actor);
    const state = db.getCandidateAdministrativeState(id);
    const assessment = db.getAssessmentByCandidateId(id);
    if (state.deleted) throw new Error('Restaura el registro antes de cambiar su asistencia.');
    if (!['active','no_show','incomplete'].includes(String(status))) throw new Error('Estado de asistencia no válido.');
    if (!assessment) throw new Error('La candidata no tiene evaluación.');
    if (assessment.status === 'submitted' || assessment.status === 'graded' || db.getFinalReview(assessment.id)) {
      throw new Error('Una evaluación entregada o histórica no puede marcarse como inasistencia.');
    }
    if (status === 'no_show' && assessment.status !== 'pending') throw new Error('La evaluación ya empezó. Utiliza No completó para registrar el abandono.');
    if (status === 'incomplete' && assessment.status !== 'in_progress') throw new Error('No completó corresponde a una evaluación iniciada.');
    return this.record(id, {
      ...state, participation: status as CandidateAdministrativeState['participation'], participation_reason: context.reason,
      participation_changed_at: new Date().toISOString(), participation_changed_by: context.actor
    }, context.actor);
  }
}
export const candidateManagementService = new CandidateManagementService();
