import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { 
  CandidateAdministrativeState,
  Candidate, 
  Invitation, 
  Assessment, 
  Question, 
  AnswerKey, 
  Answer, 
  ReviewerScore, 
  FinalReview, 
  AuditLog 
} from '../types.js';
import { 
  INITIAL_QUESTIONS, 
  INITIAL_ANSWER_KEYS, 
  INITIAL_CANDIDATES, 
  INITIAL_INVITATIONS, 
  INITIAL_ASSESSMENTS,
  INITIAL_ANSWERS,
  INITIAL_REVIEWER_SCORES
} from './initialData.js';
import { getSupabase } from '../config/supabase.js';

async function syncSupabase(promise: PromiseLike<any>, opName: string) {
  const result = await promise;
  if (result?.error) {
    console.error(`[Supabase ${opName}]`, result.error.message);
    throw new Error('No se pudo guardar en la base de datos. Inténtalo nuevamente.');
  }
}

// Base de datos en memoria para operación ultrarrápida con sincronización en la nube a Supabase PostgreSQL
class MemoryDatabase {
  candidates: Map<string, Candidate> = new Map();
  invitations: Map<string, Invitation> = new Map();
  assessments: Map<string, Assessment> = new Map();
  questions: Map<number, Question> = new Map();
  answerKeys: Map<number, AnswerKey> = new Map();
  answers: Map<string, Answer> = new Map(); // key: assessmentId_questionId
  reviewerScores: Map<string, ReviewerScore> = new Map(); // key: answerId_reviewerId
  finalReviews: Map<string, FinalReview> = new Map(); // key: assessmentId
  auditLogs: AuditLog[] = [];

  readonly ready: Promise<void>;
  initializationError: string | null = null;
  private readonly storagePath = process.env.LOCAL_DATA_FILE || fileURLToPath(new URL('../../data/database.json', import.meta.url));

  constructor() {
    this.seed();
    if (!getSupabase()) this.restoreLocal();
    this.ready = this.hydrateFromSupabase().catch(error => {
      this.initializationError = error?.message || 'Error al cargar la base de datos';
    });
  }

  private restoreLocal() {
    if (!fs.existsSync(this.storagePath)) return;
    // Un archivo inválido debe detener el arranque, nunca reemplazarse con semillas.
    const data = JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
    if (data.version !== 1) throw new Error('Formato de almacén local no compatible');
    for (const key of ['candidates', 'invitations', 'assessments', 'answers', 'reviewerScores', 'finalReviews'] as const) {
      if (!Array.isArray(data[key])) throw new Error(`Almacén local inválido: ${key}`);
      (this[key] as Map<any, any>) = new Map(data[key]);
    }
    this.auditLogs = data.auditLogs || [];
  }

  persistLocal() {
    if (getSupabase()) return;
    const data: Record<string, unknown> = { version: 1, auditLogs: this.auditLogs };
    for (const key of ['candidates', 'invitations', 'assessments', 'answers', 'reviewerScores', 'finalReviews'] as const) {
      data[key] = Array.from((this[key] as Map<any, any>).entries());
    }
    fs.mkdirSync(path.dirname(this.storagePath), { recursive: true });
    fs.writeFileSync(this.storagePath + '.tmp', JSON.stringify(data), 'utf8');
    fs.renameSync(this.storagePath + '.tmp', this.storagePath);
  }

  seed() {
    INITIAL_CANDIDATES.forEach(c => this.candidates.set(c.id, { ...c }));
    INITIAL_INVITATIONS.forEach(i => this.invitations.set(i.id, { ...i }));
    INITIAL_ASSESSMENTS.forEach(a => this.assessments.set(a.id, { ...a }));
    INITIAL_QUESTIONS.forEach(q => this.questions.set(q.id, { ...q }));
    INITIAL_ANSWER_KEYS.forEach(k => this.answerKeys.set(k.question_id, { ...k }));
    INITIAL_ANSWERS.forEach(ans => this.answers.set(`${ans.assessment_id}_${ans.question_id}`, { ...ans }));
    INITIAL_REVIEWER_SCORES.forEach(r => this.reviewerScores.set(`${r.answer_id}_${r.reviewer_id}`, { ...r }));
  }

  /**
   * Hidrata y sincroniza la memoria con PostgreSQL Supabase al iniciar
   */
  async hydrateFromSupabase() {
    this.persistLocal();
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      console.log('[Supabase] Hidratando datos desde PostgreSQL Supabase...');
      const [candRes, invRes, assRes, ansRes, revRes, finalRes] = await Promise.all([
        supabase.from('candidates').select('*'),
        supabase.from('invitations').select('*'),
        supabase.from('assessments').select('*'),
        supabase.from('answers').select('*'),
        supabase.from('reviewer_scores').select('*'),
        supabase.from('final_reviews').select('*')
      ]);

      for (const result of [candRes, invRes, assRes, ansRes, revRes, finalRes]) {
        if (result.error) throw new Error(result.error.message);
      }
      if (candRes.data?.length) {
        this.candidates.clear();
        this.invitations.clear();
        this.assessments.clear();
      }
      this.answers.clear();
      this.reviewerScores.clear();
      this.finalReviews.clear();
      finalRes.data?.forEach((r: any) => this.finalReviews.set(r.assessment_id, r));
      if (candRes.data && candRes.data.length > 0) {
        candRes.data.forEach((c: any) => this.candidates.set(c.id, c));
      } else if (candRes.data && candRes.data.length === 0) {
        console.log('[Supabase] Tablas vacías detectadas. Inicializando datos de candidatas en Supabase...');
        try {
          const candidates = await supabase.from('candidates').upsert(INITIAL_CANDIDATES);
          if (candidates.error) throw candidates.error;
          const invitations = await supabase.from('invitations').upsert(INITIAL_INVITATIONS);
          if (invitations.error) throw invitations.error;
          const assessments = await supabase.from('assessments').upsert(INITIAL_ASSESSMENTS);
          if (assessments.error) throw assessments.error;
          console.log('[Supabase] Inicialización completada: Esther y Geraldine listas en Supabase.');
        } catch (seedErr) {
          throw seedErr;
        }
      }
      if (invRes.data && invRes.data.length > 0) {
        invRes.data.forEach((i: any) => this.invitations.set(i.id, i));
      }
      if (assRes.data && assRes.data.length > 0) {
        assRes.data.forEach((a: any) => this.assessments.set(a.id, a));
      }
      if (ansRes.data && ansRes.data.length > 0) {
        ansRes.data.forEach((ans: any) => this.answers.set(`${ans.assessment_id}_${ans.question_id}`, ans));
      }
      if (revRes.data && revRes.data.length > 0) {
        revRes.data.forEach((r: any) => this.reviewerScores.set(`${r.answer_id}_${r.reviewer_id}`, r));
      }
      // Lifecycle events are durable state. Read every page, not only the API's first 1000 rows.
      const logs: AuditLog[] = [];
      for (let offset = 0; ; offset += 500) {
        const result = await supabase.from('audit_logs').select('*')
          .order('created_at', { ascending: false }).order('id', { ascending: false }).range(offset, offset + 499);
        if (result.error) throw new Error(result.error.message);
        logs.push(...(result.data || []));
        if (!result.data || result.data.length < 500) break;
      }
      this.auditLogs = logs;
      console.log(`[Supabase] Conectado y sincronizado: ${candRes.data?.length || 0} candidatas, ${assRes.data?.length || 0} evaluaciones.`);
    } catch (err: any) {
      console.error('[Supabase Hydration Error]', err?.message || err);
      throw err;
    }
  }

  getCandidateAdministrativeState(candidateId: string): CandidateAdministrativeState {
    const events = this.auditLogs.filter(log => log.action === 'CANDIDATE_LIFECYCLE' && log.entity_id === candidateId);
    const latest = events.reduce<AuditLog | undefined>((best, log) =>
      !best || (log.metadata?.revision || 0) > (best.metadata?.revision || 0) ? log : best, undefined);
    return latest ? { ...latest.metadata } : { revision: 0, deleted: false, participation: 'active' };
  }

  assertCandidateAvailable(candidateId: string) {
    const state = this.getCandidateAdministrativeState(candidateId);
    if (state.deleted) throw new Error('Este registro fue eliminado. Contacta al evaluador.');
    if (state.participation !== 'active') throw new Error('El acceso a esta evaluación está cerrado por una incidencia de asistencia. Contacta al evaluador.');
  }

  // Candidatas
  getCandidates(): Candidate[] {
    return Array.from(this.candidates.values());
  }

  getCandidateById(id: string): Candidate | undefined {
    return this.candidates.get(id);
  }

  getCandidateByEmail(email: string): Candidate | undefined {
    if (!email) return undefined;
    return Array.from(this.candidates.values()).find(c => c.email.toLowerCase() === email.toLowerCase());
  }

  async createCandidate(candidate: Candidate): Promise<Candidate> {
    const supabase = getSupabase();
    if (supabase) {
      await syncSupabase(
        supabase.from('candidates').upsert({
          id: candidate.id,
          full_name: candidate.full_name,
          email: candidate.email,
          phone: candidate.phone,
          created_at: candidate.created_at
        }),
        'createCandidate'
      );
    }
    this.candidates.set(candidate.id, candidate);
    this.persistLocal();
    return candidate;
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate | undefined> {
    const existing = this.candidates.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };

    const supabase = getSupabase();
    if (supabase) {
      await syncSupabase(
        supabase.from('candidates').update({
          full_name: updated.full_name,
          email: updated.email,
          phone: updated.phone
        }).eq('id', id),
        'updateCandidate'
      );
    }

    this.candidates.set(id, updated);
    this.persistLocal();
    return updated;
  }

  // Invitaciones
  getInvitationByCode(code: string): Invitation | undefined {
    const cleanCode = code.trim().toUpperCase();
    return Array.from(this.invitations.values()).find(
      i => i.access_code.toUpperCase() === cleanCode
    );
  }

  async createInvitation(invitation: Invitation): Promise<Invitation> {
    const supabase = getSupabase();
    if (supabase) {
      await syncSupabase(
        supabase.from('invitations').upsert(invitation),
        'createInvitation'
      );
    }
    this.invitations.set(invitation.id, invitation);
    this.persistLocal();
    return invitation;
  }

  async updateInvitation(id: string, updates: Partial<Invitation>): Promise<Invitation | undefined> {
    const existing = this.invitations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    const supabase = getSupabase();
    if (supabase) {
      await syncSupabase(
        supabase.from('invitations').update(updates).eq('id', id),
        'updateInvitation'
      );
    }
    this.invitations.set(id, updated);
    this.persistLocal();
    return updated;
  }

  // Evaluaciones
  getAssessmentById(id: string): Assessment | undefined {
    return this.assessments.get(id);
  }

  getAssessmentByCandidateId(candidateId: string): Assessment | undefined {
    return Array.from(this.assessments.values()).find(a => a.candidate_id === candidateId);
  }

  getAssessments(): Assessment[] {
    return Array.from(this.assessments.values());
  }

  async createAssessment(assessment: Assessment): Promise<Assessment> {
    const supabase = getSupabase();
    if (supabase) {
      await syncSupabase(
        supabase.from('assessments').upsert(assessment),
        'createAssessment'
      );
    }
    this.assessments.set(assessment.id, assessment);
    this.persistLocal();
    return assessment;
  }

  async updateAssessment(id: string, updates: Partial<Assessment>): Promise<Assessment | undefined> {
    const existing = this.assessments.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };

    const supabase = getSupabase();
    if (supabase) {
      await syncSupabase(
        supabase.from('assessments').update(updates).eq('id', id),
        'updateAssessment'
      );
    }

    this.assessments.set(id, updated);
    this.persistLocal();
    return updated;
  }

  // Preguntas
  getQuestions(): Question[] {
    return Array.from(this.questions.values()).sort((a, b) => a.position - b.position);
  }

  getQuestionById(id: number): Question | undefined {
    return this.questions.get(id);
  }

  getAnswerKey(questionId: number): AnswerKey | undefined {
    return this.answerKeys.get(questionId);
  }

  // Respuestas
  getAnswersByAssessment(assessmentId: string): Answer[] {
    return Array.from(this.answers.values())
      .filter(a => a.assessment_id === assessmentId)
      .sort((a, b) => a.question_id - b.question_id);
  }

  getAnswer(assessmentId: string, questionId: number): Answer | undefined {
    return this.answers.get(`${assessmentId}_${questionId}`);
  }

  async saveAnswer(answer: Answer): Promise<Answer> {
    const key = `${answer.assessment_id}_${answer.question_id}`;

    const supabase = getSupabase();
    if (supabase) {
      await syncSupabase(
        supabase.from('answers').upsert({
          id: answer.id,
          assessment_id: answer.assessment_id,
          question_id: answer.question_id,
          selected_option: answer.selected_option || null,
          written_answer: answer.written_answer || null,
          draft_answer: answer.draft_answer || null,
          started_at: answer.started_at,
          submitted_at: answer.submitted_at || null,
          elapsed_seconds: answer.elapsed_seconds,
          timed_out: answer.timed_out,
          objective_points: answer.objective_points
        }, { onConflict: 'assessment_id,question_id' }),
        'saveAnswer'
      );
    }

    this.answers.set(key, answer);
    this.persistLocal();
    return answer;
  }

  // Calificaciones manuales
  getReviewerScoresByAnswer(answerId: string): ReviewerScore[] {
    return Array.from(this.reviewerScores.values()).filter(r => r.answer_id === answerId);
  }

  async saveReviewerScore(score: ReviewerScore): Promise<ReviewerScore> {
    const key = `${score.answer_id}_${score.reviewer_id}`;

    const supabase = getSupabase();
    if (supabase) {
      await syncSupabase(
        supabase.from('reviewer_scores').upsert({
          id: score.id,
          answer_id: score.answer_id,
          reviewer_id: score.reviewer_id,
          reviewer_name: score.reviewer_name,
          criterion_scores: score.criterion_scores,
          total_points: score.total_points,
          observation: score.observation || '',
          reviewed_at: score.reviewed_at
        }, { onConflict: 'answer_id,reviewer_id' }),
        'saveReviewerScore'
      );
    }

    this.reviewerScores.set(key, score);
    this.persistLocal();
    return score;
  }

  // Revisión final
  getFinalReview(assessmentId: string): FinalReview | undefined {
    return this.finalReviews.get(assessmentId);
  }

  async saveFinalReview(review: FinalReview): Promise<FinalReview> {

    const supabase = getSupabase();
    if (supabase) {
      await syncSupabase(
        supabase.from('final_reviews').upsert(review),
        'saveFinalReview'
      );
    }

    this.finalReviews.set(review.assessment_id, review);
    this.persistLocal();
    return review;
  }

  // Auditoría
  async addAuditLog(actorId: string, action: string, entityId?: string, metadata?: any): Promise<AuditLog> {
    const log: AuditLog = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      actor_id: actorId,
      action,
      entity_id: entityId,
      metadata,
      created_at: new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase) {
      await syncSupabase(
        supabase.from('audit_logs').insert(log),
        'addAuditLog'
      );
    }

    this.auditLogs.unshift(log);
    this.persistLocal();
    return log;
  }

  getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }
}

export const db = new MemoryDatabase();
