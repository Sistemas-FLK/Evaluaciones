import { db } from '../data/mockDatabase.js';
import { reviewService } from './reviewService.js';

interface Input {
  request_id: string;
  reviewer_id: string;
  reviewer_name: string;
  answers: Array<{ question_id: number; text: string; criterion_scores: Record<string,number>; observation: string }>;
}
export async function saveSupplementaryAnswers(candidateId: string, input: Input) {
  const candidate = db.getCandidateById(candidateId);
  const assessment = db.getAssessmentByCandidateId(candidateId);
  if (!candidate || !assessment) throw new Error('Candidata o evaluación no encontrada.');
  db.assertCandidateAvailable(candidateId);
  if (assessment.status !== 'submitted' || db.getFinalReview(assessment.id)) {
    throw new Error('Las respuestas complementarias se registran en evaluaciones entregadas pendientes de dictamen.');
  }
  if (!input || !/^[a-f0-9]{64}$/i.test(input.request_id || '') ||
      typeof input.reviewer_id !== 'string' || !/^[a-zA-Z0-9_-]{1,50}$/.test(input.reviewer_id) ||
      typeof input.reviewer_name !== 'string' || !input.reviewer_name.trim() || input.reviewer_name.length > 255 ||
      !Array.isArray(input.answers) || input.answers.length < 1 || input.answers.length > 4) {
    throw new Error('Solicitud de respuestas complementarias inválida.');
  }
  const seen = new Set<number>();
  for (const row of input.answers) {
    const question = db.getQuestionById(row.question_id);
    const answer = db.getAnswer(assessment.id, row.question_id);
    const criteria = db.getAnswerKey(row.question_id)?.scoring_metadata.criteria || [];
    if (!question || question.question_type !== 'open_text' || seen.has(row.question_id) || !answer?.submitted_at ||
        typeof row.text !== 'string' || !row.text.trim() || row.text.length > 10000 ||
        typeof row.observation !== 'string' || !row.observation.trim() || row.observation.length > 5000 ||
        !row.criterion_scores || Object.keys(row.criterion_scores).length !== 4 || criteria.length !== 4 ||
        criteria.some(c => !Number.isInteger(row.criterion_scores[c.id]) || row.criterion_scores[c.id] < 0 || row.criterion_scores[c.id] > c.max)) {
      throw new Error('La respuesta o su calificación no coincide con la rúbrica.');
    }
    seen.add(row.question_id);
    const previous = db.auditLogs.find(log => log.action === 'SUPPLEMENTARY_ANSWER' && log.entity_id === assessment.id &&
      log.metadata?.request_id === input.request_id && log.metadata?.question_id === row.question_id);
    if (previous && previous.metadata.text !== row.text) throw new Error('La solicitud repetida contiene un texto distinto.');
  }
  for (const row of input.answers) {
    const answer = db.getAnswer(assessment.id, row.question_id)!;
    const previous = db.auditLogs.find(log => log.action === 'SUPPLEMENTARY_ANSWER' && log.entity_id === assessment.id &&
      log.metadata?.request_id === input.request_id && log.metadata?.question_id === row.question_id);
    if (!previous) {
      await db.addAuditLog(input.reviewer_name.trim(), 'SUPPLEMENTARY_ANSWER', assessment.id, {
        request_id: input.request_id, revision: db.getSupplementaryAnswers(assessment.id,row.question_id).length + 1,
        answer_id: answer.id, question_id: row.question_id, text: row.text,
        source: 'chat', outside_time: true, received_at: null,
        note: 'Transcrita del chat por autorización del usuario. Sin hora exacta de recepción de la candidata.'
      });
    } else if (db.getSupplementaryAnswers(assessment.id,row.question_id)[0]?.id !== previous.id) {
      throw new Error('Ya hay una versión complementaria más reciente. No se modificará con una solicitud anterior.');
    }
    await reviewService.submitReviewerScore(answer.id,input.reviewer_id,input.reviewer_name,row.criterion_scores,
      `Calificación de respuesta complementaria recibida por chat fuera del tiempo del examen. ${row.observation}`);
  }
  return reviewService.getCandidateDetail(candidateId);
}
