import { db } from '../data/mockDatabase.js';
import { RecommendationType, ReviewerScore, FinalReview } from '../types.js';

export class ReviewService {
  /**
   * Resumen general de métricas y tabla de postulantes para el dashboard de evaluadores.
   */
  async getOverview() {
    const candidates = db.getCandidates();
    const assessments = db.getAssessments();

    let pendingCount = 0;
    let inProgressCount = 0;
    let submittedCount = 0;
    let gradedCount = 0;

    const rows = candidates.map(candidate => {
      const assessment = assessments.find(a => a.candidate_id === candidate.id);
      const answers = assessment ? db.getAnswersByAssessment(assessment.id) : [];
      const totalTimeSeconds = answers.reduce((sum, a) => sum + (a.elapsed_seconds || 0), 0);
      const invitation = db.getCandidates().length > 0 
        ? Array.from(db.invitations.values()).find(i => i.candidate_id === candidate.id)
        : undefined;

      const status = assessment?.status || 'pending';
      if (status === 'pending') pendingCount++;
      else if (status === 'in_progress') inProgressCount++;
      else if (status === 'submitted') submittedCount++;
      else if (status === 'graded') gradedCount++;

      return {
        candidate_id: candidate.id,
        full_name: candidate.full_name,
        email: candidate.email,
        access_code: invitation?.access_code || '—',
        assessment_id: assessment?.id || null,
        status,
        objective_score: assessment ? Number(assessment.objective_score.toFixed(2)) : 0,
        manual_score: assessment ? Number(assessment.manual_score.toFixed(2)) : 0,
        total_score: assessment ? Number(assessment.total_score.toFixed(2)) : 0,
        total_time_seconds: totalTimeSeconds,
        answers_count: answers.length,
        has_review: assessment ? !!db.getFinalReview(assessment.id) : false
      };
    });

    return {
      kpis: {
        total_candidates: candidates.length,
        pending: pendingCount,
        in_progress: inProgressCount,
        submitted_pending_review: submittedCount,
        graded: gradedCount
      },
      candidates: rows
    };
  }

  /**
   * Ficha completa de una candidata con sus 10 respuestas, tiempos y calificaciones.
   */
  async getCandidateDetail(candidateId: string) {
    const candidate = db.getCandidateById(candidateId);
    if (!candidate) {
      throw new Error('Candidata no encontrada.');
    }

    const assessment = db.getAssessmentByCandidateId(candidateId);
    if (!assessment) {
      throw new Error('Evaluación no iniciada para esta candidata.');
    }

    const questions = db.getQuestions();
    const answers = db.getAnswersByAssessment(assessment.id);
    const finalReview = db.getFinalReview(assessment.id);

    // Mapear las 10 preguntas con sus respuestas y calificaciones
    const questionsDetail = questions.map(q => {
      const answer = answers.find(a => a.question_id === q.id);
      const answerKey = db.getAnswerKey(q.id);
      const reviewerScores = answer ? db.getReviewerScoresByAnswer(answer.id) : [];

      return {
        question: {
          id: q.id,
          position: q.position,
          category: q.category,
          question_type: q.question_type,
          statement: q.statement,
          situation: q.situation,
          options: q.options,
          time_limit_seconds: q.time_limit_seconds,
          max_points: q.max_points
        },
        answer_key: {
          correct_option: answerKey?.correct_option || null,
          scoring_metadata: answerKey?.scoring_metadata || null,
          explanation: answerKey?.explanation || null,
          benchmark_guide: answerKey?.benchmark_guide || null
        },
        candidate_answer: answer ? {
          id: answer.id,
          selected_option: answer.selected_option || null,
          written_answer: answer.written_answer || null,
          draft_answer: answer.draft_answer || null,
          started_at: answer.started_at,
          submitted_at: answer.submitted_at,
          elapsed_seconds: answer.elapsed_seconds,
          timed_out: answer.timed_out,
          objective_points: answer.objective_points
        } : null,
        reviews: reviewerScores
      };
    });

    return {
      candidate,
      assessment,
      questions_detail: questionsDetail,
      final_review: finalReview || null
    };
  }

  /**
   * Calificación manual de una pregunta abierta por un evaluador (María o 2do Evaluador).
   */
  async submitReviewerScore(
    answerId: string,
    reviewerId: string,
    reviewerName: string,
    criterionScores: Record<string, number>,
    observation?: string
  ) {
    // Validar que los criterios sean 0..3
    let totalPoints = 0;
    for (const [key, val] of Object.entries(criterionScores)) {
      const num = Number(val);
      if (isNaN(num) || num < 0 || num > 3) {
        throw new Error(`El criterio ${key} debe tener una calificación entre 0 y 3 puntos.`);
      }
      totalPoints += num;
    }

    if (totalPoints > 12) {
      throw new Error('El puntaje máximo para esta pregunta abierta no puede superar los 12 puntos.');
    }

    // Guardar la evaluación del revisor
    const scoreId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    const scoreRecord: ReviewerScore = {
      id: scoreId,
      answer_id: answerId,
      reviewer_id: reviewerId,
      reviewer_name: reviewerName,
      criterion_scores: criterionScores,
      total_points: totalPoints,
      observation: observation?.trim() || '',
      reviewed_at: new Date().toISOString()
    };

    db.saveReviewerScore(scoreRecord);

    // Buscar a qué evaluación pertenece esta respuesta
    const allAnswers = Array.from(db.answers.values());
    const answer = allAnswers.find(a => a.id === answerId);
    if (!answer) return scoreRecord;

    const assessment = db.getAssessmentById(answer.assessment_id);
    if (!assessment) return scoreRecord;

    // Recalcular puntaje manual total de la evaluación
    // Para cada una de las 4 preguntas abiertas (2, 3, 8, 9), promediar o tomar la nota de los evaluadores
    const openQuestionIds = [2, 3, 8, 9];
    let totalManualScore = 0;

    for (const qId of openQuestionIds) {
      const ans = db.getAnswer(assessment.id, qId);
      if (ans) {
        const revScores = db.getReviewerScoresByAnswer(ans.id);
        if (revScores.length > 0) {
          // Promedio de las evaluaciones si hay más de una, o la única disponible
          const sum = revScores.reduce((acc, r) => acc + r.total_points, 0);
          totalManualScore += (sum / revScores.length);
        }
      }
    }

    totalManualScore = Number(totalManualScore.toFixed(2));
    const newTotal = Number((assessment.objective_score + totalManualScore).toFixed(2));

    db.updateAssessment(assessment.id, {
      manual_score: totalManualScore,
      total_score: newTotal
    });

    db.addAuditLog(reviewerId, 'MANUAL_SCORE_SUBMITTED', answerId, {
      reviewerName,
      points: totalPoints,
      assessmentId: assessment.id
    });

    return scoreRecord;
  }

  /**
   * Guarda dictamen, justificación y recomendación final colegiada.
   */
  async saveFinalReview(
    assessmentId: string,
    payload: {
      recommendation: RecommendationType;
      justification: string;
      approved_by: string;
    }
  ) {
    const assessment = db.getAssessmentById(assessmentId);
    if (!assessment) {
      throw new Error('Evaluación no encontrada.');
    }

    if (!payload.justification || payload.justification.trim().length < 10) {
      throw new Error('Debe proporcionar una justificación clara y detallada para el dictamen comercial.');
    }

    // Calcular desglose por competencias
    const answers = db.getAnswersByAssessment(assessmentId);
    const questions = db.getQuestions();

    const competencyMap: Record<string, { earned: number; max: number }> = {
      'Atención y Cierre Comercial': { earned: 0, max: 8 },
      'Negociación bajo Presión': { earned: 0, max: 12 },
      'Captación Orgánica en Redes': { earned: 0, max: 12 },
      'Razonamiento Numérico y Conversión': { earned: 0, max: 18 }, // P4 (10) + P10 (8)
      'Cálculo Comercial y Margen': { earned: 0, max: 10 },
      'Priorización y Criterio Operativo': { earned: 0, max: 8 },
      'Ética Publicitaria y Cumplimiento': { earned: 0, max: 8 },
      'Recuperación de Ventas (WhatsApp)': { earned: 0, max: 12 },
      'Creatividad Comercial y Video B2B': { earned: 0, max: 12 }
    };

    questions.forEach(q => {
      const ans = answers.find(a => a.question_id === q.id);
      let pts = 0;
      if (q.question_type === 'multiple_choice') {
        pts = ans?.objective_points || 0;
      } else if (ans) {
        const revs = db.getReviewerScoresByAnswer(ans.id);
        if (revs.length > 0) {
          pts = revs.reduce((sum, r) => sum + r.total_points, 0) / revs.length;
        }
      }

      if (q.id === 1) competencyMap['Atención y Cierre Comercial'].earned = pts;
      if (q.id === 2) competencyMap['Negociación bajo Presión'].earned = pts;
      if (q.id === 3) competencyMap['Captación Orgánica en Redes'].earned = pts;
      if (q.id === 4) competencyMap['Razonamiento Numérico y Conversión'].earned += pts;
      if (q.id === 5) competencyMap['Cálculo Comercial y Margen'].earned = pts;
      if (q.id === 6) competencyMap['Priorización y Criterio Operativo'].earned = pts;
      if (q.id === 7) competencyMap['Ética Publicitaria y Cumplimiento'].earned = pts;
      if (q.id === 8) competencyMap['Recuperación de Ventas (WhatsApp)'].earned = pts;
      if (q.id === 9) competencyMap['Creatividad Comercial y Video B2B'].earned = pts;
      if (q.id === 10) competencyMap['Razonamiento Numérico y Conversión'].earned += pts;
    });

    const finalReview: FinalReview = {
      assessment_id: assessmentId,
      final_scores: {
        objective_score: assessment.objective_score,
        manual_score: assessment.manual_score,
        total_score: assessment.total_score,
        competency_breakdown: competencyMap
      },
      recommendation: payload.recommendation,
      justification: payload.justification.trim(),
      approved_by: payload.approved_by || 'Comité Evaluador QUIMICORP',
      approved_at: new Date().toISOString()
    };

    db.saveFinalReview(finalReview);
    db.updateAssessment(assessmentId, {
      status: 'graded'
    });

    db.addAuditLog(payload.approved_by, 'FINALIZE_ASSESSMENT', assessmentId, {
      recommendation: payload.recommendation,
      total_score: assessment.total_score
    });

    return finalReview;
  }

  /**
   * Registro de nueva candidata y generación de código de invitación individual.
   */
  async registerNewCandidate(fullName: string, email: string, phone?: string) {
    if (!fullName || !email) {
      throw new Error('Nombres completos y correo electrónico son requeridos.');
    }

    const existing = db.getCandidateByEmail(email);
    if (existing) {
      throw new Error('Ya existe una candidata registrada con este correo electrónico.');
    }

    const candidateId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    const candidate = db.createCandidate({
      id: candidateId,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      created_at: new Date().toISOString()
    });

    // Generar código único seguro (Ej: QUIMI-XXXX)
    const codeSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const cleanFirstName = fullName.trim().split(' ')[0].toUpperCase();
    const accessCode = `${cleanFirstName}-QUIMI-${codeSuffix}`;

    const invitationId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    const invitation = db.createInvitation({
      id: invitationId,
      candidate_id: candidate.id,
      access_code: accessCode,
      is_active: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    const assessmentId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    const assessment = db.createAssessment({
      id: assessmentId,
      candidate_id: candidate.id,
      invitation_id: invitation.id,
      status: 'pending',
      current_question_index: 1,
      objective_score: 0,
      manual_score: 0,
      total_score: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    db.addAuditLog('admin', 'REGISTER_CANDIDATE', candidate.id, {
      access_code: accessCode
    });

    return {
      candidate,
      invitation,
      assessment
    };
  }

  /**
   * Exporta tabla completa en CSV.
   */
  async exportCSV(): Promise<string> {
    const candidates = db.getCandidates();
    const assessments = db.getAssessments();

    const header = [
      'ID Candidata',
      'Nombres y Apellidos',
      'Correo Electrónico',
      'Código Invitación',
      'Estado Evaluación',
      'Puntaje Automático (52)',
      'Puntaje Manual (48)',
      'Puntaje Total (100)',
      'Tiempo Total (segundos)',
      'Recomendación Final',
      'Justificación'
    ];

    const lines = [header.join(',')];

    candidates.forEach(c => {
      const a = assessments.find(ass => ass.candidate_id === c.id);
      const inv = Array.from(db.invitations.values()).find(i => i.candidate_id === c.id);
      const rev = a ? db.getFinalReview(a.id) : undefined;
      const answers = a ? db.getAnswersByAssessment(a.id) : [];
      const totalSeconds = answers.reduce((sum, ans) => sum + (ans.elapsed_seconds || 0), 0);

      const row = [
        `"${c.id}"`,
        `"${c.full_name}"`,
        `"${c.email}"`,
        `"${inv?.access_code || ''}"`,
        `"${a?.status || 'pending'}"`,
        a ? a.objective_score : 0,
        a ? a.manual_score : 0,
        a ? a.total_score : 0,
        totalSeconds,
        `"${rev?.recommendation || 'Sin dictamen'}"`,
        `"${(rev?.justification || '').replace(/"/g, '""')}"`
      ];

      lines.push(row.join(','));
    });

    return lines.join('\n');
  }
}

export const reviewService = new ReviewService();
