import { db } from '../data/mockDatabase.js';
import { getSupabase } from '../config/supabase.js';
import { Question, Answer, Assessment } from '../types.js';

export class AssessmentService {
  /**
   * Valida el código individual de acceso contra el servidor.
   */
  async validateInvitation(code: string) {
    if (!code || !code.trim()) {
      throw new Error('Debe proporcionar un código de invitación válido.');
    }

    const cleanCode = code.trim().toUpperCase();
    const supabase = getSupabase();

    let invitation = db.getInvitationByCode(cleanCode);

    // Si Supabase está configurado, podemos consultar la tabla invitations
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('invitations')
          .select('*, candidates(*), assessments(*)')
          .eq('access_code', cleanCode)
          .single();

        if (data && !error) {
          // Sincronizar con db local
          invitation = {
            id: data.id,
            candidate_id: data.candidate_id,
            access_code: data.access_code,
            is_active: data.is_active,
            expires_at: data.expires_at,
            used_at: data.used_at
          };
        }
      } catch (err) {
        console.warn('[Supabase Check Warning]', err);
      }
    }

    if (!invitation) {
      throw new Error('El código de invitación no existe o es inválido.');
    }

    if (!invitation.is_active) {
      throw new Error('Esta invitación ha sido desactivada por el administrador.');
    }

    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('Esta invitación ha expirado.');
    }

    const candidate = db.getCandidateById(invitation.candidate_id);
    if (!candidate) {
      throw new Error('Candidata no encontrada en el sistema.');
    }

    let assessment = db.getAssessmentByCandidateId(candidate.id);
    if (!assessment) {
      assessment = db.createAssessment({
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
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
    }

    return {
      valid: true,
      candidate: {
        id: candidate.id,
        full_name: candidate.full_name,
        email: candidate.email
      },
      assessment: {
        id: assessment.id,
        status: assessment.status,
        current_question_index: assessment.current_question_index
      }
    };
  }

  /**
   * Inicia formalmente la evaluación cronometrada.
   */
  async startAssessment(assessmentId: string) {
    const assessment = db.getAssessmentById(assessmentId);
    if (!assessment) {
      throw new Error('Evaluación no encontrada.');
    }

    if (assessment.status === 'submitted' || assessment.status === 'graded') {
      throw new Error('Esta evaluación ya ha sido completada previamente y no puede reiniciarse.');
    }

    const now = new Date().toISOString();

    if (assessment.status === 'pending') {
      db.updateAssessment(assessmentId, {
        status: 'in_progress',
        started_at: now,
        current_question_index: 1,
        current_question_started_at: now
      });

      if (assessment.invitation_id) {
        db.updateInvitation(assessment.invitation_id, {
          used_at: now
        });
      }

      db.addAuditLog(assessment.candidate_id, 'START_ASSESSMENT', assessmentId, {
        timestamp: now
      });
    }

    return this.getCurrentQuestion(assessmentId);
  }

  /**
   * Obtiene la pregunta actual sin exponer respuestas correctas ni claves.
   * Calcula el tiempo restante según marcas del servidor.
   */
  async getCurrentQuestion(assessmentId: string) {
    const assessment = db.getAssessmentById(assessmentId);
    if (!assessment) {
      throw new Error('Evaluación no encontrada.');
    }

    if (assessment.status === 'submitted' || assessment.status === 'graded') {
      return {
        finished: true,
        message: 'La evaluación ha concluido exitosamente.'
      };
    }

    const candidate = db.getCandidateById(assessment.candidate_id);
    const question = db.getQuestionById(assessment.current_question_index);

    if (!question) {
      throw new Error(`Pregunta ${assessment.current_question_index} no encontrada.`);
    }

    // Calcular tiempo restante según servidor
    const now = Date.now();
    let questionStartedAt = assessment.current_question_started_at 
      ? new Date(assessment.current_question_started_at).getTime()
      : now;

    if (!assessment.current_question_started_at) {
      db.updateAssessment(assessmentId, {
        current_question_started_at: new Date(questionStartedAt).toISOString()
      });
    }

    const elapsedSeconds = Math.floor((now - questionStartedAt) / 1000);
    const timeRemainingSeconds = Math.max(0, question.time_limit_seconds - elapsedSeconds);

    // Buscar borrador previo si existe
    const existingAnswer = db.getAnswer(assessmentId, question.id);

    // Devolver objeto seguro para la candidata (SIN answer_keys)
    return {
      finished: false,
      assessment_id: assessmentId,
      candidate_name: candidate?.full_name || 'Candidata',
      current_question_index: question.position,
      total_questions: 10,
      question: {
        id: question.id,
        position: question.position,
        category: question.category,
        question_type: question.question_type,
        statement: question.statement,
        situation: question.situation,
        options: question.options,
        time_limit_seconds: question.time_limit_seconds,
        max_points: question.max_points
      },
      time_remaining_seconds: timeRemainingSeconds,
      draft_answer: existingAnswer?.draft_answer || ''
    };
  }

  /**
   * Guarda borrador de respuesta abierta en tiempo real (anti-pérdida).
   */
  async saveDraft(assessmentId: string, questionId: number, draftText: string) {
    const assessment = db.getAssessmentById(assessmentId);
    if (!assessment || assessment.status !== 'in_progress') return;

    let answer = db.getAnswer(assessmentId, questionId);
    if (!answer) {
      answer = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        assessment_id: assessmentId,
        question_id: questionId,
        draft_answer: draftText,
        started_at: assessment.current_question_started_at || new Date().toISOString(),
        elapsed_seconds: 0,
        timed_out: false,
        objective_points: 0
      };
    } else {
      answer.draft_answer = draftText;
    }

    db.saveAnswer(answer);
  }

  /**
   * Guarda la respuesta de la pregunta actual y avanza a la siguiente.
   * Calificación objetiva automática (52 pts totales).
   */
  async submitAnswer(
    assessmentId: string,
    questionId: number,
    payload: { selected_option?: string; written_answer?: string; client_elapsed_seconds?: number }
  ) {
    const assessment = db.getAssessmentById(assessmentId);
    if (!assessment) {
      throw new Error('Evaluación no encontrada.');
    }

    if (assessment.status === 'submitted' || assessment.status === 'graded') {
      throw new Error('Esta evaluación ya ha sido completada.');
    }

    if (assessment.current_question_index !== questionId) {
      throw new Error('No es posible responder preguntas fuera de secuencia o ya procesadas.');
    }

    const question = db.getQuestionById(questionId);
    if (!question) {
      throw new Error('Pregunta no encontrada.');
    }

    const answerKey = db.getAnswerKey(questionId);

    // Calcular tiempo servidor
    const now = Date.now();
    const questionStarted = assessment.current_question_started_at 
      ? new Date(assessment.current_question_started_at).getTime()
      : now;
    const serverElapsedSeconds = Math.max(1, Math.floor((now - questionStarted) / 1000));
    
    // Gracia técnica de 3 segundos para latencia de red
    const isTimedOut = serverElapsedSeconds > (question.time_limit_seconds + 3);

    let objectivePoints = 0;
    const selectedOption = payload.selected_option?.trim().toUpperCase();
    let writtenAnswer = payload.written_answer?.trim() || '';

    // Si la respuesta escrita vino vacía pero había un borrador guardado en tiempo real, rescatarlo
    if (!writtenAnswer && question.question_type === 'open_text') {
      const existingAnswer = db.getAnswer(assessmentId, questionId);
      if (existingAnswer?.draft_answer) {
        writtenAnswer = existingAnswer.draft_answer;
      }
    }

    // Calificación automática de preguntas objetivas (1, 4, 5, 6, 7, 10)
    if (question.question_type === 'multiple_choice' && answerKey?.correct_option) {
      if (selectedOption === answerKey.correct_option.toUpperCase()) {
        objectivePoints = question.max_points;
      }
    }

    // Persistir respuesta
    const answerId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    const answer: Answer = {
      id: answerId,
      assessment_id: assessmentId,
      question_id: questionId,
      selected_option: selectedOption,
      written_answer: writtenAnswer,
      started_at: new Date(questionStarted).toISOString(),
      submitted_at: new Date(now).toISOString(),
      elapsed_seconds: Math.min(serverElapsedSeconds, question.time_limit_seconds),
      timed_out: isTimedOut,
      objective_points: objectivePoints
    };

    db.saveAnswer(answer);

    // Actualizar puntajes acumulados en evaluación
    const newObjectiveScore = Number((assessment.objective_score + objectivePoints).toFixed(2));
    const nextQuestionIndex = assessment.current_question_index + 1;
    const isFinished = nextQuestionIndex > 10;

    if (isFinished) {
      db.updateAssessment(assessmentId, {
        status: 'submitted',
        completed_at: new Date().toISOString(),
        objective_score: newObjectiveScore,
        total_score: Number((newObjectiveScore + assessment.manual_score).toFixed(2)),
        current_question_index: 10
      });

      db.addAuditLog(assessment.candidate_id, 'COMPLETE_ASSESSMENT', assessmentId, {
        objective_score: newObjectiveScore,
        timestamp: new Date().toISOString()
      });

      return {
        finished: true,
        message: '¡Evaluación completada con éxito!'
      };
    } else {
      // Avanzar a la siguiente pregunta
      const nextStartedAt = new Date().toISOString();
      db.updateAssessment(assessmentId, {
        current_question_index: nextQuestionIndex,
        current_question_started_at: nextStartedAt,
        objective_score: newObjectiveScore,
        total_score: Number((newObjectiveScore + assessment.manual_score).toFixed(2))
      });

      return this.getCurrentQuestion(assessmentId);
    }
  }

  /**
   * Reinicio excepcional por un administrador con registro de auditoría.
   */
  async resetAssessment(assessmentId: string, actorId: string, reason: string) {
    const assessment = db.getAssessmentById(assessmentId);
    if (!assessment) {
      throw new Error('Evaluación no encontrada.');
    }

    const now = new Date().toISOString();
    db.updateAssessment(assessmentId, {
      status: 'pending',
      started_at: undefined,
      completed_at: undefined,
      current_question_index: 1,
      current_question_started_at: undefined,
      objective_score: 0,
      manual_score: 0,
      total_score: 0
    });

    db.addAuditLog(actorId, 'RESTART_ASSESSMENT', assessmentId, {
      reason,
      timestamp: now
    });

    return { success: true, message: 'Evaluación reiniciada para la candidata.' };
  }
}

export const assessmentService = new AssessmentService();
