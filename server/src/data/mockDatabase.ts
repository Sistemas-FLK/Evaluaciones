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
  INITIAL_ASSESSMENTS 
} from './initialData.js';

// Base de datos en memoria para operación de alta disponibilidad o modo local
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
  }

  seed() {
    INITIAL_CANDIDATES.forEach(c => this.candidates.set(c.id, { ...c }));
    INITIAL_INVITATIONS.forEach(i => this.invitations.set(i.id, { ...i }));
    INITIAL_ASSESSMENTS.forEach(a => this.assessments.set(a.id, { ...a }));
    INITIAL_QUESTIONS.forEach(q => this.questions.set(q.id, { ...q }));
    INITIAL_ANSWER_KEYS.forEach(k => this.answerKeys.set(k.question_id, { ...k }));
  }

  // Candidatas
  getCandidates(): Candidate[] {
    return Array.from(this.candidates.values());
  }

  getCandidateById(id: string): Candidate | undefined {
    return this.candidates.get(id);
  }

  getCandidateByEmail(email: string): Candidate | undefined {
    return Array.from(this.candidates.values()).find(c => c.email.toLowerCase() === email.toLowerCase());
  }

  createCandidate(candidate: Candidate): Candidate {
    this.candidates.set(candidate.id, candidate);
    return candidate;
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
    return invitation;
  }

  updateInvitation(id: string, updates: Partial<Invitation>): Invitation | undefined {
    const existing = this.invitations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.invitations.set(id, updated);
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
    return assessment;
  }

  updateAssessment(id: string, updates: Partial<Assessment>): Assessment | undefined {
    const existing = this.assessments.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    this.assessments.set(id, updated);
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
    return answer;
  }

  // Calificaciones manuales
  getReviewerScoresByAnswer(answerId: string): ReviewerScore[] {
    return Array.from(this.reviewerScores.values()).filter(r => r.answer_id === answerId);
  }

  saveReviewerScore(score: ReviewerScore): ReviewerScore {
    const key = `${score.answer_id}_${score.reviewer_id}`;
    this.reviewerScores.set(key, score);
    return score;
  }

  // Revisión final
  getFinalReview(assessmentId: string): FinalReview | undefined {
    return this.finalReviews.get(assessmentId);
  }

  saveFinalReview(review: FinalReview): FinalReview {
    this.finalReviews.set(review.assessment_id, review);
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
    return log;
  }

  getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }
}

export const db = new MemoryDatabase();
