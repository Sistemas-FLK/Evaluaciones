import { db } from '../data/mockDatabase.js';
import { HistoricalEvaluationPayload, FinalReview } from '../types.js';

export async function importHistoricalEvaluation(payload: HistoricalEvaluationPayload) {
  if (!payload || !/^[a-f0-9]{64}$/i.test(payload.source_sha256 || '') ||
      !/^\d{4}-\d{2}-\d{2}$/.test(payload.evaluation_date || '') ||
      !payload.source_file || !payload.original_verdict || !payload.candidate_name ||
      !Array.isArray(payload.questions) || payload.questions.length !== 10) {
    throw new Error('El informe histórico debe incluir fuente, fecha, huella SHA256 y diez preguntas.');
  }
  if (!['Recomendada', 'Recomendada con capacitación', 'Pendiente de evaluación adicional', 'No recomendada para este puesto por ahora'].includes(payload.recommendation)) {
    throw new Error('Recomendación no válida.');
  }
  const invitation = db.getInvitationByCode(payload.access_code || '');
  const candidate = invitation && db.getCandidateById(invitation.candidate_id);
  const assessment = candidate && db.getAssessmentByCandidateId(candidate.id);
  if (!candidate || !assessment || candidate.full_name !== payload.candidate_name) {
    throw new Error('La candidata del informe no coincide con el código de invitación.');
  }
  db.assertCandidateAvailable(candidate.id);
  const previous = db.getFinalReview(assessment.id);
  const importedHash = previous?.final_scores.historical_import?.source_sha256;
  if (importedHash === payload.source_sha256 && assessment.status === 'graded') {
    return { assessment_id: assessment.id, already_imported: true };
  }
  if ((assessment.status !== 'pending' || db.getAnswersByAssessment(assessment.id).length || previous) && importedHash !== payload.source_sha256) {
    throw new Error('La evaluación contiene actividad previa. La importación no puede reemplazarla.');
  }
  const ids = new Set<number>();
  let objective = 0, manual = 0, maximum = 0;
  for (const row of payload.questions) {
    const q = row.question;
    const official = q && db.getQuestionById(q.id);
    if (!official || ids.has(q.id) || q.position !== official.position || !q.statement?.trim() || !q.category?.trim() ||
        q.max_points !== official.max_points || q.question_type !== official.question_type ||
        !Number.isFinite(row.points) || row.points < 0 || row.points > q.max_points || row.answer_key?.question_id !== q.id) {
      throw new Error('Preguntas o puntajes históricos inválidos.');
    }
    ids.add(q.id);
    maximum += q.max_points;
    if (q.question_type === 'multiple_choice') {
      if (!q.options?.some(option => option.id === row.selected_option)) throw new Error('Opción histórica inválida.');
      objective += row.points;
    } else {
      const values = Object.values(row.criterion_scores || {});
      if (!row.written_answer?.trim() || values.length !== 4 || values.some(v => !Number.isInteger(v) || v < 0 || v > 3) ||
          values.reduce((a, b) => a + b, 0) !== row.points) throw new Error('La rúbrica no coincide con los puntos del informe.');
      manual += row.points;
    }
  }
  if (maximum !== 100 || objective !== payload.objective_score || manual !== payload.manual_score || objective + manual !== payload.total_score) {
    throw new Error('Los totales no coinciden con el detalle del informe.');
  }
  const importedAt = new Date().toISOString();
  // The file contains a date only. Midnight in Lima is a technical storage value,
  // never a measured start/submission time; the historical flag is shown in the UI.
  const sourceDate = `${payload.evaluation_date}T00:00:00-05:00`;
  if (Number.isNaN(Date.parse(sourceDate))) throw new Error('Fecha de informe inválida.');
  const review: FinalReview = {
    assessment_id: assessment.id,
    final_scores: {
      objective_score: objective, manual_score: manual, total_score: objective + manual,
      competency_breakdown: Object.fromEntries(payload.questions.map(row => [row.question.category, { earned: row.points, max: row.question.max_points }])),
      historical_import: {
        source_file: payload.source_file, source_sha256: payload.source_sha256,
        evaluation_date: payload.evaluation_date, imported_at: importedAt,
        original_verdict: payload.original_verdict, timing_available: false,
        questions: payload.questions.map(row => ({ question: row.question, answer_key: row.answer_key }))
      }
    },
    recommendation: payload.recommendation,
    justification: `Dictamen transcrito del informe histórico: ${payload.original_verdict}. Fuente: ${payload.source_file}, fecha ${payload.evaluation_date}. Puntaje objetivo ${objective}/52 y manual ${manual}/48. No constituye una nueva evaluación.`,
    approved_by: 'Informe histórico Excel (evaluador no identificado)',
    approved_at: sourceDate
  };
  // Write provenance first, making interrupted imports safely retryable by hash.
  await db.saveFinalReview(review);
  for (const row of payload.questions) {
    const id = db.getAnswer(assessment.id, row.question.id)?.id || crypto.randomUUID();
    await db.saveAnswer({
      id, assessment_id: assessment.id, question_id: row.question.id,
      selected_option: row.selected_option, written_answer: row.written_answer,
      started_at: sourceDate, submitted_at: sourceDate,
      elapsed_seconds: 0, timed_out: false,
      objective_points: row.question.question_type === 'multiple_choice' ? row.points : 0
    });
    if (row.question.question_type === 'open_text') {
      const priorScore = db.getReviewerScoresByAnswer(id).find(score => score.reviewer_id === 'historical_excel');
      await db.saveReviewerScore({
        id: priorScore?.id || crypto.randomUUID(), answer_id: id,
        reviewer_id: 'historical_excel', reviewer_name: 'Calificación original del Excel',
        criterion_scores: row.criterion_scores!, total_points: row.points,
        observation: row.observation, reviewed_at: sourceDate
      });
    }
  }
  await db.addAuditLog('admin_import', 'IMPORT_HISTORICAL_EVALUATION', assessment.id, {
    source_file: payload.source_file, source_sha256: payload.source_sha256,
    evaluation_date: payload.evaluation_date, total_score: objective + manual,
    timing_available: false, imported_at: importedAt
  });
  await db.updateAssessment(assessment.id, {
    status: 'graded', current_question_index: 10, completed_at: sourceDate,
    objective_score: objective, manual_score: manual, total_score: objective + manual
  });
  return { assessment_id: assessment.id, already_imported: false };
}
