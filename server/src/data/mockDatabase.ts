import { 
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
  try {
    const res = await promise;
    if (res?.error) {
      console.warn(`[Supabase ${opName}]`, res.error.message);
    }
  } catch (err: any) {
    console.warn(`[Supabase ${opName}]`, err?.message || err);
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

  constructor() {
    this.seed();
    this.hydrateFromSupabase();
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
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      console.log('[Supabase] Hidratando datos desde PostgreSQL Supabase...');
      const [candRes, invRes, assRes, ansRes, revRes] = await Promise.all([
        supabase.from('candidates').select('*'),
        supabase.from('invitations').select('*'),
        supabase.from('assessments').select('*'),
        supabase.from('answers').select('*'),
        supabase.from('reviewer_scores').select('*')
      ]);

      if (candRes.data && candRes.data.length > 0) {
        candRes.data.forEach((c: any) => this.candidates.set(c.id, c));
      } else if (candRes.data && candRes.data.length === 0) {
        console.log('[Supabase] Tablas vacías detectadas. Inicializando datos de candidatas en Supabase...');
        try {
          await supabase.from('candidates').upsert(INITIAL_CANDIDATES);
          await supabase.from('invitations').upsert(INITIAL_INVITATIONS);
          await supabase.from('assessments').upsert(INITIAL_ASSESSMENTS);
          console.log('[Supabase] Inicialización completada: Esther y Geraldine listas en Supabase.');
        } catch (seedErr) {
          console.warn('[Supabase Auto-seed Warning]', seedErr);
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
      console.log(`[Supabase] Conectado y sincronizado: ${candRes.data?.length || 0} candidatas, ${assRes.data?.length || 0} evaluaciones.`);
    } catch (err: any) {
      console.warn('[Supabase Hydration Warning]', err?.message || err);
    }
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

  createCandidate(candidate: Candidate): Candidate {
    this.candidates.set(candidate.id, candidate);
    const supabase = getSupabase();
    if (supabase) {
      syncSupabase(
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
    return candidate;
  }

  updateCandidate(id: string, updates: Partial<Candidate>): Candidate | undefined {
    const existing = this.candidates.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.candidates.set(id, updated);

    const supabase = getSupabase();
    if (supabase) {
      syncSupabase(
        supabase.from('candidates').update({
          full_name: updated.full_name,
          email: updated.email,
          phone: updated.phone
        }).eq('id', id),
        'updateCandidate'
      );
    }

    return updated;
  }

  // Invitaciones
  getInvitationByCode(code: string): Invitation | undefined {
    const cleanCode = code.trim().toUpperCase();
    return Array.from(this.invitations.values()).find(
      i => i.access_code.toUpperCase() === cleanCode
    );
  }

  createInvitation(invitation: Invitation): Invitation {
    this.invitations.set(invitation.id, invitation);
    const supabase = getSupabase();
    if (supabase) {
      syncSupabase(
        supabase.from('invitations').upsert(invitation),
        'createInvitation'
      );
    }
    return invitation;
  }

  updateInvitation(id: string, updates: Partial<Invitation>): Invitation | undefined {
    const existing = this.invitations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.invitations.set(id, updated);
    const supabase = getSupabase();
    if (supabase) {
      syncSupabase(
        supabase.from('invitations').update(updates).eq('id', id),
        'updateInvitation'
      );
    }
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

  createAssessment(assessment: Assessment): Assessment {
    this.assessments.set(assessment.id, assessment);
    const supabase = getSupabase();
    if (supabase) {
      syncSupabase(
        supabase.from('assessments').upsert(assessment),
        'createAssessment'
      );
    }
    return assessment;
  }

  updateAssessment(id: string, updates: Partial<Assessment>): Assessment | undefined {
    const existing = this.assessments.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    this.assessments.set(id, updated);

    const supabase = getSupabase();
    if (supabase) {
      syncSupabase(
        supabase.from('assessments').update(updates).eq('id', id),
        'updateAssessment'
      );
    }

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

  saveAnswer(answer: Answer): Answer {
    const key = `${answer.assessment_id}_${answer.question_id}`;
    this.answers.set(key, answer);

    const supabase = getSupabase();
    if (supabase) {
      syncSupabase(
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

    return answer;
  }

  // Calificaciones manuales
  getReviewerScoresByAnswer(answerId: string): ReviewerScore[] {
    return Array.from(this.reviewerScores.values()).filter(r => r.answer_id === answerId);
  }

  saveReviewerScore(score: ReviewerScore): ReviewerScore {
    const key = `${score.answer_id}_${score.reviewer_id}`;
    this.reviewerScores.set(key, score);

    const supabase = getSupabase();
    if (supabase) {
      syncSupabase(
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

    return score;
  }

  // Revisión final
  getFinalReview(assessmentId: string): FinalReview | undefined {
    return this.finalReviews.get(assessmentId);
  }

  saveFinalReview(review: FinalReview): FinalReview {
    this.finalReviews.set(review.assessment_id, review);

    const supabase = getSupabase();
    if (supabase) {
      syncSupabase(
        supabase.from('final_reviews').upsert(review),
        'saveFinalReview'
      );
    }

    return review;
  }

  // Auditoría
  addAuditLog(actorId: string, action: string, entityId?: string, metadata?: any): AuditLog {
    const log: AuditLog = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      actor_id: actorId,
      action,
      entity_id: entityId,
      metadata,
      created_at: new Date().toISOString()
    };
    this.auditLogs.unshift(log);

    const supabase = getSupabase();
    if (supabase) {
      syncSupabase(
        supabase.from('audit_logs').insert(log),
        'addAuditLog'
      );
    }

    return log;
  }

  getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }
}

export const db = new MemoryDatabase();
